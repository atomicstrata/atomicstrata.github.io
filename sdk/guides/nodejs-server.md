# Node.js / server-side

> Agent index: [llms.txt](/llms.txt)

Using the SDK server-side is supported, the package is ESM + CJS, has no browser-only code on its critical path, and the subpath storage primitives run anywhere Node does.

This guide covers the two things that differ from the browser path: storage selection and authorization.

## Storage

`IndexedDBStorageAdapter` is browser-only. Use `MemoryStorageAdapter` for ephemeral / per-process state, or write a custom adapter backed by filesystem / Redis / Postgres.

```typescript
import {
  StorageManager,
  MemoryStorageAdapter,
} from '@atomicmemory/sdk/storage';

const adapter = new MemoryStorageAdapter();
await adapter.initialize();

const storage = new StorageManager([adapter]);
await storage.initialize();
```

Note: `MemoryClient` does not use `StorageManager` internally, storage lives server-side in the active memory backend. Instantiate `StorageManager` only if your app needs its own local key-value store.

## Authorization

`MemoryClient` is a thin HTTP client over the active `MemoryProvider`. It does not enforce any gate before calling the backend. Authorization, who can call which endpoint, for which `scope.user`, is your app's responsibility.

The recommended shape on a server is:

1.  Terminate auth at your HTTP layer (JWT, session cookie, API key).
2.  Derive the caller's `scope` from the validated session.
3.  Call `memory.ingest` / `memory.search` with that scope.

## An Express example

```typescript
import express from 'express';
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: { atomicmemory: { apiUrl: process.env.CORE_URL! } },
});
await memory.initialize();

const app = express();
app.use(express.json());

app.post('/memory', async (req, res) => {
  const { userId, content } = req.body;
  await memory.ingest({
    mode: 'text',
    content,
    scope: { user: userId },
    provenance: { source: 'api' },
  });
  res.status(204).end();
});

app.get('/memory/:userId/search', async (req, res) => {
  const page = await memory.search({
    query: req.query.q as string,
    scope: { user: req.params.userId },
    limit: 10,
  });
  res.json(page);
});

app.listen(3000);
```

Validating `req.params.userId` against the authenticated session is a load-bearing step, the SDK trusts whatever scope you hand it.

## Next

-   [Scopes and identity](/sdk/concepts/scopes-and-identity), the `Scope` shape every operation carries
-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend), production checklist that applies here too
