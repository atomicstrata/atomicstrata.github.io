# Memory-backed passport feed: grouped doc rows + standalone memories.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listPassportFeed` from the vendored `atomicmemory-core` spec.

**GET** `/v1/documents/passport-feed`

Single SQL UNION ALL: one row per documentId-with-memories (grouped on `raw_document_id`, joined to `raw_documents` for the status envelope) plus 1:1 standalone-memory rows (memories whose `raw_document_id IS NULL`). Sorted by `(sort_at DESC, sort_id DESC)`; the webapp passport route consumes this as the memory-feed stream of its server-side two-stream merge. Cursor + limit semantics match the other document list routes; opaque `next_cursor` is the tuple of the last consumed row.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |
| query | `limit` | no | string |  |
| query | `cursor` | no | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Passport feed page. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
