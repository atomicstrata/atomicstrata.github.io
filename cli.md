# CLI

> Agent index: [llms.txt](/llms.txt)

Public CLI release timing

These pages describe the **cloud-first** CLI (Hosted Cloud as plain `am init`, Connected Local as `am init --local`). The public installer at [get.atomicstrata.ai](https://get.atomicstrata.ai) must expose those flags before this docs revision ships.

Check your binary with `am --version` and `am init --help`. If `--local` is missing (for example on public **`am` 0.2.0**), plain `am init` is still Connected Local. Follow the [Open Source Quickstart](/open-source/quickstart) using **`am init`** without `--local` until the matching release is published.

Run `npm run check:public-cli` before production deploy. See [Public CLI release contract](#public-cli-release-contract). PR [CI](https://github.com/atomicstrata/am-docs-internal/actions/workflows/ci.yml) runs typecheck/build only; deploy and the [Public CLI contract](https://github.com/atomicstrata/am-docs-internal/actions/workflows/public-cli-contract.yml) workflow gate release sequencing.

Atomic Memory ships two command-line tools. They are different programs for different jobs, and they are not interchangeable.

| Tool | Install | Use it for |
| --- | --- | --- |
| **`am`** (Atomic Memory CLI) | `get.atomicstrata.ai` | Sign-in, `am init`, projects, API keys, memory commands, agent MCP install. The primary CLI. |
| **`atomicmemory`** (Core CLI) | `npm i -g @atomicmemory/cli` | Legacy npm CLI. Deprecated for most workflows; still published for `import --type llmwiki` and Ink TUI power users. |

Start with **`am`**. Use the npm CLI only when you need a workflow that `am` does not cover yet.

Neither is the MCP server: `atomicmemory-mcp` is a stdio process for agent hosts. See [Integrations](/integrations/overview).

---

## Atomic Memory CLI (am)

The **Atomic Memory CLI** (**`am`**) is the primary CLI for Hosted Cloud and Connected Local: browser login, project management, API keys, memory commands, and agent host MCP wiring.

Install from `get.atomicstrata.ai`. Defaults to `https://api.atomicstrata.ai`.

Not the npm CLI

This is **not** the Node.js `@atomicmemory/cli` package below. The npm CLI is deprecated for most workflows and remains published for legacy paths.

### Install

Canonical one-liner (install **and** run `am init`):

```bash
curl --proto '=https' --tlsv1.2 -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --init
```

Install only (binary on PATH; you still must run `am init` next):

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh
source "$HOME/.atomicmemory/env"
am init
```

Prebuilt binaries for macOS and Linux (x86\_64 + arm64). Installs to `~/.local/bin` by default and adds the **`am`** symlink. PATH activation lives in `~/.atomicmemory/env`. Credentials are stored separately (see [Defaults](#defaults) below).

Pin a version:

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --version <x.y.z>
```

Skip PATH modification:

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --no-modify-path
```

Do I need `am init` after install?

**Yes.** Install alone only puts `am` on your PATH. You must run `am init` before memory commands, project linking, or agent MCP install — unless you used the `--init` one-liner above, which runs `am init` for you.

Pick a path in the next two sections:

1.  **[Hosted Cloud (default)](#hosted-cloud-am-init-default)** — plain `am init`
2.  **[Connected Local](#connected-local-am-init---local-opt-in)** — `am init --local` (opt-in; not the default after a fresh cloud-first install)

### Hosted Cloud: am init (default)

Plain `am init` defaults to **Hosted Cloud**: managed memory with no Docker or OpenAI key. The CLI signs you in, selects a Cloud project, provisions or reuses a per-installation API key (`am-cli-<12-hex>`), saves the active profile, and leaves you ready to run memory commands.

```bash
am init
am memory ingest "I prefer aisle seats when flying."
am memory search "seat preference"
```

Interactive `am init` offers:

1.  **Hosted Cloud** (default): managed memory, no Docker
2.  **Connected Local**: Core on this machine (`am init --local`)

Non-interactive automation:

```bash
am init --yes --project <cloud-project-id>
```

With zero Cloud projects and `--yes` (or no TTY), init prints the onboarding URL and recovery command and exits nonzero. Complete onboarding in the browser, then run `am init` again.

Full SDK walkthrough: [Quickstart](/quickstart). Something not working? See [Troubleshooting](/cloud/troubleshooting).

### Connected Local: am init --local (opt-in)

Connected Local is the **second** init path, not the default after install. Use it when you want Core on this machine with console visibility. Default path needs Docker and an OpenAI API key; pass `--slm` for host Metal SLM instead (no OpenAI key — see `am init --help` on public `am` 0.4.0+):

```bash
export OPENAI_API_KEY="sk-..."
am init --local
# or: am init --local --slm
```

Full walkthrough: [Open Source Quickstart](/open-source/quickstart). Re-check anytime with `am doctor --smoke`.

Already created a Local project in the console? Run `am init --local --project <slug>` instead.

### Instance status

Check what `am init --local` connected and configured:

```bash
am instance status
am instance status --show-secrets
```

`--show-secrets` prints the `CORE_API_KEY` `am init --local` configured for your Core — see [Authentication → Local: Core token or `CORE_API_KEY`](/cloud/authentication#local-core-token-or-core_api_key).

### Migration

Move memories from a Local project into a Cloud project after upgrading to Basic:

```bash
am migrate export --project <local-project-slug>
am migrate import --file <path-to-export.jsonl> --target-project <cloud-project-slug>
```

**Export** requires an **active Connected Local profile**. Switch with `am config profile use <local-profile>` before exporting (see [Switch Hosted Cloud and Connected Local](/cloud/faq/switch-cli-profiles)). Export fails without mutating your profile if the active profile is Hosted Cloud.

**Import** sends records in chunks of 500 per request. v1 supports `--mode merge` only (the default). Imported memories merge with existing scope data; `--mode replace-scope` is rejected by the Cloud API today.

Memory-only — trace history doesn't move. Full walkthrough: [Migrate to Atomic Memory](/cloud/how-to/migrate).

### Agent host MCP: manual install

After `am init`, wire AtomicMemory into Cursor, Claude Code, or Codex with the **manual MCP configs** in each host's integration guide. Do **not** use `am integrate` on **Hosted Cloud** in current CLI releases. See [Known product defects](#known-product-defects-am-integrate) below.

Manual Hosted Cloud MCP env (set in the host config or your shell):

`am init` saves a per-install CLI key for `am memory *`, but it does **not** print that secret. Create a dedicated MCP key and copy its one-time output:

```bash
am key create mcp
export ATOMICMEMORY_API_KEY="amc_..."  # paste from "API key secret (shown once): ..."
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_SCOPE_USER="you@company.com"   # stable per-person identity
export ATOMICMEMORY_SCOPE_LOCK=true                # reject caller scope overrides
# Do not set ATOMICMEMORY_SCOPE_NAMESPACE on Hosted Cloud today. See below.
```

Or create a key named `mcp` on the project's [API Keys](/cloud/how-to/api-keys) page and copy the one-time reveal banner into `ATOMICMEMORY_API_KEY`.

Pin `@atomicmemory/mcp-server@0.1.5` in the host MCP launch args. Per-host examples: [Integrations](/integrations/overview#wire-mcp-manually).

#### Known product defects (am integrate)

`am integrate` exists in the CLI but is **not safe to document as a Hosted Cloud install path** until these defects are fixed in `atomicmemory-internal`:

-   **Namespace asymmetry:** the generator sets `ATOMICMEMORY_SCOPE_NAMESPACE=<project_id>` and `ATOMICMEMORY_SCOPE_LOCK=true`, but ingest omits that namespace while search filters by it, so ingested facts can be invisible to recall.
-   **Scope user lock:** the generator derives `ATOMICMEMORY_SCOPE_USER` from `$USER`, `$USERNAME`, or `default` and locks it. The documented `--scope-user` flag is rejected in the integrate subcommand position and ignored even when passed at the top level, so common OS usernames (`ubuntu`, `runner`, `default`) can collide across people in the same Hosted project.

Use manual MCP with an explicit `ATOMICMEMORY_SCOPE_USER`, `ATOMICMEMORY_SCOPE_LOCK=true`, and **omit** `ATOMICMEMORY_SCOPE_NAMESPACE` on Hosted Cloud until product ships fixes.

### Public CLI release contract

Before production deploy, run:

```bash
npm run check:public-cli
```

That script downloads the live public binary from `get.atomicstrata.ai` and asserts `am init --help` lists standalone `--local` and `--cloud` flags.

| Gate | Enforcement | Blocks |
| --- | --- | --- |
| **Merge (docs quality)** | [CI](https://github.com/atomicstrata/am-docs-internal/actions/workflows/ci.yml) on PRs: typecheck + build | Broken docs only |
| **Deploy** | [Deploy](https://github.com/atomicstrata/am-docs-internal/actions/workflows/deploy.yml) on `main`: contract before Pages upload | Production until public `am` matches |
| **Release readiness** | [Public CLI contract](https://github.com/atomicstrata/am-docs-internal/actions/workflows/public-cli-contract.yml) on `main`/`staging` push or manual dispatch | Signals CLI lag after merge; not a PR check |

PR CI runs only [CI](https://github.com/atomicstrata/am-docs-internal/actions/workflows/ci.yml) (typecheck + build). The live contract check does **not** run on pull requests.

**Merge when docs CI is green.** Production deploy stays blocked on `main` until `npm run check:public-cli` passes and the deploy workflow succeeds.

### Diagnostics

| Command | What it checks |
| --- | --- |
| `am doctor` | Auth preflight, connect wiring (skipped for Hosted Cloud profile), optional `--smoke` |
| `am doctor --smoke` | End-to-end ingest → search → delete (Connected Local pipeline) |
| `am auth doctor` | OAuth endpoints and API reachability |
| `am connect doctor` | Local profile, login, Cloud sync key, Core health |
| `am integrate doctor` | MCP host config vs active profile |

```bash
am doctor
am doctor --smoke          # Connected Local round-trip
am auth doctor
am connect doctor          # Local only
am integrate doctor
```

### Dashboard commands (OAuth)

```bash
am auth login
am overview
```

Uses PKCE + browser — no config file required. The public OAuth `client_id` is baked into the binary.

### Memory commands

After `am init` (Hosted Cloud), the CLI stores your project API key. You do not need to export `ATOMICMEMORY_API_KEY` for normal use:

```bash
am memory ingest "I prefer aisle seats when flying."
am memory search "seat preference"
am memory list
```

Init-managed Hosted profiles ignore a stale `ATOMICMEMORY_API_KEY` in your shell. To force a one-off override, set `ATOMICMEMORY_API_KEY_FORCE=1`. For hand-created Cloud profiles or SDK/MCP clients outside the CLI, export the key from the console:

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx
```

See [Authentication](/cloud/authentication) and the [Quickstart](/quickstart).

### Defaults

| Setting | Default |
| --- | --- |
| API URL | `https://api.atomicstrata.ai` |
| Default profile | `cloud` (Hosted Cloud after plain `am init`) |
| OAuth callback | `http://127.0.0.1:9876/callback` |

Config and credentials live under the OS application support directory:

-   macOS: `~/Library/Application Support/ai.atomicstrata.atomicmemory/`
-   Linux: `$XDG_CONFIG_HOME/atomicmemory/` (default `~/.config/atomicmemory/`)

`~/.atomicmemory/env` is PATH activation only — not where API keys are stored.

Override API URL with `ATOMICMEMORY_API_URL`, active profile with `ATOMICMEMORY_PROFILE`, or `am config profile use`. See [Switch Hosted Cloud and Connected Local](/cloud/faq/switch-cli-profiles).

### Common commands

Grouped by job — each group links back to the section above.

#### Init & doctor

| Command | Description |
| --- | --- |
| `am init` | Hosted Cloud activation (default) |
| `am init --local` | Connected Local (Docker + OpenAI; or `--slm`) |
| `am init --project <id-or-slug>` | Connect to an existing console project |
| `am doctor` | Auth + wiring checks for the active profile |
| `am doctor --smoke` | End-to-end memory round-trip (Connected Local) |
| `am integrate doctor` | MCP host config vs active profile |

#### Connect & instance

| Command | Description |
| --- | --- |
| `am auth login` | Browser OAuth login for dashboard commands |
| `am instance status` | Show what `am init --local` connected |
| `am instance status --show-secrets` | Same, including the local `CORE_API_KEY` |

#### Memory

| Command | Description |
| --- | --- |
| `am memory ingest <text>` | Ingest a memory claim |
| `am memory ingest --file ./memories.jsonl` | Batch ingest |
| `am memory search <query>` | Search memories |
| `am memory list` | List stored memories |

#### Migration commands

| Command | Description |
| --- | --- |
| `am migrate export --project <slug>` | Export a Local project's memories |
| `am migrate import --file <path> --target-project <slug>` | Import exported memories into a Cloud project |

#### Cloud administration

| Command | Description |
| --- | --- |
| `am overview` | Dashboard overview via your browser session |
| `am org list` | List organizations |
| `am project list` | List projects |
| `am key create <name>` | Create a Cloud API key; prints a one-time `amc_…` secret |

### Uninstall

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --uninstall
```

Removes binaries and PATH blocks. Config and credentials in the application support directory are left intact unless you purge them manually.

### Related docs

-   [Quickstart](/quickstart) — Hosted Cloud first memory loop
-   [Open Source Quickstart](/open-source/quickstart) — Connected Local via `am init --local`
-   [Switch Hosted Cloud and Connected Local](/cloud/faq/switch-cli-profiles) — keep both profiles; switch default vs one-off
-   [Migrate to Atomic Memory](/cloud/how-to/migrate) — move memories with `am migrate`
-   [Troubleshooting](/cloud/troubleshooting) — recover from a failed init or doctor run
-   [Authentication](/cloud/authentication) — API key vs OAuth
-   [npm CLI (deprecated)](/cli#core-cli-atomicmemorycli) — `import --type llmwiki` and Ink TUI only

---

## Core CLI (@atomicmemory/cli)

Deprecated: use `am`

The legacy Node.js `@atomicmemory/cli` (`atomicmemory`) is deprecated and no longer documented here. Use the [Atomic Memory CLI (`am`)](#atomic-memory-cli-am) for sign-in, `am init`, memory commands, and agent MCP install.

The npm package stays published only for two leftover paths:

-   `atomicmemory import --type llmwiki` for importing an LLM wiki.
-   The Ink terminal UI (run `atomicmemory` in a TTY) for existing power users.
