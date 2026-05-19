# Chunk + embed text for a registered document.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `indexDocument` from the vendored `atomicmemory-core` spec.

**POST** `/v1/documents/{id}/index`

Deterministic char-window chunking, batched embeddings via the core embedding provider, and one provenance-linked memory per chunk. Idempotent on byte-identical text under the current chunker_version: the response's `idempotent_skip` flag indicates whether work was performed. A re-index with new text soft-deletes the prior generation of chunks + derived memories before inserting the fresh one.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |

## Request Body (application/json)

```json
{
  "description": "Chunk + embed the supplied text for the registered document, creating one provenance-linked memory per chunk. Idempotent on byte-identical text under the current chunker_version.",
  "properties": {
    "text": {
      "description": "Required. text.",
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
    "text"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Indexing result with chunk + memory counts. |
| 400 | Input validation error |
| 404 | Document not found |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
