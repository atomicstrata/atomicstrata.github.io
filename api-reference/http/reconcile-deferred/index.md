# Reconcile deferred mutations for a user (or all users when user_id is absent).

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `reconcileDeferred` from the vendored `atomicmemory-core` spec.

**POST** `/v1/memories/reconcile`

Reconcile deferred mutations for a user (or all users when user_id is absent).

## Request Body (application/json)

```json
{
  "properties": {
    "user_id": {
      "type": "string"
    }
  },
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Reconciliation result. |
| 400 | Input validation error |
| 500 | Internal server error |
