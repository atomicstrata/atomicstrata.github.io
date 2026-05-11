# Observability

> Agent index: [llms.txt](/llms.txt)

Every AtomicMemory retrieval emits a structured, stable observability payload describing *what happened*: which candidates came back from the index, which ones were packaged into the final context, and how the assembled block fit inside the token budget. This is not a debug log, it is a contract surface on the search response, safe to build dashboards, evals, and regression tests against.

Three summaries, each with a single job:

| Summary | Answers |
| --- | --- |
| `retrievalSummary` | Which memories did the index produce before packaging? |
| `packagingSummary` | Which of those made it into the context, in what role? |
| `assemblySummary` | How were they laid out against the token budget? |

## The summary shapes

All three summaries are declared together in `retrieval-trace.ts`. They are plain data, no functions, no hidden references, and they're serialized straight into JSON responses.

atomicmemory-core/src/services/retrieval-trace.ts:51-79

```ts
export interface RetrievalTraceSummary {
  candidateIds: string[];
  candidateCount: number;
  queryText: string;
  skipRepair: boolean;
  traceId?: string;
  stageCount?: number;
  stageNames?: string[];
}

export type PackagingType = 'subject-pack' | 'timeline-pack' | 'tiered';
export type PackagingEvidenceRole = 'primary' | 'supporting' | 'historical' | 'contextual';

export interface PackagingTraceSummary {
  packageType: PackagingType;
  includedIds: string[];
  droppedIds: string[];
  evidenceRoles: Record<string, PackagingEvidenceRole>;
  episodeCount: number;
  dateCount: number;
  hasCurrentMarker: boolean;
  hasConflictBlock: boolean;
  tokenCost: number;
}

export interface AssemblyTraceSummary {
  finalIds: string[];
  finalTokenCost: number;
  tokenBudget: number | null;
  primaryEvidencePosition: number | null;
  blocks: string[];
}
```

Each field is there to answer a specific question a dashboard, eval harness, or prompt-engineer would ask:

-   **`candidateIds` vs `includedIds` vs `finalIds`**, the three snapshots of "what's in the bag" at the boundaries between retrieval → packaging → assembly. Diffing them tells you exactly where a memory was dropped.
-   **`traceId`, `stageCount`, and `stageNames`**, the bridge from stable response summaries to the optional full trace artifact. When trace persistence is enabled, `traceId` names the on-disk JSON file; `stageNames` gives dashboards a cheap stage inventory without opening that file.
-   **`evidenceRoles`**, maps each included memory ID to its role (`primary` / `supporting` / `historical` / `contextual`). This is how packaging communicates "this is the answer, these are the witnesses" downstream.
-   **`tokenCost`** and **`tokenBudget`**, what we used, what was allowed. If `finalTokenCost > tokenBudget`, the assembly forced a drop; if it's well under, there's headroom.
-   **`primaryEvidencePosition`**, 1-indexed position of the first primary-role memory in the final block. Lower is better (answer at the top), `null` means no primary evidence found.

## The trace collector

A `TraceCollector` is instantiated once per search and threaded through the retrieval pipeline. Every stage calls `stage()` or `event()` to record what it did; the three summary setters attach the stable summaries.

atomicmemory-core/src/services/retrieval-trace.ts:101-170

```ts
export class TraceCollector {
  private stages: TraceStage[] = [];
  private retrieval?: RetrievalTraceSummary;
  private packaging?: PackagingTraceSummary;
  private assembly?: AssemblyTraceSummary;
  private startTime: number;
  private traceId: string;
  private query: string;
  private userId: string;
  private enabled: boolean;

  constructor(query: string, userId: string) {
    this.query = query;
    this.userId = userId;
    this.enabled = config.retrievalTraceEnabled;
    this.startTime = Date.now();
    this.traceId = `trace-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Record a pipeline stage with its current result set and optional metadata. */
  stage(name: string, results: SearchResult[], meta?: Record<string, unknown>): void {
    if (!this.enabled) return;
    this.stages.push({
      name,
      count: results.length,
      memories: snapshotMemories(results),
      meta,
      timestamp: Date.now() - this.startTime,
    });
  }

  /** Event-only stage (no memories, just metadata). */
  event(name: string, meta?: Record<string, unknown>): void {
    if (!this.enabled) return;
    this.stages.push({
      name,
      count: 0,
      memories: [],
      meta,
      timestamp: Date.now() - this.startTime,
    });
  }

  setRetrievalSummary(summary: RetrievalTraceSummary): void {
    if (!this.enabled) return;
    this.retrieval = summary;
  }

  setPackagingSummary(summary: PackagingTraceSummary): void {
    if (!this.enabled) return;
    this.packaging = summary;
  }

  setAssemblySummary(summary: AssemblyTraceSummary): void {
    if (!this.enabled) return;
    this.assembly = summary;
  }
