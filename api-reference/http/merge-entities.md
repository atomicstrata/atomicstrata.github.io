# Merge a source entity into a target entity.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `mergeEntities` from the vendored `atomicmemory-core` spec.

**POST** `/v1/entities/merge`

Re-scopes all memories, attributes, cards, and graph edges from `source` to `target` in a single transaction, then deletes the source entity.

## Request Body (application/json)

```json
{
  "properties": {
    "source": {
      "properties": {
        "entity_id": {
          "minLength": 1,
          "type": "string"
        },
        "entity_type": {
          "enum": [
            "user",
            "agent",
            "session"
          ],
          "type": "string"
        }
      },
      "required": [
        "entity_type",
        "entity_id"
      ],
      "type": "object"
    },
    "target": {
      "properties": {
        "entity_id": {
          "minLength": 1,
          "type": "string"
        },
        "entity_type": {
          "enum": [
            "user",
            "agent",
            "session"
          ],
          "type": "string"
        }
      },
      "required": [
        "entity_type",
        "entity_id"
      ],
      "type": "object"
    }
  },
  "required": [
    "source",
    "target"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Counts of records moved per table. |
| 400 | Input validation error |
| 500 | Internal server error |
