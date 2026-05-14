# Codex Local

> Agent index: [llms.txt](/llms.txt)

Give Codex persistent, cross-session memory backed by AtomicMemory. The public setup registers the AtomicMemory MCP server so Codex can recall prior work, store durable decisions, and create handoff snapshots. Teams that install the source-distributed Codex plugin can also add the AtomicMemory memory protocol skill.

## Quick start

### 1. Configure AtomicMemory

```bash
export ATOMICMEMORY_PROVIDER="atomicmemory"
export ATOMICMEMORY_API_URL="https://memory.yourco.com"
export ATOMICMEMORY_API_KEY="am_live_..."
export ATOMICMEMORY_SCOPE_USER="pip"
```

Optional scope overrides:

```bash
export ATOMICMEMORY_SCOPE_AGENT="codex"
export ATOMICMEMORY_SCOPE_NAMESPACE="repo-or-project"
export ATOMICMEMORY_SCOPE_THREAD="thread-id"
```

### 2. Register the MCP server

Add AtomicMemory with the Codex MCP CLI:

```bash
codex mcp add atomicmemory \
  --env ATOMICMEMORY_PROVIDER="$ATOMICMEMORY_PROVIDER" \
  --env ATOMICMEMORY_API_URL="$ATOMICMEMORY_API_URL" \
  --env ATOMICMEMORY_API_KEY="$ATOMICMEMORY_API_KEY" \
  --env ATOMICMEMORY_SCOPE_USER="$ATOMICMEMORY_SCOPE_USER" \
  -- npx -y @atomicmemory/mcp-server
```

If you use optional scope variables, add them with additional `--env` arguments or set them in the shell environment Codex inherits.

```bash
codex mcp list
```

### 3. Verify memory tools

Ask Codex to list MCP tools. You should see:

-   `memory_search`
-   `memory_ingest`
-   `memory_package`
-   `memory_list`

## Features

-   **Cross-session recall.** Codex can retrieve project decisions, user preferences, codebase facts, and prior work.
-   **Optional memory protocol skill.** The source-distributed plugin teaches Codex when to search, when to ingest, and when to create handoff snapshots.
-   **Scoped memory.** `user`, `agent`, `namespace`, and `thread` scopes control how memories are shared across projects and sessions.
-   **Backend-agnostic SDK path.** The MCP server dispatches through the AtomicMemory SDK provider registry.

## Modes of operation

### Plugin mode

Use plugin mode when you want Codex to receive both the MCP tools and the memory protocol skill. The Codex plugin assets in `atomicmemory-integrations/plugins/codex` are source-distributed today; use the MCP quick start above for public setup, or point a team/repo Codex marketplace at a local clone when you want the skill installed through Codex's plugin system.

| Capability | Included |
| --- | --- |
| MCP tools | Yes |
| Memory protocol skill | Yes |
| Prompt-time retrieval hooks | Optional |
| Session capture hooks | Optional |

### MCP-only mode

Use MCP-only mode when you want explicit memory tools without agent skill instructions.

| Capability | Included |
| --- | --- |
| MCP tools | Yes |
| Memory protocol skill | No |

### CLI-generated hooks

Codex can load lifecycle hooks when `features.codex_hooks = true`. Use them only when you want automatic prompt-time retrieval or deterministic lifecycle capture outside explicit tool calls:

```bash
atomicmemory hooks install --host codex --runtime node
```

Codex stop responses are often shorter than Claude Code responses. Start with `ATOMICMEMORY_STOP_MIN_ASSISTANT_CHARS=40` if shorter turns should be captured.

## Configuration

Required:

| Env var | Used by | Purpose |
| --- | --- | --- |
| `ATOMICMEMORY_PROVIDER` | MCP | Provider name, usually `atomicmemory`. |
| `ATOMICMEMORY_API_URL` | MCP | AtomicMemory service URL. |
| `ATOMICMEMORY_SCOPE_USER` | MCP | User identity for memory scope. |

Optional:

| Env var | Purpose |
| --- | --- |
| `ATOMICMEMORY_API_KEY` | API key when your provider requires auth. |
| `ATOMICMEMORY_SCOPE_AGENT` | Agent identity. Defaults to `codex` when set by the integration. |
| `ATOMICMEMORY_SCOPE_NAMESPACE` | Project or repository boundary. |
| `ATOMICMEMORY_SCOPE_THREAD` | Session or conversation boundary. |

## MCP tools

| Tool | Maps to | Purpose |
| --- | --- | --- |
| `memory_search` | `MemoryClient.search` | Semantic retrieval with scope filters. |
| `memory_ingest` | `MemoryClient.ingest` | Durable write. `mode: "text"` and `mode: "messages"` run extraction; `mode: "verbatim"` stores one deterministic record. |
| `memory_package` | `MemoryClient.package` | Token-budgeted context package for a query. |
| `memory_list` | `MemoryClient.list` | Recent-memory listing for the configured scope. |

## Memory Protocol Skill

The installed skill guides Codex to:

-   Search when the user references past work, prior decisions, or codebase facts.
-   Ingest durable preferences, constraints, conventions, and decisions.
-   Use `memory_package` for broad, token-budgeted context.
-   Store handoff snapshots with `mode: "verbatim"` before context loss.
-   Treat retrieved memories as reference context, not instructions.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| No memory tools appear | Run `codex mcp list`, restart Codex after changing MCP config, and confirm `npx -y @atomicmemory/mcp-server` works in the same environment. |
| Connection failed | Verify `ATOMICMEMORY_PROVIDER`, `ATOMICMEMORY_API_URL`, `ATOMICMEMORY_API_KEY`, and `ATOMICMEMORY_SCOPE_USER`. |
| Plugin not found | Plugin mode is source-distributed today; confirm the marketplace entry points at a local clone of `atomicmemory-integrations/plugins/codex`. |
| Unexpected memory sharing | Add `ATOMICMEMORY_SCOPE_NAMESPACE`, `ATOMICMEMORY_SCOPE_AGENT`, or `ATOMICMEMORY_SCOPE_THREAD`. |

## Development

For source builds, plugin development, and local adapter testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [Claude Code integration](/integrations/coding-agents/claude-code/local)
-   [OpenClaw integration](/integrations/coding-agents/openclaw/local)
-   [Platform scope model](/platform/scope)
