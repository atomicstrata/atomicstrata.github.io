# Deactivate a lesson by id.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `deactivateLesson` from the vendored `atomicmemory-core` spec.

**DELETE** `/v1/memories/lessons/{id}`

Deactivate a lesson by id.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Success. |
| 400 | Input validation error |
| 500 | Internal server error |
