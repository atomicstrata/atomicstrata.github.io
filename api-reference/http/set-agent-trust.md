# Set the calling user's trust level for a given agent.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `setAgentTrust` from the vendored `atomicmemory-core` spec.

**PUT** `/v1/agents/trust`

Set the calling user's trust level for a given agent.

## Request Body (application/json)

```json
{
  "description": "Set the calling user's trust level for a given agent. trust_level in [0.0, 1.0].",
  "properties": {
    "agent_id": {
      "description": "Required. agent_id.",
      "minLength": 1,
      "type": "string"
    },
    "display_name": {
      "type": "string"
    },
    "trust_level": {
      "description": "Trust score in [0.0, 1.0].",
      "maximum": 1,
      "minimum": 0,
      "type": "number"
    },
    "user_id": {
      "description": "Required. user_id.",
      "minLength": 1,
      "type": "string"
    }
  },
  "required": [
    "agent_id",
    "user_id",
    "trust_level"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Agent id + applied trust level. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
