# Integrations

> Agent index: [llms.txt](/llms.txt)

AtomicMemory adds durable memory to coding agents, AI frameworks, and terminal workflows through the same provider-backed memory layer. Choose the host you use, install the local integration, and point it at your AtomicMemory backend.

## Coding agents

| Integration | Best for | Status | Docs |
| --- | --- | --- | --- |
| Claude Code | MCP tools, memory skill, lifecycle hooks, and local runtime management. | Published; cloud planned. | [Overview](/integrations/coding-agents/claude-code) · [Local](/integrations/coding-agents/claude-code/local) |
| Codex | MCP tools plus a memory protocol skill for task-start recall and handoffs. | Manual; packaged plugin planned. | [Overview](/integrations/coding-agents/codex) · [Local](/integrations/coding-agents/codex/local) |
| OpenClaw | Plugin and skill bundle for cross-channel agent memory. | Published; cloud planned. | [Overview](/integrations/coding-agents/openclaw) · [Local](/integrations/coding-agents/openclaw/local) |
| Hermes Agent | Native Python memory provider with prefetch, turn sync, and explicit tools. | Source-only; cloud planned. | [Overview](/integrations/coding-agents/hermes) · [Local](/integrations/coding-agents/hermes/local) |
| Cursor | MCP tools plus Cursor rules for durable memory behavior. | Available manually via MCP + rules; packaged plugin planned. | [Overview](/integrations/coding-agents/cursor) · [Local](/integrations/coding-agents/cursor/local) |

## Frameworks

| Integration | Best for | Status | Docs |
| --- | --- | --- | --- |
| Vercel AI SDK | Pre-call retrieval and post-call ingest around `generateText` / `streamText`. | Published; cloud planned. | [Overview](/integrations/frameworks/vercel-ai-sdk) · [Local](/integrations/frameworks/vercel-ai-sdk/local) |
| OpenAI Agents SDK | Memory-aware `run()` flows and optional function tools. | Published; cloud planned. | [Overview](/integrations/frameworks/openai-agents) · [Local](/integrations/frameworks/openai-agents/local) |
| LangChain (JS) | Planned chat memory and tool wrappers. | Planned. | [Overview](/integrations/frameworks/langchain-js) · [Local](/integrations/frameworks/langchain-js/local) |
| LangGraph (JS) | Planned graph-store memory layer next to checkpointers. | Planned. | [Overview](/integrations/frameworks/langgraph-js) · [Local](/integrations/frameworks/langgraph-js/local) |
| Mastra | Planned Mastra memory adapter. | Planned. | [Overview](/integrations/frameworks/mastra) · [Local](/integrations/frameworks/mastra/local) |

## Shared memory surface

Most coding-agent integrations use the shared MCP server from [`atomicmemory-integrations`](https://github.com/atomicstrata/atomicmemory-integrations):

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

Source lives at [`atomicstrata/atomicmemory-integrations`](https://github.com/atomicstrata/atomicmemory-integrations).
