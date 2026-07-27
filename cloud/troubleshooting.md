# Troubleshooting

> Agent index: [llms.txt](/llms.txt)

Most activation problems fall into one of the checks below. Each one gives you a symptom to recognize, a way to confirm the cause, and the recovery step — usually followed by re-running [`am doctor --smoke`](/cli#init--doctor) to confirm the fix.

## Docker isn't running

**Symptom:** `am init` or `am doctor --smoke` stops before Core starts, or never reaches a **Verified** state.

**Check:** Confirm Docker is actually running — `am init` starts Core in Docker for you, so it needs a live Docker daemon (Docker Desktop, or your Docker Engine install) before it can proceed.

**Recovery:** Start Docker, then re-run `am init` (or `am doctor --smoke` if you already completed `am init` once). Success looks like the command continuing past Core startup instead of stopping there.

## Missing OPENAI_API_KEY

**Symptom:** `am init` fails early, before Core finishes starting.

**Check:** The [Open Source Quickstart](/open-source/quickstart) requires an OpenAI API key in the same shell you run `am init` from — Core uses it for embeddings and extraction. Confirm it's exported: `echo $OPENAI_API_KEY`.

**Recovery:**

```bash
export OPENAI_API_KEY="sk-..."
am init
```

Success looks like `am init` continuing past Core startup to sign-in and verification.

## Runtime shows Offline

**Symptom:** The console shows your Local project's runtime as **Offline** instead of **Online** — on the project Dashboard's connection pill, or in the Overview status `am init` links you to.

**Check:** Is the Core process or container `am init` started for you still running? If you or a teammate stopped it, restarted the machine, or the container exited, the console loses its heartbeat.

**Recovery:** Restart Core — re-run `am init` (safe to run again; it reconnects your existing project instead of creating a new one), then confirm with `am doctor --smoke`. Success looks like the runtime flipping back to **Online** and a new heartbeat reaching the console within moments.

## am doctor --smoke fails

**Symptom:** `am doctor --smoke` reports a failure instead of confirming the pipeline.

**Check:** It re-checks the memory pipeline — Core reachability and end-to-end memory verification — so the failure is one of the other items on this page (Docker, the OpenAI key, or the runtime being offline).

**Recovery:** Resolve whichever check it's failing on using the matching section above, then re-run `am doctor --smoke`. Success looks like it completing without reporting a failure.

## Console dashboard doesn't work in Safari

**Symptom:** A **Local** project's console pages (Dashboard, Memories, Traces) don't fully load, or the runtime never confirms **Online**, in Safari.

**Check:** Which browser you're using. A Local project's Core must be reachable directly from your browser at `http://127.0.0.1:17350` by default — the console (served over HTTPS) calls it directly rather than proxying through Cloud. Safari's stricter handling of that kind of local-network request is the most common cause of this symptom.

**Recovery:** Use **Google Chrome** for Connected Local console views, as called out in the [Open Source Quickstart](/open-source/quickstart). This only affects Local projects — Cloud projects don't depend on a locally reachable Core and aren't affected.

Success looks like: the same console pages load fully in Chrome and the runtime confirms **Online**.

## Finding your CORE_API_KEY

**Symptom:** You need the token that authenticates direct calls to your own Core (SDK, MCP, `curl`) — for example, to point [Playground](/cloud/how-to/playground) or another tool at your Local project — but you never set one yourself.

**Check:** Did `am init` start Core for you (the common path), or are you running Core yourself via [Core-only Docker](/core-only-docker)?

**Recovery:**

-   If `am init` set up Core: run `am instance status --show-secrets` to print the `CORE_API_KEY` it configured.
-   If you started Core yourself with the Core-only Docker default: it's `local-dev-key`, unless you set `CORE_API_KEY` explicitly on the container.

See [Authentication → Local: Core token or `CORE_API_KEY`](/cloud/authentication#local-core-token-or-core_api_key) for how this credential is used. Never substitute a Cloud `amc_` key here — it isn't accepted by Core.

Success looks like: a direct call to your Core using that value (`am doctor --smoke`, or a manual SDK/MCP/`curl` call) succeeds instead of returning `401`.

## Is this a Core error or a Cloud console/API error?

**Symptom:** A request fails and it's unclear whether your Local Core or the Cloud console/API rejected it.

**Check:** Which surface the failing call actually targets — see [Authentication → Where do memory calls go?](/cloud/authentication#where-do-memory-calls-go) for the routing table:

-   **Local** project memory calls (`ingest`, `search`) go straight to your own Core. They never touch the Cloud gateway, so a `401` here means your Core token / `CORE_API_KEY` is wrong — a Cloud `amc_` key will not work.
-   **Cloud** project memory calls, and anything you do in the console itself (dashboard, Playground with a pasted Cloud key), go through Cloud. A `401` here means your Cloud project API key is wrong, missing, or revoked — check [API Keys](/cloud/how-to/api-keys).
-   Anything about write caps or plan limits (writes pausing, upgrade prompts) is always a Cloud-side, plan-level response — see [Usage & Limits](/cloud/how-to/usage) and [Plans & Billing](/cloud/how-to/billing).

**Recovery:** Fix the credential or limit on the surface you identified, then retry the call.

Success looks like: the retried call succeeds (no `401`, no cap/limit response), and the matching trace or dashboard state reflects it.

## Related docs

-   [Open Source Quickstart](/open-source/quickstart) — Connected Local activation with `am init`
-   [Atomic Memory CLI](/cli) — full command reference
-   [Authentication](/cloud/authentication) — which credential goes where
-   [Migrate to Atomic Memory](/cloud/how-to/migrate) — moving memories from Local to Cloud
