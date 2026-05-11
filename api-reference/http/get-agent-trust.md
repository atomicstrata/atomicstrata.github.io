# Look up the trust level for a (user, agent) pair.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getAgentTrust` from the vendored `atomicmemory-core` spec.

**GET** `/v1/agents/trust`

Look up the trust level for a (user, agent) pair.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| query | `agent_id` | yes | string | Required. agent_id. |
| query | `user_id` | yes | string | Required. user_id. |

## Responses

| Status | Description |
|---|---|
| 200 | Agent id + trust level. |
| 400 | Input validation error |
| 500 | Internal server error |
