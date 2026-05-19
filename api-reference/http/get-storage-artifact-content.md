# Read the raw bytes for a managed artifact.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getStorageArtifactContent` from the vendored `atomicmemory-core` spec.

**GET** `/v1/storage/artifacts/{id}/content`

Returns the artifact bytes for managed-mode artifacts. Pointer-mode artifacts return 409 `pointer_content_not_managed` — the server never proxies pointer content.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Raw bytes. |
| 404 | Artifact not found. |
| 409 | Pointer-mode artifact; fetch the URI directly. |
| 500 | Internal server error |
| 503 | Managed storage is disabled for this deployment. |
