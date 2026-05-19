# Delete a single memory by UUID.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `deleteMemory` from the vendored `atomicmemory-core` spec.

**DELETE** `/v1/memories/{id}`

Delete a single memory by UUID.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |
| query | `user_id` | yes | string |  |
| query | `workspace_id` | no | string |  |
| query | `agent_id` | no | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Deletion success. |
| 400 | Input validation error |
| 404 | Memory not found |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
