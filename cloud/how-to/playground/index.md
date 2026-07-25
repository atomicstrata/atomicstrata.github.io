# Using the Playground

> Agent index: [llms.txt](/llms.txt)

The **Playground** lets you ingest memories and run searches against your project straight from the dashboard - no terminal, no client code. It closes the loop: every result deep-links into the Memory Explorer so you can inspect exactly what happened.

## What it does

-   **Ingest** - push a piece of conversation or a claim and watch the memory layer store, update, or skip it.
-   **Search** - run a semantic query and see which memories match.
-   Deep-links every stored or matched memory into the [Memory Explorer](/cloud/how-to/what-is-memories) so you can inspect exactly what was written or retrieved.

## How it works

### Authenticate

Authenticate with the credential for this project's type, then work in the **Ingest** or **Search** tab.

-   **Cloud project** - paste a Cloud project API key (starts with `amc_`) from [API Keys](/cloud/how-to/api-keys) into the key field. Requests proxy same-origin through the dashboard.
-   **Local project** - paste your project's Local Core token, the same one `am init` configured on your Core (see [Authentication](/cloud/authentication#local-core-token-or-core_api_key)). Requests go straight to your Core instance, not through the Cloud gateway.

### Run a call

-   **Ingest** takes free-form content and a user ID. On success it reports how many memories were stored, updated, and skipped, and lists the resulting memory IDs as links straight into the Memory Explorer.
-   **Search** takes a query and a user ID and returns up to ten hits, each showing its claim, type, and status - follow any hit's link to see the full memory record.

Either way, each call also writes a trace you can open from the [Traces](/cloud/how-to/traces) page - that's your confirmation the credential worked and the request reached the memory layer.

tip

Whichever credential you use, it lives in the page's memory only - it is never stored or persisted. Grab a Cloud key from [API Keys](/cloud/how-to/api-keys), or find your Local Core token via [Authentication](/cloud/authentication#local-core-token-or-core_api_key), and paste it in each session.

## Key capabilities

-   **No-code loop** - exercise ingest and search without leaving the dashboard.
-   **Type-aware auth** - paste a Cloud API key or your Local Core token; the Playground calls the right surface for this project's type.
-   **Deep links** - jump from any stored or matched memory straight to its full record in the Memory Explorer.
-   **Cloud or Local** - works against Cloud projects and Local Core alike.

## Related

-   [What is Memories](/cloud/how-to/what-is-memories)
-   [Understanding Traces](/cloud/how-to/traces)
-   [Resolving Conflicts](/cloud/how-to/conflicts)
