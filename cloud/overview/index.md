# Atomic Memory

> Agent index: [llms.txt](/llms.txt)

**Run memory on your own machine. See exactly what it's doing. Add managed hosting only when you need it.**

Atomic Memory pairs the **Open Source Core** engine with a developer console: Core stores and retrieves memories, and the console gives you inspectable ingest, search, and mutation traces without requiring you to host anything. The console labels the two project types **Local** and **Cloud**; this page calls them **Connected Local** (Core running on your machine, connected to the console) and **Atomic Memory** (fully managed hosting) before using the shorter labels.

**→ [Start the Quickstart](/quickstart)** — Connected Local in one command, free forever.  
Ready for shared or hosted access later? [Add Atomic Memory](/cloud/quickstart). Something not working? [Troubleshooting](/cloud/troubleshooting).

## Why teams start here

-   **Local ownership** — memories live in Core, on your machine. Nothing leaves your infrastructure unless you choose to add hosting.
-   **Console visibility** — every ingest, search, and mutation writes an inspectable trace with its call type, timing, and reconciliation decision; open Memory Explorer to see the actual stored content.
-   **Portable integrations** — the same CLI, SDK, and MCP tools work whether Core runs on your laptop or behind a managed endpoint.

## The Connected Local journey

Three steps, one command to start:

1.  **Install and run `am init`** — signs you in, starts Core in Docker, and connects your console project.
2.  **Add a memory** — `am memory ingest` and `am memory search` round-trip through your local Core.
3.  **Confirm it in the console** — the runtime shows **Online**, and your memory appears under **Memories** with a matching trace.

Success looks like: the CLI prints **Verified**, and the console shows the runtime **Online** with your memory listed.

Full walkthrough: [Platform Quickstart](/quickstart).

## Local vs Cloud

| Outcome | Local project | \+ Cloud project |
| --- | --- | --- |
| Where memories live | Your machine, via Core | Atomic Memory-managed hosting — your existing Local project's memories stay on your machine, unaffected |
| Console visibility | Runtime status, memories, traces | Same, plus a managed project space |
| Setup | `am init` | Upgrade to Free, then create a Cloud project |
| Good for | Evaluating, local dev, air-gapped work | Shared access without operating infrastructure |

The console labels these **Local** and **Cloud** projects — the shorter names used in this table and for the rest of the page.

## Plans at a glance

-   **Open Source** — free forever. One Connected Local project, full console visibility, no Atomic Memory project.
-   **Free** — a self-serve $0 upgrade. Keeps your Local project and unlocks one Atomic Memory project.

See [Plans & Billing](/cloud/how-to/billing) for details.

## Explore the console

-   [Developer Console](/cloud/console) — dashboard tour
-   [Memories](/cloud/how-to/what-is-memories) — inspect everything stored
-   [Traces](/cloud/how-to/traces) — ingest, search, and mutation history
-   [Playground](/cloud/how-to/playground) — try ingest and search interactively
-   [Integrations](/integrations/overview) — MCP, SDKs, and coding agents

## Advanced

-   [Authentication](/cloud/authentication) — credential model and deployment details
-   [Atomic Memory CLI](/cloud/cli) — full command reference
-   [Core architecture](/platform/architecture) — how the engine is composed
-   [Core-only Docker](/core-only-docker) — run Core without a Cloud connection
