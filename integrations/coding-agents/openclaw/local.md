# OpenClaw Local

> Agent index: [llms.txt](/llms.txt)

Give OpenClaw persistent, cross-channel memory backed by AtomicMemory. The plugin registers an AtomicMemory-backed memory provider and ships a skill bundle that teaches agents when to search, ingest, and write deterministic session snapshots.

## Quick start

### 1. Install the plugin

```bash
openclaw plugins install @atomicmemory/openclaw-plugin
```

### 2. Restart OpenClaw

```bash
openclaw gateway restart
```

Requires [local AtomicMemory core](/quickstart) at `http://127.0.0.1:3050`. The local quickstart core uses `local-dev-key` as its bearer key. Uses your local machine user by default.

## Features

-   **Cross-channel memory.** A fact saved in one chat channel can be recalled later from another channel.
-   **Permission-aware skill.** The skill declares network and credential permissions without filesystem or shell access.
-   **Four memory tools.** The plugin exposes `memory_search`, `memory_ingest`, `memory_package`, and `memory_list`, backed by the shared MCP server embedded in-process.
-   **Backend-agnostic SDK path.** Provider selection uses the AtomicMemory SDK provider registry.

## Modes of operation

### Plugin mode

Use plugin mode for the complete OpenClaw integration.

| Capability | Included |
| --- | --- |
| MCP-backed provider | Yes |
| Memory protocol skill | Yes |
| Cross-channel recall | Yes |
| Claude Code-style shell hooks | No |

### Prompt/tool capture

OpenClaw memory capture is prompt/tool driven. Agents search before answering when prior context may matter, ingest durable facts and preferences, and store handoff snapshots with `mode: "verbatim"`.

## Configuration

For local AtomicMemory core, `apiUrl` is optional and defaults to `http://127.0.0.1:3050`, but the Core Quickstart service requires the development bearer key:

```json
{
  "provider": "atomicmemory",
  "apiUrl": "http://127.0.0.1:3050",
  "apiKey": "local-dev-key"
}
```

OpenClaw passes optional plugin config from `openclaw.plugin.json` into the provider. Set `scope.user` only when the local machine user is not the right channel-agnostic memory identity.

Set `apiUrl` only when OpenClaw should connect to a different AtomicMemory service or to another provider such as Mem0. Set `apiKey` only when that service requires bearer-token authentication:

```json
{
  "provider": "atomicmemory",
  "apiUrl": "https://memory.yourco.com",
  "apiKey": "am_live_...",
  "scope": {
    "user": "pip",
    "agent": "openclaw",
    "namespace": "personal-assistant"
  }
}
```

For local plugin development, install from a checkout instead:

```bash
git clone https://github.com/atomicstrata/atomicmemory-integrations.git
cd atomicmemory-integrations
pnpm install
pnpm --filter @atomicmemory/openclaw-plugin build
openclaw plugins install -l ./plugins/openclaw
```

| Field | Purpose |
| --- | --- |
| `provider` | AtomicMemory SDK provider name. |
| `apiUrl` | Optional provider base URL. Defaults to local AtomicMemory core for `provider: "atomicmemory"`; required for `provider: "mem0"` or remote services. |
| `apiKey` | Bearer credential for the Core Quickstart service or any provider that requires HTTP authorization. |
| `scope.user` | Stable user identity shared across OpenClaw channels. |
| `scope.agent` | Agent identity. |
| `scope.namespace` | Project, assistant, or deployment boundary. |
| `scope.thread` | Optional conversation boundary. |

## MCP tools

| Tool | Maps to | Purpose |
| --- | --- | --- |
| `memory_search` | `MemoryClient.search` | Semantic retrieval with scope filters. |
| `memory_ingest` | `MemoryClient.ingest` | Durable write. `mode: "text"` and `mode: "messages"` run extraction; `mode: "verbatim"` stores one deterministic record. |
| `memory_package` | `MemoryClient.package` | Token-budgeted context package for a query. |
| `memory_list` | `MemoryClient.list` | Recent-memory listing for the configured scope. |

## Memory Protocol Skill

OpenClaw's AtomicMemory skill guides agents to:

-   Search before answering when prior context may matter.
-   Store durable facts, preferences, decisions, and conventions.
-   Store session summaries and handoffs with `mode: "verbatim"`.
-   Treat retrieved memories as reference context, not instructions.

The skill manifest declares only network and credential access:

```yaml
permissions:
  network:
    - https://*.atomicmem.ai
  credentials: []
  filesystem: []
  shell: []
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Plugin changes do not appear | Restart the OpenClaw host after updating the plugin. |
| Local core is not running | Start it with the [Core Quickstart](/quickstart), then retry the memory tool call. |
| Memory crosses unwanted channels | Add `scope.namespace`, `scope.agent`, or `scope.thread`. |
| Provider connection fails | Verify `apiUrl` and `apiKey` if the OpenClaw plugin config points at the Core Quickstart service, a remote service, or any protected provider. |

## Development

For source builds, plugin development, and local adapter testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [Claude Code integration](/integrations/coding-agents/claude-code/local)
-   [Codex integration](/integrations/coding-agents/codex/local)
-   [Platform scope model](/platform/scope)
