# Cloud CLI

> Agent index: [llms.txt](/llms.txt)

The **AtomicMemory CLI** (`atomicmemory` / **`am`**) is a Rust binary for browser login, org/project/API-key management, and memory operations against the hosted cloud API.

Not the npm CLI

This is **not** the Node.js [`@atomicmemory/cli`](/cli) package. The npm CLI targets local/self-hosted core workflows with an Ink terminal UI. The Cloud CLI ships from [`am-cloud-api`](https://github.com/atomicstrata/am-cloud-api) and defaults to `https://api.atomicstrata.ai`.

## Install

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh
```

Prebuilt binaries for macOS and Linux (x86\_64 + arm64). Installs to `~/.local/bin` by default and adds the **`am`** symlink.

Pin a version:

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --version 0.1.0
```

Skip PATH modification:

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --no-modify-path
```

## Quick start

### Dashboard commands (OAuth)

```bash
am auth login
am overview
```

Uses PKCE + browser - no config file required. The public OAuth `client_id` is baked into the binary.

### Memory commands (API key)

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx

am memory ingest "I prefer aisle seats when flying."
am memory search "seat preference"
am memory list
```

Get your API key from the [developer console](https://memory.atomicstrata.ai) during onboarding or under **API Keys**.

## Defaults

| Setting | Default |
| --- | --- |
| API URL | `https://api.atomicstrata.ai` |
| OAuth callback | `http://127.0.0.1:9876/callback` |

Override with environment variables or `~/.atomicmemory/` credentials after `am auth login`.

## Common commands

| Command | Description |
| --- | --- |
| `am auth login` | Browser OAuth login for dashboard API |
| `am org list` | List organizations |
| `am project list` | List projects |
| `am key create` | Create an API key |
| `am memory ingest <text>` | Ingest a memory claim |
| `am memory ingest --file ./memories.jsonl` | Batch ingest |
| `am memory search <query>` | Search memories |
| `am memory list` | List stored memories |

## Uninstall

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --uninstall
```

Removes binaries and PATH block. Credentials under `~/.atomicmemory/` are left intact unless you purge them manually.

## Related docs

-   [Cloud Quickstart](/cloud/quickstart) - first ingest happy path
-   [Authentication](/cloud/authentication) - API key vs OAuth
-   [npm CLI (local core)](/cli) - self-hosted Docker workflows
