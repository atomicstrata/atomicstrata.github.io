# Resolve a specific conflict with one of the three enum variants.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `resolveAgentConflict` from the vendored `atomicmemory-core` spec.

**PUT** `/v1/agents/conflicts/{id}/resolve`

Resolve a specific conflict with one of the three enum variants.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |

## Request Body (application/json)

```json
{
  "description": "Resolve a specific conflict with one of the three enum variants.",
  "properties": {
    "resolution": {
      "enum": [
        "resolved_new",
        "resolved_existing",
        "resolved_both"
      ],
      "type": "string"
    }
  },
  "required": [
    "resolution"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Resolution confirmation. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
