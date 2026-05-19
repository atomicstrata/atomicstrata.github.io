# Mark the document as index-failed.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `markIndexFailure` from the vendored `atomicmemory-core` spec.

**POST** `/v1/documents/{id}/index-failure`

Service-owned status transition. The `index_text_too_large` code on a `extraction_status='pending'` row atomically advances extraction to `'complete'` AND writes `semantic_index_status='failed'` so the durable row reflects the upload-pipeline sequence. Idempotent on retry; 409 on invalid source state.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |

## Request Body (application/json)

```json
{
  "additionalProperties": false,
  "description": "Constrained transition body for the index-failure route. Permitted transitions: (a) `extraction_status=\"complete\"` + `semantic_index_status=\"pending\"` -> writes `semantic_index_status=\"failed\"`; (b) `extraction_status=\"pending\"` + `semantic_index_status=\"pending\"` AND `error_code=\"index_text_too_large\"` -> atomically writes `extraction_status=\"complete\"` + `semantic_index_status=\"failed\"`; (c) idempotent retry on already-failed rows. Any other state returns 409.",
  "properties": {
    "error_code": {
      "description": "Bounded semantic-index-layer failure code. `index_text_too_large` is the upload-pipeline shortcut for the case where extracted text exceeded the index byte cap before reaching `POST /:id/index`.",
      "enum": [
        "index_text_too_large",
        "extraction_empty",
        "unknown"
      ],
      "type": "string"
    },
    "error_message": {
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
    "error_code",
    "error_message"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Marker write acknowledgement; durable row echoed. |
| 400 | Input validation error |
| 404 | Document not found |
| 409 | Invalid index state transition; current per-layer status echoed. |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
