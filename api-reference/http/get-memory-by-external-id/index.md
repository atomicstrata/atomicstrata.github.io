# Fetch a single memory by caller-owned metadata.externalId.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getMemoryByExternalId` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/by-external-id/{externalId}`

Reverse lookup of a memory by its `metadata.externalId`, scoped to `user_id`. the caller stamps its own id into `metadata.externalId` on quick-ingest; this resolves that id back to the core memory. Returns the same body as GET /v1/memories/{id}.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `externalId` | yes | string |  |
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Memory object. |
| 400 | Input validation error |
| 404 | Memory not found |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
