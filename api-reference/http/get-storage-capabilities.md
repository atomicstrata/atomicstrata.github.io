# Read the direct storage API capability snapshot.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getStorageCapabilities` from the vendored `atomicmemory-core` spec.

**GET** `/v1/storage/capabilities`

Public preflight surface for the storage API. Clients call this before attempting a managed-mode artifact upload. The response describes what the direct `/v1/storage/artifacts/*` API supports for the active backend — Filecoin direct managed upload is not yet supported in v1, so every capability flag reports `false` for Filecoin here. Filecoin still has full feature support through document ingestion (see `/v1/documents/limits`).

## Responses

| Status | Description |
|---|---|
| 200 | Capability snapshot for the direct storage API. |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
