# Quickstart

> Agent index: [llms.txt](/llms.txt)

**Run memory locally. See it clearly.**

AtomicMemory keeps your memories on your machine. The Cloud console shows what Core is doing — ingest, search, and traces — without hosting your data.

**You need:** Docker · OpenAI API key · macOS or Linux

1.  1Install + init`am init` — sign in, start Core, verify
2.  2Add a memory`am memory ingest` / `search`
3.  3Open your dashboardruntime **Online**, memories + traces

## 1. Install and initialize

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh
source "$HOME/.atomicmemory/env"

export OPENAI_API_KEY="sk-..."
am init
```

`am init` opens a browser to sign you in, starts Core in Docker, connects your console, and verifies the memory pipeline. When it finishes, you'll see **Verified** and a link to your dashboard.

Sign-in creates a free **Open Source** organization with one Connected Local project. See [Billing & plans](/cloud/how-to/billing) when you want a Hosted Cloud project on the **Free** tier.

Your memories stay on your machine. Connected Local sends the console a runtime heartbeat and operation traces (call type, timing, and the reconciliation decision) so the dashboard stays accurate — never your memory content.

Already created a project in the console? Run `am init --project <slug>` instead.

### What am init handles for you

-   Secure browser sign-in
-   Local Core startup on `http://127.0.0.1:17350`
-   Console connection — runtime shows **Online**
-   End-to-end memory verification

For a **Connected Local** project, use **Google Chrome** when viewing it in the console — your browser needs to reach Core directly, which is more reliable in Chrome. More detail: [Cloud CLI](/cloud/cli).

## 2. Add your first memory

```bash
am memory ingest "I ship Go backends and TypeScript frontends."
am memory search "what stack do I use?"
```

## 3. Open your dashboard

Open the dashboard link from the CLI output — or go to [memory.atomicstrata.ai](https://memory.atomicstrata.ai). Confirm the runtime is **Online**, then browse **Memories** and **Traces**.

Something didn't work? Run `am doctor --smoke` to re-check the pipeline, or see [Troubleshooting](/cloud/troubleshooting) for Docker, OpenAI key, and runtime-offline recovery steps.

## What's next

-   [Integrations](/integrations/overview) — wire MCP, Claude Code, Cursor, and more
-   [SDK Quickstart](/sdk/quickstart) — typed client for your app
-   [Add Hosted Cloud](/cloud/quickstart) — add managed hosting when you're ready
-   [Troubleshooting](/cloud/troubleshooting) — recover from a failed `am init` or `am doctor --smoke`

Prefer Core without a Cloud connection? [Core-only Docker setup](/core-only-docker) runs the engine with curl — no account required.
