# Get the synthesized profile for a user or agent.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getEntityProfile` from the vendored `atomicmemory-core` spec.

**GET** `/v1/entities/{entity_type}/{entity_id}/profile`

Returns the auto-synthesized prose profile from `user_profiles` plus top structured attribute triples from `entity_attributes`. No LLM call on the read path — the profile is pre-computed at ingest time. `profile` is `null` when fewer than 3 memories have been ingested or when `USER_PROFILE_CHANNEL_ENABLED` is off.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `entity_type` | yes | string |  |
| path | `entity_id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Entity profile with attributes and memory count. |
| 400 | Input validation error |
| 500 | Internal server error |
