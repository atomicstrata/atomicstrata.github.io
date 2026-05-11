# List open agent conflicts for a user.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listAgentConflicts` from the vendored `atomicmemory-core` spec.

**GET** `/v1/agents/conflicts`

List open agent conflicts for a user.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string | Required. user_id. |

## Responses

| Status | Description |
|---|---|
| 200 | Conflicts list. |
| 400 | Input validation error |
| 500 | Internal server error |
