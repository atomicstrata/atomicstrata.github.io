# Composition

> Agent index: [llms.txt](/llms.txt)

AtomicMemory has an **explicit composition root**, a single function, `createCoreRuntime`, that owns every piece of wiring between config, the Postgres pool, repositories, stores, and services. On top of that root, a three-seam design (`createCoreRuntime` → `createApp` → `bindEphemeral`) lets the same engine boot into production HTTP, in-process TypeScript, and ephemeral test harnesses **without forking code paths**. This is the property that makes AtomicMemory usable as a platform layer and not just a server.

This page shows what each seam does, how they compose, and why this shape is a differentiator when you look at the alternatives.

## The three seams

Every consumer of AtomicMemory, the production server, the test suite, a research benchmark, an embedded agent harness, boots through some subset of these three calls:

```typescript
const runtime = createCoreRuntime({ pool });  // seam 1: compose deps into a runtime
const app     = createApp(runtime);            // seam 2: wire HTTP transport onto the runtime
const booted  = await bindEphemeral(app);      // seam 3: bind to an ephemeral port (tests/harnesses)
```

Each seam is a plain function. No global state, no hidden DI container, no framework magic. You pick up exactly the amount of infrastructure you need:

| Consumer | Uses |
| --- | --- |
| Production server | `createCoreRuntime` + `createApp` + `app.listen(PORT)` |
| In-process SDK / research | `createCoreRuntime` → call `runtime.services.memory.*` |
| Integration tests | `createCoreRuntime` + `createApp` + `bindEphemeral` |
| Docker / E2E compose | Same as production; compose manages port + env |

## Seam 1: createCoreRuntime

**File:** [`src/app/runtime-container.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/app/runtime-container.ts)

`createCoreRuntime` is the composition root. It takes an explicit dependency bundle, the Postgres pool plus an optional composition-time config for isolated harnesses, and returns a fully wired `CoreRuntime` containing config, repos, stores, and services:

atomicmemory-core/src/app/runtime-container.ts

```typescript
/**
 * Explicit dependency bundle accepted by `createCoreRuntime`.
 *
 * `pool` is required, the composition root never reaches around to
 * import the singleton `pg.Pool` itself.
 *
 * Optional `config` is for isolated harnesses such as benchmark runs.
 * Server deployments normally omit it and use the env-backed singleton.
 */
export interface CoreRuntimeDeps {
  pool: pg.Pool;
  config?: RuntimeConfig;
}

/** The composed runtime, single source of truth for route registration. */
export interface CoreRuntime {
  config: RuntimeConfig;
  configRouteAdapter: CoreRuntimeConfigRouteAdapter;
  pool: pg.Pool;
  repos: CoreRuntimeRepos;
  /** Domain-facing store interfaces (Phase 5). Will replace repos once migration is complete. */
  stores: CoreStores;
  services: CoreRuntimeServices;
}
```

The function itself is small and deliberately un-clever. It initializes leaf-module config, constructs the six repositories, materializes the eight store implementations, and hands all of them to `MemoryService`:

atomicmemory-core/src/app/runtime-container.ts

```typescript
export function createCoreRuntime(deps: CoreRuntimeDeps): CoreRuntime {
  const { pool } = deps;
  const runtimeConfig = deps.config ?? config;

  // Leaf-module config init. Embedding and LLM modules hold module-local
  // config bound here at composition-root time.
  initEmbedding(runtimeConfig);
  initLlm(runtimeConfig);

  const memory   = new MemoryRepository(pool);
  const claims   = new ClaimRepository(pool);
  const trust    = new AgentTrustRepository(pool);
  const links    = new LinkRepository(pool);
  const entities = config.entityGraphEnabled ? new EntityRepository(pool) : null;
  const lessons  = config.lessonsEnabled     ? new LessonRepository(pool) : null;

  const stores: CoreStores = {
    memory:         new PgMemoryStore(pool),
    episode:        new PgEpisodeStore(pool),
    search:         new PgSearchStore(pool),
    link:           new PgSemanticLinkStore(pool),
    representation: new PgRepresentationStore(pool),
    claim:          claims,
    entity:         entities,
    lesson:         lessons,
    pool,
  };

  const service = new MemoryService(memory, claims, entities ?? undefined, lessons ?? undefined, undefined, config, stores);

  return { config, configRouteAdapter: /* ... */, pool, repos: { memory, claims, trust, links, entities, lessons }, stores, services: { memory: service } };
}
```

Three things are important about this shape:

**It takes `pool` as an argument.** The comment is explicit: *"the composition root never reaches around to import the singleton `pg.Pool` itself."* This is a rule, not an accident. It means tests can pass a test-scoped pool, research harnesses can pass a benchmark-scoped pool, and the production server can pass its production pool, all through the same entry point. No global Pool importer anywhere under `app/`.

**It returns a typed `CoreRuntime`.** Everything downstream, route registration, in-process calls, store access, goes through this typed bundle. There is no "god object" or service locator. If a piece of code wants the memory service, it reads `runtime.services.memory`. If it wants the claim repository for a custom query, it reads `runtime.repos.claims`. The handles are explicit and narrow.

**Optional domains are wired as `null`, not absent.** When `entityGraphEnabled` is false, the runtime stores `entities: null` rather than omitting the field. Downstream code checks `if (!deps.stores.entity) return null;`, the contract is uniform and the disablement is discoverable, not accidental.

## Seam 2: createApp

**File:** [`src/app/create-app.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/app/create-app.ts)

