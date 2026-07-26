# Understanding Traces

> Agent index: [llms.txt](/llms.txt)

The **Traces** page records what the memory layer did on every request your application made. Each retrieval, mutation, and package call becomes an inspectable **trace** - the memories it touched, the decision it reached, and the payload it returned.

## What it does

-   Streams traces live, newest first, as your application calls the memory layer - with a connection pill and a reconnect control if the stream drops.
-   Filters by type - retrieval, mutation, or package - and mirrors the choice into the URL, so a filtered view is shareable and survives a refresh.
-   Opens a detail view for any trace: the memories it included and excluded, the reconciliation decision, and the final response - with content redacted for Local projects (see below).

## How it works

Each call the memory layer serves writes exactly one trace row. A `search` produces a **retrieval** trace; an `ingest` produces a **mutation** trace; a context-packaging request produces a **package** trace.

```ts
// A search call...
await memory.search({ query: "seat preferences", scope: { user: "user_001" } });
// ...writes one retrieval trace: which memories were included, which were
// excluded, and the exact payload returned.
```

**Local** and **Cloud** projects populate this page differently - this page calls them **Connected Local** (Core running on your machine, connected to the console) and **Atomic Memory** (fully managed hosting) once, then uses the shorter **Local**/**Cloud** labels below, matching the console's own labels. A Local project's memory content never leaves your Core, so the trace row the console stores has its claim text and inputs redacted - you get the call type, timing, and outcome, not the underlying content. A Cloud project's content already lives in managed infrastructure, so its traces show full detail; content-level inspection is effectively Cloud-only today.

Open a **retrieval** trace to see two columns - **Included** and **Excluded** memories - plus the final response payload (redacted for Local projects, as above). Open a **mutation** trace to see the AUDN decision (such as add, update, supersede, or no-op) with its confidence and reason, the previous claim struck through against the new claim, the source evidence, and the incoming input (also redacted for Local projects). Package traces appear in the list and filter; opening one shows its summary card.

The list is a live, recent window - it prepends new traces as they stream in rather than paginating a full history.

Success looks like: after your first `ingest` or `search` call, a matching trace appears in the list within moments - that's your confirmation the call reached the memory layer and was recorded.

## Key capabilities

-   **Live stream** - traces appear the moment a request is served, with a reconnect control when the connection drops.
-   **Type filter** - isolate retrieval, mutation, or package traces; the filter lives in the URL.
-   **Decision transparency** - every mutation trace records the AUDN decision, its confidence, and the reason behind it.
-   **Local redaction** - Local projects never send memory content to the console; their traces show call type and outcome, not claim text.
-   **Traceable to memories** - jump from an included memory straight to its record in the [Memory Explorer](/cloud/how-to/what-is-memories).

## Related

-   [What is Memories](/cloud/how-to/what-is-memories)
-   [Resolving Conflicts](/cloud/how-to/conflicts)
-   [Using the Playground](/cloud/how-to/playground)
