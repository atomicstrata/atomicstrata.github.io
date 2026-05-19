# List memories for a user (or workspace).

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listMemories` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/list`

List memories for a user (or workspace).

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |
| query | `limit` | no | string |  |
| query | `offset` | no | string |  |
| query | `workspace_id` | no | string |  |
| query | `agent_id` | no | string |  |
| query | `source_site` | no | string |  |
| query | `episode_id` | no | string |  |
| query | `session_id` | no | string | Optional thread/session identifier used to scope ingest, search, and list symmetrically. |

## Responses

| Status | Description |
|---|---|
| 200 | Paginated memory list. |
| 400 | Input validation error |
| 500 | Internal server error |
| 502 | Upstream AI provider returned an unrecoverable failure (auth, non-retryable 4xx). |
| 503 | Upstream AI provider is rate-limited, quota-exhausted, or returned 5xx; consult `retryable`. |
