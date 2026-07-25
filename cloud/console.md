# Developer Console

> Agent index: [llms.txt](/llms.txt)

The AtomicMemory developer console at **[memory.atomicstrata.ai](https://memory.atomicstrata.ai)** is a Next.js dashboard for provisioning projects, managing API keys, exploring memories, and inspecting AUDN mutation traces.

All `/app/*` routes require sign-in. The marketing landing page and `/share/*` public memory viewer stay open without an account.

## First-run onboarding

New users follow a guided path:

1.  Sign up at `/signup`
2.  Gateway at `/app` redirects to `/app/onboarding` when no project exists or a cloud project has zero API keys
3.  Default org + `default-project` are auto-provisioned
4.  First API key is revealed exactly once with copy-to-clipboard and CLI commands
5.  Redirect to project **Overview** after acknowledgment

See [Cloud Quickstart](/cloud/quickstart) for the full happy path.

## Project workspace

Each project includes:

| Section | Purpose |
| --- | --- |
| **Overview** | Stats, integration snippets, setup checklist |
| **Memories** | Memory Explorer with filters, inline evidence, trace deep-links |
| **Traces** | AUDN mutation and retrieval trace viewer (live SSE updates) |
| **API Keys** | Create, list, and revoke project keys |
| **Usage** | Usage events and stored memory counts |
| **Playground** | Interactive ingest and search (managed or local core) |
| **Settings** | Project configuration |
| **Audit** | Project-scoped admin audit log |

## How the console reaches the API

| Data plane | Auth |
| --- | --- |
| Browser → Next.js `/api/proxy/*` → cloud API | Session JWT (console) or pasted API key (Playground) |

The console never exposes `AM_API_URL` to the browser bundle.

## Real-time updates

The console uses Server-Sent Events (SSE) proxied same-origin:

| Stream | Route | Events |
| --- | --- | --- |
| Memories | `/api/proxy/projects/{id}/memories/stream` | `ready`, `memory` |
| Traces | `/api/proxy/projects/{id}/traces/stream` | `ready`, `trace` |

Live updates appear in the Memory Explorer and trace views without polling.

## Setup checklist

The sidebar **SetupGuide** tracks activation milestones:

-   First API key created
-   First ingest completed
-   First search completed

Complete these from the Overview page or Playground.

## Integration snippets

The project Overview surfaces copy-paste snippets for:

-   MCP (`@atomicmemory/mcp`)
-   TypeScript and Python SDKs
-   Claude Code plugin
-   Cloud CLI (`am memory ingest`)

Snippets use your project's API base URL automatically for managed projects.

## Public memory sharing

`/share/*` renders a read-only memory list for unauthenticated visitors. Sign-in CTAs appear in the chrome for visitors who want full console access.

## Related docs

-   [Authentication](/cloud/authentication) - how the console authenticates to the API
-   [Cloud HTTP API](/cloud/how-to/dashboard) - dashboard and memory routes
-   [Platform Observability](/platform/observability) - trace schema on the engine side
