# Lesson statistics for a user.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getLessonStats` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/lessons/stats`

Return the count of currently active lessons for a user, broken
down by lesson type — a lightweight per-user health signal. A
lesson is a recorded failure pattern (blocked injection, low-trust
write, high-confidence contradiction, or user report) that future
retrievals filter against. See [Lessons](/platform/lessons) for
background. Use this endpoint to surface a count badge or alert
on spikes (e.g. sustained growth in `injection_blocked`) without
exposing the raw pattern text — use `GET /v1/memories/lessons`
for the full rows.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `user_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Stats. |
| 400 | Input validation error |
| 500 | Internal server error |
