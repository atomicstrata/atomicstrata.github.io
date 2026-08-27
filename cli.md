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

Canonical one-liner (install + onboard):

```bash
curl --proto '=https' --tlsv1.2 -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --init
```

Install only (run `am init` yourself):

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh
source "$HOME/.atomicmemory/env"
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

### Connected Local — am init --local

Run Core on your machine with console visibility. Requires Docker and an OpenAI API key:

```bash
export OPENAI_API_KEY="sk-..."
am init --local
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

Move memories from a Local project into a Cloud project after upgrading to Free:

```bash
am migrate export --project <local-project-slug>
am migrate import --file <path-to-export.jsonl> --target-project <cloud-project-slug>
```

**Export** requires an **active Connected Local profile**. Switch with `am config profile use <local-profile>` before exporting. Export fails without mutating your profile if the active profile is Hosted Cloud.

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

Override API URL with `ATOMICMEMORY_API_URL`, active profile with `ATOMICMEMORY_PROFILE`, or `am config profile use`.

### Common commands

Grouped by job — each group links back to the section above.

#### Init & doctor

| Command | Description |
| --- | --- |
| `am init` | Hosted Cloud activation (default) |
| `am init --local` | Connected Local (Docker + OpenAI) |
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
-   [Migrate to Atomic Memory](/cloud/how-to/migrate) — move memories with `am migrate`
-   [Troubleshooting](/cloud/troubleshooting) — recover from a failed init or doctor run
-   [Authentication](/cloud/authentication) — API key vs OAuth
-   [npm CLI (legacy)](/cli#core-cli-atomicmemorycli) — advanced self-hosted workflows

---

## Core CLI (@atomicmemory/cli)

`@atomicmemory/cli` is the legacy Node.js command line for direct self-hosted core workflows. **`am`** from [get.atomicstrata.ai](https://get.atomicstrata.ai) is the supported path for sign-in, `am init`, memory commands, and agent MCP install. The npm package remains published for `import --type llmwiki` and teams that rely on the Ink terminal UI.

`atomicmemory` is also separate from the MCP server: `atomicmemory-mcp` is a stdio process for agent hosts, while this package is a terminal tool for setup, diagnostics, memory operations, and stable script output.

The CLI uses the same backend-agnostic SDK provider model as the rest of Open Source. The current CLI surface supports `atomicmemory` and `mem0`. Additional SDK providers require a CLI adapter, spec, and config-schema update before they are selectable from command scripts.

The npm CLI does **not** start a memory backend by itself. Direct memory commands need a configured Open Source service — usually Core from the [Open Source Quickstart](/open-source/quickstart) via `am init --local`, or your own deployment. For Claude Code personal use, prefer the [Claude Code plugin](/integrations/coding-agents/claude-code/local): it installs the MCP server, skill, hooks, and auto-managed local runtime for you.

### What you get

-   **Interactive terminal dashboard.** Running `atomicmemory` in a real terminal opens an Ink UI with a bottom prompt, scrollable session output, slash menu, and styled diagnostics.
-   **Plain command surface.** Use `--no-interactive`, non-TTY output, or machine output modes when you want static text or JSON. Use `--interactive` as a TTY rendering hint when text output should open the Ink dashboard.
-   **Setup and diagnostics.** `init`, `doctor`, `status`, `validate`, `config`, `hooks`, `completion`, `help`, and `version` help operators install, inspect, and repair local configuration.
-   **Memory workflows.** `add`, `ingest`, `search`, `package`, `list`, `get`, `delete`, and `import` expose the same durable memory primitives used by the SDK and integrations.
-   **Agent-safe output.** `--agent` emits stable JSON envelopes for automation.

### Install

Requires Node.js 20 or newer.

```bash
npm install -g @atomicmemory/cli
atomicmemory
```

Running `atomicmemory` opens the local dashboard. Memory operations will ask for a profile or provider flags until you connect the CLI to an Open Source backend.

To try the published CLI without a global install, use:

```bash
npx -y @atomicmemory/cli
```

### Choose a setup path

| Path | Use when | Start here |
| --- | --- | --- |
| Claude Code plugin | You want personal Claude Code memory with local runtime management and no separate API key for extraction. | [Claude Code Local](/integrations/coding-agents/claude-code/local) |
| Connected Local (recommended) | You want Core on your machine with console visibility. | [Open Source Quickstart](/open-source/quickstart) via `am init --local`. |
| Direct CLI against local core | You run `atomicmemory-core` yourself and want npm terminal commands. | [Open Source Quickstart](/open-source/quickstart), then configure a `local` profile below. |
| Direct CLI against a self-hosted service | Your team operates Open Source behind its own URL and token. | Configure a `self-hosted` profile below. |
| Hosted Cloud | You want managed memory hosting. | `am init` and [Quickstart](/quickstart). |
| Mem0 adapter | You want the CLI shape against a Mem0 backend. | Use `--provider mem0`; Open Source-only commands are capability-gated. |

### Configure

Create a named local profile for a local Core deployment:

```bash
printf '%s\n' 'local-dev-key' | \
atomicmemory init \
  --profile local \
  --provider atomicmemory \
  --api-url http://127.0.0.1:17350 \
  --trust-surface local \
  --user "$USER" \
  --namespace my-project \
  --api-key-stdin \
  --save-api-key
