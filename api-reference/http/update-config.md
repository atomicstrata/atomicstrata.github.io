# Mutate runtime config (dev/test only). 410 when disabled.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `updateConfig` from the vendored `atomicmemory-core` spec.

**PUT** `/v1/memories/config`

Set CORE_RUNTIME_CONFIG_MUTATION_ENABLED=true to enable. Startup-only fields (embedding_provider/model, voyage_api_key, voyage_document_model, voyage_query_model, llm_provider/model) return 400 with a `rejected` array listing the offending fields.

## Request Body (application/json)

```json
{
  "additionalProperties": {},
  "description": "Runtime config mutation. See handler for 410 and rejected[] paths.",
  "properties": {},
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Applied changes + config snapshot. |
| 400 | Input validation error OR startup-only fields were supplied. |
| 410 | Runtime config mutation is disabled in production. |
| 500 | Internal server error |
