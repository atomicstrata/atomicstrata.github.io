# Open Source vs Atomic Memory

> Agent index: [llms.txt](/llms.txt)

Atomic Memory runs in two modes backed by the **same engine**. The API surface, the AUDN mutation model, the retrieval pipeline, and the observability envelope are identical — what differs is where Core runs and what the console can see.

Start with **Connected Local** unless you have a specific reason not to.

Start here

Connected Local`am init` — Core on your machine, console shows runtime + traces. Free forever.

upgrade to Free ($0)

Add when needed

Atomic Memorymanaged hosting, shared access, one project on Free

## At a glance

|  | **Connected Local** | **Atomic Memory** |
| --- | --- | --- |
| **Setup** | `am init` — one command | Upgrade to Free, create a Cloud project |
| **Where memories live** | Your machine, in Core | Atomic Memory-managed hosting |
| **Console** | Runtime status, memories, operation traces | Same, for the managed project |
| **Account** | Sign-in creates a free Open Source org | Free tier ($0 self-serve upgrade) |
| **Good for** | Evaluating, local dev, day-to-day use | Shared access without operating infrastructure |
| **Plan** | Open Source — free forever, one Local project | Free — keeps your Local project, adds one Cloud project |

Team and Corporate plans are demo-led — [book a demo](https://atomicstrata.ai/demo) for pooled usage, more projects, and governed deployments.

## Choose Connected Local when

-   You want your first memory stored in minutes, with the console showing exactly what Core did.
-   Memories should live on your machine while you still get inspectable ingest, search, and mutation traces.
-   You are evaluating, developing locally, or running a single-developer workflow.

→ [Open Source Quickstart](/open-source/quickstart)

## Add Atomic Memory when

-   You need shared access to the same memories from more than one place.
-   You want a managed endpoint without operating Postgres and Core yourself.
-   You are ready to point production traffic at `https://api.atomicstrata.ai` with a project API key.

→ [Quickstart](/quickstart)

## Moving between them

The [TypeScript SDK](/sdk/overview) and the [CLI](/cli) work identically against a local Core and an Atomic Memory project — switching is a base URL and credential change, not a code change. To copy existing local memories into a Cloud project, see [Migrate to Atomic Memory](/cloud/how-to/migrate).
