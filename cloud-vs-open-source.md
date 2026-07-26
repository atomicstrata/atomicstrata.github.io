# Open Source vs Atomic Memory

> Agent index: [llms.txt](/llms.txt)

Atomic Memory runs in three modes backed by the **same engine**. The API surface, the AUDN mutation model, the retrieval pipeline, and the observability envelope are identical — what differs is where Core runs and what the console can see.

Start with **Connected Local** unless you have a specific reason not to.

Start here

Connected Local`am init` — Core on your machine, console shows runtime + traces. Free forever.

upgrade to Free ($0)

Add when needed

Atomic Memorymanaged hosting, shared access, one project on Free

Prefer the engine with no account at all? [Core-only Docker](/core-only-docker) runs Core with curl — no console, no sign-in.

## At a glance

|  | **Connected Local** | **Atomic Memory** | **Core-only Docker** |
| --- | --- | --- | --- |
| **Setup** | `am init` — one command | Upgrade to Free, create a Cloud project | `docker run` + curl |
| **Where memories live** | Your machine, in Core | Atomic Memory-managed hosting | Your machine |
| **Console** | Runtime status, memories, operation traces | Same, for the managed project | None |
| **Account** | Sign-in creates a free Open Source org | Free tier ($0 self-serve upgrade) | Not required |
| **Good for** | Evaluating, local dev, day-to-day use | Shared access without operating infrastructure | Air-gapped work, CI, no-console automation |
| **Plan** | Open Source — free forever, one Local project | Free — keeps your Local project, adds one Cloud project | n/a |

Team and Corporate plans are demo-led — [book a demo](https://atomicstrata.ai/demo) for pooled usage, more projects, and governed deployments.

## Choose Connected Local when

-   You want your first memory stored in minutes, with the console showing exactly what Core did.
-   Memories should live on your machine while you still get inspectable ingest, search, and mutation traces.
-   You are evaluating, developing locally, or running a single-developer workflow.

→ [Quickstart](/quickstart)

## Add Atomic Memory when

-   You need shared access to the same memories from more than one place.
-   You want a managed endpoint without operating Postgres and Core yourself.
-   You are ready to point production traffic at `https://api.atomicstrata.ai` with a project API key.

→ [Add Atomic Memory](/cloud/quickstart)

## Choose Core-only Docker when

-   You need the engine with no account and no console — air-gapped, CI, or fully offline work.
-   You are embedding Core in your own stack and bringing your own observability.
-   You want to fork the engine, replace a store, or add a provider.

→ [Core-only Docker](/core-only-docker)

## Moving between them

The [TypeScript SDK](/sdk/overview) and the [CLI](/cloud/cli) work identically against a local Core and an Atomic Memory project — switching is a base URL and credential change, not a code change. To copy existing local memories into a Cloud project, see [Migrate to Atomic Memory](/cloud/how-to/migrate).
