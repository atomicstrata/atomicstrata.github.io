# The Dashboard

> Agent index: [llms.txt](/llms.txt)

The **Dashboard** is the first thing you see when you open a project. It answers three questions at a glance: what is stored, how do I connect, and what happened recently. For a cloud project it doubles as the activation path - get a key, wire up a tool, then confirm the traffic lands.

## What it does

-   Shows headline **stats** - stored memories and ingest, search, and package request counts - each with a tooltip defining exactly what it counts.
-   Provides **Connect your tools**: copy-ready snippets for Cursor, Claude Code, Claude Desktop, any MCP client, and the Node SDK, Python SDK, and CLI.
-   Lists the **most recent traces** with a link through to the full history.
-   Nudges you to **create an API key** first when the project has none.

## How it works

Each stat maps to a concrete API surface - for example, ingest requests count successful `POST /v1/ingest` calls - so the numbers are auditable, not estimates. The tool snippets are pre-filled with this project's API URL; drop one into the tool you already use:

```ts
import { MemoryClient } from '@atomicmemory/sdk'

const memory = new MemoryClient({
  providers: { atomicmemory: { apiUrl: '<your-api-url>', apiKey: process.env.ATOMICMEMORY_API_KEY } },
})
```

**Local projects** render a different overview: a live connection pill that pings your proxy, `n/a` stat placeholders (local usage isn't reported to the cloud), and the same tool snippets pointed at your local URL instead of a hosted key.

## Key capabilities

-   **Defined metrics** - every stat's tooltip states the exact call it counts.
-   **One-paste integration** - connect a tool without leaving the page.
-   **Recent activity** - see the latest traces and jump to the full log.

## Related

-   [What is Memories](/cloud/how-to/what-is-memories)
-   [Understanding Traces](/cloud/how-to/traces)
-   [Managing API Keys](/cloud/how-to/api-keys)
-   [Usage & Limits](/cloud/how-to/usage)
