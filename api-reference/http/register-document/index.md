# Register a pointer-only document.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `registerDocument` from the vendored `atomicmemory-core` spec.

**POST** `/v1/documents`

Idempotent on (user_id, source_site, provider, external_id, provider_version). Returns 201 on first registration; 200 on a re-register that matches an active row. Registration accepts `storage_mode = 'pointer_only'`; managed_blob and inline_small_text return 400.

## Request Body (application/json)

```json
{
  "additionalProperties": false,
  "description": "Register a document pointer. Document registration accepts pointer_only mode; managed_blob and inline_small_text return 400.",
  "properties": {
    "account_id": {
      "type": [
        "string",
        "null"
      ]
    },
    "consent_policy": {
      "additionalProperties": true,
      "type": "object"
    },
    "content_hash": {
      "type": [
        "string",
        "null"
      ]
    },
    "display_name": {
      "type": [
        "string",
        "null"
      ]
    },
    "external_id": {
      "description": "Required. external_id.",
      "minLength": 1,
      "type": "string"
    },
    "external_uri": {
      "type": [
        "string",
        "null"
      ]
    },
    "extraction_status": {
      "description": "Initial extraction-layer state at register time. 'pending' = caller intends to extract; 'not_required' = pointer-only flow (default); 'unsupported' = caller knows the file type cannot be extracted. Service-owned values ('running', 'complete', 'failed') are rejected.",
      "enum": [
        "pending",
        "not_required",
        "unsupported"
      ],
      "type": "string"
    },
    "metadata": {
      "additionalProperties": true,
      "type": "object"
    },
    "mime_type": {
      "type": [
        "string",
        "null"
      ]
    },
    "provider": {
      "description": "Required. provider.",
      "minLength": 1,
      "type": "string"
    },
    "provider_version": {
      "type": [
        "string",
        "null"
      ]
    },
    "retention_policy": {
      "additionalProperties": true,
      "type": "object"
    },
    "semantic_index_status": {
      "description": "Initial semantic-index-layer state at register time. 'pending' = caller intends to index; 'not_required' = no indexing planned. Service-owned transitions handle 'running', 'complete', 'failed', 'stale'.",
      "enum": [
        "pending",
        "not_required"
      ],
      "type": "string"
    },
    "size_bytes": {
      "minimum": 0,
      "type": "integer"
    },
    "source_modified_at": {
      "format": "date-time",
      "type": "string"
    },
    "source_site": {
      "description": "Required. source_site.",
      "minLength": 1,
      "type": "string"
    },
    "storage_mode": {
      "enum": [
        "pointer_only"
      ],
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
    "source_site",
    "provider",
    "external_id"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Idempotent re-registration; document already existed. |
| 201 | Document registered. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
