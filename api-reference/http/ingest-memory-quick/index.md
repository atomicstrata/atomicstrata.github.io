# Quick ingest (storeVerbatim when skip_extraction=true).

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `ingestMemoryQuick` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/ingest/quick`

Quick or verbatim ingest. The `metadata` field is **honored only** when `skip_extraction=true` and no workspace context (`workspace_id` / `agent_id` / `visibility`) is provided; otherwise rejected with 400.

## Request Body (application/json)

```json
{
  "description": "Ingest a conversation transcript. User-scoped unless workspace_id + agent_id are both provided.",
  "properties": {
    "agent_id": {
      "description": "Optional agent identifier. Silently dropped if empty / non-string.",
      "type": "string"
    },
    "config_override": {
      "additionalProperties": {
        "anyOf": [
          {
            "type": "boolean"
          },
          {
            "type": "number"
          },
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "description": "Optional per-request overlay on RuntimeConfig. Keys correspond to RuntimeConfig field names; values must be primitives (boolean / number / string / null). Unknown keys are accepted but surfaced via the X-Atomicmem-Unknown-Override-Keys response header and a server-side warning log — they do not cause a 400. Scope: just this request — no server mutation.",
      "type": "object"
    },
    "content_class": {
      "description": "Optional sensitivity class of the supplied content: 'summary' (distilled, hosted-safe), 'redacted' (sensitive spans removed by the caller), or 'raw' (verbatim prompt/response/diff/source). When the deployment runs RAW_CONTENT_POLICY=reject, ingest of 'raw' content — or content with no content_class at all (treated as unknown/raw) — is rejected with 422 raw_content_rejected.",
      "enum": [
        "summary",
        "redacted",
        "raw"
      ],
      "type": "string"
    },
    "conversation": {
      "description": "Required. conversation.",
      "minLength": 1,
      "type": "string"
    },
    "metadata": {
      "additionalProperties": {},
      "description": "Caller-supplied metadata, persisted alongside the memory. Honored ONLY on /v1/memories/ingest/quick with skip_extraction=true and no workspace context — rejected with 400 on every other branch. Reserved keys (RESERVED_METADATA_KEYS in repository-types) are rejected. Max 32 KB UTF-8 serialized.",
      "type": "object"
    },
    "session_id": {
      "description": "Optional thread/session identifier used to scope ingest, search, and list symmetrically.",
      "maxLength": 256,
      "type": "string"
    },
    "skip_extraction": {
      "type": "boolean"
    },
    "source_site": {
      "description": "Required. source_site.",
      "minLength": 1,
      "type": "string"
    },
    "source_url": {
      "type": "string"
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
    "conversation",
    "source_site"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Ingest result. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
