# Understanding Traces

> Agent index: [llms.txt](/llms.txt)

The **Traces** page records what the memory layer did on every request your application made. Each retrieval, mutation, and package call becomes an inspectable **trace** - the memories it touched, the decision it reached, and the payload it returned.

## What it does

-   Streams traces live, newest first, as your application calls the memory layer - with a connection pill and a reconnect control if the stream drops.
-   Filters by type - retrieval, mutation, or package - and mirrors the choice into the URL, so a filtered view is shareable and survives a refresh.
-   Opens a detail view for any trace: the memories it included and excluded, the reconciliation decision, and the final response.

## How it works

Each call the memory layer serves writes exactly one trace row. A `search` produces a **retrieval** trace; an `ingest` produces a **mutation** trace; a context-packaging request produces a **package** trace.

```ts
// A search call...
await memory.search({ query: "seat preferences", scope: { user: "user_001" } });
// ...writes one retrieval trace: which memories were included, which were
// excluded, and the exact payload returned.
```

Open a **retrieval** trace to see two columns - **Included** and **Excluded** memories, each with its trust score - plus the final response payload. Open a **mutation** trace to see the AUDN decision (such as add, update, supersede, or no-op) with its confidence and reason, the previous claim struck through against the new claim, the source evidence, and the incoming input. Package traces appear in the list and filter; opening one shows its summary card.

The list is a live, recent window - it prepends new traces as they stream in rather than paginating a full history.

## Key capabilities

-   **Live stream** - traces appear the moment a request is served, with a reconnect control when the connection drops.
-   **Type filter** - isolate retrieval, mutation, or package traces; the filter lives in the URL.
-   **Decision transparency** - every mutation trace records the AUDN decision, its confidence, and the reason behind it.
-   **Traceable to memories** - jump from an included memory straight to its record in the [Memory Explorer](/cloud/how-to/what-is-memories).

## Related

-   [What is Memories](/cloud/how-to/what-is-memories)
-   [Resolving Conflicts](/cloud/how-to/conflicts)
-   [Using the Playground](/cloud/how-to/playground)
