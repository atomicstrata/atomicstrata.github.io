# AtomicMemory

> Agent index: [llms.txt](/llms.txt)

**AtomicMemory** is hosted, multi-tenant memory infrastructure for AI agents. It provides orgs, projects, API keys, usage tracking, and a developer console - while the open-source **AtomicMemory Core** engine handles embeddings, vector storage, retrieval, fact extraction, and AUDN mutation.

Console: **[memory.atomicstrata.ai](https://memory.atomicstrata.ai)**  
API: **`https://api.atomicstrata.ai`**

## Cloud vs Core

| Layer | Owns | Where it runs |
| --- | --- | --- |
| **Cloud gateway** | Tenancy, API keys, JWT dashboard auth, traces, usage, billing hooks | `am-cloud-api` (public) |
| **Developer console** | Onboarding, Memory Explorer, traces, playground | [memory.atomicstrata.ai](https://memory.atomicstrata.ai) |
| **Core engine** | pgvector index, fact extraction, retrieval, LLM repair loop | Private ECS service (not user-facing) |

Use **Cloud** when you want a managed endpoint and dashboard with zero infrastructure. Use **Core** when you need full data residency, custom deployment, or to embed the engine in your own stack. The same SDK and MCP tools work against both - point `ATOMICMEMORY_API_URL` at Cloud or your self-hosted core.

Weighing hosted against self-hosted? See [Cloud vs Open Source](/cloud-vs-open-source).

## Architecture

Clients (untrusted)

CLI / SDK / Web

Dashboard (web)

`amc_…` key or session JWT

am-cloud-api (gateway)

API-key authn

Tenancy mapping

Trace + usage

`AM_CORE_API_KEY` infra only

AtomicMemory Core (private)

pgvector index

AUDN mutation

retrieval + LLM

## Trust boundaries

-   The **`amc_…` API key** is the only credential clients see. It is verified in the cloud gateway (argon2 hash + display prefix) and is **never** forwarded to core.
-   **`AM_CORE_API_KEY`** is an infrastructure credential that lives only in the cloud environment. It authenticates outbound calls to core.
-   **`ProjectType::Local`** projects are rejected with `400` before any core call. Local traffic should hit the project's own core URL directly and bypass the cloud gateway.

## Multi-tenancy mapping

Every cloud project maps to exactly one core `user_id`, guaranteeing no cross-project leakage at the storage layer.

| Cloud concept | Core field | Notes |
| --- | --- | --- |
| `project_id` | `user_id = "project:{project_id}"` | Hard tenant boundary on every outbound request |
| SDK `user_id` / `scope.user` | `session_id` | Per-user filtering on reads |
| SDK `agent_id` / `scope.agent` | `agent_id` | Pass-through |
| SDK `workspace_id` | `workspace_id` | Pass-through; core requires `agent_id` when set |

## When to choose Cloud

Choose **AtomicMemory** if you:

-   Want to ship agents with memory in minutes, not weeks
-   Need inspectable mutation and retrieval traces in a dashboard
-   Prefer managed Postgres, Redis, and scaling over operating core yourself
-   Plan to migrate to self-hosted core later with the same SDK surface

Choose **self-hosted Core** if you:

-   Require on-prem or air-gapped deployment
-   Need full control over embedding providers and LLM routing
-   Want to embed `createCoreRuntime` in-process (TypeScript) without HTTP

## Next steps

-   [Cloud Quickstart](/cloud/quickstart) - sign up, get an API key, first ingest
-   [Developer Console](/cloud/console) - dashboard tour
-   [Authentication](/cloud/authentication) - API keys vs dashboard session JWT
-   [Cloud CLI](/cloud/cli) - `am` / `atomicmemory` from `get.atomicstrata.ai`
