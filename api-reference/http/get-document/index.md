# Fetch a single document by UUID.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getDocument` from the vendored `atomicmemory-core` spec.

**GET** `/v1/documents/{id}`

Fetch a single document by UUID.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Document record. |
| 400 | Input validation error |
| 404 | Document not found |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
