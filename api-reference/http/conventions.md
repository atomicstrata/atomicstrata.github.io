# Conventions

> Agent index: [llms.txt](/llms.txt)

General conventions that apply across every `/v1/memories/*` and `/v1/agents/*` route. Per-endpoint request/response details live on the generated pages in the HTTP API section.

## Request and response format

-   Base URL defaults to `http://localhost:3050` for local runs.
-   Request and response bodies are JSON.
-   Field names use `snake_case` (e.g. `user_id`, `source_site`).

## Error responses

The canonical error envelope is a single string:

```json
{ "error": "user_id (string) is required" }
```

This shape applies to 400 (input validation), 404 (resource not found), and 500 (internal server error) on every route.

**Exception, `PUT /v1/memories/config`** ships two richer envelopes so operators know exactly which guard rejected the request:

```json
// 400 when a body includes startup-only fields
{
  "error": "Provider/model selection is startup-only",
  "detail": "Fields embedding_provider cannot be mutated at runtime, the embedding/LLM provider caches are fixed at first use.",
  "rejected": ["embedding_provider"]
}
```

```json
// 410 when runtime config mutation is disabled (production default)
{
  "error": "PUT /v1/memories/config is deprecated for production",
  "detail": "Set CORE_RUNTIME_CONFIG_MUTATION_ENABLED=true to enable runtime mutation in dev/test environments."
}
```

| Status | Meaning |
| --- | --- |
| 400 | Invalid input (missing/malformed fields). Basic `{ error }` on every route except `PUT /v1/memories/config`, which may return the richer envelope above. |
| 404 | Resource not found (e.g. `GET /v1/memories/:id` with an unknown id). |
| 410 | Gone, `PUT /v1/memories/config` only, when runtime config mutation is disabled. Uses the richer envelope above. |
| 500 | Internal server error. |

## CORS

The server allows requests from:

-   `http://localhost:3050`
-   `http://localhost:3081`

Preflight `OPTIONS` requests are handled automatically.
