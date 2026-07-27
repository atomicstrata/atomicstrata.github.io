# Quickstart: give an assistant memory

> Agent index: [llms.txt](/llms.txt)

**Outcome:** store one travel preference, retrieve it in a later request, and confirm both operations in the console.

**You need:** a Node.js project and an account at [memory.atomicstrata.ai](https://memory.atomicstrata.ai). Nothing to install or operate beyond the client library.

1.  1Create a projectGet an API key from the console.
2.  2Remember a preferenceWrite one durable fact for a user.
3.  3Use it laterRetrieve it and see the trace in the console.

## 1. Create a project and get a key

1.  Sign in at [memory.atomicstrata.ai](https://memory.atomicstrata.ai).
2.  Go to **Billing** → **Upgrade to Free**. Free is self-serve and costs $0.
3.  Create a project and copy the API key (`amc_…`). It is shown once.

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx
```

## 2. Remember a travel preference

Install the client:

```bash
npm install @atomicmemory/sdk
```

Write something the assistant should know next time:

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
```

The `scope` says who this memory belongs to. Every write and every read names a scope, so one user's context never leaks into another's.

## 3. Retrieve it for the next task

On a later request — a different conversation, a different day — ask the question that needs the preference:

```typescript
const results = await memory.search({
  query: 'Which seat should I book?',
  scope: { user: 'user_001' },
});
```

Success looks like a result about the aisle-seat preference. That result is the context your application passes to a model before it answers the person.

## 4. Inspect the result

Open the console. Under **Memories** you see the stored content; under **Traces** you see the ingest and the search, each with its call type, timing, and reconciliation decision.

Something not working? See [Troubleshooting](/cloud/troubleshooting).

## What you just built

You completed the smallest durable-memory loop: write a preference, retrieve it for a later request, and inspect the operations that made it happen. Next, see how scopes, corrections, and version history keep that loop safe in a real application: [How memory works](/how-memory-works).

## Next steps

-   [How memory works](/how-memory-works) — scopes, corrections, provenance, and lifecycle
-   [Developer Console](/cloud/console) — traces, usage, and API keys
-   [Authentication](/cloud/authentication) — which credential goes where
-   [Integrations](/integrations/overview) — MCP and agent wiring
