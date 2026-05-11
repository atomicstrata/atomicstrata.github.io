# Browser primitives

> Agent index: [llms.txt](/llms.txt)

note

This guide bypasses `MemoryClient`. You get storage, local embeddings, and semantic search, but no provider, no extensions, no remote sync. If you want a backend-agnostic client, start at [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend) instead.

The `/storage`, `/embedding`, and `/search` subpath exports work on their own. You can build client-side semantic search over your app's data without ever constructing `MemoryClient`, and without a memory backend of any kind.

This is the right path when:

-   The data is local to the browser and should not leave
-   You want to prototype without standing up a server
-   You already have application state and just want similarity search over it
-   You're embedding a small, bounded corpus (bundled docs, site content)

## The pipeline

```typescript
import {
  StorageManager,
  IndexedDBStorageAdapter,
} from '@atomicmemory/atomicmemory-sdk/storage';
import { EmbeddingGenerator } from '@atomicmemory/atomicmemory-sdk/embedding';
import { SemanticSearch } from '@atomicmemory/atomicmemory-sdk/search';

// 1. Storage
const adapter = new IndexedDBStorageAdapter();
await adapter.initialize({ dbName: 'my-app' });
const storage = new StorageManager([adapter]);
await storage.initialize();

// 2. Embeddings
const generator = new EmbeddingGenerator({
  model: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  provider: 'transformers',
});

// 3. Index some documents
const docs = [
  { id: '1', text: 'Prefer gRPC for internal service calls.' },
  { id: '2', text: 'Dark mode uses prefers-color-scheme.' },
  { id: '3', text: 'Postgres pgvector supports cosine distance.' },
];

for (const doc of docs) {
  const { embedding } = await generator.generateEmbedding(doc.text);
  await storage.set(`doc:${doc.id}`, {
    ...doc,
    embedding: Array.from(embedding),
  });
}

// 4. Search
const { embedding: queryVec } = await generator.generateEmbedding(
  'service communication',
);

const keys = await storage.keys();
const entries = await Promise.all(
  keys
    .filter((k) => k.startsWith('doc:'))
    .map((k) => storage.get<{ id: string; text: string; embedding: number[] }>(k)),
);

const search = new SemanticSearch();
const results = search.searchSimilar(queryVec, entries.filter((e) => e !== null));

for (const hit of results.slice(0, 3)) {
  console.log(hit.score.toFixed(3), hit.item.text);
}
```

The exact `SemanticSearch` API differs slightly by version, import the types from `@atomicmemory/atomicmemory-sdk/search` and read the shape. The pattern is always: vectorize the query, score it against stored vectors, rank.

## When to graduate to MemoryClient

The moment you need any of these, switch to the top-level client:

-   Remote sync to `atomicmemory-core` or Mem0
-   Multi-device memory
-   Server-side embedding for larger corpora
-   The AUDN mutation model (add / update / delete / no-op) for contradiction-safe writes
-   Context packaging, temporal search, versioning

At that point, the backend owns storage and embedding; the subpath primitives drop out of your data path.

## Trade-offs

| You get | You don't get |
| --- | --- |
| Zero-backend prototyping | Remote sync |
| Data stays on the device | Cross-session persistence unless you use IndexedDB |
| Full control of the indexing strategy | AUDN, versioning, observability |

Both modes are legitimate. Pick the one that matches the constraint.

## Next

-   [Embeddings](/sdk/concepts/embeddings), the default model and caching behaviour
-   [Storage adapters](/sdk/concepts/storage-adapters), the adapter interface if `IndexedDBStorageAdapter` doesn't fit
