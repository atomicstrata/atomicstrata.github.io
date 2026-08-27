# Open Source vs Atomic Memory

> Agent index: [llms.txt](/llms.txt)

Atomic Memory runs in two modes backed by the **same engine**. The API surface, the AUDN mutation model, the retrieval pipeline, and the observability envelope are identical — what differs is where Core runs and what the console can see.

Start with **Hosted Cloud** for the fastest setup. Choose **Connected Local** when you want Core on your machine.

Start here

Hosted Cloud`am init` — managed memory, no Docker. Fastest path.

or run Core locally

Alternative

Connected Local`am init --local` — Core on your machine, console shows runtime + traces.

## At a glance

|  | **Hosted Cloud** | **Connected Local** |
| --- | --- | --- |
| **Setup** | `am init` (default) or installer `--init` | `am init --local` + Docker + OpenAI key |
| **Where memories live** | Atomic Memory-managed hosting | Your machine, in Core |
| **Console** | Memories, operation traces | Runtime status, memories, operation traces |
| **Account** | Sign-in + Cloud project | Sign-in creates a free Open Source org |
| **Good for** | Fastest first memory, production API traffic | Local dev, on-machine content, evaluation |
| **Plan** | Free tier ($0 self-serve upgrade) | Open Source — free forever, one Local project |

Team and Corporate plans are demo-led — [book a demo](https://atomicstrata.ai/demo) for pooled usage, more projects, and governed deployments.

## Choose Hosted Cloud when

-   You want your first memory in minutes with no Docker or OpenAI key.
-   You want a managed endpoint at `https://api.atomicstrata.ai`.
-   You are building an app or agent that calls the Cloud memory API.

→ [Quickstart](/quickstart)

## Choose Connected Local when

-   Memories should live on your machine while you still get inspectable ingest, search, and mutation traces.
-   You are evaluating Core, developing locally, or running a single-developer workflow.
-   You need full control over where content is stored.

→ [Open Source Quickstart](/open-source/quickstart)

## Moving between them

The [TypeScript SDK](/sdk/overview) and the [CLI](/cli) work identically against a local Core and a Hosted Cloud project — switching is a base URL and credential change, not a code change. To copy existing local memories into a Cloud project, see [Migrate to Atomic Memory](/cloud/how-to/migrate).
