# Update per-entity extraction guidance and pipeline config.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `patchEntitySettings` from the vendored `atomicmemory-core` spec.

**PATCH** `/v1/entities/{entity_type}/{entity_id}/settings`

Stores an extraction prompt (up to 1,500 chars) and pipeline overrides for a specific entity. Returns 503 when `entity_settings` is not yet wired into the runtime.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `entity_type` | yes | string |  |
| path | `entity_id` | yes | string |  |

## Request Body (application/json)

```json
{
  "properties": {
    "decay_enabled": {
      "type": "boolean"
    },
    "extraction_prompt": {
      "maxLength": 1500,
      "type": "string"
    },
    "memory_kinds": {
      "items": {
        "type": "string"
      },
      "type": "array"
    }
  },
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Updated entity settings row. |
| 400 | Input validation error |
| 500 | Internal server error |
| 503 | Entity settings feature not enabled on this deployment. |
