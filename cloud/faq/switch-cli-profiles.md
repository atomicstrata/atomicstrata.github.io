# Switch between Hosted Cloud and Connected Local

> Agent index: [llms.txt](/llms.txt)

Yes — you can keep **both** configured on one machine and switch which profile is the default. This FAQ covers the common switch questions after `am init` / `am init --local`.

Verify your CLI

These commands match the cloud-first CLI (`am init` → Hosted Cloud, `am init --local` → Connected Local). Check your binary first:

```bash
am --version
am init --help
```

If `am init --help` does not list standalone `--local` / `--cloud`, see the caution on the [CLI](/cli) page for the current public installer behavior.

## Can I install and configure both?

Yes. Hosted Cloud and Connected Local are separate **profiles**. Running both init paths keeps both credential sets on disk:

```bash
# Hosted Cloud (default)
am init
# or explicitly:
am init --cloud

# Connected Local (opt-in; needs Docker + OPENAI_API_KEY)
export OPENAI_API_KEY="sk-..."
am init --local
```

Cloud credentials live under a profile named like `hosted-cloud-<project-id>`. Local typically uses the profile name `local`. They coexist — init does not delete the other profile.

## After am init --local, am I on local?

Usually yes for the **default** profile: the last successful init that selected a path becomes the active default. Confirm instead of guessing:

```bash
am config profile list
am config profile show
```

`list` shows every saved profile. `show` prints the active one (and its backend). If you still need Hosted Cloud as the default after a local init, switch with the commands below.

## How do I switch back to cloud (and vice versa)?

Change the **default** profile:

```bash
# Use Connected Local as the default
am config profile use local

# Use Hosted Cloud as the default (replace with your profile name from list)
am config profile use hosted-cloud-<project-id>
```

Re-run init when you need to reselect a project or refresh credentials:

```bash
am init --cloud
am init --local
```

Full walkthroughs: [Quickstart](/quickstart) (Hosted Cloud) and [Open Source Quickstart](/open-source/quickstart) (Connected Local).

## How do I see which profile is active?

```bash
am config profile list
am config profile show
```

Also useful after a local setup: `am instance status` (what Connected Local connected). For MCP host wiring vs the active profile: `am integrate doctor`.

## One-off override vs changing the default

| Goal | Mechanism | Persists? |
| --- | --- | --- |
| Change the default for every later `am` command | `am config profile use <name>` | Yes |
| One command only | `am --profile <name> …` | No |
| One shell / process only | `ATOMICMEMORY_PROFILE=<name> am …` | No (env for that process) |

Copy-paste one-offs:

```bash
am --profile local memory search "seat preference"
am --profile hosted-cloud-<project-id> memory search "seat preference"

# or:
ATOMICMEMORY_PROFILE=local am memory search "seat preference"
ATOMICMEMORY_PROFILE=hosted-cloud-<project-id> am memory search "seat preference"
```

`--profile` / `ATOMICMEMORY_PROFILE` do **not** change the saved default. Only `am config profile use` (or a later init that selects a path) does.

## MCP and hooks pin the profile at install time

Agent MCP configs and hooks capture the profile that was active when you installed them. Switching the CLI default later does **not** rewrite those host configs automatically.

After you change the default (or when agents should follow a new profile):

1.  Re-run `am integrate` for Connected Local hosts that were installed that way, **or**
2.  Update the host MCP / hook env (for example `ATOMICMEMORY_PROFILE`, API URL, and keys) to match the profile you want.

Hosted Cloud and `am integrate`

Do **not** use `am integrate` as the Hosted Cloud install path in current CLI releases — see [CLI → Known product defects](/cli#known-product-defects-am-integrate). For Hosted Cloud agents, update the manual MCP env from the [Integrations](/integrations/overview) guides after you switch profiles.

Confirm host wiring against the active profile:

```bash
am integrate doctor
```

## Related docs

-   [CLI](/cli) — install, `am init`, doctor, defaults
-   [Quickstart](/quickstart) — Hosted Cloud first memory loop
-   [Open Source Quickstart](/open-source/quickstart) — Connected Local
-   [Troubleshooting](/cloud/troubleshooting) — failed init and doctor recovery
-   [Migrate to Atomic Memory](/cloud/how-to/migrate) — export requires an active Local profile
