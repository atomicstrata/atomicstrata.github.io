# Using the atomicmemory backend

> Agent index: [llms.txt](/llms.txt)

`AtomicMemoryProvider` is the SDK's HTTP client for [atomicmemory-core](/). It ships with the SDK and is the default backend when you configure `default: 'atomicmemory'`.

## Wire it up

```typescript
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'https://core.example.com',
      apiKey: process.env.CORE_API_KEY,   // bearer token for protected core deployments
      timeout: 30000,                      // ms; optional
      apiVersion: 'v1',                    // default 'v1'
    },
  },
});

await memory.initialize();
```

## Health check

Before traffic flows, confirm the backend is reachable:

```typescript
const caps = memory.capabilities();
const status = memory.getProviderStatus();
console.log(status);
// [{ name: 'atomicmemory', initialized: true, capabilities: { ... } }]
```

For a deeper liveness check, hit the core `/v1/memories/health` endpoint directly, it returns the full config snapshot (embedding / LLM provider, thresholds).

The local Docker quickstart uses `local-dev-key` as its default bearer token. Production deployments should set an explicit `CORE_API_KEY` on core and pass the same value as `apiKey` in the SDK config.

## One ingest, one search

```typescript
await memory.ingest({
  mode: 'text',
  content: 'Prefer gRPC over REST for internal service-to-service calls.',
  scope: { user: 'alice' },
  provenance: { source: 'manual' },
});

const page = await memory.search({
  query: 'internal service communication',
  scope: { user: 'alice' },
  limit: 5,
});
```

Every SDK method has a corresponding HTTP endpoint on core. Useful if you're debugging wire traffic or comparing behaviour across clients:

| SDK method | HTTP endpoint | Endpoint docs |
| --- | --- | --- |
| `ingest` | `POST /v1/memories/ingest` | [Ingest](/api-reference/http/ingest-memory) |
| `search` | `POST /v1/memories/search` | [Search](/api-reference/http/search-memories) |
| `package` | `POST /v1/memories/search` with packaging params | [Search](/api-reference/http/search-memories) |
| `list` | `GET /v1/memories/list` | [List](/api-reference/http/list-memories) |
| `get` | `GET /v1/memories/:id` | [Get](/api-reference/http/get-memory) |
| `delete` | `DELETE /v1/memories/:id` | [Delete](/api-reference/http/delete-memory) |

## Verbatim ingest, idempotent by your own id

`mode: 'verbatim'` stores the content as a single record without LLM extraction — use it for context blobs where extraction would over-split or yield nothing. Stamp a caller-owned `metadata.externalId` to make re-ingest idempotent: re-ingesting the same id updates the existing record in place instead of creating a duplicate (you can also fetch it back with [GET /v1/memories/by-external-id](/api-reference/http/get-memory-by-external-id)).

Verbatim content is stored raw, so a core running the default `RAW_CONTENT_POLICY=reject` refuses it unless you stamp a non-raw `contentClass`. Choose the class that matches what you're actually sending — the SDK never labels content for you, so an unstamped (or `'raw'`) verbatim ingest fails closed against a `reject` core rather than mislabeling raw content as safe:

```typescript
await memory.ingest({
  mode: 'verbatim',
  content: 'Q3 planning summary: ship the gRPC migration, defer the REST shim.',
  scope: { user: 'alice' },
  contentClass: 'summary', // 'summary' | 'redacted' | 'raw'
  metadata: { externalId: 'q3-planning-summary' },
});
```

Sending genuinely raw transcripts? Either `redact` them first and pass `contentClass: 'redacted'`, or set `RAW_CONTENT_POLICY=allow` on a deployment you control.

## Supported extensions

`AtomicMemoryProvider` declares the following extensions. Apps can rely on all of them:

-   `package`, context packaging with token budgets
-   `temporal`, `searchAsOf` for point-in-time queries
-   `versioning`, `history()` per memory ref
-   `update`, in-place updates
-   `health`, liveness probe

Run `memory.capabilities()` at init and cache the result, you'll know exactly what's available without calling around.

## Production checklist

-   **`apiKey`**, set a bearer token on the SDK side and a matching gate on core. Don't rely on `testMode` identity in production.
-   **`timeout`**, the default 30s is fine for most paths. Tighten for latency-sensitive UIs; loosen for batch workloads that trigger large searches.
-   **`apiVersion`**, pin to the version your core is on. Leave as `'v1'` unless you've deployed a different API version.
-   **Network reachability**, core runs on port `17350` by default. Verify from your deployment target (container? serverless? browser?) that the URL resolves.

## Next

-   [Swapping backends](/sdk/guides/swapping-backends), moving memories from atomicmemory to another provider
-   [Using the Mem0 backend](/sdk/guides/mem0-backend), [Hindsight](/sdk/guides/hindsight-backend), and [llmwiki](/sdk/guides/llmwiki-backend), the alternate paths
