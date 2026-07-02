# Lessons

> Agent index: [llms.txt](/llms.txt)

A **lesson** is a recorded failure pattern that AtomicMemory has seen for a specific user - a prompt-injection attempt that was blocked, a low-trust source that tried to write a fact, a high-confidence contradiction that forced a SUPERSEDE/DELETE, or a memory the user explicitly flagged as wrong. Each lesson is stored with a vector embedding of the offending text, a severity, and provenance. Before any future retrieval runs for that user, the search pipeline embeds the query and asks: *"have I been burned by something like this before?"* If a match crosses the similarity threshold, the retrieval either annotates the response with a warning or - for `critical` matches - refuses to return anything.

In other words: **lessons are the engine's long-term immune system.** They turn one-off bad inputs into durable per-user filters, without operator intervention.

This page explains what they are, when they get recorded, what each of the four HTTP endpoints is for, and how to think about the data they expose. Lessons are an optional subsystem - they only run when `lessonsEnabled` is set on the [runtime config](/platform/consuming-core) and a `LessonStore` is wired into the [composition root](/platform/composition).

## Why they exist

Memory systems that ingest from untrusted surfaces - chat transcripts, browser captures, third-party agents - are exposed to two classes of contamination that ordinary retrieval ranking can't fix:

1.  **Adversarial inputs.** A prompt-injection payload looks like normal text. Even after the input sanitizer catches it, the same attacker (or the same compromised source) tends to try the *same shape of payload* again. Embedding-similarity search over recorded blocks catches the re-attempt before it ever reaches a model.
2.  **Low-signal or contradicted writes.** Trust scoring rejects a fact today; tomorrow the same low-trust source ingests near-identical text. Without a memory of yesterday's rejection, retrieval is forced to re-evaluate from scratch every time. Lessons collapse that loop into a single embedding lookup.

The defense is **self-reinforcing**: every block, every contradiction, every user report makes the next retrieval slightly safer. The engine calls this its Phase 6 / A-MemGuard layer; the implementation lives in `atomicmemory-core/src/services/lesson-service.ts`.

## What gets recorded

Five lesson **types** are declared on the wire. Four of them are auto-recorded by the ingest pipeline; one is operator-driven.

| Type | Recorded when… | Severity | Recorded by |
| --- | --- | --- | --- |
| `injection_blocked` | input sanitizer flags a prompt-injection attempt (`block`\-severity finding) | `high` (1–2 findings) → `critical` (≥3) | ingest pipeline, automatic |
| `trust_violation` | the writing source's trust score falls below `trustScoreMinThreshold` | `medium` (`< threshold`) → `high` (`< 0.1`) | ingest pipeline, automatic |
| `contradiction_pattern` | a SUPERSEDE or DELETE fires with contradiction confidence ≥ 0.8 | `medium` | ingest pipeline, automatic |
| `false_memory` *(reserved)* | not yet recorded by any service path | \- | reserved for future automatic detection |
| `user_reported` | operator/end-user explicitly flags a memory via `POST /lessons/report` | `high` by default; caller may pass `low | medium | high | critical` | application code |

Every lesson row carries:

-   the **pattern text** (a truncated extract of the offending content + the reason it was flagged),
-   the **embedding** of that pattern (pgvector, same model as memories so retrieval-time matching is direct),
-   the **source memory ids** that produced or were affected by the lesson,
-   the **severity**, and
-   structured **metadata** about the trigger (rule names, trust score, contradiction confidence, source site).

The shape lives in `atomicmemory-core/src/db/repository-lessons.ts`:

atomicmemory-core/src/db/repository-lessons.ts:26-38

```ts
export interface LessonRow {
  id: string;
  user_id: string;
  lesson_type: LessonType;
  pattern: string;
  embedding: number[];
  source_memory_ids: string[];
  source_query: string | null;
  severity: LessonSeverity;
  active: boolean;
  metadata: Record<string, unknown>;
  created_at: Date;
}
```

## How they affect retrieval

Every search runs through `checkLessons` before results are returned. The check embeds the query, runs a cosine-similarity lookup against the user's active lessons (similarity threshold `0.75`, top `3` matches), and returns three things:

-   `safe: boolean` - `false` only if any matched lesson has severity `critical`. A `false` here causes the orchestrator to skip core retrieval entirely and return an empty memory list with a `lessonCheck` block explaining why.
-   `warnings: string[]` - one short warning per matched lesson, suitable for surfacing in a UI ("flagged previously: …").
-   `highestSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical'` - so callers can decide their own gating without parsing the warnings.

The full block also appears on the search response (`lessonCheck` / `lesson_check`), so application code can render it without making a second round-trip. In the SDK it shows up on `SearchResult.lessonCheck`; on the wire it's the `lesson_check` field on the search response.

## The four HTTP endpoints

All four endpoints live under `/v1/memories/lessons*` and are user-scoped

