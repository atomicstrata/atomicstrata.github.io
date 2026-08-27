# Troubleshooting

> Agent index: [llms.txt](/llms.txt)

Most problems fall into one of the checks below. Each one gives you a symptom to recognize, a way to confirm the cause, and the recovery step.

For Connected Local pipeline checks after `am init --local`, re-run [`am doctor --smoke`](/cli#init--doctor).

## Hosted am init needs a browser

**Symptom:** Interactive `am init` fails immediately or asks for a browser that cannot open (headless machine, remote SSH without display).

**Check:** Hosted Cloud init uses browser OAuth by default. Non-interactive sessions need a pre-authenticated session or device flow.

**Recovery:**

```bash
am auth login --token "$JWT"
# or
am init --device
```

For automation: `am init --yes --project <cloud-id>` after `am auth login --token`.

## am init --yes with zero or many Cloud projects

**Symptom:** `am init --yes` exits nonzero and prints an onboarding or projects URL instead of completing.

**Check:** With no Cloud projects, `--yes` cannot wait for browser onboarding. With multiple projects, `--yes` cannot pick one automatically.

**Recovery:** Complete onboarding in the browser, or list projects and pass an explicit ID:

```bash
am init --yes --project <cloud-project-id>
```

## Stale ATOMICMEMORY_API_KEY in your shell

**Symptom:** `am memory ingest` or `search` fails with `401` after a successful Hosted `am init`, or doctor warns about a Cloud env export.

**Check:** Init-managed Hosted profiles **ignore** a stale `ATOMICMEMORY_API_KEY` in your shell and use the stored key instead. A leftover export from an old session can still confuse SDK or MCP clients you run separately.

**Recovery:**

```bash
unset ATOMICMEMORY_API_KEY
am memory ingest "test preference"
```

To force the env key for one command: `ATOMICMEMORY_API_KEY_FORCE=1 am memory search "query"`. See [Authentication → Init-managed Hosted Cloud keys](/cloud/authentication#init-managed-hosted-cloud-keys).

## API key quota full during am init

**Symptom:** Init reports quota full and does not rotate unrelated keys.

**Check:** The CLI preserves your previous default profile and prints recovery commands instead of revoking keys on other machines.

**Recovery:** Open the project dashboard, revoke an unused key under **API Keys**, then:

```bash
am key list
am init --project <cloud-project-id>
```

## Docker isn't running (Connected Local)

**Symptom:** `am init --local` or `am doctor --smoke` stops before Core starts, or never reaches a **Verified** state.

**Check:** Connected Local requires Docker. Confirm the daemon is running.

**Recovery:** Start Docker, then re-run `am init --local` (or `am doctor --smoke` if you already completed init once).

## Missing OPENAI_API_KEY (Connected Local)

**Symptom:** `am init --local` fails early, before Core finishes starting.

**Check:** The [Open Source Quickstart](/open-source/quickstart) requires an OpenAI API key in the same shell — Core uses it for embeddings and extraction. Confirm it's exported: `echo $OPENAI_API_KEY`.

**Recovery:**

```bash
export OPENAI_API_KEY="sk-..."
am init --local
```

## Runtime shows Offline (Connected Local)

**Symptom:** The console shows your Local project's runtime as **Offline** instead of **Online**.

**Check:** Is the Core container `am init --local` started still running?

**Recovery:** Re-run `am init --local` (safe to run again; reconnects your existing project), then confirm with `am doctor --smoke`.

## am doctor --smoke fails (Connected Local)

**Symptom:** `am doctor --smoke` reports a failure instead of confirming the pipeline.

**Check:** It re-checks Core reachability and end-to-end memory verification — usually Docker, the OpenAI key, or an offline runtime (sections above).

**Recovery:** Resolve the matching check, then re-run `am doctor --smoke`.

## Console dashboard doesn't work in Safari (Connected Local)

**Symptom:** A **Local** project's console pages don't fully load in Safari.

**Check:** Local Core must be reachable from your browser at `http://127.0.0.1:17350` by default. Safari's handling of local-network requests from HTTPS pages is the most common cause.

**Recovery:** Use **Google Chrome** for Connected Local console views. Cloud projects are not affected.

## Finding your CORE_API_KEY

**Symptom:** You need the token for direct Core calls (SDK, MCP, `curl`) but never set one yourself.

**Check:** Did `am init --local` start Core for you?

**Recovery:**

-   Run `am instance status --show-secrets` to print the configured key.
-   If you started Core yourself with `CORE_API_KEY` on the container, use that same value.

See [Authentication → Local: Core token or `CORE_API_KEY`](/cloud/authentication#local-core-token-or-core_api_key). Never substitute a Cloud `amc_` key — Core rejects it.

## Is this a Core error or a Cloud console/API error?

**Symptom:** A request fails and it's unclear whether your Local Core or the Cloud console/API rejected it.

**Check:** See [Authentication → Where do memory calls go?](/cloud/authentication#where-do-memory-calls-go):

-   **Local** memory calls go to your Core — `401` means wrong `CORE_API_KEY`.
-   **Cloud** memory calls and console operations go through Cloud — `401` means wrong, missing, or revoked `amc_` key.
-   Plan limits and write caps are always Cloud-side — see [Usage & Limits](/cloud/how-to/usage) and [Plans & Billing](/cloud/how-to/billing).

**Recovery:** Fix the credential on the surface you identified, then retry.

## Related docs

-   [Quickstart](/quickstart) — Hosted Cloud with plain `am init`
-   [Open Source Quickstart](/open-source/quickstart) — Connected Local with `am init --local`
-   [Atomic Memory CLI](/cli) — full command reference
-   [Authentication](/cloud/authentication) — which credential goes where
-   [Migrate to Atomic Memory](/cloud/how-to/migrate) — moving memories from Local to Cloud
