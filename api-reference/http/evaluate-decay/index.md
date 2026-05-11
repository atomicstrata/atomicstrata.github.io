# Evaluate decay candidates. dry_run=false archives them.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `evaluateDecay` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/decay`

Evaluate decay candidates. dry_run=false archives them.

## Request Body (application/json)

```json
{
  "properties": {
    "dry_run": {
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
| 200 | Decay evaluation + archived count. |
| 400 | Input validation error |
| 500 | Internal server error |
