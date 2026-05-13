# Architecture

> Agent index: [llms.txt](/llms.txt)

AtomicMemory is a **standardized platform layer for AI memory**, not a monolithic service. The engine is split into five independently replaceable domains (Ingest, Search, CRUD, Lifecycle, Trust) that sit behind explicit TypeScript contracts. You can swap any one of them without touching the others, because each is reachable through a plain function signature over a shared `MemoryServiceDeps` bundle.

This page walks through the five domains, shows where each lives in the real source, and explains why this split matters when you're choosing between AtomicMemory and the single-binary alternatives.

## The five domains

The `MemoryService` class is a **thin facade**. It holds no business logic, every public method delegates to one of five domain modules. Here is the whole shape of the facade (see [`src/services/memory-service.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/memory-service.ts)):

atomicmemory-core/src/services/memory-service.ts

```typescript
import { performIngest, performQuickIngest, performStoreVerbatim, performWorkspaceIngest } from './memory-ingest.js';
import { performSearch, performFastSearch, performWorkspaceSearch } from './memory-search.js';
import * as crud from './memory-crud.js';

export class MemoryService {
  // ...
  async ingest(userId, conversationText, sourceSite, sourceUrl, sessionTimestamp) {
    return performIngest(this.deps, userId, conversationText, sourceSite, sourceUrl, sessionTimestamp);
  }

  async scopedSearch(scope, query, options = {}) {
    if (scope.kind === 'workspace') return performWorkspaceSearch(/* ... */);
    if (options.fast)              return performFastSearch(/* ... */);
    return performSearch(/* ... */);
  }

  async list(userId, limit, offset, sourceSite, episodeId)  { return crud.listMemories(this.deps, /* ... */); }
  async evaluateDecay(userId, referenceTime)                 { return crud.evaluateDecay(this.deps, userId, referenceTime); }
  async consolidate(userId)                                  { return crud.consolidate(this.deps, userId); }
  // ... and so on
}
```

Every method is a one-liner. The class exists only to resolve the right domain module and pass along `this.deps`. This is deliberate, it means you can invoke any domain *directly* without constructing a `MemoryService` at all, which is exactly what the runtime does internally for parallel or background work.

### 1. Ingest domain

**File:** [`src/services/memory-ingest.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/memory-ingest.ts) **Entry points:** `performIngest`, `performQuickIngest`, `performStoreVerbatim`, `performWorkspaceIngest`

Ingest turns raw conversation text into canonical, deduplicated, trust-scored memory rows. It owns:

-   Episode persistence (the raw conversation blob)
-   Fact extraction (LLM consensus, rule-based quick path, or verbatim passthrough)
-   AUDN resolution (Add/Update/Delete/No-op decision against existing claims)
-   Embedding generation and entropy-gated storage
-   Post-write link creation and composite grouping

The pipeline is parameterized, not hard-coded. `performIngest` uses LLM consensus extraction and full AUDN; `performQuickIngest` swaps to rule-based extraction and skips AUDN for UC2 background capture. Both share the same inner `processFactThroughPipeline` call, differing only in flags:

atomicmemory-core/src/services/memory-ingest.ts

```typescript
for (const fact of facts) {
  const result = await timed('ingest.fact', () => processFactThroughPipeline(
    deps, userId, fact, sourceSite, sourceUrl, episodeId,
    {
      entropyGate: true,           // quickIngest: false
      fullAudn: true,              // quickIngest: false
      supersededTargets,
      entropyCtx,
      logicalTimestamp: sessionTimestamp,
      timingPrefix: 'ingest',
    },
  ));
  accumulateFactResult(acc, result);
  if (result.memoryId) storedFacts.push({ memoryId: result.memoryId, fact });
}
```

Why is this shaped this way? Because *ingest strategy* is the thing users most want to replace. Some teams want heavy consensus extraction with contradiction resolution; some want a 50ms rule-based pass; some want verbatim storage for user-uploaded files. The domain exposes three pre-wired strategies *and* a shared inner pipeline, so you can also add a fourth without rewriting anything else.

### 2. Search domain

**File:** [`src/services/memory-search.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/memory-search.ts) **Entry points:** `performSearch`, `performFastSearch`, `performWorkspaceSearch`

Search is pure orchestration. The file's own header comment is explicit about this: it "delegates formatting to retrieval-format, dedup to composite-dedup, side effects to retrieval-side-effects, lesson recording to lesson-service, and the main retrieval to search-pipeline." Every one of those is a separately replaceable module.

The orchestrator is a sequence of named steps, lesson check, URI resolution, core retrieval, post-processing, response assembly, each one a pure function. You can see the shape clearly in `performSearch`:

atomicmemory-core/src/services/memory-search.ts

```typescript
export async function performSearch(deps, userId, query, /* ... */): Promise<RetrievalResult> {
  const lessonCheck = await checkSearchLessons(deps, userId, query);
  if (lessonCheck && !lessonCheck.safe) {
    return { memories: [], injectionText: '', citations: [], retrievalMode: /* ... */, lessonCheck };
  }

  const { limit: effectiveLimit, classification } = resolveSearchLimitDetailed(query, limit, deps.config);
  const trace = new TraceCollector(query, userId);

  const uriResult = await tryUriResolution(deps, query, userId, retrievalOptions, trace);
  if (uriResult) return uriResult;

  const { memories: rawMemories, activeTrace } = await executeSearchStep(/* ... */);
  const filteredMemories = await postProcessResults(deps, rawMemories, activeTrace, userId, query, asOf);
  return assembleResponse(deps, filteredMemories, query, userId, activeTrace, /* ... */);
}
```

Notice what is *not* here: no direct SQL, no embedding calls, no ranker implementation, no token-budgeting. Each step hands off to a focused module. That means swapping the ranker doesn't touch the orchestrator, and swapping the orchestrator doesn't touch the ranker, which is precisely the property research harnesses and custom deployments need.

### 3. CRUD domain

**File:** [`src/services/memory-crud.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/memory-crud.ts) **Entry points:** `listMemories`, `getMemory`, `expandMemories`, `deleteMemory`, `resetBySource`, plus workspace-scoped variants

CRUD covers the operational surface, everything that is neither ingest nor similarity search. List, get, expand (staged-to-full content), soft delete, source-scoped reset, audit trail, mutation summary, lesson management. Each is a one- or two-line function that reads or writes through the store interfaces on `deps.stores`.

The shape is deliberately boring: no orchestration, no pipelines, just typed functions over stores. Workspace variants enforce agent visibility at the same layer so the HTTP route layer never has to re-check scope:

atomicmemory-core/src/services/memory-crud.ts

```typescript
export async function deleteMemoryInWorkspace(
  deps: MemoryServiceDeps,
  id: string,
  workspaceId: string,
  callerAgentId: string,
): Promise<boolean> {
  const memory = await deps.stores.memory.getMemoryInWorkspace(id, workspaceId, callerAgentId);
  if (!memory) return false;
  await deps.stores.memory.softDeleteMemoryInWorkspace(id, workspaceId);
  if (config.auditLoggingEnabled) {
    emitAuditEvent('memory:delete', '', {}, { memoryId: id, workspaceId });
  }
  return true;
}
```

The reason this is its own domain (not a grab-bag inside ingest or search) is that the contract is fundamentally different: CRUD operations are keyed, deterministic, and idempotent. They do not need embeddings, LLMs, or the retrieval pipeline. Isolating them means you can run CRUD against a stripped-down runtime that has no embedding provider bound at all.

### 4. Lifecycle domain

**File:** [`src/services/memory-lifecycle.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/memory-lifecycle.ts) **Entry points:** `evaluateDecayCandidates`, `checkMemoryCap`, plus `consolidate` / `executeConsolidation` via CRUD

Lifecycle is the "what should happen to memory over time" domain. Decay (Ebbinghaus forgetting curve), memory-count caps, consolidation cluster identification, deferred AUDN reconciliation. The module header is explicit about the design principle:

> Both features are pure functions over memory data + config, they compute what should happen but let the caller decide when to act.

That separation, computation of *candidates* from the *action* on them, is what makes lifecycle replaceable. Here is the retention score, the central primitive:

atomicmemory-core/src/services/memory-lifecycle.ts

```typescript
export function computeRetentionScore(
  memory: Pick<MemoryRow, 'importance' | 'last_accessed_at' | 'access_count' | 'trust_score'>,
  referenceTime: Date,
  decayConfig: DecayConfig,
): number {
  const elapsedMs = referenceTime.getTime() - memory.last_accessed_at.getTime();
  const recency = Math.exp(-elapsedMs / DECAY_TAU_MS);
  const accessFreq = Math.min(1.0, memory.access_count / 10);
  const rawScore = (decayConfig.importanceWeight * memory.importance)
    + (decayConfig.recencyWeight * recency)
    + (decayConfig.accessWeight * accessFreq);
  return rawScore * (memory.trust_score ?? 1.0);
}
```

It takes config and a memory row, returns a number. No database, no side effects, no globals. If you want a different decay model, power-law instead of exponential, per-user retention, or a learned importance weighting, you replace this one function and the rest of the engine is unaffected. The same property holds for `checkMemoryCap`, which returns a `CapRecommendation` tagged enum (`'none' | 'consolidate' | 'decay' | 'consolidate-and-decay'`) and leaves the action to the caller.

### 5. Trust domain

**Files:** [`src/services/trust-scoring.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/trust-scoring.ts) + [`src/services/write-security.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/write-security.ts) **Entry points:** `computeTrustScore`, `assessWriteSecurity`, `applyTrustPenalty`

Trust is enforced at two points, **write time** (before a memory is stored) and **read time** (when ranking candidates). At write time, `assessWriteSecurity` is the single gate every ingest path must pass through. It composes sanitization with trust scoring so the standard and hive ingest flows physically cannot diverge on what counts as unsafe content:

atomicmemory-core/src/services/write-security.ts

```typescript
export function assessWriteSecurity(
  content: string,
  sourceSite: string,
  config: WriteSecurityAssessConfig,
): WriteSecurityDecision {
  const trust = config.trustScoringEnabled
    ? computeTrustScore(content, sourceSite)
    : PASS_THROUGH_TRUST;

  if (!config.trustScoringEnabled)                           return { allowed: true,  blockedBy: null,           trust };
  if (!trust.sanitization.passed)                            return { allowed: false, blockedBy: 'sanitization', trust };
  if (!meetsMinimumTrust(trust, config.trustScoreMinThreshold)) return { allowed: false, blockedBy: 'trust',       trust };
  return { allowed: true, blockedBy: null, trust };
}
```

The score itself is built out of three orthogonal signals, domain reputation, injection-pattern detection, and content-anomaly warnings, each of which could be replaced independently:

atomicmemory-core/src/services/trust-scoring.ts

```typescript
export function computeTrustScore(content: string, sourceSite: string): TrustScore {
  const sanitization = sanitize(content);

  const domainTrust = isDomainTrusted(sourceSite) ? 0 : UNKNOWN_DOMAIN_PENALTY;

  const injectionCount = sanitization.findings.filter((f) => f.rule.startsWith('injection:')).length;
  const injectionPenalty = Math.min(injectionCount * INJECTION_PENALTY_PER_MATCH, MAX_INJECTION_PENALTY);

  const warnCount = sanitization.findings.filter((f) => f.severity === 'warn').length;
  const contentPenalty = warnCount * CONTENT_WARN_PENALTY;

  const score = Math.max(0, Math.min(1, 1.0 - domainTrust - injectionPenalty - contentPenalty));

  return { score, domainTrust: 1.0 - domainTrust, contentPenalty, injectionPenalty, sanitization };
}
```

At read time, the same trust score is re-used to down-rank low-trust memories via `applyTrustPenalty(retrievalScore, trustScore)`. One number, computed once at write, referenced everywhere after. That is what lets you enable or disable the whole domain with a single config flag, and it is what makes it safe to replace the scorer without re-embedding or re-ingesting.

## The shared contract: MemoryServiceDeps

Every domain function takes the same first argument:

```typescript
async function performIngest(deps: MemoryServiceDeps, /* ... */): Promise<IngestResult>
async function performSearch(deps: MemoryServiceDeps, /* ... */): Promise<RetrievalResult>
async function listMemories(deps: MemoryServiceDeps, /* ... */)
async function evaluateDecay(deps: MemoryServiceDeps, /* ... */): Promise<DecayResult>
```

`MemoryServiceDeps` is the full dependency bundle, `config`, `stores` (memory / episode / search / link / representation / claim / entity / lesson / pool), `observationService`, `uriResolver`. Because it is the *same* type for every domain, a custom implementation of any domain slots in without adapter code. And because each store is an interface (not a class), swapping Postgres for an alternative backend is a matter of implementing the store contract, not rewriting the engine.

See the [stores](/platform/stores) page for the full store contracts and how to bind custom implementations.

## Why this matters vs the alternatives

**vs. mem0.** Mem0 is SaaS-first and Python-centric. The open-source tier is a thin wrapper around their hosted API; the "platform" is hosted, not composed. AtomicMemory's engine runs on your Postgres, is addressable via both HTTP and in-process TypeScript, and lets you replace any of the five domains with your own implementation. There is no hosted dependency on the critical path.

**vs. Letta (formerly MemGPT).** Letta is tightly coupled to an agent framework, memory is a feature of the agent runtime, not a standalone service. If you're not using Letta's agents, you inherit a lot of framework you don't want. AtomicMemory's five-domain split is agent-framework-agnostic: the Ingest domain does not know what called it, the Search domain returns a `RetrievalResult`, and you wire it into whatever agent layer you already have.

**vs. Zep.** Zep is a Go-based commercial server with a fixed internal architecture. Extending it means forking Go code or waiting for upstream features. AtomicMemory is TypeScript-native with explicit domain boundaries and typed store contracts, so extending it means writing a TypeScript module that satisfies an existing interface. The cost-of-customization curve is fundamentally different.

The common theme: AtomicMemory treats memory as a **pluggable platform layer**, not a product. Every seam is explicit, typed, and individually replaceable, which is what makes the engine suitable as a foundation for teams who intend to customize, not just consume.

## Next steps

-   [Composition](/platform/composition), how `createCoreRuntime`, `createApp`, and `bindEphemeral` let you boot the engine in any context
-   [Stores](/platform/stores), the pluggable storage contracts each domain runs on
-   [Providers](/platform/providers), swapping embeddings and LLMs
-   [Scope](/platform/scope), user, workspace, and agent-visibility boundaries
