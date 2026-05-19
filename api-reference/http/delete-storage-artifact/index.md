# Soft-delete an artifact (optionally cascading documents).

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `deleteStorageArtifact` from the vendored `atomicmemory-core` spec.

**DELETE** `/v1/storage/artifacts/{id}`

Reference-aware delete. Default `policy=artifact_only` returns 409 `artifact_in_use` if any active document references the artifact; `policy=with_documents` cascades a soft-delete to those documents first. No `force` parameter is supported.

## Parameters

| In | Name | Required | Type | Description |
|---|---|---|---|---|
| path | `id` | yes | string |  |
| query | `policy` | no | string | Delete behaviour when documents reference the artifact. `artifact_only` (default) returns 409 `artifact_in_use` if any non-deleted documents reference it. `with_documents` cascades a soft-delete to those documents first. |

## Responses

| Status | Description |
|---|---|
| 200 | Artifact deleted (or delete failed at the backend). |
| 400 | Input validation error |
| 404 | Artifact not found. |
| 409 | Artifact is referenced by active documents (`error_code: artifact_in_use`) OR another caller holds an active delete claim and this caller never ran the delete (`error_code: delete_in_flight`, `retryable: true`). |
| 500 | Internal server error |
