# List open agent conflicts for a user.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listAgentConflicts` from the vendored `atomicmemory-core` spec.

**GET** `/v1/agents/conflicts`

List open agent conflicts for a user.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string | Required. user_id. |

## Responses

| Status | Description |
|---|---|
| 200 | Conflicts list. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
