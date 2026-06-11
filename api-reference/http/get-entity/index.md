# Get entity detail — attributes, relations, and recent cards.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getEntity` from the vendored `atomicmemory-core` spec.

**GET** `/v1/entities/{entity_type}/{entity_id}`

Pass `?entity_name=<name>` to resolve entity relations for a specific named entity in the user's graph. Without `entity_name`, `relations` is always `[]` because entity-graph lookup requires a semantic name, not an opaque user_id.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `entity_type` | yes | string |  |
| path | `entity_id` | yes | string |  |
| query | `entity_name` | no | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Entity detail with attribute triples, relation edges, and recent entity cards. |
| 400 | Input validation error |
| 500 | Internal server error |
