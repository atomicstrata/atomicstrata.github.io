# List active documents for a user, optionally filtered by source_site.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listDocuments` from the vendored `atomicmemory-core` spec.

**GET** `/v1/documents/list`

List active documents for a user, optionally filtered by source_site.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |
| query | `source_site` | no | string |  |
| query | `limit` | no | string |  |
| query | `offset` | no | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Document list with count. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
