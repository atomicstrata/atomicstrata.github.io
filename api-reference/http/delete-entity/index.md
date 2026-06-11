# Cascade-delete all data for an entity.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `deleteEntity` from the vendored `atomicmemory-core` spec.

**DELETE** `/v1/entities/{entity_type}/{entity_id}`

Deletes memories, entity attributes, user profile, entity graph records, entity edges, and entity cards for the given entity ID. Idempotent — returns zero counts if the entity does not exist.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `entity_type` | yes | string |  |
| path | `entity_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Deleted row counts per table. |
| 400 | Input validation error |
| 500 | Internal server error |