-   every read and every write requires a `userId` query parameter, mirroring the rest of the memories surface.

### GET /v1/memories/lessons - list

Returns all active lessons for a user, newest first. Use it to:

-   power an admin or trust-and-safety dashboard,
-   debug a blocked retrieval (the `lessonCheck` from search names matched lesson IDs; this endpoint resolves them),
-   audit what your ingest pipeline has been recording over time.

The pattern text is included in each row, so the response can be sensitive - treat the endpoint the same way you treat memory contents.

See: [List active lessons](/api-reference/http/list-lessons).

### GET /v1/memories/lessons/stats - counts only

Returns just the aggregate count of active lessons per type:

```json
{
  "total_active": 7,
  "by_type": {
    "injection_blocked": 3,
    "trust_violation": 2,
    "contradiction_pattern": 1,
    "user_reported": 1
  }
}
```

This is the right endpoint when you want a **lightweight health signal**

-   a number you can show next to a user, watch for spikes (e.g. sudden growth in `injection_blocked` from a single source), or feed into monitoring without exposing pattern text.

See: [Lesson statistics](/api-reference/http/get-lesson-stats).

### POST /v1/memories/lessons/report - operator-driven recording

Records a `user_reported` lesson on behalf of the caller. The body specifies the offending pattern, the source memory IDs that produced it, and an optional severity. Use it when:

-   a user clicks "this memory is wrong / harmful" in a UI,
-   an operator runs a sweep that finds bad content the automatic detectors missed,
-   a downstream system (eval harness, abuse pipeline) wants to teach the retriever about a pattern.

This is the only endpoint where the **application controls severity**. The default is `high`; pass `critical` if you want subsequent retrievals to fail closed rather than warn.

See: [Report a new lesson](/api-reference/http/report-lesson).

### DELETE /v1/memories/lessons/:id - retire

Marks a lesson inactive (`active = false` in the DB). Active is the only state that affects retrieval, so a deactivated lesson is effectively ignored but still preserved for audit. Use it to:

-   reverse a false positive,
-   retire a lesson whose source has been investigated and resolved,
-   bulk-clean a user's record without losing the audit trail.

See: [Deactivate a lesson](/api-reference/http/deactivate-lesson).

## When you might not want lessons on

Lessons are feature-flagged on the runtime config (`lessonsEnabled`). Reasons to leave the flag off:

-   **You're running fully offline / single-trust-source.** If every write comes from a trusted local agent, the bad-input class lessons are designed to catch can't happen.
-   **You aren't shipping the embedding model lessons rely on.** Lesson matching reuses the same embedding pipeline as memories. If you've customized that pipeline, verify the threshold (`0.75`) still separates real matches from noise for your model.
-   **You want zero per-user pgvector rows beyond the memories table.** Lessons add their own table; some embedded deployments prefer the smaller footprint.

When the flag is off, search returns no `lessonCheck` block, the four endpoints respond with empty data, and no rows are written.

## Day-to-day recipes

A few practical patterns:

-   **Surface a count to users.** Poll `GET /lessons/stats` on dashboard load; show `total_active` as a small badge. Don't fetch `GET /lessons` unless the user clicks into details - the patterns can contain raw prompt-injection payloads.
-   **Alert on spikes.** Diff `by_type.injection_blocked` against a recent baseline; a sustained jump is usually a single bad source. Cross- reference with `GET /lessons` to find the source site listed in each row's `metadata.sourceSite`.
-   **Wire user feedback to `POST /lessons/report`.** When a "flag this memory" affordance fires, send the memory ID and a one-sentence rationale as the `pattern`. Severity `high` is the right default - bump to `critical` only when the user explicitly says "block this".
-   **Roll back over-eager auto-recording.** Pull recent rows from `GET /lessons`, inspect the `metadata` to spot false-positive triggers, and `DELETE /lessons/:id` the offenders. The deactivated rows remain queryable in the DB but no longer affect retrieval.

## SDK access

The TypeScript SDK exposes the four endpoints on the [`atomicmemory` namespace handle](/sdk/api/memory-provider), under `client.memory.lessons`:

```ts
const { lessons, count } = await client.memory.lessons.list(userId);
const stats = await client.memory.lessons.stats(userId);
const { lessonId } = await client.memory.lessons.report({
  userId, pattern, sourceMemoryIds, severity: 'high',
});
await client.memory.lessons.delete(lessonId, userId);
```

`SearchResult.lessonCheck` carries the per-query check inline (camelCase fields: `safe`, `warnings`, `highestSeverity`, `matchedCount`), so most applications never have to call the list endpoint to react to a flagged query.

## See also

-   [Stores](/platform/stores) - where `LessonStore` plugs into the composition root.
-   [Architecture](/platform/architecture) - how `checkLessons` slots into the search orchestrator.
-   [Consuming core](/platform/consuming-core) - runtime config surface including the `lessonsEnabled` flag.
