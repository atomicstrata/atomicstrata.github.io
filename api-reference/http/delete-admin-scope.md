# Delete one allowed disposable test scope.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `deleteAdminScope` from the vendored `atomicmemory-core` spec.

**DELETE** `/v1/admin/scope`

Mounted only when CORE_ADMIN_API_KEY and CORE_TEST_SCOPE_ALLOW_PATTERN are both configured. The server refuses user_id values that do not match the configured test-scope pattern.

## Request Body (application/json)

```json
{
  "properties": {
    "user_id": {
      "minLength": 1,
      "type": "string"
    }
  },
  "required": [
    "user_id"
  ],
  "type": "object"
}
```

## Responses

| Status | Description |
|---|---|
| 200 | Number of memories deleted for the requested scope. |
| 400 | Input validation error |
| 401 | Missing or invalid bearer token |
| 403 | Request is authenticated but not allowed |
| 500 | Internal server error |