```

`--trust-surface` is required when the CLI is asked to trust a provider URL without an existing saved profile. It is not a secret; it describes the operator boundary around the URL.

| Value | Use when |
| --- | --- |
| `local` | The URL points at a local development service, for example `localhost`. |
| `self-hosted` | Your team operates the service and owns the network boundary. |
| `authenticated-wrapper` | A hosted or shared endpoint is protected by an authenticated wrapper. |

For environment-only configuration (npm **`atomicmemory`** CLI local profiles — not Hosted Cloud MCP):

```bash
export ATOMICMEMORY_PROVIDER="atomicmemory"
export ATOMICMEMORY_API_URL="http://127.0.0.1:17350"
export ATOMICMEMORY_API_KEY="local-dev-key"
export ATOMICMEMORY_TRUST_SURFACE="local"
export ATOMICMEMORY_SCOPE_USER="$USER"
export ATOMICMEMORY_SCOPE_NAMESPACE="my-project"
```

Configuration precedence is:

1.  CLI flags
2.  `ATOMICMEMORY_*` environment variables
3.  `~/.atomicmemory/config.json` (npm CLI profile file)
4.  command defaults

`atomicmemory config show` redacts saved API keys.

API keys should be passed through stdin or environment variables:

```bash
printf '%s\n' "$ATOMICMEMORY_API_KEY" | \
  atomicmemory init --profile cloud --api-key-stdin --save-api-key
```

Plain `--api-key <value>` is rejected at parse time so secrets do not land in shell history. `--api-key-stdin` provides an ephemeral key for most commands; for `init`, pair it with `--save-api-key` when the key should be persisted to the named profile.

Memory commands require an explicit scope user from flags, environment, or config. The CLI does not invent a user for provider-backed operations.

After `init`, verify the active profile:

```bash
atomicmemory status
```

If you skip `init`, `status` and memory commands need equivalent flags or environment variables. A user by itself is not enough; provider-backed commands also need a provider URL and trust surface.

```bash
atomicmemory status \
  --provider atomicmemory \
  --api-url http://127.0.0.1:17350 \
  --trust-surface local \
  --user "$USER"
