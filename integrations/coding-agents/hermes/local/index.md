# Hermes Local

> Agent index: [llms.txt](/llms.txt)

Give Hermes Agent persistent, cross-session memory backed by AtomicMemory. Unlike MCP-backed coding-agent plugins, Hermes uses a native Python memory provider that participates directly in prefetch, turn sync, and shutdown hooks. The published npm installer copies the provider into your Hermes profile; the provider then uses the published AtomicMemory Python SDK from the Hermes Python environment.

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

### 2. Install the provider

```bash
npx -y @atomicmemory/hermes-plugin install
```

By default, the installer writes to `$HERMES_HOME/plugins/atomicmemory`. When `HERMES_HOME` is unset, it uses `$HOME/.hermes/plugins/atomicmemory`.

### 3. Configure the backend

```bash
export ATOMICMEMORY_API_URL="http://127.0.0.1:17350"
export ATOMICMEMORY_API_KEY="local-dev-key"
```

### 4. Select the provider

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
-   **SDK-backed provider.** Hermes-specific code owns registration and hooks; memory semantics flow through the published Python SDK.

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
| `ATOMICMEMORY_API_URL` | AtomicMemory core URL. Required; the Hermes provider intentionally has no default API URL. |
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

mkdir -p "$HERMES_HOME/plugins"
ln -s "$(pwd)/plugins/hermes" "$HERMES_HOME/plugins/atomicmemory"
```

The published npm package is the supported distribution path for the provider itself. Its `plugin.yaml` declares the Python SDK dependency that Hermes should install into its own Python environment.

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
| Provider does not appear | Confirm the provider is installed under `$HERMES_HOME/plugins/atomicmemory`, or under `$HOME/.hermes/plugins/atomicmemory` when `HERMES_HOME` is unset. |
| Provider unavailable | Confirm `ATOMICMEMORY_API_URL`, `ATOMICMEMORY_API_KEY`, and that Hermes installed the `atomicmemory` Python SDK dependency from `plugin.yaml`. |
| Siloed recall fails | Use `ATOMICMEMORY_PROVIDER=atomicmemory` or switch to `shared`. |
| Calls pause after repeated backend failures | Hermes opens a circuit breaker after five SDK failures and resumes after roughly two minutes. Check the AtomicMemory service before retrying. |

## Update

After changing the Hermes provider, restart Hermes so it reloads the plugin. For published installs, rerun `npx -y @atomicmemory/hermes-plugin install` after updating the package. For source installs, update the monorepo checkout and refresh the symlink before restarting.

## Development

For source builds, plugin development, and local adapter testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [Integrations overview](/integrations/overview)
-   [SDK provider model](/sdk/concepts/provider-model)
-   [Scopes and identity](/sdk/concepts/scopes-and-identity)
