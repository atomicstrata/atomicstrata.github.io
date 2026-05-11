# Compute consolidation candidates; optionally execute (execute=true).

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `consolidateMemories` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/consolidate`

Compute consolidation candidates; optionally execute (execute=true).

## Request Body (application/json)

```json
{
  "properties": {
    "execute": {
      "type": "boolean"
    },
    "user_id": {
      "description": "Required. user_id.",
      "minLength": 1,
      "type": "string"
    }
  },
  "required": [
    "user_id"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Consolidation result. |
| 400 | Input validation error |
| 500 | Internal server error |
