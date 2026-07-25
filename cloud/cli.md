# Cloud CLI

> Agent index: [llms.txt](/llms.txt)

The **AtomicMemory Cloud CLI** (`atomicmemory` / **`am`**) is the primary CLI for Open Source activation and Cloud operations: browser login, Connected Local setup, org/project management, API keys, and memory commands.

Install from `get.atomicstrata.ai`. Defaults to `https://api.atomicstrata.ai`.

Not the npm CLI

This is **not** the Node.js [`@atomicmemory/cli`](/cli) package. The npm CLI is an advanced tool for direct self-hosted core workflows with an Ink terminal UI.

## Install

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh
source "$HOME/.atomicmemory/env"
```

Prebuilt binaries for macOS and Linux (x86\_64 + arm64). Installs to `~/.local/bin` by default and adds the **`am`** symlink.

Pin a version:

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --version <x.y.z>
```

Skip PATH modification:

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --no-modify-path
```

## Connected Local — am init

The fastest Open Source path. One command signs you in, starts Core in Docker, links your console project, and verifies the memory pipeline.

```bash
export OPENAI_API_KEY="sk-..."
am init
```

Full walkthrough: [Platform Quickstart](/quickstart). Re-check anytime with `am doctor --smoke`. Something not working? See [Troubleshooting](/cloud/troubleshooting).

Already created a project in the console? Run `am init --project <slug>` instead.

## Instance status

Check what `am init` connected and configured, without re-running the whole setup flow:

```bash
am instance status
am instance status --show-secrets
```

`--show-secrets` is how you find the `CORE_API_KEY` `am init` configured for your Core, if you need it for a direct SDK, MCP, or `curl` call — see [Authentication → Local: Core token or `CORE_API_KEY`](/cloud/authentication#local-core-token-or-core_api_key).

## Migration

Move memories from a Local project into a Cloud project after upgrading to Free:

```bash
am migrate export --project <local-project-slug>
am migrate import --file <path-to-export.jsonl> --target-project <cloud-project-slug>
```

Memory-only — trace history doesn't move. Full walkthrough, prerequisites, and console verification: [Migrate to Hosted Cloud](/cloud/how-to/migrate).

## Dashboard commands (OAuth)

```bash
am auth login
am overview
```

Uses PKCE + browser — no config file required. The public OAuth `client_id` is baked into the binary.

## Hosted Cloud memory commands (API key)

For managed hosting after upgrading to Free:

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx

am memory ingest "I prefer aisle seats when flying."
am memory search "seat preference"
am memory list
```

Get your API key from the [developer console](https://memory.atomicstrata.ai) during onboarding or under **API Keys**. See [Add Hosted Cloud](/cloud/quickstart) for the Hosted Cloud add-on path.

## Defaults

| Setting | Default |
| --- | --- |
| API URL | `https://api.atomicstrata.ai` |
| OAuth callback | `http://127.0.0.1:9876/callback` |

Override with environment variables or `~/.atomicmemory/` credentials after `am auth login`.

## Common commands

Grouped by job, not alphabetically — each group links back to the section above with the full walkthrough.

### Init & doctor

| Command | Description |
| --- | --- |
| `am init` | Connected Local activation (sign-in, Core, verify) |
| `am init --project <slug>` | Connect to an existing console project instead of creating one |
| `am doctor --smoke` | Re-check memory pipeline |

### Connect & instance

| Command | Description |
| --- | --- |
| `am auth login` | Browser OAuth login for dashboard commands |
| `am instance status` | Show what `am init` connected |
| `am instance status --show-secrets` | Same, including the local `CORE_API_KEY` |

### Memory

| Command | Description |
| --- | --- |
| `am memory ingest <text>` | Ingest a memory claim |
| `am memory ingest --file ./memories.jsonl` | Batch ingest |
| `am memory search <query>` | Search memories |
| `am memory list` | List stored memories |

### Migration commands

| Command | Description |
| --- | --- |
| `am migrate export --project <slug>` | Export a Local project's memories |
| `am migrate import --file <path> --target-project <slug>` | Import exported memories into a Cloud project |

### Cloud administration

| Command | Description |
| --- | --- |
| `am overview` | Dashboard overview via your browser session — run `am overview --help` for exact scope |
| `am org list` | List organizations |
| `am project list` | List projects |
| `am key create` | Create an API key |

## Uninstall

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --uninstall
```

Removes binaries and PATH block. Credentials under `~/.atomicmemory/` are left intact unless you purge them manually.

## Related docs

-   [Platform Quickstart](/quickstart) — Connected Local activation
-   [Add Hosted Cloud](/cloud/quickstart) — add Hosted Cloud after local setup
-   [Migrate to Hosted Cloud](/cloud/how-to/migrate) — move memories with `am migrate`
-   [Troubleshooting](/cloud/troubleshooting) — recover from a failed `am init` or `am doctor --smoke`
-   [Authentication](/cloud/authentication) — API key vs OAuth
-   [npm CLI (advanced)](/cli) — self-hosted core workflows without Cloud
