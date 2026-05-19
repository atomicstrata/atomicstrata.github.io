# Soft-delete (tombstone) a document.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `deleteDocument` from the vendored `atomicmemory-core` spec.

**DELETE** `/v1/documents/{id}`

Idempotent: a second DELETE on the same id returns success with `already_deleted: true`. Subsequent GETs of the deleted id return 404.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Soft-delete acknowledgement. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
