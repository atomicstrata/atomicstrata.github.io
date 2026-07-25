# Using the Playground

> Agent index: [llms.txt](/llms.txt)

The **Playground** lets you ingest memories and run searches against your project straight from the dashboard - no terminal, no client code. It closes the loop: every result deep-links into the Memory Explorer so you can inspect exactly what happened.

## What it does

-   **Ingest** - push a piece of conversation or a claim and watch the memory layer store, update, or skip it.
-   **Search** - run a semantic query and see the matching memories ranked by trust.
-   Deep-links every stored or matched memory into the [Memory Explorer](/cloud/how-to/what-is-memories) so you can inspect exactly what was written or retrieved.

## How it works

Paste a project API key (it starts with `amc_`) into the key field, then work in the **Ingest** or **Search** tab.

-   **Ingest** takes free-form content and a user ID. On success it reports how many memories were stored, updated, and skipped, and lists the resulting memory IDs as links.
-   **Search** takes a query and a user ID and returns up to ten hits, each showing its claim, trust score, type, and status.

For managed (cloud) projects the requests are proxied same-origin through the dashboard; for local self-hosted projects they go straight to your core instance. Either way, each call also writes a trace you can open from the [Traces](/cloud/how-to/traces) page.

tip

The API key lives in the page's memory only - it is never stored or persisted. Grab a project key from [API Keys](/cloud/how-to/api-keys) and paste it in each session.

## Key capabilities

-   **No-code loop** - exercise ingest and search without leaving the dashboard.
-   **Trust-ranked results** - search hits are scored so you can see what your application would actually retrieve.
-   **Deep links** - jump from any stored or matched memory straight to its full record in the Memory Explorer.
-   **Managed or local** - works against cloud-managed projects and self-hosted core alike.

## Related

-   [What is Memories](/cloud/how-to/what-is-memories)
-   [Understanding Traces](/cloud/how-to/traces)
-   [Resolving Conflicts](/cloud/how-to/conflicts)
