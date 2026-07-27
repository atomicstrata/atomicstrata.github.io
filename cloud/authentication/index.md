# Authentication

> Agent index: [llms.txt](/llms.txt)

Atomic Memory and Core each authenticate requests differently. The console labels the two project types **Local** and **Cloud**; this page calls them **Connected Local** (Core running on your machine, connected to the console) and **Atomic Memory** (fully managed hosting) once, then uses the shorter **Local**/**Cloud** labels below. Use the right credential for the surface you're calling — mixing them returns `401`.

Callers

CLI / SDK / MCP / PlaygroundProject API key

Developer consoleSession JWT (browser OAuth)

Route classes

Memory API`/v1/*`

Dashboard API`/api/*`

user keys never forwarded

Engine

Open Source Core`AM_CORE_API_KEY` only

## Which credential do I need?

| I'm... | Use... | Get it from |
| --- | --- | --- |
| Running `am init` for the first time | Browser OAuth (PKCE) — handled automatically | The CLI opens your browser |
| Calling the Cloud memory API (CLI, SDK, MCP, Playground) | A Cloud project API key (`amc_…`) | Console → **API Keys** |
| Making Local memory calls against your own Core | A Core token / `CORE_API_KEY` | Your local Core instance (`am init` wires this up for you) |
| Signed into the console in a browser | Your dashboard session — no key needed | Automatic after sign-in |

Two things trip people up:

-   A Cloud `amc_` key is **never** sent to Core as the memory bearer, and a Core token is **never** valid against the Cloud memory API. They are different credentials for different surfaces.
-   Local projects still have a Cloud key, but it's used only for **heartbeat and trace sync** back to the console — never for memory calls. `am init` and `am doctor --smoke` manage it for you; you don't copy or paste it.

## Where do memory calls go?

Only **Cloud** memory routes go through the Cloud gateway. **Local** memory calls (ingest, search) go straight to your own Core — they never touch the Cloud gateway. Your local Core still reports a runtime heartbeat and operation traces to the console for visibility, so the console stays accurate even though your memory content never leaves your machine.

| Project type | Memory calls (`ingest`, `search`) | Heartbeat + traces |
| --- | --- | --- |
| **Local** | Your own Core, direct — no Cloud gateway | Cloud, for console visibility |
| **Cloud** | Cloud gateway | Cloud |

## Cloud project API keys

Create and manage these in the console under **API Keys**. See [Managing API Keys](/cloud/how-to/api-keys) for the full create/rotate/revoke flow.

```text
Authorization: Bearer amc_dev_xxxxxxxxxxxxxxxx
```

Properties:

-   Returned **exactly once** at creation; only a masked prefix is shown after
-   Scoped to a single Cloud project
-   Verified on every Cloud memory API request

Example:

```bash
curl -X POST https://api.atomicstrata.ai/v1/memories/search/fast \
  -H "Authorization: Bearer $ATOMICMEMORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "default", "query": "seat preference", "limit": 5}'
```

### SDK and MCP

Point integrations at the Cloud API URL:

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx
```

MCP tools (`memory_ingest`, `memory_search`, `memory_list`, `memory_package`) hit the same `/v1/memories/*` routes through this gateway.

### Playground

The Playground routes to the credential for the project's type: a **Cloud** project's Playground posts to the Cloud API with the Cloud project API key you paste in; a **Local** project's Playground calls your Core directly with your Local Core token instead, never through the Cloud gateway. Either way, the credential stays in browser memory only for that session — it is never stored or embedded in client bundles. See [Using the Playground](/cloud/how-to/playground) for the full walkthrough.

## Local: Core token or CORE_API_KEY

Local memory calls authenticate directly against your own Core, not the Cloud gateway. `am init` starts Core with a token already configured, so you rarely need to set this by hand — find it with:

```bash
am instance status --show-secrets
```

That prints the `CORE_API_KEY` `am init` generated for your Core. Point any SDK, MCP client, or curl call at your Core's URL (`http://127.0.0.1:17350` by default) with that token — not your Cloud `amc_` key.

```bash
export CORE_API_KEY="<value from am instance status --show-secrets>"
```

`local-dev-key` is a different, fixed default — it only applies to [Core-only Docker](/core-only-docker), where you run Core yourself without `am init`. It is not what `am init` configures.

## Dashboard session

Console routes require a signed-in session. You never handle this credential directly — sign in at [memory.atomicstrata.ai/signup](https://memory.atomicstrata.ai/signup) or [memory.atomicstrata.ai/login](https://memory.atomicstrata.ai/login) and the console manages the session for you, including for the Playground UI shell around a pasted Cloud key.

## CLI auth modes

The [Atomic Memory CLI](/cloud/cli) supports two flows:

| Command | Auth | Purpose |
| --- | --- | --- |
| `am init` / `am auth login` | Browser OAuth (PKCE) | Sign-in, project connection, dashboard commands (`am org list`, `am key create`, …) |
| `ATOMICMEMORY_API_KEY` env | Cloud project API key | Cloud memory operations (`am memory ingest`, `am memory search`) |

`am memory ingest`/`search` against a Cloud project don't require `am auth login` when `ATOMICMEMORY_API_KEY` is set. Against a Local project, the same commands use your local Core directly and need neither credential set manually — `am init` already wired that up.

## Security reporting

Report vulnerabilities per the [Atomic Memory Cloud API SECURITY policy](https://github.com/atomicstrata/am-cloud-api/blob/main/SECURITY.md).

## Advanced deployment details

The rest of this page is for operators running or customizing a deployment, not for evaluating or day-to-day use.

### JWT audience (non-local deploys)

Configure your identity provider's session JWT template with:

```json
{
  "aud": "atomicmemory-cloud"
}
```

The `aud` claim must match `JWT_AUDIENCE` on the cloud API.

### Browser proxy pattern

The developer console **never** calls the cloud API directly from the browser for dashboard operations. Next.js Route Handlers obtain the session token server-side and forward the JWT to `AM_API_URL`, which the browser bundle never sees directly.

This keeps CORS strict — set `CORS_ALLOWED_ORIGINS` on the API to the console origin only (`https://memory.atomicstrata.ai`).

### Cloud → Core infrastructure credential

For Cloud projects, the cloud gateway never forwards a user's API key to Open Source Core. Outbound calls from the gateway to the managed Core fleet use a separate infrastructure credential (`AM_CORE_API_KEY`), set by the operator — it is not a credential end users ever see or configure.

## Related docs

-   [Open Source Quickstart](/open-source/quickstart) — Connected Local via `am init`
-   [Quickstart](/quickstart) — create a project and your first memory
-   [Developer Console](/cloud/console) — dashboard tour
-   [Managing API Keys](/cloud/how-to/api-keys) — create, rotate, revoke
-   [The Dashboard](/cloud/how-to/dashboard) - project landing page and activation path
