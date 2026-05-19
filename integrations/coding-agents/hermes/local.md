# Hermes Local

> Agent index: [llms.txt](/llms.txt)

Give Hermes Agent persistent, cross-session memory backed by AtomicMemory. Unlike MCP-backed coding-agent plugins, Hermes uses a native Python memory provider that participates directly in prefetch, turn sync, and shutdown hooks.

## Quick start

### 1. Install the provider

```bash
npx -y @atomicmemory/hermes-plugin install
```

### 2. Configure the backend

```bash
export ATOMICMEMORY_API_URL="http://127.0.0.1:3050"
export ATOMICMEMORY_API_KEY="local-dev-key"
```

Start [local AtomicMemory core](/quickstart) first if it is not already running.

### 3. Select the provider

```bash
hermes memory setup
hermes memory status
```

## Features

-   **Native provider lifecycle.** Hermes calls the AtomicMemory provider during recall, ingest, and shutdown.
-   **Background recall.** Prefetch prepares memory for the next turn without blocking the chat loop.
-   **Non-blocking ingest.** Completed turns sync in the background.
-   **Shared or siloed memory.** Hermes can recall all user memories or only Hermes-ingested memories.
-   **Explicit tools.** Agents can search, package context, store conclusions, and inspect recent records.

## Modes of operation

| Mode | Recall and sync | Explicit tools |
| --- | --- | --- |
| `hybrid` | Yes | Yes |
| `context` | Yes | Hidden |
| `tools` | Disabled | Yes |

| Scope | Recall |
| --- | --- |
| `shared` | All AtomicMemory memories for the user. |
| `siloed` | Only Hermes-ingested memories. |

## Configuration

The Core Quickstart's local Docker service requires the development bearer key shown above. For a remote AtomicMemory service, use that service's issued key:

```bash
export ATOMICMEMORY_API_URL="https://memory.yourco.com"
export ATOMICMEMORY_API_KEY="am_live_..."
```

Hermes' setup wizard prompts for:

| Field | Purpose |
| --- | --- |
| `scope_user` | User identity used for AtomicMemory scope. |
| `memory_scope` | `shared` or `siloed`. |

Required environment:

| Env var | Purpose |
| --- | --- |
| `ATOMICMEMORY_API_URL` | AtomicMemory core URL. |
| `ATOMICMEMORY_API_KEY` | Bearer credential for the Core Quickstart service or any protected AtomicMemory service. |

Optional environment:

| Env var | Purpose |
| --- | --- |
| `ATOMICMEMORY_PROVIDER` | SDK provider name. Defaults to `atomicmemory`. |
| `ATOMICMEMORY_SCOPE_USER` | Hermes user identity. Defaults to `$USER`. |
| `ATOMICMEMORY_MEMORY_SCOPE` | `shared` or `siloed`. Defaults to `shared`. |
| `ATOMICMEMORY_MEMORY_MODE` | `hybrid`, `context`, or `tools`. Defaults to `hybrid`. |
| `ATOMICMEMORY_PREFETCH_ENABLED` | `true` or `false`. Defaults to `true`. |
| `ATOMICMEMORY_PREFETCH_METHOD` | `context` or `fast`. Defaults to `context`. |

Advanced settings live in `$HERMES_HOME/atomicmemory.json`:

| Key | Purpose |
| --- | --- |
| `memory_mode` | `hybrid`, `context`, or `tools`. |
| `prefetch_enabled` | Enable background recall. |
| `prefetch_method` | `context` for packages or `fast` for lower-latency search. |
| `search_limit` | Default search/list limit. |
| `token_budget` | Default context-package token budget. |

Secrets stay in the environment, not in the Hermes config file.

Set `ATOMICMEMORY_SCOPE_USER` only when the local machine user is not the right memory identity, such as shared machines or cross-machine setups:

```bash
export ATOMICMEMORY_SCOPE_USER="pip"
```

For local provider development, install from a checkout instead:

```bash
git clone https://github.com/atomicstrata/atomicmemory.git
cd atomicmemory

mkdir -p "$HERMES_HOME/plugins/memory"
ln -s "$(pwd)/plugins/hermes" "$HERMES_HOME/plugins/memory/atomicmemory"
```

The provider is also prepared for Hermes' Python entry-point plugin path. After the Python package is published, teams that manage Hermes with Python packages can install it into the Hermes virtualenv instead:

```bash
uv pip install atomicmemory-hermes \
  --python "$HOME/.hermes/hermes-agent/venv/bin/python"
```

## Tools

| Tool | Maps to | Purpose |
| --- | --- | --- |
| `atomicmemory_search` | `MemoryClient.search` | Search AtomicMemory by meaning. |
| `atomicmemory_context` | `MemoryClient.package` | Build an injection-ready context package. |
| `atomicmemory_conclude` | `MemoryClient.ingest` | Store one explicit durable fact verbatim. |
| `atomicmemory_profile` | `MemoryClient.list` | List recent records for the current user. |

## Lifecycle hooks

| Hook | What it does |
| --- | --- |
| `queue_prefetch(query)` | Starts background recall for the next turn. |
| `prefetch(query)` | Returns the most recent completed recall and clears the slot. |
| `sync_turn(user, assistant)` | Enqueues a completed turn for non-blocking ingest. |
| `on_session_end(messages)` | Drains the worker and closes the SDK client. |
| `shutdown` | Releases provider resources when Hermes exits. |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Provider does not appear | Confirm the provider is installed under `$HERMES_HOME/plugins/memory/atomicmemory`. |
| Provider unavailable | Confirm `ATOMICMEMORY_API_URL`, `ATOMICMEMORY_API_KEY`, and that Hermes installed the provider package dependencies. |
| Siloed recall fails | Use `ATOMICMEMORY_PROVIDER=atomicmemory` or switch to `shared`. |
| Calls pause after repeated backend failures | Hermes opens a circuit breaker after five SDK failures and resumes after roughly two minutes. Check the AtomicMemory service before retrying. |

## Update

After changing the Hermes provider, restart Hermes so it reloads the plugin. For source installs, update the integrations checkout and rerun the provider install or symlink step before restarting.

## Development

For source builds, plugin development, and local adapter testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [Integrations overview](/integrations/overview)
-   [SDK provider model](/sdk/concepts/provider-model)
-   [Scopes and identity](/sdk/concepts/scopes-and-identity)
