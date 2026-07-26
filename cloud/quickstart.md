# Add Atomic Memory

> Agent index: [llms.txt](/llms.txt)

Add **Atomic Memory** — managed memory hosting — after your local Core is running. This page depends on the [Platform Quickstart](/quickstart): run `am init` first if you have not already.

**Console:** [memory.atomicstrata.ai](https://memory.atomicstrata.ai)  
**API:** `https://api.atomicstrata.ai`

1.  1Upgrade to FreeConsole → Billing
2.  2Create Cloud projectcopy the one-time `amc_…` key
3.  3Ingest + search`am memory ingest`
4.  4Verify in consoleMemories + Traces

## Prerequisites

-   Completed [Platform Quickstart](/quickstart) — Connected Local via `am init`
-   Upgrade to **Free** in the console (self-serve, $0): **Billing** → **Upgrade to Free**. Free keeps your Local project and unlocks one Atomic Memory project.

## Add Atomic Memory

1.  Console → **Billing** → **Upgrade to Free**
2.  Create an **Atomic Memory** project and copy the one-time API key (`amc_…`)
3.  Ingest and search from anywhere:

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx

am memory ingest "I prefer aisle seats when flying."
am memory search "seat preference"
```

## Success state

Open the console under **Memories**. Your ingested memory appears there, with a matching trace under **Traces**. That confirms the Atomic Memory project is receiving traffic.

## SDK alternative

```bash
npm install @atomicmemory/sdk
```

```typescript
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'https://api.atomicstrata.ai',
      apiKey: process.env.ATOMICMEMORY_API_KEY,
    },
  },
});

await memory.ingest({
  messages: [{ role: 'user', content: 'I prefer aisle seats when flying.' }],
  scope: { user: 'user_001' },
});

const results = await memory.search({
  query: 'seat preference',
  scope: { user: 'user_001' },
});
```

## Moving existing local memories

Already have memories in your Connected Local project? `am migrate export` and `am migrate import` move them into your new Atomic Memory project. See [Migrate to Atomic Memory](/cloud/how-to/migrate) for prerequisites, the memory-only scope, safe re-run behavior, and how to verify the result in the console.

## What's next

-   [Developer Console](/cloud/console) — traces, usage, API keys
-   [Migrate to Atomic Memory](/cloud/how-to/migrate) — bring existing Local memories over
-   [Authentication](/cloud/authentication) — which credential goes where
-   [Integrations](/integrations/overview) — MCP and agent wiring

Something not working? See [Troubleshooting](/cloud/troubleshooting).
