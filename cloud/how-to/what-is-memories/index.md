# What is Memories

> Agent index: [llms.txt](/llms.txt)

The **Memories** page is the inspector for your project's memory layer. Every fact, preference, or claim the layer has ingested shows up here as a structured **memory** you can read, filter, and trace back to the moment it was written.

## What it does

-   Lists every stored memory for the active project, newest first.
-   Filters by scope (project, user, or agent) so you can see exactly what one end-user's assistant would recall.
-   Opens a detail view for any memory - its claim, the reasoning behind it, its scope, and the trace that produced it.

## How it works

When your application calls `ingest`, the memory layer does not blindly append text. It reconciles the new information against what it already knows and records the decision (add, update, delete, or no-op). The Memories page renders the **result** of those decisions - the current, reconciled state - while the [Traces](/cloud/how-to/traces) page shows the decisions themselves.

![ingest() flows into Reconcile, which resolves to an Add, Update, Delete, or No-op decision, updating the stored Memories and recording a Trace.](/img/cloud/memory-reconciliation.svg)

Every write is reconciled against existing memory, never blindly appended.

```ts
await memory.ingest({
  messages: [{ role: "user", content: "I prefer aisle seats." }],
  scope: { user: "user_001" },
});
```

Search reads from this same reconciled state, so what you see on the Memories page is what your application retrieves at query time.

## Key capabilities

-   **Inspectable state** - nothing is hidden; every claim is visible and queryable.
-   **Scoped views** - isolate memory per user or agent.
-   **Traceable** - jump from any memory to the trace that created it.

## Related

-   [Understanding Traces](/cloud/how-to/traces)
-   [Resolving Conflicts](/cloud/how-to/conflicts)