`createApp` is a pure HTTP concern. It takes a composed runtime and returns an Express app, with CORS, body parsing, and routers wired on. It constructs no repos, pools, or services of its own:

atomicmemory-core/src/app/create-app.ts

```typescript
export function createApp(runtime: CoreRuntime): ReturnType<typeof express> {
  const app = express();

  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  app.use('/v1/memories', createMemoryRouter(runtime.services.memory, runtime.configRouteAdapter));
  app.use('/v1/agents',   createAgentRouter(runtime.repos.trust));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
```

The file header makes the boundary explicit: *"Separates composition (done in `runtime-container.ts`) from HTTP transport concerns. Tests and harnesses can create an Express app from any runtime container without touching the server bootstrap."*

That is the key property. Because `createApp` takes an already-composed runtime, you can point HTTP at *any* runtime, a test runtime with a scratch schema, a research runtime with a different config, a runtime with custom stores bound, and the routes don't know or care. Conversely, because composition happens in `createCoreRuntime`, you can use the runtime *without* `createApp` at all when you want to skip HTTP and call services directly in process.

The two seams compose, but they don't *require* each other. That is the whole point.

## Seam 3: bindEphemeral

**File:** [`src/app/bind-ephemeral.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/app/bind-ephemeral.ts)

`bindEphemeral` is the canonical test/harness adapter. It binds an Express app to an OS-assigned ephemeral port and returns the base URL plus a close handle:

atomicmemory-core/src/app/bind-ephemeral.ts

```typescript
export interface BootedApp {
  baseUrl: string;
  close: () => Promise<void>;
}

export async function bindEphemeral(app: ReturnType<typeof express>): Promise<BootedApp> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  return {
    baseUrl: `http://localhost:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
```

It is thirty lines. It could easily be inlined in every test. The reason it isn't is that **inlining invites divergence**, one test would forget to await `'listening'`, another would hard-code a port, a third would leak handles. Naming the primitive and putting it in `app/` makes it the obvious thing to reach for, which keeps every HTTP test using the same pattern.

The file header calls this out directly: *"This is the stable seam for any in-repo test or external research harness that wants to exercise the HTTP contract against a live core server without hard-coding port allocation."*

## Why three seams matters: HTTP ↔ in-process parity

The three-seam design is not a stylistic choice. It is enforced by a contract test that runs in CI on every build.

`research-consumption-seams.test.ts` ([source](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/app/__tests__/research-consumption-seams.test.ts)) boots **one** runtime, wires **one** app, binds it ephemerally, and then proves that writes through one seam are visible through the other:

atomicmemory-core/src/app/\_\_tests\_\_/research-consumption-seams.test.ts

```typescript
describe('Phase 6 research-consumption seams', () => {
  const runtime = createCoreRuntime({ pool });
  const app = createApp(runtime);
  let server: BootedApp;

  beforeAll(async () => {
    await setupTestSchema(pool);
    server = await bindEphemeral(app);
  });

  it('in-process seam: ingest + search via runtime.services.memory', async () => {
    const write = await runtime.services.memory.ingest(TEST_USER, CONVERSATION, 'test-site');
    expect(write.memoriesStored).toBeGreaterThan(0);

    const read = await runtime.services.memory.search(TEST_USER, 'What stack does the user use?');
    expect(read.memories.length).toBeGreaterThan(0);
    expect(read.injectionText.length).toBeGreaterThan(0);
  });

  it('parity: in-process write is observable through the HTTP seam (shared pool)', async () => {
    const write = await runtime.services.memory.ingest(TEST_USER, CONVERSATION, 'test-site');
    const writtenIds = new Set(write.memoryIds);

    const searchRes = await fetch(`${server.baseUrl}/v1/memories/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: TEST_USER, query: 'What stack does the user use?' }),
    });
    const body = await searchRes.json();
    const returnedIds: string[] = body.memories.map((memory: { id: string }) => memory.id);
    const overlap = returnedIds.filter((id) => writtenIds.has(id));

    expect(overlap.length).toBeGreaterThan(0);
  });
});
```

This test does two useful things at once. It documents the canonical in-process and HTTP call patterns, a new consumer can read this file and immediately see how to use the engine. And it makes "HTTP and in-process agree on stored state" into a machine-checked invariant instead of a README claim. The day someone accidentally adds a caching layer that makes the HTTP seam see stale data, this test fails.

## Why this shape is a differentiator

**No hidden singletons.** The `server.ts` file for the production server is fifteen lines of top-level code: import pool, call `createCoreRuntime({ pool })`, call `createApp(runtime)`, listen. Every dependency is threaded explicitly. You can audit the entire boot path by reading two files.

**Tests boot the real engine.** Integration tests don't use mocks-of-mocks. They call `createCoreRuntime` with a test pool, `createApp` on the runtime, and `bindEphemeral` to get a URL. The code under test is bit-for-bit the code running in production, only the pool and config are scoped differently.

**Research harnesses are first-class.** The [Consuming core](/platform/consuming-core) guide documents three official consumption modes, HTTP, in-process runtime container, and docker/E2E compose, and the composition root exposes them all through the same three seams. A research benchmark can run 10,000 in-process ingests without paying HTTP overhead, then flip to HTTP for a parity check, using the same runtime.

## Why this matters vs the alternatives

**vs. mem0.** Mem0's OSS library is a client wrapping a hosted service, or a single-process Python runtime with implicit global state. There is no "bind an ephemeral app to a test pool" story, running an integration test against mem0 means either talking to their cloud or fighting their module-level singletons. AtomicMemory's three-seam design makes local, parallel, and test boots trivial.

**vs. Letta.** Letta's architecture assumes you're running the Letta agent server. Its memory layer is reachable primarily *through* that server. AtomicMemory's `createCoreRuntime` gives you the memory engine as a pure TypeScript object with typed services, you can embed it in a Next.js API route, a long-running worker, a Cloudflare Worker, or a Vitest test with exactly the same code.

**vs. Zep.** Zep is a Go binary. Composition is whatever the binary does; the only customization surface is config flags. AtomicMemory is a TypeScript library that happens to also run an Express server. The composition root is source code you can read, fork, and adapt, not a deploy artifact.

The deeper point: **every boundary is a plain function with a typed argument and a typed return**. `createCoreRuntime({ pool })` returns a `CoreRuntime`. `createApp(runtime)` returns an Express app. `bindEphemeral(app)` returns a `BootedApp`. There is no hidden state between them, which means there is no hidden cost to replacing any one of them.

That is what "standardized platform layer, pluggable at every seam" actually means in code.

## Next steps

-   [Architecture](/platform/architecture), the five domains that live inside `runtime.services.memory`
-   [Stores](/platform/stores), how `CoreStores` lets you swap storage backends
-   [Providers](/platform/providers), how `initEmbedding` and `initLlm` let you swap providers at composition time
-   [Observability](/platform/observability), tracing, timing, and audit events surfaced through the runtime
