# Latency-optimized search (skips LLM repair loop). ~88% lower latency than /search.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `searchMemoriesFast` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/search/fast`

Latency-optimized search (skips LLM repair loop). ~88% lower latency than /search.

## Request Body (application/json)

```json
{
  "description": "Search memories. User-scoped unless workspace_id + agent_id are both provided.",
  "properties": {
    "agent_id": {
      "description": "Optional agent identifier. Silently dropped if empty / non-string.",
      "type": "string"
    },
    "agent_scope": {
      "description": "Agent-scope filter for workspace searches. String literal 'all' | 'self' | 'others' or a concrete agent_id. Array of agent_ids is also accepted. Any other value is silently ignored.",
      "example": "all",
      "oneOf": [
        {
          "type": "string"
        },
        {
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      ]
    },
    "as_of": {
      "description": "ISO-8601 timestamp accepted by temporal search (as_of). Empty string or null means absent; any other non-ISO value is rejected with 400.",
      "example": "2026-01-15T12:00:00.000Z",
      "format": "date-time",
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
    "limit": {
      "maximum": 100,
      "minimum": 1,
      "type": "integer"
    },
    "namespace_scope": {
      "type": "string"
    },
    "query": {
      "description": "Required. query.",
      "minLength": 1,
      "type": "string"
    },
    "retrieval_mode": {
      "enum": [
        "flat",
        "tiered",
        "abstract-aware"
      ],
      "type": "string"
    },
    "session_id": {
      "description": "Optional thread/session identifier used to scope ingest, search, and list symmetrically.",
      "maxLength": 256,
      "type": "string"
    },
    "skip_repair": {
      "type": "boolean"
    },
    "source_site": {
      "type": "string"
    },
    "threshold": {
      "description": "Optional normalized relevance threshold. Results below this semantic relevance floor are excluded before injection packaging.",
      "maximum": 1,
      "minimum": 0,
      "type": "number"
    },
    "token_budget": {
      "maximum": 50000,
      "minimum": 100,
      "type": "integer"
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
    "query"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Search results. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
