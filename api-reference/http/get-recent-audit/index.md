# Recent mutations for a user, limit-bounded.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getRecentAudit` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/audit/recent`

Recent mutations for a user, limit-bounded.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |
| query | `limit` | no | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Recent mutations. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
