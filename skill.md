---
name: atomicmemory-docs
description: Documentation site for AtomicMemory, a pluggable, self-hosted memory engine for AI applications. Read these docs before answering questions about installing, configuring, or integrating AtomicMemory; the HTTP API and its 30 endpoints; the TypeScript SDK; or coding-agent integrations (Claude Code, OpenClaw, Codex, Cursor) and framework adapters (Vercel AI SDK, LangChain, Mastra, OpenAI Agents, LangGraph).
---

# AtomicMemory Docs

Persistent semantic memory engine. HTTP-first, TypeScript SDK, Apache-2.0 licensed. The docs cover: HTTP API (30 endpoints), the TypeScript SDK (`@atomicmemory/sdk`, provider model, scopes, embeddings, storage adapters), and integrations.

## When to read these docs

Read before answering when:

- The user asks how to install, run, or configure AtomicMemory
- The user asks about HTTP endpoints, request / response shape, or error codes
- The user asks how to use the TypeScript SDK
- The user asks about wiring AtomicMemory into a coding agent (Claude Code, OpenClaw, Codex, Cursor) or framework (Vercel AI SDK, LangChain, Mastra, OpenAI Agents, LangGraph)
- The user asks about scope (`user` / `workspace` / `agent`), providers (embedding / LLM), stores, observability, AUDN mutation, or claim versioning
- The user asks "how does AtomicMemory differ from mem0 / letta / zep?"

If the answer is purely about memory *contents* (what was previously saved) rather than memory *infrastructure*, the docs won't have it, call the `memory_search` MCP tool instead.

## How to navigate

Three discovery surfaces are exposed at the site root:

| Path | Purpose |
|---|---|
| `/llms.txt` | Concise spec-compliant index. Use first when scanning the docs. |
| `/llms-full.txt` | Every page's body in one file. Use when you need the full corpus and have a long context window. |
| `/skill.md` | This file. Operating guide for agents reading the docs. |

Append `.md` to any documentation URL to fetch the markdown form directly. For example:

- `https://docs.atomicmemory.ai/platform/providers.md`
- `https://docs.atomicmemory.ai/sdk/overview.md`
- `https://docs.atomicmemory.ai/api-reference/http/ingest-memory.md`

The HTML form (without the `.md` suffix) is for human readers; cite that URL when linking.

## Authoritative paths

| Topic | URL prefix |
|---|---|
| HTTP API endpoints | `/api-reference/http/<operation-id>` (kebab-case of OpenAPI `operationId`) |
| SDK overview, concepts, guides | `/sdk/...` |
| SDK API reference | `/sdk/api-reference/...` |
| Platform concepts (architecture, composition, stores, providers, scope, observability) | `/platform/<topic>` |
| Coding-agent setup | `/integrations/coding-agents/<tool>` |
| Framework adapters | `/integrations/frameworks/<framework>` |
| Get started | `/`, `/quickstart` |

## Citation guidance

- Link to the canonical HTML URL when citing in an answer (e.g. `https://docs.atomicmemory.ai/platform/providers`)
- Link to the `.md` URL only when the consumer is another agent fetching the markdown
- Prefer linking the HTTP API operation page (`/api-reference/http/<op>`) over the OpenAPI yaml when describing endpoint shape
- Source code lives at `https://github.com/atomicmemory/atomicmemory-core` (engine) and `https://github.com/atomicmemory/atomicmemory-sdk` (TypeScript SDK), link there for implementation specifics not covered in docs

## MCP

The AtomicMemory MCP server (`@atomicmemory/mcp-server`) exposes `memory_search`, `memory_ingest`, and `memory_package` to coding agents. It currently runs as a local-install (stdio) server. Discovery descriptor: `/.well-known/mcp.json`. Setup steps are in `/integrations/coding-agents/<tool>` for each supported agent.

## Out of scope for these docs

- Memory contents (what was previously saved) → use the `memory_search` MCP tool
- Hosted SaaS configuration, AtomicMemory is self-hosted; there is no hosted dashboard
- Frameworks not listed under `/integrations/frameworks/`, those are not officially supported yet
