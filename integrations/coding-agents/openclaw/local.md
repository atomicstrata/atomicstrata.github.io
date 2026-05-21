# OpenClaw Local

> Agent index: [llms.txt](/llms.txt)

Give OpenClaw persistent, cross-channel memory backed by AtomicMemory. The plugin embeds the shared AtomicMemory MCP server in-process, registers four memory tools, and ships a skill bundle that teaches agents when to search, ingest, and write deterministic session snapshots.

## Quick start

### 1. Start AtomicMemory core

Start local core first. It should be reachable at `http://127.0.0.1:17350`.

```bash
export OPENAI_API_KEY="sk-..."

docker run -d --pull always \
  --name atomicmemory-core \
  -p 127.0.0.1:17350:17350 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v $HOME/.atomicstrata/atomicmemory-docker:/var/lib/atomicmemory/postgres \
  ghcr.io/atomicstrata/atomicmemory-core:latest
```

For the default local core, no OpenClaw plugin config is required: the embedded MCP server uses the local core URL, local quickstart key, and your local machine user by default.

### 2. Install the plugin

```bash
openclaw plugins install @atomicmemory/openclaw-plugin
```

### 3. Restart OpenClaw if needed

If OpenClaw is already running, restart the gateway so it loads the newly installed plugin:

```bash
openclaw gateway restart
```

## Features

-   **Cross-channel memory.** A fact saved in one chat channel can be recalled later from another channel.
-   **Permission-aware skill.** The skill declares network and credential permissions without filesystem or shell access.
-   **Four memory tools.** The plugin exposes `memory_search`, `memory_ingest`, `memory_package`, and `memory_list`, backed by the shared MCP server embedded in-process.
-   **Local defaults.** Local `apiUrl`, local quickstart auth, and user scope are inferred when omitted.
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

For local AtomicMemory core, plugin config is optional. The embedded MCP server defaults to `http://127.0.0.1:17350`, uses the local quickstart key for that URL, and derives `scope.user` from the local machine user.

Add config only when you need explicit scoping or a non-default provider:

```json
{
  "provider": "atomicmemory",
  "apiUrl": "http://127.0.0.1:17350",
  "scope": {
    "user": "pip",
    "agent": "openclaw",
    "namespace": "personal-assistant"
  }
}
```

OpenClaw passes optional plugin config from `openclaw.plugin.json` into the provider. Set `scope.user` only when the local machine user is not the right channel-agnostic memory identity. Set `apiKey` only when your allowed local service uses a non-default bearer key.

The shipped skill manifest allows only the local AtomicMemory core origins listed below. Do not point this plugin at a remote service unless your OpenClaw administrator also updates and revalidates the plugin skill permissions.

For local plugin development, install from a checkout instead:

```bash
git clone https://github.com/atomicstrata/atomicmemory.git
cd atomicmemory
pnpm install
pnpm --filter @atomicmemory/openclaw-plugin build
openclaw plugins install -l ./plugins/openclaw
```

| Field | Purpose |
| --- | --- |
| `provider` | AtomicMemory SDK provider name. |
| `apiUrl` | Optional provider base URL. Defaults to local AtomicMemory core for `provider: "atomicmemory"`. The shipped skill manifest allows `http://127.0.0.1:17350` and `http://localhost:17350`. |
| `apiKey` | Optional bearer credential. Omit it for the default local core; provide it for an allowed local service with a non-default key. |
| `scope.user` | Stable user identity shared across OpenClaw channels. Defaults to the local machine user. |
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
    - http://127.0.0.1:17350
    - http://localhost:17350
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
| Provider connection fails | Verify local core is running at an allowed origin. If you configured `apiUrl` or `apiKey`, confirm both values match the service you are running. |

## Development

For source builds, plugin development, and local adapter testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [Claude Code integration](/integrations/coding-agents/claude-code/local)
-   [Codex integration](/integrations/coding-agents/codex/local)
-   [Platform scope model](/platform/scope)
