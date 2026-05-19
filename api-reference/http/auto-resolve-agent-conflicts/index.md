# Auto-resolve all expired conflicts for a user.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `autoResolveAgentConflicts` from the vendored `atomicmemory-core` spec.

**POST** `/v1/agents/conflicts/auto-resolve`

Auto-resolve all expired conflicts for a user.

## Request Body (application/json)

```json
{
  "description": "Auto-resolve expired conflicts for a user.",
  "properties": {
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
| 200 | Count of resolved conflicts. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
