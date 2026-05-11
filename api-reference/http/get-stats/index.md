# Aggregate memory statistics for a user.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getStats` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/stats`

Aggregate memory statistics for a user.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Stats payload. |
| 400 | Input validation error |
| 500 | Internal server error |