```

If you are using the Claude Code plugin in local auto-managed mode, you usually do **not** need to run `atomicmemory init`; the plugin owns the local runtime configuration. Use this page when you want direct terminal access, manual hook snippets, or a profile that points at an external service.

### Interactive mode

Run with no arguments in a TTY:

```bash
atomicmemory
```

The dashboard keeps the prompt at the bottom and appends command results above it. Slash controls are handled by the dashboard:

On a fresh machine, run `init` before relying on interactive commands such as `status`, `add`, or `search`. If the dashboard says `scope not configured`, either run `init`, set `ATOMICMEMORY_SCOPE_USER` plus the provider environment variables above, or include flags directly in the command you type into the dashboard:

```text
status --provider atomicmemory --api-url http://127.0.0.1:17350 --trust-surface local --user alice
```

| Input | Purpose |
| --- | --- |
| `/` | Show the command menu. |
| `/help`, `help`, `?` | Show keyboard controls and command examples. |
| `/clear`, `clear` | Clear the session output. |
| `/quit`, `/exit`, `quit`, `exit` | Exit interactive mode. |

Regular CLI commands are typed without a slash:

| Input | Purpose |
| --- | --- |
| `doctor` | Verify local config, package health, and provider readiness. |
| `status` | Show the active provider, profile, scope, and capability surface. |
| `config show` | Show the current profile/config in a redacted, readable format. |
| `add <text>` | Store a durable memory. |
| `search <query>` | Search scoped memories. |
| `package <query>` | Build prompt-ready context. |

Use `PageUp` / `PageDown`, `Ctrl+U` / `Ctrl+D`, or the arrow keys to scroll session output.

### Commands

```bash
atomicmemory doctor
atomicmemory status
atomicmemory validate
atomicmemory validate --online
atomicmemory help search
atomicmemory version

atomicmemory add "The project uses pnpm workspaces."
atomicmemory ingest --mode verbatim "Decision recap for handoff"
atomicmemory ingest --mode messages --file ./conversation.json
atomicmemory search "workspace package conventions" --limit 5
atomicmemory package "recent implementation context" --token-budget 1200
atomicmemory list --limit 20
atomicmemory get <memory-id>
atomicmemory delete <memory-id>
atomicmemory import ./memories.json

atomicmemory config show
atomicmemory config profile list
atomicmemory config profile use cloud
atomicmemory config profile show local
atomicmemory skill get core
atomicmemory hooks install --host codex --runtime node
atomicmemory hooks install --host codex --runtime python
atomicmemory hooks run user-prompt-submit --host codex
atomicmemory completion bash
atomicmemory completion zsh
```

`validate` is the post-install diagnostic. It checks the bundled command spec, config schema, embedded skill, redaction behavior, and local config-file safety; `--online` adds provider connectivity checks.

Provider-backed commands accept the same provider and scope overrides:

```bash
atomicmemory search "release policy" \
  --provider atomicmemory \
  --api-url http://127.0.0.1:17350 \
  --trust-surface local \
  --user "$USER" \
  --namespace atomicmemory-integrations
