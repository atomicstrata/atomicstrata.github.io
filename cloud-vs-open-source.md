# Cloud vs Open Source

> Agent index: [llms.txt](/llms.txt)

AtomicMemory ships in two consumption modes backed by the **same memory engine**. The API surface, the AUDN mutation model, the retrieval pipeline, and the observability envelope are identical. What differs is who runs the infrastructure.

Start with **AtomicMemory** unless you have a specific reason to self-host.

Question

Must data stay on your own infrastructure?

No

Hosted

AtomicMemoryconsole, traces, and keys managed for you

Yes

Self-hosted

AtomicMemory OSSyou run the engine and the database

Either way you get the **same engine, the same API, and the same SDK**.

## At a glance

|  | **AtomicMemory** | **Open Source** |
| --- | --- | --- |
| **Setup** | Sign up, copy an API key | Docker, Postgres volume, provider keys |
| **You provide** | Nothing | Host, database, OpenAI (or local) provider keys |
| **Runs where** | `api.atomicstrata.ai` | Your machine, your VPC, your cluster |
| **Console, traces, usage** | Included | Build your own on the observability envelope |
| **Orgs, projects, scoped keys** | Included | Single-tenant; you model tenancy yourself |
| **Data residency** | Managed by AtomicStrata | Entirely yours |
| **License / cost** | Usage-based | Apache-2.0, free |
| **Best for** | Shipping a product, prototypes, teams | Air-gapped, regulated, or infra-owning teams |

## Choose AtomicMemory when

-   You want your first memory stored in under five minutes.
-   You want the developer console, traces, conflict inspection, and usage tracking without building them.
-   You need orgs, projects, environments, and scoped API keys out of the box.
-   Running and upgrading a Postgres + pgvector service is not where you want to spend time.

→ [Cloud Quickstart](/cloud/quickstart)

## Choose Open Source when

-   Memory data cannot leave your infrastructure for regulatory or contractual reasons.
-   You need to run air-gapped or fully offline, including local embedding models.
-   You want to fork the engine, replace a store, or add a provider.
-   You are running deterministic tests or benchmarks against an ephemeral in-process engine.

→ [Open Source Quickstart](/quickstart)

## Moving between them

The [TypeScript SDK](/sdk/overview) routes through `MemoryProvider`, so the same application code targets either mode. Switching is a configuration change — point at `https://api.atomicstrata.ai` with a Cloud project key, or at your own host with your own key. See [one SDK, self-hosted or managed](/cloud/use-cases/one-sdk-self-hosted-or-managed).

The [HTTP API](/api-reference/http/conventions) is the same in both modes, so non-TypeScript consumers move by changing a base URL and a credential.
