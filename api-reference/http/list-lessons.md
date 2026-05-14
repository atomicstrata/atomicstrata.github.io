# List active lessons for a user.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `listLessons` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/lessons`

List every active "lesson" for a user, newest first. A lesson is a
recorded failure pattern (blocked prompt-injection attempt,
low-trust write, high-confidence contradiction, or user report)
that future retrievals match against by embedding similarity to
warn or block known-bad queries. See [Lessons](/platform/lessons)
for the full concept guide, including what gets recorded and how
the search pipeline consumes it. Returns full pattern text — treat
the response as sensitive.

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
