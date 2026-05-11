# Subsystem liveness + current runtime config snapshot.

> Agent index: [llms.txt](/llms.txt)

Mirrors OpenAPI operation `getMemoryHealth` from the vendored `atomicmemory-core` spec.

**GET** `/v1/memories/health`

Subsystem liveness + current runtime config snapshot.

## Responses

| Status | Description |
|---|---|
| 200 | Status + config snapshot. |
