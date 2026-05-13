# Consuming atomicmemory-core

> Agent index: [llms.txt](/llms.txt)

`atomicmemory-core` can be used as a network service, embedded in a Node process, or booted as a containerized release target. Pick the path based on how much control you need over the runtime boundary.

## Choose a mode

-   **Use HTTP** when you want a stable service boundary, any-language clients, or a core deployment shared by multiple applications.
-   **Use in-process core** when you are writing a Node harness, test suite, benchmark, or tightly controlled service that needs direct access to the runtime.
-   **Use Docker / E2E** when you need to validate the packaged service exactly as it ships.

## Three consumption modes

| Mode | Entry point | Use when |
| --- | --- | --- |
| **HTTP** | `POST /v1/memories/ingest`, `POST /v1/memories/search`, etc. | Black-box integration, language-agnostic clients, extension/SDK |
| **In-process** | `createCoreRuntime({ pool })` | TypeScript/Node code that wants no HTTP overhead |
| **Docker/E2E** | `docker-compose.smoke-isolated.yml` + `scripts/docker-smoke-test.sh` | Release validation, extension E2E, containerized CI |

All three are designed to converge on the same composition root (`createCoreRuntime`). A parity test, [`research-consumption-seams.test.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/app/__tests__/research-consumption-seams.test.ts), guards the main ingest/search path across modes.

## HTTP

Boot core as a server (`npm start`) and issue JSON requests. Snake\_case on the wire.

This is the most portable integration path. If you are writing TypeScript and do not need direct HTTP control, use [`@atomicmemory/sdk`](/sdk/overview) on top of this API instead of hand-rolling request wrappers.

```ts
const res = await fetch('http://localhost:3050/v1/memories/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'alice',
    conversation: 'user: I ship Go on the backend.',
    source_site: 'my-app',
  }),
});
const {
  episode_id,
  memories_stored,
  stored_memory_ids,
  updated_memory_ids,
} = await res.json();
```

```ts
const res = await fetch('http://localhost:3050/v1/memories/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 'alice', query: 'what stack?' }),
});
const { count, injection_text, memories } = await res.json();
```

The full endpoint surface and response shapes are documented under [HTTP API Reference](/api-reference/http/conventions), rendered from `openapi.yaml` at the core repo's root.

### Per-request config_override

`config_override` is an advanced control for tests, evaluations, and controlled experiments. Production applications should prefer fixed startup configuration unless they intentionally need per-request policy variation.

All four memory routes (`/search`, `/search/fast`, `/ingest`, `/ingest/quick`) accept an optional `config_override` body field that overlays the startup `RuntimeConfig` for the scope of that one request. Scope is strictly per-request; the startup singleton is not mutated.

```ts
const res = await fetch('http://localhost:3050/v1/memories/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'alice',
    query: 'what stack?',
    config_override: { hybridSearchEnabled: true, maxSearchResults: 20 },
  }),
});

// Observability headers (only emitted when an override is present)
res.headers.get('X-Atomicmem-Config-Override-Applied');   // 'true'
res.headers.get('X-Atomicmem-Effective-Config-Hash');     // 'sha256:<hex>'
res.headers.get('X-Atomicmem-Config-Override-Keys');      // 'hybridSearchEnabled,maxSearchResults'
res.headers.get('X-Atomicmem-Unknown-Override-Keys');     // null unless a key doesn't match a current RuntimeConfig field
```

Shape: a flat object whose values are primitives (boolean, number, string, null). Keys should be `RuntimeConfig` field names. The schema is permissive: unknown keys are accepted and carried through, and surface via the `X-Atomicmem-Unknown-Override-Keys` response header plus a server-side warning log rather than a 400, so adding a new overlay-eligible `RuntimeConfig` field in a future release doesn't require a matching schema landing before consumers can use it.

Effective config semantics: `{ ...startup, ...override }` (shallow merge). `maxSearchResults` in an override is fully respected, the request-limit clamp uses the post-override value, not the startup snapshot.

## In-process

Import the composition root and call services directly. This is useful for Node code that owns the database connection and wants core behavior without an HTTP hop.

Before using this mode, make sure:

-   The Postgres database is reachable and has the core schema applied.
-   Required env vars are set before importing `@atomicmemory/core`, or an explicit `RuntimeConfig` is passed to `createCoreRuntime`.
-   Your process owns runtime lifecycle concerns such as pool shutdown and test isolation.

```ts
import pg from 'pg';
import { config, createCoreRuntime } from '@atomicmemory/core';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const runtime = createCoreRuntime({ pool });

const voyageApiKey = process.env.VOYAGE_API_KEY;
if (!voyageApiKey) {
  throw new Error('VOYAGE_API_KEY is required for the Voyage benchmark runtime');
}

const voyageRuntime = createCoreRuntime({
  pool,
  config: {
    ...config,
    embeddingProvider: 'voyage',
    embeddingDimensions: 1024,
    voyageApiKey,
    voyageDocumentModel: 'voyage-4-large',
    voyageQueryModel: 'voyage-4-lite',
  },
});

const write = await runtime.services.memory.ingest(
  'alice',
  'user: I ship Go on the backend.',
  'my-app',
);

