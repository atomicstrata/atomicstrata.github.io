# Quickstart: give an assistant memory

> Agent index: [llms.txt](/llms.txt)

Public CLI release timing

This quickstart assumes a cloud-first CLI where plain `am init` sets up Hosted Cloud. If `am init --help` does not list `--local`, the public installer still serves an older flow — use plain `am init` for Connected Local instead and see [Open Source Quickstart](/open-source/quickstart).

**Outcome:** store one travel preference, retrieve it in a later request, and confirm both operations in the console.

**You need:** macOS or Linux and an account at [memory.atomicstrata.ai](https://memory.atomicstrata.ai). No Docker required for the default Hosted Cloud path.

1.  1Install and initializeRun the installer; plain `am init` sets up Hosted Cloud.
2.  2Remember a preferenceWrite one durable fact with `am memory ingest`.
3.  3Use it laterRetrieve it and see the trace in the console.

## 1. Install and initialize

```bash
curl --proto '=https' --tlsv1.2 -fsSL https://get.atomicstrata.ai/install.sh | sh -s -- --init
```

Plain `am init` defaults to **Hosted Cloud**: browser sign-in, Cloud project selection, and a per-installation API key saved in your local profile. No Docker or OpenAI key is required.

If the installer updated PATH, open a new terminal or run:

```bash
source "$HOME/.atomicmemory/env"
```

Already have a Cloud project? Run `am init --project <id-or-slug>` instead.

## 2. Remember a travel preference

```bash
am memory ingest "I prefer aisle seats when I fly."
```

The CLI uses the stored project API key — you do not need to export `ATOMICMEMORY_API_KEY` after init-managed setup.

## 3. Retrieve it for the next task

```bash
am memory search "Which seat should I book?"
```

Success looks like a result about the aisle-seat preference. That result is the context your application passes to a model before it answers the person.

## 4. Inspect the result

Open the console at [memory.atomicstrata.ai](https://memory.atomicstrata.ai). Under **Memories** you see the stored content; under **Traces** you see the ingest and the search, each with its call type, timing, and reconciliation decision.

Something not working? See [Troubleshooting](/cloud/troubleshooting).

## From an application (SDK)

To wire memory into a Node.js app instead of the CLI, install the client and pass an API key explicitly:

```bash
npm install @atomicmemory/sdk
```

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx
```

Copy the key from the console under **API Keys** (shown once at creation), or use the key `am init` stored locally without exporting it in the CLI path above.

```typescript
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: process.env.ATOMICMEMORY_API_URL,
      apiKey: process.env.ATOMICMEMORY_API_KEY,
    },
  },
});

await memory.ingest({
  messages: [{ role: 'user', content: 'I prefer aisle seats when I fly.' }],
  scope: { user: 'user_001' },
});

const results = await memory.search({
  query: 'Which seat should I book?',
  scope: { user: 'user_001' },
});
```

The `scope` says who this memory belongs to. Every write and every read names a scope, so one user's context never leaks into another's.

## What you just built

You completed the smallest durable-memory loop: write a preference, retrieve it for a later request, and inspect the operations that made it happen. Next, see how scopes, corrections, and version history keep that loop safe in a real application: [How memory works](/how-memory-works).

## Next steps

-   [How memory works](/how-memory-works) — scopes, corrections, provenance, and lifecycle
-   [Developer Console](/cloud/console) — traces, usage, and API keys
-   [Authentication](/cloud/authentication) — which credential goes where
-   [Integrations](/integrations/overview) — manual MCP wiring for agent hosts
-   [Open Source Quickstart](/open-source/quickstart) — run Core locally with `am init --local`
-   [Switch Hosted Cloud and Connected Local](/cloud/faq/switch-cli-profiles) — keep both profiles; switch default vs one-off
