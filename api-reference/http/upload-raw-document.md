# Upload managed raw bytes for a registered document.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `uploadRawDocument` from the vendored `atomicmemory-core` spec.

**PUT** `/v1/documents/{id}/raw`

Stores the request body as the document's managed blob via the configured `RawContentStore` adapter (`local_fs` or `s3`), and promotes the document row to `storage_mode='managed_blob'` / `raw_storage_status='blob_stored'`. Idempotent on byte-identical input under the same document. Different bytes against an already-stored managed blob return 409 because the managed slot is immutable per row to avoid orphaning the prior blob. Returns 503 when the deployment runs `rawStorageMode='pointer_only'`.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |
| query | `user_id` | yes | string |  |
| query | `content_type` | no | string |  |

## Request Body

See operation schema in the OpenAPI spec.

## Responses

| Status | Description |
|---|---|
| 200 | Upload result with storage URI + content hash + size. |
| 400 | Input validation error |
| 404 | Document not found |
| 409 | Conflict: the document already has a managed blob with a different content_hash. Register a fresh document for the new bytes — the existing blob is not overwritten. |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
