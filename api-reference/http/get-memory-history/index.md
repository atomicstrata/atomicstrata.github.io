# Get the mutation history of a single memory record.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getMemoryHistory` from the vendored `atomicmemory-core` spec.

**GET** `/v1/entities/{entity_type}/{entity_id}/memories/{memory_id}/history`

Surfaces the full AUDN version chain for a memory — ADD, UPDATE, SUPERSEDE events in chronological order.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `entity_type` | yes | string |  |
| path | `entity_id` | yes | string |  |
| path | `memory_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Ordered mutation history for the memory. |
| 400 | Input validation error |
| 404 | Memory not found |
| 500 | Internal server error |
