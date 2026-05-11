# Report a new lesson.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `reportLesson` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/lessons/report`

Report a new lesson.

## Request Body (application/json)

```json
{
  "properties": {
    "pattern": {
      "description": "Required. pattern.",
      "minLength": 1,
      "type": "string"
    },
    "severity": {},
    "source_memory_ids": {
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "user_id": {
      "description": "Required. user_id.",
      "minLength": 1,
      "type": "string"
    }
  },
  "required": [
    "user_id",
    "pattern"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Lesson id. |
| 400 | Input validation error |
| 500 | Internal server error |
