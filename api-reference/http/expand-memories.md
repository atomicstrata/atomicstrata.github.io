# Expand a list of memory IDs into full objects.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `expandMemories` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/expand`

Expand a list of memory IDs into full objects.

## Request Body (application/json)

```json
{
  "description": "Expand a list of memory IDs into full objects.",
  "properties": {
    "agent_id": {
      "description": "Optional agent identifier. Silently dropped if empty / non-string.",
      "type": "string"
    },
    "memory_ids": {
      "description": "Required. memory_ids.",
      "items": {
        "type": "string"
      },
      "type": "array"
    },
    "user_id": {
      "description": "Required. user_id.",
      "minLength": 1,
      "type": "string"
    },
    "visibility": {
      "description": "Visibility (one of agent_only / restricted / workspace). Invalid values silently drop to undefined.",
      "enum": [
        "agent_only",
        "restricted",
        "workspace"
      ],
      "type": "string"
    },
    "workspace_id": {
      "description": "Optional workspace identifier. Silently dropped if empty / non-string.",
      "type": "string"
    }
  },
  "required": [
    "user_id",
    "memory_ids"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Expanded memories array. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
