# Hermes Local

> Agent index: [llms.txt](/llms.txt)

The Hermes integration is a native memory provider backed by the AtomicMemory Python SDK. It participates in Hermes' memory lifecycle:

-   background recall is prefetched for the next turn
-   completed turns are synced without blocking the chat loop
-   explicit tools expose search, context packaging, durable conclusions, and recent-memory inspection
-   writes are stamped with Hermes provenance for auditability

By default, Hermes uses **shared** recall: it can retrieve memories written by other AtomicMemory tools for the same user. Set `memory_scope=siloed` when you want Hermes to see only Hermes-ingested memories.

## Architecture

Hermes owns lifecycle and tool invocation. The Python SDK owns provider selection, request shapes, and backend behavior.

## Install

Source-only

The Hermes provider currently lives under [`plugins/hermes`](https://github.com/atomicstrata/atomicmemory-integrations/tree/main/plugins/hermes) and imports `atomicmemory-python` from a local checkout. Install from source until the Python SDK and provider package are published.

Prerequisites:

-   Hermes Agent installed with `HERMES_HOME` set.
-   A local `atomicmemory-python` checkout.
-   A local `atomicmemory-integrations` checkout.
-   A running AtomicMemory core URL exported as `ATOMICMEMORY_API_URL`.

Clone `atomicmemory-python` and `atomicmemory-integrations` side-by-side, then symlink the provider into Hermes' memory-provider directory:

```bash
git clone https://github.com/atomicstrata/atomicmemory-python.git
git clone https://github.com/atomicstrata/atomicmemory-integrations.git

cd atomicmemory-integrations
mkdir -p "$HERMES_HOME/plugins/memory"
ln -s "$(pwd)/plugins/hermes" "$HERMES_HOME/plugins/memory/atomicmemory"
```

If your Python SDK checkout is somewhere else:

```bash
export ATOMICMEMORY_PYTHON_SDK_PATH="/path/to/atomicmemory-python"
```

Export the core URL before launching Hermes:

```bash
export ATOMICMEMORY_API_URL="http://localhost:3050"
# Optional:
export ATOMICMEMORY_API_KEY="am_live_..."
```

Select and verify the provider:

```bash
hermes memory setup
# select "atomicmemory"

hermes memory status
# confirm "atomicmemory" is active
```

## Configuration

Hermes' setup wizard prompts for the minimal pair:

| Field | Purpose |
| --- | --- |
| `scope_user` | User identity used for AtomicMemory scope. |
| `memory_scope` | `shared` or `siloed`. |

Advanced settings live in `$HERMES_HOME/atomicmemory.json`.

| Key | Description |
| --- | --- |
| `scope_user` | User identity. |
| `scope_agent` | Hermes prompt label; does not change AtomicMemory scoping. |
| `memory_mode` | `hybrid`, `context`, or `tools`. |
| `memory_scope` | `shared` or `siloed`. |
| `prefetch_enabled` | Enable background recall. |
| `prefetch_method` | `context` or `fast`. |
| `search_limit` | Default search/list limit. |
| `token_budget` | Default context-package token budget. |
| `python_sdk_path` | Local `atomicmemory-python` checkout path. |

`prefetch_method=context` builds a token-budgeted context package for the next turn. `prefetch_method=fast` uses direct semantic search and formats the hits as memory bullets for lower-latency recall.

Secrets are not persisted in this file. `api_url` and `api_key` come from the environment.

## Environment

| Env var | Purpose |
| --- | --- |
| `ATOMICMEMORY_API_URL` | AtomicMemory core URL. Required. |
| `ATOMICMEMORY_API_KEY` | Bearer credential for AtomicMemory core. Optional. |
| `ATOMICMEMORY_PYTHON_SDK_PATH` | Local `atomicmemory-python` checkout. Defaults to `../../../atomicmemory-python` relative to the plugin. |
| `ATOMICMEMORY_PROVIDER` | SDK provider name. Defaults to `atomicmemory`. |
| `ATOMICMEMORY_SCOPE_USER` | Hermes user identity. Defaults to `$USER`. |
| `ATOMICMEMORY_MEMORY_SCOPE` | `shared` or `siloed`. Defaults to `shared`. |
| `ATOMICMEMORY_MEMORY_MODE` | `hybrid`, `context`, or `tools`. Defaults to `hybrid`. |
| `ATOMICMEMORY_PREFETCH_ENABLED` | `true` or `false`. Defaults to `true`. |
| `ATOMICMEMORY_PREFETCH_METHOD` | `context` or `fast`. Defaults to `context`. |
| `ATOMICMEMORY_SEARCH_LIMIT` | Default search/list limit. |
| `ATOMICMEMORY_TOKEN_BUDGET` | Default context-package token budget. |

The default Python SDK path is for sibling source checkouts. Set `ATOMICMEMORY_PYTHON_SDK_PATH` or `python_sdk_path` explicitly for packaged or published installs.

## Memory scope

| Mode | Recall | Ingest |
| --- | --- | --- |
| `shared` | All AtomicMemory memories for the user. | Written with `provenance.source="hermes"`. |
| `siloed` | Only Hermes-ingested memories. | Written with `provenance.source="hermes"`. |

`siloed` recall is enforced through the AtomicMemory provider's `source_site` filter. AtomicMemory core maps the Python SDK provenance source to `source_site=hermes` on stored records. If the SDK is configured against a provider that cannot apply that filter, the provider fails loudly instead of silently broadening recall.

## Memory mode

| Mode | Auto-recall and sync | Explicit tools |
| --- | --- | --- |
| `hybrid` | Yes | Yes |
| `context` | Yes | Hidden |
| `tools` | Disabled | Yes |

## Tools

| Tool | Purpose |
| --- | --- |
| `atomicmemory_search` | Search AtomicMemory by meaning. |
| `atomicmemory_context` | Build an injection-ready context package. |
| `atomicmemory_conclude` | Store one explicit durable fact verbatim. |
| `atomicmemory_profile` | List recent records for the current user; shared mode includes all AtomicMemory records, while siloed mode lists Hermes-source records. |

## Lifecycle hooks

| Hook | What it does |
| --- | --- |
| `queue_prefetch(query)` | Starts background recall for the next turn. |
| `prefetch(query)` | Returns the most recent completed recall and clears the slot. |
| `sync_turn(user, assistant)` | Enqueues a completed turn for non-blocking ingest. |
| `on_session_end(messages)` | Drains the worker and closes the SDK client. |
| `shutdown` | Releases provider resources when Hermes exits. |

Hermes writes pass Python SDK provenance with `source = "hermes"` and `source_url = "hermes://session/<session_id>"`. Python SDK fields use snake\_case; the equivalent TypeScript SDK provenance fields are `source` and `sourceUrl`.

## Reliability

The provider includes a circuit breaker. After repeated SDK failures, calls are paused briefly so Hermes can keep running while AtomicMemory is unavailable.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Provider does not appear in `hermes memory setup` | The plugin is not installed under `$HERMES_HOME/plugins/memory/<name>/`. |
| `is_available()` returns false | `ATOMICMEMORY_API_URL` is unset, or `ATOMICMEMORY_PYTHON_SDK_PATH` does not point at a local SDK checkout. |
| Import fails at startup | Hermes' Python environment is missing dependencies from `plugin.yaml`, or `atomicmemory-python` is not reachable. |
| Default SDK path works in dev but not after install | The relative default only fits sibling checkouts. Set `ATOMICMEMORY_PYTHON_SDK_PATH` or `python_sdk_path`. |
| Calls fail in `siloed` mode | The configured provider cannot enforce the Hermes `source_site` filter. Use `ATOMICMEMORY_PROVIDER=atomicmemory` or switch to `shared`. |

## Tests

```bash
python3 -m unittest discover plugins/hermes/tests
```

## See also

-   [Integrations overview](/integrations/overview)
-   [SDK provider model](/sdk/concepts/provider-model)
-   [Scopes and identity](/sdk/concepts/scopes-and-identity)
