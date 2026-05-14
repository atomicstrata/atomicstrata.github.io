# Deactivate a lesson by id.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `deactivateLesson` from the vendored `atomicmemory-core` spec.

**DELETE** `/v1/memories/lessons/{id}`

Mark a lesson inactive (`active = false`). Active is the only
state that affects retrieval, so a deactivated lesson is ignored
by future search-time checks but preserved in the database for
audit. Use this to reverse a false positive or retire a lesson
whose source has been investigated. See [Lessons](/platform/lessons)
for background.

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