```

Two behaviors worth calling out:

1.  **`enabled` is latched at construction.** Whether the collector records depends on `config.retrievalTraceEnabled` at the moment the search starts. Flipping the flag mid-request can't produce half-traces.
2.  **Stages and summaries are orthogonal.** Stages are the fine-grained forensic log (saved to disk when tracing is on, for eval runs). Summaries are the stable contract (attached to every response when present). Disabling trace persistence does not disable summaries, summaries travel with the search result regardless.

## Packaging → summaries in one call

The packaging pipeline builds the packaging and assembly summaries together, they're two slices of the same computation, and hands them back to the caller in a single invocation. This is the seam between "retrieval produced candidates" and "we have an assembled, token-budgeted context block."

atomicmemory-core/src/services/packaging-observability.ts:179-207

```ts
/**
 * Build packaging + assembly summaries, emit the tiered-packaging trace
 * event when in tiered mode, and attach both summaries to the active
 * trace. Returns the summaries so the caller can include them in the
 * retrieval result. Does NOT finalize the trace, caller owns that.
 */
export function finalizePackagingTrace(
  activeTrace: TraceCollector,
  input: FinalizePackagingInput,
): { packagingSummary: PackagingTraceSummary; assemblySummary: AssemblyTraceSummary } {
  const packagedForSummary = input.mode === 'flat'
    ? input.outputMemories
    : deduplicateCompositeMembersHard(input.outputMemories);
  const packagingSummary = buildPackagingTraceSummary(
    input.outputMemories, packagedForSummary, input.mode, input.injectionText, input.estimatedContextTokens,
  );
  const assemblySummary = buildAssemblyTraceSummary(
    packagingSummary, input.mode === 'flat' ? undefined : input.tokenBudget ?? DEFAULT_TOKEN_BUDGET,
  );

  if (input.mode === 'tiered') {
    activeTrace.event('tiered-packaging', {
      budget: input.tokenBudget ?? DEFAULT_TOKEN_BUDGET,
      estimatedTokens: input.estimatedContextTokens,
      tierDistribution: input.tierAssignments?.reduce<Record<string, number>>((acc, a) => {
        acc[a.tier] = (acc[a.tier] || 0) + 1;
        return acc;
      }, {}),
    });
  }

  activeTrace.setPackagingSummary(packagingSummary);
  activeTrace.setAssemblySummary(assemblySummary);
  return { packagingSummary, assemblySummary };
}
```

The function is deliberately disciplined: it computes the two summaries, emits the one tiered-mode event needed for offline analysis, attaches both summaries to the active trace, and returns them. It does not finalize the trace, the search pipeline owns that call, so the summaries can be attached whether or not the trace is persisted.

## The retrieval result carries summaries

Summaries are declared as optional fields on `RetrievalResult`, the canonical return type from every search method. They're not attached on a side-channel; they're part of the same object everything else comes back in.

atomicmemory-core/src/services/memory-service-types.ts:103-117

```ts
export interface RetrievalResult {
  memories: import('../db/repository-types.js').SearchResult[];
  injectionText: string;
  citations: string[];
  retrievalMode: RetrievalMode;
  tierAssignments?: import('./tiered-loading.js').TierAssignment[];
  expandIds?: string[];
  estimatedContextTokens?: number;
  lessonCheck?: import('./lesson-service.js').LessonCheckResult;
  consensusResult?: import('./consensus-validation.js').ConsensusResult;
  packagingSignal?: import('./retrieval-format.js').PackagingSignal;
  retrievalSummary?: import('./retrieval-trace.js').RetrievalTraceSummary;
  packagingSummary?: import('./retrieval-trace.js').PackagingTraceSummary;
  assemblySummary?: import('./retrieval-trace.js').AssemblyTraceSummary;
}
```

Any consumer of the SDK, whether they're calling `MemoryService` directly or talking to the HTTP API, sees the same three summaries. The in-process shape uses TypeScript camelCase. The HTTP API translates that payload to the public snake\_case wire convention.

## HTTP: the observability envelope

On the wire, the three summaries are grouped under a single `observability` field. The grouping is itself a typed contract:

atomicmemory-core/src/services/memory-service-types.ts:158-163

```ts
/** Supported observability payload for retrieval responses. */
export interface RetrievalObservability {
  retrieval?: import('./retrieval-trace.js').RetrievalTraceSummary;
  packaging?: import('./retrieval-trace.js').PackagingTraceSummary;
  assembly?: import('./retrieval-trace.js').AssemblyTraceSummary;
}
```

The route builder is a thin shim, it collects whichever summaries are present on the `RetrievalResult` and omits the whole field if none of them ran.

atomicmemory-core/src/routes/memories.ts:667-675

```ts
function buildRetrievalObservability(result: RetrievalResult): RetrievalObservability | undefined {
  const observability: RetrievalObservability = {
    ...(result.retrievalSummary ? { retrieval: result.retrievalSummary } : {}),
    ...(result.packagingSummary ? { packaging: result.packagingSummary } : {}),
    ...(result.assemblySummary ? { assembly: result.assemblySummary } : {}),
  };

  return Object.keys(observability).length > 0 ? observability : undefined;
}
```

So a `POST /v1/memories/search` response looks like this (abridged):

```json
{
  "count": 3,
  "retrieval_mode": "flat",
  "scope": { "kind": "user", "userId": "u-123" },
  "memories": [
    { "id": "m-a", "content": "...", "similarity": 0.82, "score": 0.71, "importance": 0.6 },
    { "id": "m-b", "content": "...", "similarity": 0.78, "score": 0.69, "importance": 0.5 },
    { "id": "m-c", "content": "...", "similarity": 0.74, "score": 0.66, "importance": 0.4 }
  ],
  "injection_text": "...",
  "citations": ["m-a", "m-b", "m-c"],
  "observability": {
    "retrieval": {
      "candidate_ids": ["m-a", "m-b", "m-c", "m-d", "m-e"],
      "candidate_count": 5,
      "query_text": "what did we decide about retries?",
      "skip_repair": false,
      "trace_id": "trace-1777059543810-roea9",
      "stage_count": 10,
      "stage_names": ["initial", "entity-coretrieval", "mmr", "final"]
    },
    "packaging": {
      "package_type": "subject-pack",
      "included_ids": ["m-a", "m-b", "m-c"],
      "dropped_ids": ["m-d", "m-e"],
      "evidence_roles": { "m-a": "primary", "m-b": "supporting", "m-c": "contextual" },
      "episode_count": 2,
      "date_count": 1,
      "has_current_marker": false,
      "has_conflict_block": false,
      "token_cost": 184
    },
    "assembly": {
      "final_ids": ["m-a", "m-b", "m-c"],
      "final_token_cost": 184,
      "token_budget": null,
      "primary_evidence_position": 1,
      "blocks": ["subject"]
    }
  }
}
```

The `observability` key is stable. Field additions inside the three summaries are additive. Fields are never removed without a major version bump. You can build on this.

## What to do with it

A few concrete uses that drop out of having summaries on every response:

-   **Regression tests.** Assert that for a known query, `candidate_ids` includes the memory you expect and `primary_evidence_position === 1`. If packaging drifts, the test fails before prompt quality does.
-   **Eval dashboards.** Aggregate `token_cost`, `dropped_ids` rates, and evidence-role distributions across a traffic sample. Answer "how often do we drop candidates on this route?" without a separate telemetry pipeline.
-   **Debug panels.** Show the request-issuing agent the exact candidate → included → final pipeline for a given query. Because IDs are stable across the three summaries, a UI can render the whole journey from one HTTP response.
-   **Budget tuning.** `final_token_cost` vs `token_budget` across real traffic tells you whether your budget is tight, slack, or miscalibrated for your model's context window.

None of these require turning on a trace flag or mining a separate log store, the contract is in the response.

## Relationship to on-disk traces

The `TraceCollector` can also persist full per-stage traces (with content previews, similarities, scores, and per-stage timestamps) to disk when `RETRIEVAL_TRACE_ENABLED=true`. Those files are the fine-grained forensic artifact, useful for offline eval runs, regression archaeology, and prompt-engineering drills. They are a superset of what the summaries expose, and they live in `docs/memory-research/evaluation/traces/` by default.

Summaries and on-disk traces are complementary, not redundant:

-   **Summaries** ship on every response. Low overhead. Parseable. Stable contract. Always on.
-   **On-disk traces** are flag-gated. Higher overhead (content previews, per-stage snapshots). Tooling-friendly for eval pipelines. Not part of the API contract.

If you need to answer "what happened on this one request?", use the response's `observability` field. If you need to answer "across 10k requests last week, where did we drop candidates?", turn on `RETRIEVAL_TRACE_ENABLED` for the relevant job and mine the traces.
