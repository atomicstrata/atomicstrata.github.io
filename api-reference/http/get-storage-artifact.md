# Read an artifact metadata projection.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getStorageArtifact` from the vendored `atomicmemory-core` spec.

**GET** `/v1/storage/artifacts/{id}`

Read an artifact metadata projection.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |

## Responses

| Status | Description |
|---|---|
| 200 | Artifact metadata. |
| 404 | Artifact not found. |
| 500 | Internal server error |
