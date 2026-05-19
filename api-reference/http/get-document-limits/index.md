# Read upload + index byte caps and raw-storage capability.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getDocumentLimits` from the vendored `atomicmemory-core` spec.

**GET** `/v1/documents/limits`

Public preflight surface. Clients call this to size requests and decide whether to attempt a managed-blob upload. The values are a composition-time snapshot of the runtime config; no PII, no per-user state. Mirrors the auth posture of `/health`.

## Responses

| Status | Description |
|---|---|
| 200 | Document limits + raw_storage capability. |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
