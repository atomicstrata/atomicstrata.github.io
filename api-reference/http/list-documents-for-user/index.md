# Cursor-paginated user-scoped document list with status-bucket filter.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listDocumentsForUser` from the vendored `atomicmemory-core` spec.

**GET** `/v1/documents`

Returns active documents for the supplied `user_id`, ordered `(created_at DESC, id DESC)`. The opaque `cursor` is the `next_cursor` from the previous page (base64-url JSON tuple); malformed cursors return 400. The `status` query param buckets rows for the recovery surfaces: `'failed'` (any layer failed), `'unsupported'` (extraction marked unsupported), `'pending'` (extraction or semantic_index in pending/running), or `'all'` (default — every active row).

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |
| query | `limit` | no | string |  |
| query | `cursor` | no | string |  |
| query | `status` | no | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Cursor-paginated document list. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
