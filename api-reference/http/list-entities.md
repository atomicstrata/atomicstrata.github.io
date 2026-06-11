# List all entities with memory counts.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listEntities` from the vendored `atomicmemory-core` spec.

**GET** `/v1/entities`

Returns all distinct entity IDs for the authenticated deployment, ordered by most recently active. Paginated via `page` and `page_size`.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `entity_type` | no | string |  |
| query | `page` | no | integer |  |
| query | `page_size` | no | integer |  |

## Responses

| Status | Description |
|---|---|
| 200 | Paginated entity list. |
| 400 | Input validation error |
| 500 | Internal server error |
