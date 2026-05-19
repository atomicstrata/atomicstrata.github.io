# Mark the document as extraction-failed.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `markExtractionFailure` from the vendored `atomicmemory-core` spec.

**POST** `/v1/documents/{id}/extraction-failure`

Service-owned status transition: callers declare *that* extraction failed and *what category* via a bounded `error_code`. The route service-truncates `error_message` to a fixed cap and rejects arbitrary status combinations. Idempotent on retry; 409 on invalid source state with the row's current per-layer status echoed in the response body.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |

## Request Body (application/json)

```json
{
  "additionalProperties": false,
  "description": "Constrained transition body for the extraction-failure route. The route loads the row under a per-document advisory lock, verifies the current state is one of the allowed source states, and writes `extraction_status=\"failed\"` + `semantic_index_status=\"not_required\"` + a sanitised `last_error.layer=\"extraction\"`. 409 on invalid transitions; idempotent on repeat for already-failed rows.",
  "properties": {
    "error_code": {
      "description": "Bounded extraction-layer failure code. Open-ended exception messages ride on `error_message`; this code is what the UI / metrics layer pivots on.",
      "enum": [
        "parser_threw",
        "parser_timeout",
        "parser_oom",
        "unsupported_encoding",
        "corrupt_input",
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
| 409 | Invalid extraction state transition. The response body echoes `current.{raw_storage_status,extraction_status,semantic_index_status}` so the caller can reason about retries. |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
