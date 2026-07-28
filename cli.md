# CLI

> Agent index: [llms.txt](/llms.txt)

Atomic Memory ships two command-line tools. They are different programs for different jobs, and they are not interchangeable.

| Tool | Install | Use it for |
| --- | --- | --- |
| **`am`** — Atomic Memory CLI | `get.atomicstrata.ai` | Sign-in, `am init`, projects, API keys, memory commands. The primary CLI. |
| **`atomicmemory`** — Core CLI | `npm i -g @atomicmemory/cli` | Direct workflows against a self-hosted Core you run yourself. Advanced. |

Start with **`am`** unless you are driving a self-hosted Core directly and do not want an account.

Neither is the MCP server: `atomicmemory-mcp` is a stdio process for agent hosts. See [Integrations](/integrations/overview).

---

## Atomic Memory CLI (am)

The **Atomic Memory CLI** (`atomicmemory` / **`am`**) is the primary CLI for both Open Source activation and Cloud operations: browser login, Connected Local setup, org/project management, API keys, and memory commands.

Install from `get.atomicstrata.ai`. Defaults to `https://api.atomicstrata.ai`.

Not the npm CLI

This is **not** the Node.js the Core CLI section below package. The npm CLI is an advanced tool for direct self-hosted core workflows with an Ink terminal UI.

### Install

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

### Connected Local — am init

The fastest Open Source path. One command signs you in, starts Core in Docker, links your console project, and verifies the memory pipeline.

```bash
export OPENAI_API_KEY="sk-..."
am init
```

Full walkthrough: [Open Source Quickstart](/open-source/quickstart). Re-check anytime with `am doctor --smoke`. Something not working? See [Troubleshooting](/cloud/troubleshooting).

Already created a project in the console? Run `am init --project <slug>` instead.

### Instance status

Check what `am init` connected and configured, without re-running the whole setup flow:

```bash
am instance status
am instance status --show-secrets
```

`--show-secrets` is how you find the `CORE_API_KEY` `am init` configured for your Core, if you need it for a direct SDK, MCP, or `curl` call — see [Authentication → Local: Core token or `CORE_API_KEY`](/cloud/authentication#local-core-token-or-core_api_key).

### Migration

Move memories from a Local project into a Cloud project after upgrading to Free:

```bash
am migrate export --project <local-project-slug>
am migrate import --file <path-to-export.jsonl> --target-project <cloud-project-slug>
```

Memory-only — trace history doesn't move. Full walkthrough, prerequisites, and console verification: [Migrate to Atomic Memory](/cloud/how-to/migrate).

### Dashboard commands (OAuth)

```bash
am auth login
am overview
```

Uses PKCE + browser — no config file required. The public OAuth `client_id` is baked into the binary.

### Atomic Memory memory commands (API key)

For managed hosting after upgrading to Free:

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx

am memory ingest "I prefer aisle seats when flying."
am memory search "seat preference"
am memory list
```

Get your API key from the [developer console](https://memory.atomicstrata.ai) during onboarding or under **API Keys**. See the [Quickstart](/quickstart) for the full path.

### Defaults

| Setting | Default |
| --- | --- |
| API URL | `https://api.atomicstrata.ai` |
| OAuth callback | `http://127.0.0.1:9876/callback` |

Override with environment variables or `~/.atomicmemory/` credentials after `am auth login`.

### Common commands

Grouped by job, not alphabetically — each group links back to the section above with the full walkthrough.

#### Init & doctor

| Command | Description |
| --- | --- |
| `am init` | Connected Local activation (sign-in, Core, verify) |
| `am init --project <slug>` | Connect to an existing console project instead of creating one |
| `am doctor --smoke` | Re-check memory pipeline |

#### Connect & instance

| Command | Description |
| --- | --- |
| `am auth login` | Browser OAuth login for dashboard commands |
| `am instance status` | Show what `am init` connected |
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
| `am overview` | Dashboard overview via your browser session — run `am overview --help` for exact scope |
| `am org list` | List organizations |
| `am project list` | List projects |
| `am key create` | Create an API key |

### Uninstall

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --uninstall
```

Removes binaries and PATH block. Credentials under `~/.atomicmemory/` are left intact unless you purge them manually.

### Related docs

-   [Open Source Quickstart](/open-source/quickstart) — Connected Local activation
-   [Quickstart](/quickstart) — create a project and your first memory
-   [Migrate to Atomic Memory](/cloud/how-to/migrate) — move memories with `am migrate`
-   [Troubleshooting](/cloud/troubleshooting) — recover from a failed `am init` or `am doctor --smoke`
-   [Authentication](/cloud/authentication) — API key vs OAuth
-   [npm CLI (advanced)](/cli) — self-hosted core workflows without Cloud

---

## Core CLI (@atomicmemory/cli)

`@atomicmemory/cli` is the Node.js command line for direct self-hosted core workflows. It is separate from the Atomic Memory CLI (`am` from [get.atomicstrata.ai](https://get.atomicstrata.ai)) — use the `am` section above and the [Open Source Quickstart](/open-source/quickstart) for Connected Local activation.

`atomicmemory` is also separate from the MCP server: `atomicmemory-mcp` is a stdio process for agent hosts, while this package is a terminal tool for setup, diagnostics, memory operations, and stable script output.

The CLI uses the same backend-agnostic SDK provider model as the rest of Open Source. The current CLI surface supports `atomicmemory` and `mem0`. Additional SDK providers require a CLI adapter, spec, and config-schema update before they are selectable from command scripts.

The npm CLI does **not** start a memory backend by itself. Direct memory commands need a configured Open Source service — usually Core from the [Open Source Quickstart](/open-source/quickstart) or your own deployment. For Claude Code personal use, prefer the [Claude Code plugin](/integrations/coding-agents/claude-code/local): it installs the MCP server, skill, hooks, and auto-managed local runtime for you.

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
| Connected Local (recommended) | You want Core on your machine with console visibility. | [Open Source Quickstart](/open-source/quickstart) via the `am` section above (`am init`). |
| Direct CLI against local core | You run `atomicmemory-core` yourself and want npm terminal commands. | [Open Source Quickstart](/open-source/quickstart), then configure a `local` profile below. |
| Direct CLI against a self-hosted service | Your team operates Open Source behind its own URL and token. | Configure a `self-hosted` profile below. |
| Atomic Memory | You want managed memory hosting. | the `am` section above and [Quickstart](/quickstart). |
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

For environment-only configuration:

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
3.  `~/.atomicmemory/config.json`
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
