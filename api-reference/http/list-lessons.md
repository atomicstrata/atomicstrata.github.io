# List active lessons for a user.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listLessons` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/lessons`

List active lessons for a user.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Lessons list. |
| 400 | Input validation error |
| 500 | Internal server error |