```

`--trust-surface` can be omitted only when an initialized profile already supplies it.

### Hook install

`atomicmemory hooks install` emits host-specific lifecycle hook config without mutating user config files. Node is the recommended default and is bundled as `atomicmemory hooks run ...`. Python is an advanced option for teams that set `ATOMICMEMORY_PYTHON_HOOK_BIN` to a compatible Python hook runner.

For Claude Code, the plugin already ships hooks and is the recommended local path. Use CLI-generated hooks only when you maintain Claude Code or Codex hook configuration yourself.

```bash
atomicmemory hooks install --host codex --runtime node
atomicmemory hooks install --host codex --runtime python
atomicmemory hooks install --host claude-code --runtime node
```

`hooks run <event>` is normally invoked by the generated host snippet, not by operators directly. Supported events are `user-prompt-submit`, `post-compact`, and `stop`.

Agent hook environments often have a thinner `PATH` than the interactive shell that ran `atomicmemory hooks install`. Before relying on a generated snippet, confirm the CLI resolves inside the host environment:

```bash
command -v atomicmemory
```

Codex stop payloads are often shorter than Claude Code payloads. The bundled Node runtime defaults `ATOMICMEMORY_STOP_MIN_ASSISTANT_CHARS` to `200`; for Codex hosts, start with `40` if shorter stop turns should be captured:

```bash
export ATOMICMEMORY_STOP_MIN_ASSISTANT_CHARS=40
```

The generated snippet does not set this override for you.

Claude Code local extraction can use Claude Code's own authenticated session instead of a separate Anthropic key:

```bash
claude auth login
export LLM_PROVIDER=claude-code
export EMBEDDING_PROVIDER=transformers
```

That mode is for personal/local use. It requires Claude Code to be installed and logged in, consumes the user's Claude Code / Claude subscription limits, and is not the recommended path for hosted or team deployments. `LLM_PROVIDER` configures the local Open Source core process; CLI profile variables such as `ATOMICMEMORY_API_URL`, `ATOMICMEMORY_API_KEY`, and scope still configure how the CLI reaches that core process.

Codex local extraction defaults to account-auth:

```bash
codex login
export LLM_PROVIDER=codex
export EMBEDDING_PROVIDER=transformers
```

This is the default Codex local setup. Core reads the auth file created by `codex login` and calls the Codex backend directly. No OpenAI API key is required. It consumes the user's Codex account limits and is not the recommended path for hosted or team deployments; use `LLM_PROVIDER=openai` plus `OPENAI_API_KEY` for that mode.

### Machine output

Use `--json` for raw command data and `--agent` for a stable envelope:

```bash
atomicmemory search "prior decisions" --agent
```

Envelope shape:

```json
{
  "status": "success",
  "command": "search",
  "duration_ms": 12,
  "profile": "default",
  "scope": { "user": "pip", "namespace": "docs" },
  "count": 1,
  "data": [
    {
      "memory": {
        "id": "mem_123",
        "content": "The docs repo uses pnpm workspaces.",
        "scope": { "user": "pip", "namespace": "docs" },
        "kind": "fact",
        "createdAt": "2026-05-09T12:00:00.000Z",
        "provenance": { "source": "manual-handoff" }
      },
      "score": 0.82
    }
  ],
  "meta": { "truncated": false, "limit": 5 }
}
```

`provenance` is whatever the operator passed through `--source`, `--source-url`, or `--source-id`; the CLI does not stamp `source: "cli"` automatically.

Package results carry both the data-level SDK field and the envelope-level metadata field:

```json
{
  "status": "success",
  "command": "package",
  "duration_ms": 18,
  "profile": "default",
  "scope": { "user": "pip", "namespace": "docs" },
  "count": 2,
  "data": {
    "text": "## Relevant Memory\n...",
    "tokens": 842,
    "hits": [],
    "budgetConstrained": false
  },
  "meta": {
    "token_budget": 1200,
    "format": "tiered",
    "section": "inline",
    "budget_constrained": false
  }
}
```

`data` is command-specific: memory commands return the sanitized result for that command, while errors in `--agent` mode are emitted as JSON and exit non-zero.

`--interactive` is a text-mode rendering hint. It is rejected with exit code 2 when output resolves to a non-text mode such as `--json`, `--agent`, or `--output quiet`.

### Backend smoke

Backend-gated CLI tests are skipped unless `ATOMICMEMORY_TEST_BACKEND=1` points at a real `atomicmemory-core` instance. To exercise them deterministically against a local Docker stack, run from `atomicmemory-integrations`:

```bash
pnpm -C packages/cli test:backend:docker
```

The harness starts a sibling `atomicmemory-core` Docker stack, layers a CLI-side mock OpenAI-compatible LLM so ingest tests need no external API credentials, polls the real `/health` endpoint with a bounded timeout, runs the backend-gated suite, and tears the stack down.

Optional harness environment variables:

| Var | Purpose |
| --- | --- |
| `ATOMICMEMORY_CORE_PATH` | Path to the core checkout; defaults to sibling `../atomicmemory-core`. |
| `ATOMICMEMORY_DOCKER_APP_PORT` | Host port for core's app; defaults to a free port from `3060`. |
| `ATOMICMEMORY_DOCKER_POSTGRES_PORT` | Host port for core's Postgres; defaults to a free port from `5444`. |
| `ATOMICMEMORY_DOCKER_HEALTH_TIMEOUT` | Bounded `/health` poll cap in seconds. |
| `ATOMICMEMORY_DOCKER_SKIP_BUILD` | Reuse existing compose images when set. |
| `ATOMICMEMORY_DOCKER_KEEP_UP` | Leave the stack running after the test for inspection when set. |

### See also

-   [SDK provider model](/sdk/concepts/provider-model)
-   [Using the Open Source backend](/sdk/guides/atomicmemory-backend)
-   [Integrations overview](/integrations/overview)
