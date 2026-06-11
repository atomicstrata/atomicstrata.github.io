# Get structured attribute triples for an entity.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getEntityAttributes` from the vendored `atomicmemory-core` spec.

**GET** `/v1/entities/{entity_type}/{entity_id}/attributes`

Returns `(entity, attribute, value, type)` triples extracted from memories. Pass `?attribute=<key>` to filter by a specific attribute. Returns an empty array when `ENTITY_ATTRIBUTES_ENABLED` is off.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `entity_type` | yes | string |  |
| path | `entity_id` | yes | string |  |
| query | `attribute` | no | string |  |
| query | `entity` | no | string |  |
| query | `limit` | no | integer |  |

## Responses

| Status | Description |
|---|---|
| 200 | Attribute triples ordered by observed_at DESC. |
| 400 | Input validation error |
| 500 | Internal server error |
