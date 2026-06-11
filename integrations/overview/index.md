# Integrations

> Agent index: [llms.txt](/llms.txt)

AtomicMemory adds durable memory to coding agents, AI frameworks, and terminal workflows through the same provider-backed memory layer. Choose the host you use, install the local integration, and point it at your AtomicMemory backend.

## Coding agents

| Integration | Best for | Status | Docs |
| --- | --- | --- | --- |
| Claude Code | MCP tools, memory skill, lifecycle hooks, and local core connection. | Published; hosted mode planned. | [Overview](/integrations/coding-agents/claude-code) · [Local](/integrations/coding-agents/claude-code/local) |
| Codex | MCP tools plus a memory protocol skill for task-start recall and handoffs. | Manual; packaged plugin planned. | [Overview](/integrations/coding-agents/codex) · [Local](/integrations/coding-agents/codex/local) |
| OpenClaw | Published plugin with embedded MCP tools and a memory skill bundle for cross-channel agent memory. | Published; hosted mode planned. | [Overview](/integrations/coding-agents/openclaw) · [Local](/integrations/coding-agents/openclaw/local) |
| Hermes Agent | Published native Python memory provider with prefetch, turn sync, and explicit tools. | Packaged provider; hosted mode planned. | [Overview](/integrations/coding-agents/hermes) · [Local](/integrations/coding-agents/hermes/local) |
| Cursor | MCP tools plus Cursor rules for durable memory behavior. | Manual local MCP + rule template; packaged plugin planned. | [Overview](/integrations/coding-agents/cursor) · [Local](/integrations/coding-agents/cursor/local) |

## Frameworks

| Integration | Best for | Status | Docs |
| --- | --- | --- | --- |
| Vercel AI SDK | Pre-call retrieval and post-call ingest around `generateText` / `streamText`. | Published; hosted mode planned. | [Overview](/integrations/frameworks/vercel-ai-sdk) · [Local](/integrations/frameworks/vercel-ai-sdk/local) |
| OpenAI Agents SDK | Memory-aware `run()` flows and optional function tools. | Published; hosted mode planned. | [Overview](/integrations/frameworks/openai-agents) · [Local](/integrations/frameworks/openai-agents/local) |
| LangChain (JS) | Memory search/ingest tools and helper functions around an injected SDK client. | Published; hosted mode planned. | [Overview](/integrations/frameworks/langchain-js) · [Local](/integrations/frameworks/langchain-js/local) |
| Langflow | Custom visual-flow components for explicit store, prompt-ready search context, read-only chat memory, and scoped deletion. | Published; hosted mode planned. | [Overview](/integrations/frameworks/langflow) · [Local](/integrations/frameworks/langflow/local) |
| LangGraph (JS) | Retrieve and ingest node factories for durable memory inside state graphs. | Published; hosted mode planned. | [Overview](/integrations/frameworks/langgraph-js) · [Local](/integrations/frameworks/langgraph-js/local) |
| Mastra | Memory search/ingest tools for Mastra agents. | Published; hosted mode planned. | [Overview](/integrations/frameworks/mastra) · [Local](/integrations/frameworks/mastra/local) |

## Shared memory surface

Most coding-agent integrations use the shared MCP server from the [`packages/mcp-server`](https://github.com/atomicstrata/atomicmemory/tree/main/packages/mcp-server) package in the public [`atomicstrata/atomicmemory`](https://github.com/atomicstrata/atomicmemory) monorepo:

| Tool | Purpose |
| --- | --- |
| `memory_search` | Search durable memory by meaning. |
| `memory_ingest` | Store durable facts, decisions, preferences, or exact session snapshots. |
| `memory_package` | Build a token-budgeted context package. |
| `memory_list` | Inspect recent scoped memories. |

Framework integrations use the TypeScript or Python SDK directly, but keep the same loop: retrieve before the agent acts, ingest after useful work completes, and scope memory by user, agent, namespace, or thread.

Terminal users can use the [AtomicMemory CLI](/cli) for direct search, ingest, profile setup, and hook generation.

## Backend choice

Integrations are backend-agnostic. The SDK's [`MemoryProvider` model](/sdk/concepts/provider-model) lets the same integration point at self-hosted `atomicmemory-core` or another registered provider by configuration.

## Contributing

Source lives in the public [`atomicstrata/atomicmemory`](https://github.com/atomicstrata/atomicmemory) monorepo:

-   MCP server: [`packages/mcp-server`](https://github.com/atomicstrata/atomicmemory/tree/main/packages/mcp-server)
-   Framework adapters: [`adapters/*`](https://github.com/atomicstrata/atomicmemory/tree/main/adapters)
-   Host plugins: [`plugins/*`](https://github.com/atomicstrata/atomicmemory/tree/main/plugins)
