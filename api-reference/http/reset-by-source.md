# Delete all memories for a given user + source_site.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `resetBySource` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/reset-source`

Delete all memories for a given user + source_site.

## Request Body (application/json)

```json
{
  "properties": {
    "source_site": {
      "description": "Required. source_site.",
      "minLength": 1,
      "type": "string"
    },
    "user_id": {
      "description": "Required. user_id.",
      "minLength": 1,
      "type": "string"
    }
  },
  "required": [
    "user_id",
    "source_site"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Reset result. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
