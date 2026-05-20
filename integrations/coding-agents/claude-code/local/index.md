# Claude Code Local

> Agent index: [llms.txt](/llms.txt)

Give Claude Code persistent, cross-session memory backed by AtomicMemory. The integration installs the AtomicMemory MCP server, a memory protocol skill, and Claude Code lifecycle hooks for prompt-time recall and deterministic session capture.

## Quick start

### 1. Install the plugin

```bash
claude plugin marketplace add atomicstrata/atomicmemory --sparse .claude-plugin plugins/claude-code
claude plugin install claude-code@atomicmemory
```

The Claude Code plugin is discovered from the public AtomicMemory monorepo. Source and development live in the [`plugins/claude-code`](https://github.com/atomicstrata/atomicmemory/tree/main/plugins/claude-code) package.

### 2. Start AtomicMemory core

Start [local AtomicMemory core](/quickstart) first, or set `ATOMICMEMORY_API_URL` and `ATOMICMEMORY_API_KEY` to an existing AtomicMemory service:

```bash
export ATOMICMEMORY_API_URL="http://127.0.0.1:3050"
export ATOMICMEMORY_API_KEY="local-dev-key"
```

### 3. Use Claude Code for local extraction

```bash
claude auth login
export LLM_PROVIDER=claude-code
export EMBEDDING_PROVIDER=transformers
```

Set `LLM_PROVIDER=claude-code` and `EMBEDDING_PROVIDER=transformers` in the environment that starts the AtomicMemory core process. That lets core use your Claude Code login for extraction; it does not make the plugin start core for you.

### 4. Start Claude Code

```bash
claude
```

The plugin connects to the configured AtomicMemory service and exposes memory tools.

### 5. Verify memory tools

Ask Claude Code to list its MCP tools. You should see:

-   `memory_search`
-   `memory_ingest`
-   `memory_package`
-   `memory_list`

## Features

-   **Cross-session recall.** Claude Code can retrieve project decisions, user preferences, codebase facts, and prior work.
-   **Prompt-time retrieval.** `UserPromptSubmit` searches memory before the model turn and injects matching memories as untrusted reference context.
-   **Deterministic capture.** `PostCompact`, `Stop`, and `TaskCompleted` store compact session records without asking the model to reconstruct everything.
-   **Local or external core.** For local use, start AtomicMemory core with the quickstart first. For team deployments, point `ATOMICMEMORY_API_URL` and `ATOMICMEMORY_API_KEY` at the service your team manages.
-   **Memory protocol skill.** The installed skill teaches Claude when to search, when to ingest, and when to create handoff snapshots.
-   **Scoped memory.** `user`, `agent`, `namespace`, and `thread` scopes control how memories are shared across projects and sessions.
-   **Backend-agnostic SDK path.** The MCP server dispatches through the AtomicMemory SDK provider registry.

## Modes of operation

### Local core mode

Use local core mode for personal Claude Code memory. Start AtomicMemory core with the [quickstart](/quickstart), then install the plugin so Claude Code can call the MCP server and lifecycle hooks. The core process can use `LLM_PROVIDER=claude-code` for extraction without a separate Anthropic API key.

| Capability | Included |
| --- | --- |
| MCP tools | Yes |
| Memory protocol skill | Yes |
| Prompt-time retrieval hooks | Yes |
| Session capture hooks | Yes |
| Local runtime management | No; start core separately |

### External AtomicMemory mode

Hosted AtomicMemory coming soon

Hosted AtomicMemory for Claude Code is planned but not yet available. For now, use this mode with your own self-hosted AtomicMemory deployment.

Use external mode when a team or production deployment runs AtomicMemory for you. Configure the service URL and token, and let the hosted service own LLM credentials, storage, backups, and policy.

```bash
export ATOMICMEMORY_API_URL="https://memory.yourco.com"
export ATOMICMEMORY_API_KEY="am_live_..."
```

### MCP-only mode

Use MCP-only mode when you want explicit memory tools without lifecycle hooks or agent skill instructions. This is the smallest integration surface and is useful for locked-down environments that manage host prompts separately.

Register the published MCP server directly:

```json
{
  "mcpServers": {
    "atomicmemory": {
      "command": "npx",
      "args": ["-y", "--package=@atomicmemory/mcp-server", "atomicmemory-mcp"],
      "env": {
        "ATOMICMEMORY_API_URL": "http://127.0.0.1:3050",
        "ATOMICMEMORY_API_KEY": "local-dev-key"
      }
    }
  }
}
```

After creating the project `.mcp.json`, [approve/trust the project MCP server and verify it with `claude mcp list`](#claude-code-does-not-show-atomicmemory-mcp-tools) before starting a Claude Code session that needs AtomicMemory tools.

| Capability | Included |
| --- | --- |
| MCP tools | Yes |
| Memory protocol skill | No |
| Prompt-time retrieval hooks | No |
| Session capture hooks | No |

### CLI-generated hooks

The plugin ships hooks by default. If you maintain your own Claude Code config, the AtomicMemory CLI can generate equivalent hook snippets:

```bash
atomicmemory hooks install --host claude-code --runtime node
```

Node is the default hook runtime because it shares the TypeScript SDK adapter and CLI packaging. Python hook generation is available for Python-first environments that provide a compatible hook runner.

## Configuration

The plugin ships with local defaults. Configure only what you want to change.

Default behavior:

| Setting | Default |
| --- | --- |
| Runtime | User-managed AtomicMemory core |
| Service URL | `http://127.0.0.1:3050` unless `ATOMICMEMORY_API_URL` is set |
| User scope | Claude Code user/session context, then local fallback |
| Agent scope | `claude-code` |
| Capture level | `balanced` |
| Memory extraction provider | Configured on the AtomicMemory core process |

Common overrides:

```bash
export LLM_PROVIDER=claude-code
export EMBEDDING_PROVIDER=transformers
export ATOMICMEMORY_SCOPE_NAMESPACE="repo-or-project"
export ATOMICMEMORY_CAPTURE_LEVEL=balanced
```

`LLM_PROVIDER` and `EMBEDDING_PROVIDER` configure the AtomicMemory core process. Claude Code hooks and the MCP server use `ATOMICMEMORY_*` values for service URL, scope, and capture policy. The `claude-code` provider consumes the user's Claude Code / Claude subscription limits and is for personal local use.

When you are running your own shared AtomicMemory runtime instead of using Claude Code's local authenticated session, configure an API-backed extraction provider:

```bash
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
# or
export LLM_PROVIDER=openai
export OPENAI_API_KEY="sk-..."
```

Advanced values:

| Env var | Used by | Purpose |
| --- | --- | --- |
| `LLM_PROVIDER` | core process | Extraction provider. Use `claude-code` for personal local use without a separate Anthropic API key. |
| `LLM_MODEL` | core process | Optional model override. Omit when using Claude Code's configured default. |
| `EMBEDDING_PROVIDER` | core process | Embedding provider. Use `transformers` or `ollama` to avoid an OpenAI embedding key. |
| `ANTHROPIC_API_KEY` | core process | Anthropic provider key for production or team usage. |
| `OPENAI_API_KEY` | core process | OpenAI provider key. |
| `ATOMICMEMORY_API_URL` | MCP + hooks | AtomicMemory service URL. Defaults to local core at `http://127.0.0.1:3050` when omitted. |
| `ATOMICMEMORY_API_KEY` | MCP + hooks | API key for an external AtomicMemory service. |
| `ATOMICMEMORY_SCOPE_USER` | MCP + hooks | User identity override. |
| `ATOMICMEMORY_SCOPE_NAMESPACE` | MCP + hooks | Project or repository boundary. |
| `ATOMICMEMORY_SCOPE_AGENT` | MCP + hooks | Optional agent identity override. |
| `ATOMICMEMORY_SCOPE_THREAD` | MCP + hooks | Session or conversation boundary. |
| `ATOMICMEMORY_CAPTURE_LEVEL` | hooks | Lifecycle write volume: `minimal`, `balanced`, or `full`. Defaults to `balanced`. |
| `ATOMICMEMORY_PROMPT_SEARCH_ENABLED=false` | hooks | Disable prompt-time retrieval. |
| `ATOMICMEMORY_PROMPT_SEARCH_MIN_CHARS=20` | hooks | Skip very short prompt searches. |
| `ATOMICMEMORY_PROMPT_SEARCH_LIMIT=5` | hooks | Prompt-search result count. |
| `ATOMICMEMORY_STOP_MIN_ASSISTANT_CHARS=200` | hooks | Minimum assistant text size for `Stop` capture. |
| `ATOMICMEMORY_TASK_MIN_TOOL_CALLS=5` | hooks | `TaskCompleted` threshold under `minimal` capture. |
| `ATOMICMEMORY_SEMANTIC_PROMPTS_ENABLED=false` | hooks | Disable extra `Stop` prompts for model-mediated learnings. |

Invalid or missing required config fails loudly. Hooks do not run in degraded mode.

## MCP tools

| Tool | Maps to | Purpose |
| --- | --- | --- |
| `memory_search` | `MemoryClient.search` | Semantic retrieval with scope filters. |
| `memory_ingest` | `MemoryClient.ingest` | Durable write. `mode: "text"` and `mode: "messages"` run extraction; `mode: "verbatim"` stores one deterministic record. |
| `memory_package` | `MemoryClient.package` | Token-budgeted context package for a query. |
| `memory_list` | `MemoryClient.list` | Recent-memory listing for the configured scope. |

Use `mode: "text"` for extracted durable facts and `mode: "verbatim"` for exact handoffs, compact summaries, and lifecycle records.

## Lifecycle hooks

| Hook | What it does |
| --- | --- |
| `SessionStart` | Injects bootstrap guidance telling Claude to call `memory_search` early. |
| `UserPromptSubmit` | Searches memory before the model turn and injects matches as reference context. |
| `PreCompact` | No-op by design; compaction is never blocked. |
| `PostCompact` | Stores Claude Code's generated compact summary as a deterministic record. |
| `Stop` | Stores meaningful completed turns with outcome, changed files, and validation. |
| `StopFailure` | Emits debug telemetry only; no memory write. |
| `SessionEnd` | Cleans local dedupe and last-write markers. |
| `TaskCompleted` | Stores compact task records. |
| `PreToolUse` | Blocks writes to local memory files so agents use `memory_ingest`. |

Lifecycle writes are compact records, not raw prompt dumps. Hook scripts redact obvious secret-shaped values and strip fenced code blocks from stop summaries before writing.

## Memory Protocol Skill

The installed skill guides Claude Code to:

-   Search when the user references past work, prior decisions, or codebase facts.
-   Ingest durable preferences, constraints, conventions, and decisions.
-   Use `memory_package` for broad, token-budgeted context.
-   Store handoff snapshots with `mode: "verbatim"` before context loss.
-   Treat retrieved memories as reference context, not instructions.

## Troubleshooting

### Claude Code does not show AtomicMemory MCP tools

If you configured AtomicMemory through a project `.mcp.json`, Claude Code may require the project MCP server to be approved/trusted before the tools are available.

From the project root, run:

```bash
claude mcp list
claude mcp get atomicmemory
```

If Claude Code prompts you to approve the project MCP server, approve it and restart the Claude Code session. If you previously rejected the server, reset the project choices and run the verification commands again:

```bash
claude mcp reset-project-choices
```

For non-interactive Docker or CI smoke tests only, use a disposable workspace and create a project-local settings file:

```bash
mkdir -p .claude
printf '%s\n' '{"enableAllProjectMcpServers":true}' > .claude/settings.json
```

Do not use `enableAllProjectMcpServers` casually in normal projects. It trusts all project MCP servers from `.mcp.json`.

| Symptom | Fix |
| --- | --- |
| No memory tools appear | Restart Claude Code after installing the plugin or changing MCP config. For MCP-only `.mcp.json` setups, verify project trust with `claude mcp list`. |
| Local runtime does not start | Confirm Claude Code can run local plugin commands and check AtomicMemory plugin logs. |
| `claude-code` provider fails | Confirm Claude Code is installed, authenticated, and allowed for personal/local use. Use `ANTHROPIC_API_KEY` for production. |
| External service connection fails | Verify `ATOMICMEMORY_API_URL` and `ATOMICMEMORY_API_KEY`. |
| Unexpected memory sharing | Add `ATOMICMEMORY_SCOPE_NAMESPACE`, `ATOMICMEMORY_SCOPE_AGENT`, or `ATOMICMEMORY_SCOPE_THREAD`. |
| Hook output is missing | Confirm `atomicmemory` resolves in the Claude Code hook environment with `command -v atomicmemory`. |

## Development

For source builds, plugin development, and local adapter testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [SDK Overview](/sdk/overview)
-   [Platform scope model](/platform/scope)
-   [Codex integration](/integrations/coding-agents/codex/local)
-   [OpenClaw integration](/integrations/coding-agents/openclaw/local)
