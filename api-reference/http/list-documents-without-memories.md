# Documents WITHOUT non-deleted memories, narrowed by recovery-status filter.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listDocumentsWithoutMemories` from the vendored `atomicmemory-core` spec.

**GET** `/v1/documents/without-memories`

Backs the passport synthetic-row stream and the UI "uploaded but unindexed" surface. A row appears when it has zero non-deleted memories AND at least one layer status sits in the supplied filter. Filter omitted -> server default 'recovery-relevant set (extraction in pending/failed/unsupported, semantic_index in pending/failed, raw_storage in raw_storage_failed). Cursor + limit semantics match `GET /v1/documents`.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |
| query | `limit` | no | string |  |
| query | `cursor` | no | string |  |
| query | `extraction` | no | string |  |
| query | `semantic_index` | no | string |  |
| query | `raw_storage` | no | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Cursor-paginated unbacked-document list. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
