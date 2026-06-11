# Wire capabilities descriptor for protocol-level callers.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getCapabilities` from the vendored `atomicmemory-core` spec.

**GET** `/v1/capabilities`

Unauthenticated. A protocol-level caller (e.g. a control-plane service) GETs this at startup to negotiate the core feature surface WITHOUT the JS SDK. Mirrors the SDK provider`s capabilities() descriptor over the wire. Like `/health`, it advertises a static capability surface (no user data), so it waives the document-level bearer requirement.

## Responses

| Status | Description |
|---|---|
| 200 | Capabilities descriptor. |
