# Introduction

> Agent index: [llms.txt](/llms.txt)

AtomicMemory is an open-source memory engine for AI applications, semantic retrieval, AUDN mutation (Add / Update / Delete / No-op), and contradiction-safe claim versioning, delivered as an HTTP service you can run with one `docker compose up`. It is pluggable at every seam: swap the embedding provider, the LLM, the storage backend, or the scope model without forking. The engine ships as a standardized platform layer, not a framework, not a SaaS, so your agents, assistants, and products can compose the memory stack they need.

## Why AtomicMemory

AI memory is becoming a platform concern, not a product feature. Most existing options force a hosted runtime, a specific agent framework, or a proprietary query language. AtomicMemory is designed around the opposite defaults.

Memory is also production state. If remembered facts can change agent behavior, engineers need to inspect them, correct them, audit where they came from, and replace the parts of the system they disagree with. Most memory products optimize for recall first and expose operational control later. AtomicMemory is built for memory you can own.

| Production requirement | AtomicMemory | mem0 | Letta | Zep |
| --- | --- | --- | --- | --- |
| Own the memory layer, not rent a hosted opinion | **Best fit.** Apache-2.0 engine, self-hosted by default, Postgres-backed, no required hosted control plane. | OSS plus hosted platform orientation. | Self-hosted agent runtime. | OSS plus commercial / hosted platform orientation. |
| Inspect memory during an incident | **Best fit.** Stored content, trust, source, timestamps, mutation lineage, and audit surfaces live in inspectable engine state and ordinary Postgres. | Inspection depends on Mem0's exposed APIs and platform surfaces. | Inspection happens through the Letta agent/runtime model. | Inspection depends on the server and hosted / platform surfaces. |
| Correct bad memory without wiping the user | **Best fit.** AUDN mutation, `SUPERSEDE`, `CLARIFY`, trust scoring, CRUD, consolidation, and decay are core domains. | Primarily memory add/search/update/delete abstraction. | Memory correction is coupled to agent state. | Memory correction is coupled to the server's memory model. |
| Debug why retrieval behaved a certain way | **Best fit.** Search responses separate retrieval, packaging, and final context assembly in a structured observability envelope. | Logs and integrations. | Framework-dependent tracing. | Hosted / server observability. |
| Swap internals without rewriting the product | **Best fit.** Ingest, Search, CRUD, Lifecycle, Trust, stores, embeddings, LLMs, and SDK backends are explicit typed seams. | Provider and storage choices exist, but the core pipeline is not exposed as five replaceable domains. | Customize by adopting or extending the Letta agent runtime. | Customize mostly through server configuration and supported APIs. |
| Run deterministic local tests and benchmarks | **Best fit.** The same engine boots as production HTTP, in-process TypeScript, or ephemeral test server from `createCoreRuntime`. | Possible, but not the primary product shape. | Possible inside the Letta framework. | Server-oriented; less suited to per-test composition. |
| Keep app code portable across memory engines | **Best fit.** The TypeScript SDK routes through `MemoryProvider`, so apps can compare AtomicMemory, Mem0, or custom backends behind one interface. | You integrate with Mem0's SDK/API. | You integrate with Letta's agent/runtime abstractions. | You integrate with Zep's server/API model. |

Sources for third-party positioning: [Mem0 OSS overview](https://docs.mem0.ai/open-source/overview), [Letta intro](https://docs.letta.com/guides/get-started/intro), [Zep overview](https://help.getzep.com/overview). AtomicMemory architecture details: [Architecture](/platform/architecture), [Composition](/platform/composition), [Scope](/platform/scope), [Observability](/platform/observability).

The pitch is not "we do more." It is: the seams are explicit, the contracts are stable, and you compose your own stack.

## Platform at a glance

-   **Pluggable storage**, five domain-facing store interfaces so ingest, search, CRUD, lifecycle, and trust each see only the contract they need ([stores](/platform/stores))
-   **Pluggable providers**, embeddings via openai, openai-compatible, ollama, transformers (local WASM), or voyage; LLM via openai, openai-compatible, ollama, anthropic, google, or groq ([providers](/platform/providers))
-   **Explicit composition**, a single composition root wires the runtime container; no hidden singletons, no global state ([composition](/platform/composition))
-   **First-class scope**, user, workspace, and agent scopes dispatched at the request boundary, not bolted on after ([scope](/platform/scope))
-   **Observability as contract**, every search response carries a stable trace schema so dashboards and evals never break on a refactor ([observability](/platform/observability))
-   **Domain separation**, Ingest, Search, CRUD, Lifecycle, and Trust are independent domains with their own routes and services ([architecture](/platform/architecture))

## Try it in 2 minutes

The fastest path is the [Quickstart](/quickstart): clone the core repo, set an API key, `docker compose up`, and run your first ingest and search with two curl commands.

Core is HTTP-first, so any language works today. The [TypeScript SDK](/sdk/overview) gives TypeScript and JavaScript consumers typed request and response shapes, richer ergonomics, scope-aware helpers, and a pluggable provider model that decouples your app from any particular memory engine, but nothing about core requires it.

AtomicMemory is [Apache-2.0 licensed](https://github.com/atomicstrata/atomicmemory-core/blob/main/LICENSE). Self-host it, fork it, run it behind your own gateway, the platform is yours.
