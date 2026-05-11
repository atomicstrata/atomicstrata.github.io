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

## Responses

| Status | Description |
|---|---|
| 200 | Paginated memory list. |
| 400 | Input validation error |
| 500 | Internal server error |
