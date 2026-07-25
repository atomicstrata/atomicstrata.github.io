# Developer Console

> Agent index: [llms.txt](/llms.txt)

The AtomicMemory developer console at **[memory.atomicstrata.ai](https://memory.atomicstrata.ai)** is a Next.js dashboard for provisioning projects, managing API keys, exploring memories, and inspecting AUDN mutation traces.

All `/app/*` routes require sign-in. The marketing landing page and `/share/*` public memory viewer stay open without an account.

## First-run onboarding

New users follow a guided path:

1.  Sign up at [memory.atomicstrata.ai/signup](https://memory.atomicstrata.ai/signup) and select or create an Organization.
2.  The console provisions a default **Local** project (slug `default`) — Open Source starts with one Connected Local project and no Hosted Cloud project.
3.  **Connect Core**: run `am init` in your terminal. It signs you in, starts Core, connects this project, and verifies the memory pipeline end to end.
4.  Once the runtime reports **Online**, the console hands off to the project **Overview** — no key to create or redeem first.
5.  Optional: upgrade to **Free** (self-serve, $0) from **Billing** to unlock one Hosted Cloud project.

See [Platform Quickstart](/quickstart) for the full `am init` walkthrough, then [Add Hosted Cloud](/cloud/quickstart) when you want managed hosting.

## Inside a project

Each project includes:

| Section | Purpose |
| --- | --- |
| **Overview** | Stats, integration snippets, setup checklist |
| **Memories** | Memory Explorer with filters, inline evidence, trace deep-links |
| **Traces** | AUDN mutation and retrieval trace viewer, updates live |
| **API Keys** | Create, list, and revoke project keys |
| **Usage** | Usage events and stored memory counts |
| **Playground** | Interactive ingest and search (Hosted Cloud key or Connected Local Core) |
| **Settings** | Project configuration |
| **Audit** | Project-scoped admin audit log |

Memory and trace views update live as new activity happens — no manual refresh needed. Session and proxy details behind that live update behavior are covered in [Authentication → Advanced deployment details](/cloud/authentication#advanced-deployment-details), not repeated here.

## Setup checklist

The sidebar **SetupGuide** tracks activation milestones:

-   First API key created (Hosted Cloud projects only)
-   First ingest completed
-   First search completed

Complete these from the Overview page or Playground.

## Integration snippets

The project Overview surfaces copy-paste snippets for:

-   MCP (`@atomicmemory/mcp`)
-   TypeScript and Python SDKs
-   Claude Code plugin
-   AtomicMemory CLI (`am memory ingest`)

Snippets use your project's API base URL automatically for Hosted Cloud projects.

## Public memory sharing

`/share/*` renders a read-only memory list for unauthenticated visitors. Sign-in CTAs appear in the chrome for visitors who want full console access.

## Related docs

-   [Authentication](/cloud/authentication) - how the console authenticates to the API
-   [The Dashboard](/cloud/how-to/dashboard) - project landing page and activation path
-   [Platform Observability](/platform/observability) - trace schema on the engine side
