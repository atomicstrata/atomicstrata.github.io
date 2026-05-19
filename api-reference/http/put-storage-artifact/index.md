# Register a pointer artifact or upload a managed artifact.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `putStorageArtifact` from the vendored `atomicmemory-core` spec.

**POST** `/v1/storage/artifacts`

Pointer mode sends a JSON body with `mode: "pointer"` plus a caller-supplied `uri`; the server stores the reference but NEVER fetches the URI. Managed mode sends the raw bytes with `?mode=managed[&disclose_content_hash=true]` and an optional `X-AtomicMemory-Metadata` base64-JSON header. Filecoin direct managed uploads return 501 in v1.

## Request Body (application/json)

```json
{
  "description": "Discriminated union over put-artifact mode.",
  "oneOf": [
    {
      "additionalProperties": false,
      "description": "Pointer-mode artifact registration body. The server stores the URI as a reference; it NEVER fetches the URI itself.",
      "properties": {
        "content_hash": {
          "minLength": 1,
          "type": "string"
        },
        "content_type": {
          "minLength": 1,
          "type": "string"
        },
        "metadata": {
          "additionalProperties": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "number"
              },
              {
                "type": "boolean"
              }
            ]
          },
          "description": "Caller-supplied metadata. Decoded JSON must be ≤4 KiB; encoded header value must be ≤8 KiB when sent via `X-AtomicMemory-Metadata`.",
          "type": "object"
        },
        "mode": {
          "enum": [
            "pointer"
          ],
          "type": "string"
        },
        "size_bytes": {
          "minimum": 0,
          "type": "integer"
        },
        "uri": {
          "minLength": 1,
          "type": "string"
        }
      },
      "required": [
        "mode",
        "uri",
        "content_type"
      ],
      "type": "object"
    },
    {
      "additionalProperties": false,
      "description": "Managed-mode marker. The route uses query params for the managed-mode contract; the body is raw bytes, not JSON. Included in the discriminated union so a managed-mode JSON body (caller mistake) parses cleanly and is rejected at the route layer.",
      "properties": {
        "mode": {
          "enum": [
            "managed"
          ],
          "type": "string"
        }
      },
      "required": [
        "mode"
      ],
      "type": "object"
    }
  ]
}
```

## Responses

| Status | Description |
|---|---|
| 201 | Artifact created. |
| 400 | Input validation error |
| 411 | Content-Length is required for managed uploads. |
| 413 | Managed upload body exceeds the configured cap. |
| 500 | Internal server error |
| 501 | Direct Filecoin managed upload is not supported in v1. |
| 503 | Managed storage is disabled for this deployment. |
