# SDK Quickstart

> Agent index: [llms.txt](/llms.txt)

Install, initialize, and make your first ingest and search, with `MemoryClient` wired to a running `atomicmemory-core`.

## Prerequisites

-   **Node.js 22+** (FOC/Filecoin storage paths require Node 24+)
-   **A running `atomicmemory-core`**, follow the [Core Quickstart](/quickstart) if you have not yet brought one up; we assume `http://localhost:17350` below

## Step 1, Install

```bash
npm install @atomicmemory/sdk
```

Also works with `pnpm add` / `yarn add`.

## Step 2, Initialize

`MemoryClient` needs one thing: a `providers` map telling it which memory backend(s) to use and how to reach them.

```typescript
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'http://localhost:17350',
      apiKey: 'local-dev-key',
    },
  },
});

await memory.initialize();
```

The `atomicmemory` key is the provider id the client uses to route calls; the nested object is the provider adapter's config. See [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend) for the full config shape (`apiKey`, `timeout`, `apiVersion`).

If you configure more than one provider, pass `defaultProvider` to pick which one receives un-qualified calls:

```typescript
new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'http://localhost:17350',
      apiKey: 'local-dev-key',
    },
    mem0: { apiUrl: 'http://localhost:8888', pathPrefix: '' },
  },
  defaultProvider: 'atomicmemory',
});
```

## Step 3, Ingest a memory

```typescript
await memory.ingest({
  mode: 'text',
  content: 'JavaScript closures capture variables from their lexical scope.',
  scope: { user: 'demo-user' },
  provenance: { source: 'manual' },
});
```

Or from a conversation:

```typescript
await memory.ingest({
  mode: 'messages',
  messages: [
    { role: 'user', content: 'I prefer aisle seats.' },
    { role: 'assistant', content: 'Noted.' },
  ],
  scope: { user: 'demo-user' },
});
```

`ingest` takes a single `IngestInput`. Any capture-gating policy ("should this conversation be saved at all?") lives in your application, not in the SDK.

## Step 4, Search

```typescript
const page = await memory.search({
  query: 'How do closures work?',
  scope: { user: 'demo-user' },
  limit: 5,
});

for (const { memory: record, score } of page.results) {
  console.log(score.toFixed(3), record.content);
}
```

Similarly, `search` takes a single `SearchRequest`. Injection-gating ("should this result ever be shown on this site?") is also an application-layer concern.

## Optional, Register An Artifact

If your app also needs to reference files or raw bytes, use `AtomicMemoryClient.storage`. Pointer artifacts work against the default pointer-only core configuration; managed uploads require the server to opt into `RAW_STORAGE_MODE=managed_blob`.

```typescript
import { AtomicMemoryClient } from '@atomicmemory/sdk';

const client = new AtomicMemoryClient({
  apiUrl: 'http://localhost:17350',
  apiKey: process.env.ATOMICMEMORY_API_KEY!,
  userId: 'demo-user',
  memory: {
    providers: {
      atomicmemory: {
        apiUrl: 'http://localhost:17350',
        apiKey: 'local-dev-key',
      },
    },
  },
});

const artifact = await client.storage.put({
  mode: 'pointer',
  uri: 'https://example.com/manual.pdf',
  contentType: 'application/pdf',
});
```

See [Artifact storage](/sdk/guides/artifact-storage) for managed uploads, Filecoin caveats, verification, and Python examples.

## This is the whole round trip

`initialize` → `ingest` → `search`. Every other method (`get`, `delete`, `list`, `package`, `capabilities`, `getExtension`, `getProviderStatus`) is reachable on the same `memory` object. Backend-specific admin, lifecycle reset, audit trails, lesson lists, agent trust, is reachable via the `atomicmemory` namespace handle:

```typescript
const handle = memory.atomicmemory;
if (handle) {
  await handle.lifecycle.resetSource('demo-user', 'manual');
  const stats = await handle.lifecycle.stats('demo-user');
}
```

For the full surface, see the [API Reference overview](/sdk/api/overview).

## What next

-   Understand the pluggable-backend story in [Provider model](/sdk/concepts/provider-model).
-   Register or upload files with [Artifact storage](/sdk/guides/artifact-storage).
-   Swap `atomicmemory` for a different backend in [Using the Mem0 backend](/sdk/guides/mem0-backend) or [Writing a custom provider](/sdk/guides/custom-provider).
-   Build memory features without a backend at all using [Browser primitives](/sdk/guides/browser-primitives).
