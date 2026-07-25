# Debug retrieval with traces

> Agent index: [llms.txt](/llms.txt)

When an assistant recalls the wrong thing, the bug is usually retrieval, not the model. AtomicMemory Cloud records a retrieval trace for every search and lets you replay any query in the Playground - so you can see exactly which memories came back for a query, and narrow down why.

## The problem

The model answers with a stale preference, or misses a fact you know is stored. Was the memory never written? Written under a different scope? Or simply not returned for this phrasing of the query? Without visibility into retrieval you are guessing, and guessing against an opaque vector store is slow.

## How the cloud helps

Every `search` produces a [retrieval trace](/cloud/how-to/traces): the query, the scope, and the memories that were returned for it. When recall looks wrong, open the trace to confirm what the layer actually handed back - then reproduce the exact query in the [Playground](/cloud/how-to/playground) to iterate on phrasing and scope against live project memory.

## How it works

Run the search your app runs, then inspect what it returned:

```ts
const { results } = await memory.search({
  query: "preferred airline",
  scope: { user: "user_001" },
});
```

If `results` doesn't contain the fact you expected, the retrieval trace for that call shows what did come back. Two causes surface fast:

-   **Wrong scope** - the memory exists, but under a different `user` or `agent`. Confirm it on the [Memories](/cloud/how-to/what-is-memories) page with the scope filter.
-   **Phrasing mismatch** - the query and the stored claim describe the same thing in different words. Reword and re-run in the Playground.

tip

Reproduce first, then fix. The Playground runs the same ingest and search path as your app, so a query that misbehaves in production misbehaves the same way here - giving you a deterministic loop.

## Key capabilities

-   **Retrieval traces** - every search records the query, scope, and the memories it returned.
-   **Playground replay** - re-run any query interactively against live project memory.
-   **Cross-check with Memories** - confirm a fact exists, and under which scope, when it doesn't come back.

## Outcomes

Retrieval bugs stop being guesswork. You see what a query returned, reproduce it in one place, and fix the scope or phrasing - instead of blaming the model.

## Get started

Run a search in the [Playground](/cloud/how-to/playground), open its retrieval trace, and compare the returned memories against what you expected. When the fact is missing, check the [Memories](/cloud/how-to/what-is-memories) page to see whether it was stored - and where.
