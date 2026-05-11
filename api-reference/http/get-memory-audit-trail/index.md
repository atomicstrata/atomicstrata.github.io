# Per-memory version history.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getMemoryAuditTrail` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/{id}/audit`

Per-memory version history.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Audit trail. |
| 400 | Input validation error |
| 500 | Internal server error |
