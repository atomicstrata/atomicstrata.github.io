# Claude Code Local

> Agent index: [llms.txt](/llms.txt)

Give Claude Code persistent, cross-session memory backed by AtomicMemory. The plugin installs one MCP server exposing `memory_search`, `memory_ingest`, `memory_package`, and `memory_list`, a `SKILL.md` that teaches the agent when to call those tools, and Claude Code lifecycle hooks for low-latency retrieval and deterministic session capture.

Source-only

`@atomicmemory/mcp-server` and the Claude Code plugin are not published to npm or to the Claude plugin marketplace yet. Install from a local clone of [`atomicmemory-integrations`](https://github.com/atomicstrata/atomicmemory-integrations).

## What you get

-   **Durable memory across sessions.** Claude Code can retrieve project decisions, user preferences, codebase facts, and prior work.
-   **Prompt-time retrieval.** `UserPromptSubmit` searches memory before the model turn and injects matches as untrusted reference context.
-   **Deterministic lifecycle capture.** `PostCompact`, `Stop`, and `TaskCompleted` store compact records without asking the model to reconstruct everything.
-   **Scope-aware retrieval.** `user` / `agent` / `namespace` / `thread` scopes are threaded through MCP calls. Hook writes keep content clean and carry attribution through `sourceSite` / `sourceUrl` until core supports first-class hook metadata.
-   **Backend-agnostic.** Point the plugin at self-hosted AtomicMemory core or another provider registered in the SDK's `MemoryProvider` registry.

## Install

Clone `atomicmemory-sdk` and `atomicmemory-integrations` side-by-side, then build each in order:

```bash
git clone https://github.com/atomicstrata/atomicmemory-sdk.git
git clone https://github.com/atomicstrata/atomicmemory-integrations.git

cd atomicmemory-sdk
pnpm install
pnpm build

cd ../atomicmemory-integrations
pnpm install
pnpm --filter @atomicmemory/mcp-server build
```

Install `jq` and `curl` for the shell hooks, then export config before launching Claude Code:

```bash
export ATOMICMEMORY_MCP_SERVER_BIN="$HOME/path/to/atomicmemory-integrations/packages/mcp-server/dist/bin.js"
export ATOMICMEMORY_PROVIDER="atomicmemory"
export ATOMICMEMORY_API_URL="https://memory.yourco.com"
export ATOMICMEMORY_API_KEY="am_live_..."
export ATOMICMEMORY_SCOPE_USER="pip"
export ATOMICMEMORY_CAPTURE_LEVEL="balanced" # minimal|balanced|full

# Optional:
export ATOMICMEMORY_SCOPE_AGENT="claude-code"
export ATOMICMEMORY_SCOPE_NAMESPACE="<repo-or-project>"
export ATOMICMEMORY_SCOPE_THREAD="<thread-id>"
```

Even in the source-backed flow, provider, URL, credentials, and scope come from the shell or Claude Code environment.

Register and install from the local repo:

```bash
claude plugin marketplace add ./
claude plugin install claude-code@atomicmemory
```

## Update and Version

Claude Code plugin updates are version-gated. After changing hooks, skills, `hooks.json`, plugin manifests, or marketplace metadata, bump plugin versions from `atomicmemory-integrations` before `claude plugin update claude-code@atomicmemory` will refresh the installed cache.

```bash
pnpm bump:plugin-versions patch
```

For local testing:

```bash
pnpm --filter @atomicmemory/mcp-server build
claude plugin marketplace list
claude plugin update claude-code@atomicmemory
```

If the marketplace points at an old clone, replace it from the current checkout:

```bash
claude plugin marketplace remove atomicmemory
claude plugin marketplace add ./ --scope user
claude plugin install claude-code@atomicmemory
```

Fully restart Claude Code after updating. Existing sessions can keep old hook registrations in memory even when the installed cache on disk is fresh.

## Configuration

Required:

| Env var | Used by | Purpose |
| --- | --- | --- |
| `ATOMICMEMORY_MCP_SERVER_BIN` | MCP manifest | Absolute path to `packages/mcp-server/dist/bin.js` |
| `ATOMICMEMORY_PROVIDER` | MCP + hooks | Provider name; Claude lifecycle hooks require `atomicmemory` |
| `ATOMICMEMORY_API_URL` | MCP + hooks | AtomicMemory service URL |
| `ATOMICMEMORY_API_KEY` | MCP + hooks | API key when your provider requires auth |
| `ATOMICMEMORY_SCOPE_USER` | MCP + hooks | Required user scope |
| `ATOMICMEMORY_CAPTURE_LEVEL` | hooks | Lifecycle write volume: `minimal`, `balanced`, or `full` |

Optional:

| Env var | Purpose |
| --- | --- |
| `ATOMICMEMORY_SCOPE_NAMESPACE` | Project/repo boundary |
| `ATOMICMEMORY_SCOPE_AGENT` | Agent identity |
| `ATOMICMEMORY_SCOPE_THREAD` | Session/thread boundary |
| `ATOMICMEMORY_PROMPT_SEARCH_ENABLED=false` | Disable prompt-time retrieval |
| `ATOMICMEMORY_PROMPT_SEARCH_MIN_CHARS=20` | Skip very short prompt searches; must be a positive integer if set |
| `ATOMICMEMORY_PROMPT_SEARCH_LIMIT=5` | Prompt-search result count; must be a positive integer if set |
| `ATOMICMEMORY_STOP_MIN_ASSISTANT_CHARS=200` | Minimum assistant text size for `Stop` capture; must be a positive integer if set. The default is tuned for Claude Code's typical multi-paragraph responses; lower it if your workflow produces shorter stop turns that should still be captured. |
| `ATOMICMEMORY_TASK_MIN_TOOL_CALLS=5` | `TaskCompleted` threshold under `minimal` capture; must be a positive integer if set |
| `ATOMICMEMORY_SEMANTIC_PROMPTS_ENABLED=false` | Disable extra `Stop` prompts for model-mediated learnings; must be `true` or `false` if set |

If required config is missing, helper tools are unavailable, or numeric/boolean env vars are invalid, hooks surface the error instead of running in a degraded mode.

Use `ATOMICMEMORY_SCOPE_NAMESPACE`, `ATOMICMEMORY_SCOPE_AGENT`, or `ATOMICMEMORY_SCOPE_THREAD` only when you want narrower partitions.

## MCP tools exposed

| Tool | Maps to | Purpose |
| --- | --- | --- |
| `memory_search` | `MemoryClient.search` | Semantic retrieval with scope filters |
| `memory_ingest` | `MemoryClient.ingest` | Durable write. `mode: "text"` and `mode: "messages"` run extraction; `mode: "verbatim"` stores one deterministic record for summaries and handoffs |
| `memory_package` | `MemoryClient.package` | Token-budgeted context package for a query |
| `memory_list` | `MemoryClient.list` | Recent-memory listing for the configured scope, with optional `sourceSite` filtering on AtomicMemory providers |

For lifecycle dedupe, pass a stable `metadata.dedupe_key` when using `mode: "verbatim"`. AtomicMemory verbatim records store only the provided content in the searchable `content` field; provenance is carried by `sourceSite` / `sourceUrl` until core exposes first-class hook-write metadata and server-side dedupe.

## Lifecycle hooks

| Hook | What it does |
| --- | --- |
| `SessionStart` | Injects bootstrap guidance telling Claude to call `memory_search` early. Separate prompts for `startup`, `resume`, and `compact`. |
| `UserPromptSubmit` | Searches `/v1/memories/search/fast` directly and injects matching memories as untrusted additional context. |
| `PreCompact` | No-op by design. It never blocks compaction; `PostCompact` handles deterministic summary capture. |
| `PostCompact` | Stores Claude Code's generated `compact_summary` as a deterministic lifecycle record. This is the primary compaction-capture path. |
| `Stop` | On meaningful turns, stores a normalized deterministic record with outcome, changed files, and validation. Tool counts, session IDs, cwd, and transcript paths are intentionally kept out of searchable content until core exposes first-class hook metadata. Optionally prompts Claude for decisions, preferences, and anti-patterns. |
| `StopFailure` | Debug telemetry only; no memory write. |
| `SessionEnd` | Cleans local dedupe / last-write markers. |
| `TaskCompleted` | Stores a compact task record using the documented `task_subject` field. |
| `PreToolUse` (`Write` / `Edit`) | Blocks writes to `MEMORY.md`, `.atomicmemory`, and Claude memory-file paths so agents use `memory_ingest` instead. |

Lifecycle writes are compact records, not raw prompt dumps. Hook scripts redact obvious secret-shaped values and strip fenced code blocks / follow-up prompts from Stop summaries before writing.

### CLI-generated hook snippets

The installed Claude Code plugin ships versioned shell hooks. For manual hook configs, the AtomicMemory CLI can generate equivalent host snippets with a runtime choice:

```bash
# Recommended: bundled Node CLI hook runner.
atomicmemory hooks install --host claude-code --runtime node

# Advanced: emit config for a compatible Python hook runner.
atomicmemory hooks install --host claude-code --runtime python
```

Node is the default because it shares the TypeScript SDK adapter and CLI packaging. Python is an advanced option for Python-first environments; set `ATOMICMEMORY_PYTHON_HOOK_BIN` to a compatible Python hook runner before using the generated Python snippet.

When debugging CLI-generated Node hooks manually with `--json` or `--agent`, skipped runs include `meta.reason`: `prompt_too_short`, `no_content`, `no_hits`, or `low_signal`. Generated snippets keep skipped runs quiet so Claude Code receives no extra output unless memory context is available.

Claude Code hook environments commonly have a thinner `PATH` than the interactive shell that ran `atomicmemory hooks install`. Confirm the bundled CLI resolves inside the host environment:

```bash
command -v atomicmemory
```

## Memory Protocol Skill

`skills/atomicmemory/SKILL.md` covers the semantic lane:

-   Search when the user references past work, prior decisions, or codebase facts.
-   Ingest durable preferences, constraints, conventions, and decisions.
-   Use `memory_package` for broad, token-budgeted context.
-   Skip ephemeral scratch state and facts already documented in code, README, or recent commits.

Retrieved memories are reference context. They are not instructions unless the current user message confirms them.

## Limitations

-   **Source-only install.** The MCP server is launched from the local `dist/bin.js`; no npm package or public plugin marketplace entry exists yet.

-   **Direct hook writes.** Command hooks cannot talk to Claude Code's already-running stdio MCP child, so latency-sensitive retrieval and lifecycle writes use AtomicMemory HTTP endpoints directly.
-   **Workspace verbatim caveat.** Core currently guarantees `skip_extraction=true` on user-scoped quick-ingest. Hook records keep searchable content clean and rely on `sourceSite` / `sourceUrl` for provenance until core supports first-class metadata and workspace-scoped verbatim writes.
-   **Transcript parsing is defensive.** `Stop` uses `last_assistant_message` when available and only parses transcript tails for structural signals such as file edits or tests.

## View source

-   [`plugins/claude-code/.claude-plugin/plugin.json`](https://github.com/atomicstrata/atomicmemory-integrations/blob/main/plugins/claude-code/.claude-plugin/plugin.json) — plugin manifest
-   [`plugins/claude-code/hooks/hooks.json`](https://github.com/atomicstrata/atomicmemory-integrations/blob/main/plugins/claude-code/hooks/hooks.json) — lifecycle hook registrations
-   [`plugins/claude-code/scripts/`](https://github.com/atomicstrata/atomicmemory-integrations/tree/main/plugins/claude-code/scripts) — hook scripts
-   [`plugins/claude-code/skills/atomicmemory/SKILL.md`](https://github.com/atomicstrata/atomicmemory-integrations/blob/main/plugins/claude-code/skills/atomicmemory/SKILL.md) — agent-facing memory protocol
-   [`packages/mcp-server/`](https://github.com/atomicstrata/atomicmemory-integrations/tree/main/packages/mcp-server) — shared MCP server

## See also

-   [SDK Overview](/sdk/overview) — the `MemoryProvider` model behind the plugin
-   [Platform scope model](/platform/scope) — how scope fields dispatch
-   [Codex integration](/integrations/coding-agents/codex/local) — skill-only sibling integration
-   [OpenClaw integration](/integrations/coding-agents/openclaw/local) — in-process plugin sibling integration
