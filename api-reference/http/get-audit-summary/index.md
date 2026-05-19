# Aggregate mutation statistics for a user's memory store.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getAuditSummary` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/audit/summary`

Aggregate mutation statistics for a user's memory store.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Mutation summary. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
