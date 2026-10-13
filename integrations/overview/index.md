# Integrations

> Agent index: [llms.txt](/llms.txt)

Atomic Memory adds durable memory to coding agents, AI frameworks, and terminal workflows through the same provider-backed memory layer. Choose the host you use, install the integration, and point it at your Atomic Memory backend.

## Wire MCP manually

After [Hosted Cloud](/quickstart) or [Connected Local](/open-source/quickstart) `am init`, install MCP from each host's integration guide. **Do not use `am integrate` on Hosted Cloud** in current CLI releases. It sets a namespace filter that ingest does not write, so recall can miss new facts, and it locks scope to the OS username with no working override. See [CLI → Agent host MCP](/cli#agent-host-mcp-manual-install).

Hosted Cloud manual env (export or forward into the host MCP config):

```bash
am key create mcp
export ATOMICMEMORY_API_KEY="amc_..."  # paste from "API key secret (shown once): ..."
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_SCOPE_USER="you@company.com"
export ATOMICMEMORY_SCOPE_LOCK=true
# Omit ATOMICMEMORY_SCOPE_NAMESPACE on Hosted Cloud until product fixes land.
```

See [CLI → Agent host MCP](/cli#agent-host-mcp-manual-install) for the console alternative. Pin `@atomicmemory/mcp-server@0.1.5` in MCP launch args.

Your host

Coding agentsClaude Code · Codex · Cursor · OpenClaw · Hermes

FrameworksVercel AI · LangChain · LangGraph · Langflow · Mastra

MCP tools / SDK adapters

Shared surface

MCP server

SDK adapters

Backend

Atomic Memoryhosted or self-hosted

## Coding agents

| Integration | Best for | Status | Docs |
| --- | --- | --- | --- |
| Claude Code | MCP tools, memory skill, lifecycle hooks, and local core connection. | Published; hosted mode planned. | [Overview](/integrations/coding-agents/claude-code) · [Local](/integrations/coding-agents/claude-code/local) |
| Codex | MCP tools plus a memory protocol skill for task-start recall and handoffs. | Manual `codex mcp add`. See local guide. | [Overview](/integrations/coding-agents/codex) · [Local](/integrations/coding-agents/codex/local) |
| OpenClaw | Published plugin with embedded MCP tools and a memory skill bundle for cross-channel agent memory. | Published; hosted mode planned. | [Overview](/integrations/coding-agents/openclaw) · [Local](/integrations/coding-agents/openclaw/local) |
| Hermes Agent | Published native Python memory provider with prefetch, turn sync, and explicit tools. | Packaged provider; hosted mode planned. | [Overview](/integrations/coding-agents/hermes) · [Local](/integrations/coding-agents/hermes/local) |
| Cursor | MCP tools plus Cursor rules for durable memory behavior. | Manual MCP + rules. See local guide. | [Overview](/integrations/coding-agents/cursor) · [Local](/integrations/coding-agents/cursor/local) |

## Frameworks

| Integration | Best for | Status | Docs |
| --- | --- | --- | --- |
| Vercel AI SDK | User-scoped search and ingest tools for `generateText` and `streamText`, plus opt-in retrieval and ingest helpers. | `@atomicmemory/vercel-ai-sdk`: implemented, publish pending. | [Overview](/integrations/frameworks/vercel-ai-sdk) · [Local](/integrations/frameworks/vercel-ai-sdk/local) · [Cloud](/integrations/frameworks/vercel-ai-sdk/cloud) |
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

### Verbatim ingest and contentClass

Core 1.2.0+ with default `RAW_CONTENT_POLICY=reject` refuses unstamped verbatim content and also rejects `contentClass: "raw"`. For `mode: "verbatim"` on default-policy deployments, pass `contentClass: "summary"` or `"redacted"` — distil handoff snapshots rather than sending raw transcripts.

The `"raw"` enum value is accepted only on deployments configured with `RAW_CONTENT_POLICY=allow`.

`contentClass` and `metadata` apply only to `mode: "verbatim"`. Put lineage in `provenance` (`source`, `sourceUrl`, `sourceId`). Reserve `metadata` for integration keys such as `externalId` and `dedupe_key` — reserved keys are rejected by MCP server 0.1.5+.

```json
{
  "mode": "verbatim",
  "content": "Distilled session summary, not a raw transcript.",
  "contentClass": "summary",
  "provenance": { "source": "cursor", "sourceUrl": "cursor://session/<id>" },
  "metadata": { "dedupe_key": "<stable-id>" },
  "scope": { "user": "<user>" }
}
```

See [Using the Open Source backend](/sdk/guides/atomicmemory-backend) for SDK details and `RAW_CONTENT_POLICY`.

Framework integrations use the TypeScript or Python SDK directly. Choose model-selected tools or application-owned retrieval and ingest. Supported scope fields and isolation depend on the provider. See [Scopes and identity](/sdk/concepts/scopes-and-identity).

Terminal users: run [Hosted Cloud](/quickstart) or [Connected Local](/open-source/quickstart) with `am init`, then wire MCP manually from the host guides above. See the [CLI](/cli) for memory commands, migration, and diagnostics.

## Backend choice

Integrations are backend-agnostic. The SDK's [`MemoryProvider` model](/sdk/concepts/provider-model) lets the same integration point at self-hosted `atomicmemory-core` or another registered provider by configuration.

## Contributing

Source lives in the public [`atomicstrata/atomicmemory`](https://github.com/atomicstrata/atomicmemory) monorepo:

-   MCP server: [`packages/mcp-server`](https://github.com/atomicstrata/atomicmemory/tree/main/packages/mcp-server)
-   Framework adapters: [`adapters/*`](https://github.com/atomicstrata/atomicmemory/tree/main/adapters)
-   Host plugins: [`plugins/*`](https://github.com/atomicstrata/atomicmemory/tree/main/plugins)
