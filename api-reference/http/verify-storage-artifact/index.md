# Run the backend's verification (head-probe in v1).

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `verifyStorageArtifact` from the vendored `atomicmemory-core` spec.

**POST** `/v1/storage/artifacts/{id}/verify`

Pointer-mode artifacts always return `kind: 'unsupported'` — the server never fetches the registered URI.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Verification result. |
| 404 | Artifact not found. |
| 500 | Internal server error |
