# Authentication

> Agent index: [llms.txt](/llms.txt)

AtomicMemory exposes two authentication surfaces. Use the right credential for each route class - mixing them returns `401`.

Callers

CLI / SDK / MCP / PlaygroundProject API key

Developer consoleSession JWT

Route classes

Memory API`/v1/*`

Dashboard API`/api/*`

user keys never forwarded

Engine

AtomicMemory Core`AM_CORE_API_KEY` only

## Summary

| Surface | Routes | Credential | Used by |
| --- | --- | --- | --- |
| **Memory API** | `/v1/*` | Project API key (`amc_<env>_<random>`) | CLI, SDK, MCP, Playground |
| **Dashboard API** | `/api/*` | Session JWT (`Authorization: Bearer <jwt>`) | Developer console (server-side) |

The cloud gateway **never** forwards user API keys to AtomicMemory Core. Outbound core calls use the infrastructure credential `AM_CORE_API_KEY` only.

## Project API keys

API keys are created in the console under **API Keys** or during onboarding.

```text
Authorization: Bearer amc_dev_xxxxxxxxxxxxxxxx
```

Properties:

-   Returned **exactly once** at creation; stored server-side as argon2 hash + display prefix
-   Scoped to a single project and environment (`dev`, `staging`, `prod`)
-   Rate-limited per key (`RATE_LIMIT_PER_SECOND`, `RATE_LIMIT_BURST`)
-   Verified on every `/v1/*` request

Example:

```bash
curl -X POST https://api.atomicstrata.ai/v1/memories/search/fast \
  -H "Authorization: Bearer $ATOMICMEMORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "default", "query": "seat preference", "limit": 5}'
```

### SDK and MCP

Point integrations at the cloud API URL:

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx
```

MCP tools (`memory_ingest`, `memory_search`, `memory_list`, `memory_package`) hit the core-isomorphic `/v1/memories/*` routes through this gateway.

## Dashboard session JWT

Dashboard routes under `/api/*` require a signed-in console session. The web app obtains a JWT server-side and forwards it as `Authorization: Bearer <jwt>`.

### JWT audience (non-local deploys)

Configure your identity provider's session JWT template with:

```json
{
  "aud": "atomicmemory-cloud"
}
```

The `aud` claim must match `JWT_AUDIENCE` on the cloud API.

### Browser proxy pattern

The developer console **never** calls the cloud API directly from the browser for dashboard operations. Next.js Route Handlers at `/api/proxy/*` obtain the session token server-side and forward the JWT to `AM_API_URL`.

This keeps CORS strict - set `CORS_ALLOWED_ORIGINS` on the API to the console origin only (`https://memory.atomicstrata.ai`).

### Playground API key auth

The Playground posts to `/api/proxy/v1/memories/*` with the user's pasted API key. The key stays in browser memory only - it is not embedded in client bundles.

## CLI auth modes

The [Cloud CLI](/cloud/cli) supports two flows:

| Command | Auth | Purpose |
| --- | --- | --- |
| `am auth login` | OAuth PKCE + browser | Dashboard commands (`am org list`, `am key create`, …) |
| `ATOMICMEMORY_API_KEY` env | Project API key | Memory operations (`am memory ingest`, `am memory search`) |

Memory ingest does **not** require `am auth login` when `ATOMICMEMORY_API_KEY` is set.

## Local projects

Projects with `type: local` are rejected by the cloud gateway (`400 bad_request`). Connect local projects directly to a self-hosted core instance - they bypass cloud entirely.

## Security reporting

Report vulnerabilities per the [AtomicMemory API SECURITY policy](https://github.com/atomicstrata/am-cloud-api/blob/main/SECURITY.md).

## Related docs

-   [Cloud Quickstart](/cloud/quickstart) - create your first API key
-   [Developer Console](/cloud/console) - proxy and SSE architecture
-   [Cloud HTTP API](/cloud/how-to/dashboard) - route reference
