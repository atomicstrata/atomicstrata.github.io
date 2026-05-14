# OpenClaw Local

> Agent index: [llms.txt](/llms.txt)

Give OpenClaw persistent, cross-channel memory backed by AtomicMemory. The plugin registers an AtomicMemory-backed memory provider and ships a skill bundle that teaches agents when to search, ingest, and write deterministic session snapshots.

## Quick start

### 1. Install the plugin

```bash
openclaw plugins install @atomicmemory/openclaw-plugin
```

For local plugin development, install from a checkout instead:

```bash
git clone https://github.com/atomicstrata/atomicmemory-integrations.git
cd atomicmemory-integrations
pnpm install
pnpm --filter @atomicmemory/openclaw-plugin build
openclaw plugins install -l ./plugins/openclaw
```

### 2. Configure scope

OpenClaw passes plugin config from `openclaw.plugin.json` into the provider:

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

`scope.user` is the stable channel-agnostic user identity. Optional `agent`, `namespace`, and `thread` fields narrow memory when needed.

### 3. Restart OpenClaw

Restart the OpenClaw gateway after installing or updating the plugin:

```bash
openclaw gateway restart
```

## Features

-   **Cross-channel memory.** A fact saved in one chat channel can be recalled later from another channel.
-   **Permission-aware skill.** The skill declares network and credential permissions without filesystem or shell access.
-   **MCP-backed provider.** OpenClaw registers the shared MCP server as `atomicmemory.memory`.
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

| Field | Purpose |
| --- | --- |
| `provider` | AtomicMemory SDK provider name. |
| `apiUrl` | AtomicMemory service URL. |
| `apiKey` | Optional bearer credential for the AtomicMemory service. |
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
| Memory crosses unwanted channels | Add `scope.namespace`, `scope.agent`, or `scope.thread`. |
| Provider connection fails | Verify `apiUrl`, `apiKey` if required, and `scope.user` in the OpenClaw plugin config. |

## Development

For source builds, plugin development, and local adapter testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [Claude Code integration](/integrations/coding-agents/claude-code/local)
-   [Codex integration](/integrations/coding-agents/codex/local)
-   [Platform scope model](/platform/scope)
