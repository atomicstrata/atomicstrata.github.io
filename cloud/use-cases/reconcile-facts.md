# Reconcile facts instead of appending

> Agent index: [llms.txt](/llms.txt)

Append-only memory rots. Every time a user restates something it becomes another row, contradictions pile up, and retrieval hands back three versions of the same fact. AtomicMemory Cloud reconciles each write against what it already knows, so memory stays consistent as facts change.

## The problem

A user says "I live in San Francisco," then months later "I moved to New York." A naive store keeps both. Now a search for their location returns two contradictory facts and the model picks one at random. The more your users talk, the noisier their memory gets - and the harder it is to trust any single recall.

## How the cloud helps

On every `ingest`, the layer compares the incoming information to existing memory and records an explicit decision - **Add** a new fact, **Update** an existing one, **Delete** one that no longer holds, or **No-op** when nothing changed. "Moved to New York" updates the standing location instead of duplicating it. When new information genuinely contradicts what's stored, the layer surfaces a [conflict](/cloud/how-to/conflicts) for review rather than silently overwriting or merging.

## How it works

The same scope, written twice, does not produce two facts:

```ts
// First session
await memory.ingest({
  messages: [{ role: "user", content: "I live in San Francisco." }],
  scope: { user: "user_001" },
});

// Months later - same scope
await memory.ingest({
  messages: [{ role: "user", content: "I just moved to New York." }],
  scope: { user: "user_001" },
});
```

The second call doesn't append. The layer recognizes it's the same underlying fact and records an **Update** - the standing memory now reads New York, and the [Traces](/cloud/how-to/traces) page shows the before and after. A later search for the user's location returns one answer, not a contradiction.

info

Reconciliation is scoped. Facts are compared within a scope, so one user's move never rewrites another user's - or the shared project's - memory.

## Key capabilities

-   **AUDN decisions** - every write resolves to Add, Update, Delete, or No-op, never a blind append.
-   **Conflicts surfaced** - contradictory facts are flagged for review, not silently merged away.
-   **Consistent retrieval** - one fact per truth, so search returns a clean answer instead of a pile of restatements.

## Outcomes

Memory stays small and truthful as it grows. Retrieval returns the current fact, and every change is auditable as a decision on the Traces page rather than an opaque overwrite.

## Get started

Ingest the same fact twice from the [Playground](/cloud/how-to/playground) and watch the [Traces](/cloud/how-to/traces) page record an **Update** instead of a second **Add**. When a contradiction can't be resolved automatically, review it on the [Conflicts](/cloud/how-to/conflicts) page.
