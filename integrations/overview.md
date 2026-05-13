# Integrations

> Agent index: [llms.txt](/llms.txt)

AtomicMemory is a platform layer, so the useful question is never "what integrates with it?" — it is "what wants persistent, pluggable memory?" Three surfaces already do: terminal operators who need a scriptable memory tool, coding agents that need durable context across sessions, and AI frameworks that want a swappable memory backend behind their agent loops.

The integration family consumes AtomicMemory through a small set of shared seams:

-   **HTTP API** — `ingest` / `search` / `package` / `trust`, documented under [API Reference](/api-reference/http/conventions)
-   **TypeScript SDK** — `MemoryClient` with the pluggable `MemoryProvider` model, documented under [SDK](/sdk/overview)
-   **Python SDK** — used where the host runtime is Python-native, such as Hermes.

Coding-agent integrations additionally share a **common MCP server** (`@atomicmemory/mcp-server`) shipped from [`atomicmemory-integrations`](https://github.com/atomicstrata/atomicmemory-integrations). It exposes `memory_search`, `memory_ingest`, `memory_package`, and `memory_list` so Claude Code, OpenClaw, Codex, and Cursor all speak to the same memory surface through the same tool contract. `memory_ingest` supports extracted writes (`mode: "text"` / `mode: "messages"`) and deterministic one-record snapshots (`mode: "verbatim"`) for handoffs and lifecycle summaries.

The **AtomicMemory CLI** is the terminal companion to those integration surfaces. It is not an MCP server; it is a human- and agent-facing command line for setup, diagnostics, memory operations, config, and stable `--agent` JSON output. See [AtomicMemory CLI](/cli).

Hermes is the main exception to the MCP wrapper pattern. Hermes has a native Python memory-provider lifecycle, so the AtomicMemory Hermes integration uses `atomicmemory-python` directly to participate in prefetch, turn sync, and shutdown hooks.

## Coding Agents

Each coding-agent integration is now split into two tracks:

-   **Local** — the self-managed workflow.
-   **Cloud** — a separate page reserved for the hosted model and rollout details.

The Local pages currently render the production-ready self-managed path: published plugins or packages against your own AtomicMemory deployment.

| Integration | Overview | Local | Cloud |
| --- | --- | --- | --- |
| Claude Code | [Overview](/integrations/coding-agents/claude-code) | [Local](/integrations/coding-agents/claude-code/local) | [Cloud](/integrations/coding-agents/claude-code/cloud) |
| OpenClaw | [Overview](/integrations/coding-agents/openclaw) | [Local](/integrations/coding-agents/openclaw/local) | [Cloud](/integrations/coding-agents/openclaw/cloud) |
| Codex | [Overview](/integrations/coding-agents/codex) | [Local](/integrations/coding-agents/codex/local) | [Cloud](/integrations/coding-agents/codex/cloud) |
| Hermes Agent | [Overview](/integrations/coding-agents/hermes) | [Local](/integrations/coding-agents/hermes/local) | [Cloud](/integrations/coding-agents/hermes/cloud) |
| Cursor | [Overview](/integrations/coding-agents/cursor) | [Local](/integrations/coding-agents/cursor/local) | [Cloud](/integrations/coding-agents/cursor/cloud) |

## Frameworks

Framework integrations expose AtomicMemory as the memory primitive inside an agent's loop — retrieved context goes into prompts, new turns get ingested, capabilities are surfaced to the framework's tool system.

Each framework integration follows the same split:

-   **Local** — the self-managed, linked-package, or intended local adapter workflow.
-   **Cloud** — a separate page reserved for the hosted model and rollout details.

| Integration | Overview | Local | Cloud |
| --- | --- | --- | --- |
| Vercel AI SDK | [Overview](/integrations/frameworks/vercel-ai-sdk) | [Local](/integrations/frameworks/vercel-ai-sdk/local) | [Cloud](/integrations/frameworks/vercel-ai-sdk/cloud) |
| LangChain (JS) | [Overview](/integrations/frameworks/langchain-js) | [Local](/integrations/frameworks/langchain-js/local) | [Cloud](/integrations/frameworks/langchain-js/cloud) |
| Mastra | [Overview](/integrations/frameworks/mastra) | [Local](/integrations/frameworks/mastra/local) | [Cloud](/integrations/frameworks/mastra/cloud) |
| OpenAI Agents SDK | [Overview](/integrations/frameworks/openai-agents) | [Local](/integrations/frameworks/openai-agents/local) | [Cloud](/integrations/frameworks/openai-agents/cloud) |
| LangGraph (JS) | [Overview](/integrations/frameworks/langgraph-js) | [Local](/integrations/frameworks/langgraph-js/local) | [Cloud](/integrations/frameworks/langgraph-js/cloud) |

## Choosing a backend

Every integration on this page is **backend-agnostic**. The SDK's [`MemoryProvider` model](/sdk/concepts/provider-model) means the same Claude Code plugin or Vercel AI adapter can point at self-hosted `atomicmemory-core` or any other registered `MemoryProvider` — by config, not by code change.

## Contributing

Source lives at [`atomicstrata/atomicmemory-integrations`](https://github.com/atomicstrata/atomicmemory-integrations). The shared MCP server is in [`packages/mcp-server`](https://github.com/atomicstrata/atomicmemory-integrations/tree/main/packages/mcp-server); per-tool wrappers live under [`plugins/`](https://github.com/atomicstrata/atomicmemory-integrations/tree/main/plugins). If the tool you want isn't here, the cheapest path is usually: copy the closest plugin, swap the manifest shape for the target agent's, and reuse the MCP server unchanged.
