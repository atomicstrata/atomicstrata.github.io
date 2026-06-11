# Langflow

> Agent index: [llms.txt](/llms.txt)

AtomicMemory provides Langflow custom components that add durable semantic memory to visual AI workflows through the Python `atomicmemory` SDK.

## Deployment targets

### Local

Use the local setup when Langflow runs on your laptop, workstation, or self-hosted server and connects to a local AtomicMemory core.

See [Langflow Local](/integrations/frameworks/langflow/local).

### Cloud

Coming Soon

Hosted Langflow setup is not documented yet.

See [Langflow Cloud](/integrations/frameworks/langflow/cloud).

## Components

| Component | Purpose |
| --- | --- |
| Chat Memory | Read-only message history backend for a user/session scope. |
| Search Context | Query-driven memory recall that returns prompt-ready context. |
| Store Message | Explicitly persists a message or turn into AtomicMemory. |
| Delete Memories in Scope | Confirm-gated best-effort deletion for a selected scope. |

## Common patterns

-   **Cross-session chatbot memory.** Store important user turns, then retrieve user-scoped context in a later Langflow session.
-   **Personalized RAG.** Combine document retrieval with AtomicMemory recall for preferences, prior questions, and durable user context.
-   **Support and research workflows.** Persist facts, decisions, and follow-up items across repeated runs of the same flow.

## Trust model

Langflow flow authors can set component inputs such as `User ID` and `Session ID`. In shared or multi-tenant deployments, only trusted operators should be able to edit and run flows that can access durable memory.