const read = await runtime.services.memory.search('alice', 'what stack?');
```

Stable imports from the root export:

-   `createCoreRuntime`, `CoreRuntime`, `CoreRuntimeDeps`
-   `createApp`, build the Express app from a runtime
-   `bindEphemeral`, bind the app to an ephemeral port (for tests)
-   `checkEmbeddingDimensions`, startup guard
-   `MemoryService`, `IngestResult`, `RetrievalResult`

**Config caveat.** `createCoreRuntime({ pool, config })` is intended for isolated single-runtime harnesses such as benchmark runs. Embedding and LLM modules still hold module-local provider state, so do not keep two concurrently-active runtimes with different embedding/LLM configs in one Node process. Use a fresh process or fresh isolated runtime lifecycle per provider/model configuration.

## Docker / E2E

The canonical compose file for isolated end-to-end runs is `docker-compose.smoke-isolated.yml`. Driven by `scripts/docker-smoke-test.sh`.

Key env overrides:

-   `APP_PORT` (default `3061`), host port bound to the core container's 3050
-   `POSTGRES_PORT` (default `5444`), host port for the pgvector container
-   `EMBEDDING_PROVIDER` / `EMBEDDING_MODEL` / `EMBEDDING_DIMENSIONS`, already wired to `transformers` / `Xenova/all-MiniLM-L6-v2` / `384` for offline runs

Use this mode for extension E2E, release validation, or any harness that needs to treat core exactly as it ships.

## Stability boundary

-   **Stable:** the root package export. Types and functions re-exported from `src/index.ts` are the supported consumption surface.
-   **Unstable:** deep-path imports (`@atomicmemory/core/services/*`, `@atomicmemory/core/db/*`). These exist in `package.json` today for migration convenience and will be narrowed. Consumers should prefer the root export and open an issue if something they need is missing.

### Deep-path init requirement

Two service modules hold config as module-local state and require an explicit init before their hot-path APIs work:

-   `@atomicmemory/core/services/embedding`, `embedText` / `embedTexts` throw unless `initEmbedding(config)` has been called.
-   `@atomicmemory/core/services/llm`, the `llm` / `createLLMProvider` APIs throw unless `initLlm(config)` has been called.

**Consumers going through `createCoreRuntime({ pool })` are auto-initialized**, the composition root calls both inits internally. If you deep-import these modules directly (unstable path), you must call the init yourself:

```ts
import {
  initEmbedding,
  initLlm,
  config, // or your own EmbeddingConfig / LLMConfig object
} from '@atomicmemory/core';

initEmbedding(config);
initLlm(config);

// Now embedText / embedTexts / llm.chat work.
```

`initEmbedding`, `initLlm`, `EmbeddingConfig`, and `LLMConfig` are re-exported from the root for this purpose. Explicit init is the preferred pattern, the modules will throw with an actionable error message if you forget.

Rationale: provider/model selection is startup-only, so module-local state after an explicit init matches the effective contract without the cross-module coupling to `config.ts`.

## Config surface: supported vs experimental

Runtime config is split into two contracts. The split is documented in `src/config.ts` via `SUPPORTED_RUNTIME_CONFIG_FIELDS` and `INTERNAL_POLICY_CONFIG_FIELDS`. A partition test (`src/__tests__/config-partition.test.ts`) enforces disjointness and full coverage, any new `RuntimeConfig` field must be tagged into one bucket.

-   **`SupportedRuntimeConfig`**, fields with a stable contract. Consumers may rely on their semantics, defaults, and presence. Breaking changes go through a documented deprecation cycle. This is where infrastructure (database, port), provider/model selection (embedding, LLM, cross-encoder), and major feature toggles (entity graph, lessons, repair loop, agentic retrieval, etc.) live.
-   **`InternalPolicyConfig`**, experimental / tuning flags. Thresholds, scoring weights, MMR/PPR lambdas, staging internals, affinity-clustering knobs, entropy-gate parameters, composite-grouping parameters, etc. **No stability guarantee.** These may be renamed, re-defaulted, or removed between minor versions. Consumers must not persist values in deployment configs expecting them to remain meaningful. Promoted to the supported set when a field's behavior stabilizes.

Both types are re-exported from the root package. Docs, code review, and release notes should reference `SUPPORTED_RUNTIME_CONFIG_FIELDS` as the authoritative list of what's stable.

### PUT /v1/memories/config, dev/test only

`PUT /v1/memories/config` is gated by the startup-validated flag `runtimeConfigMutationEnabled` (env: `CORE_RUNTIME_CONFIG_MUTATION_ENABLED`).

-   **Production** deploys leave the flag unset → the route returns `410 Gone`. Production config must come from env vars at process start, not runtime HTTP mutation.
-   **Dev / test** deploys set `CORE_RUNTIME_CONFIG_MUTATION_ENABLED=true` → the route mutates the runtime singleton. `.env.test` has this set by default so local test runs and CI continue to work.

Even in dev/test, provider/model fields (`embedding_provider`, `embedding_model`, `voyage_api_key`, `voyage_document_model`, `voyage_query_model`, `llm_provider`, `llm_model`) are rejected with 400, these are composition-time because the embedding/LLM provider caches are fixed for a runtime. Set them via env vars before server startup, or pass a full `RuntimeConfig` when creating an isolated in-process runtime. Only `similarity_threshold`, `audn_candidate_threshold`, `clarification_conflict_threshold`, and `max_search_results` are mutable through this route.

Routes read the flag from a memoized startup snapshot through `configRouteAdapter.current().runtimeConfigMutationEnabled`, they never re-check `process.env` at request time, matching the workspace rule that config is validated once at startup.
