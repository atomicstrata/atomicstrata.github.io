# Stores

> Agent index: [llms.txt](/llms.txt)

AtomicMemory's storage layer is exposed as a family of **narrow, domain-facing store interfaces**, not a monolithic "repository" that every service has to import. Each consumer sees only the methods it actually uses, and every seam is a plain TypeScript interface you can re-implement against your own backend.

That is the point of the platform layer: the engine's business logic depends on `MemoryStore`, `SearchStore`, `ClaimStore`, `EntityStore`, `EpisodeStore`, and friends, never on a Postgres pool. If you want to run the same services on a different database, a different vector backend, or an in-memory mock for tests, you implement the interfaces. Nothing above the store layer changes.

## The bundled shape

The composition root hands every service a single `CoreStores` bundle. That bundle is the only "god object" in the system, and services destructure it down to the store they care about.

From [`atomicmemory-core/src/db/stores.ts:204-219`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/db/stores.ts#L204-L219):

```ts
export interface CoreStores {
  memory: MemoryStore;
  episode: EpisodeStore;
  search: SearchStore;
  link: SemanticLinkStore;
  representation: RepresentationStore;
  claim: ClaimStore;
  entity: EntityStore | null;
  lesson: LessonStore | null;
  /**
   * Raw pool access for call sites that still need it (PPR, deferred-audn
   * reconciliation, link generation). Will be removed when those paths
   * move behind dedicated store methods.
   */
  pool: pg.Pool;
}
```

Two things to notice:

1.  **`entity` and `lesson` are `null`\-able.** They're feature-flagged (behind `entityGraphEnabled` and `lessonsEnabled`). A consumer that doesn't care about the entity graph never needs an implementation at all.
2.  **`pool` is explicitly called out as tech debt.** The goal is zero direct database access above the store layer. Every seam we close makes the engine more portable.

## The core interfaces

### MemoryStore, memory CRUD and workspace variants

`MemoryStore` is the canonical write+read surface for individual memories. It includes per-user CRUD, bulk operations, statistics, and parallel `…InWorkspace` variants for the workspace/agent isolation model.

From [`stores.ts:60-90`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/db/stores.ts#L60-L90):

```ts
export interface MemoryStore {
  storeMemory(input: StoreMemoryInput): Promise<string>;
  getMemory(id: string, userId?: string): Promise<MemoryRow | null>;
  listMemories(
    userId: string,
    limit?: number,
    offset?: number,
    sourceSite?: string,
    episodeId?: string,
  ): Promise<MemoryRow[]>;
  softDeleteMemory(userId: string, id: string): Promise<void>;
  updateMemoryContent(
    userId: string, id: string, content: string,
    embedding: number[], importance: number,
    keywords?: string, trustScore?: number,
  ): Promise<void>;
  // ... CRUD, stats, bulk operations ...

  // Workspace variants
  getMemoryInWorkspace(
    id: string, workspaceId: string, callerAgentId?: string,
  ): Promise<MemoryRow | null>;
  listMemoriesInWorkspace(
    workspaceId: string, limit?: number, offset?: number,
    callerAgentId?: string,
  ): Promise<MemoryRow[]>;
  softDeleteMemoryInWorkspace(id: string, workspaceId: string): Promise<void>;
}
```

### SearchStore, vector, hybrid, keyword, and dedup

`SearchStore` is the retrieval surface. Vector search, hybrid search, keyword search, atomic-fact search, near-duplicate detection, temporal neighbors, and the id-hydration path all live here.

From [`stores.ts:105-117`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/db/stores.ts#L105-L117):

```ts
export interface SearchStore {
  searchSimilar(
    userId: string, queryEmbedding: number[], limit: number,
    sourceSite?: string, referenceTime?: Date,
  ): Promise<SearchResult[]>;
  searchHybrid(
    userId: string, queryText: string, queryEmbedding: number[],
    limit: number, sourceSite?: string, referenceTime?: Date,
  ): Promise<SearchResult[]>;
  searchKeyword(
    userId: string, queryText: string, limit: number, sourceSite?: string,
  ): Promise<SearchResult[]>;
  findNearDuplicates(
    userId: string, embedding: number[], threshold: number, limit?: number,
  ): Promise<CandidateRow[]>;
  findTemporalNeighbors(
    userId: string, anchorTimestamps: Date[], queryEmbedding: number[],
    windowMinutes: number, excludeIds: Set<string>, limit: number,
    referenceTime?: Date,
  ): Promise<SearchResult[]>;
  fetchMemoriesByIds(
    userId: string, ids: string[], queryEmbedding: number[],
    referenceTime?: Date, includeExpired?: boolean,
  ): Promise<SearchResult[]>;
  // Workspace variants follow the same pattern.
}
```

Notice that `SearchStore` and `MemoryStore` are **separate interfaces** even though the Postgres implementation happens to use the same pool. A service that does pure retrieval (e.g. a read-only embedding gateway) never has to depend on the write surface.

### Supporting stores

-   **`EpisodeStore`**, session/episode lifecycle (`storeEpisode`, `getEpisode`).
-   **`SemanticLinkStore`**, create links between memories, find link candidates, traverse link neighborhoods.
-   **`RepresentationStore`**, atomic facts + foresight projections derived from raw memories.

---

## The Pick<>-narrowing pattern

Three of the stores, `ClaimStore`, `EntityStore`, `LessonStore`, aren't hand-written interfaces. They're **type-level projections** of the underlying repository class, narrowed to exactly the methods domain consumers call.

From [`stores.ts:147-165`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/db/stores.ts#L147-L165):

```ts
export type ClaimStore = Pick<import('./repository-claims.js').ClaimRepository,
  | 'addEvidence'
  | 'createClaim'
  | 'createClaimVersion'
  | 'createUpdateVersion'
  | 'findClaimByMemoryId'
  | 'getActiveClaimTargetBySlot'
  | 'getClaimVersionByMemoryId'
  | 'getRecentMutations'
  | 'getReversalChain'
  | 'getUserMutationSummary'
  | 'invalidateClaim'
  | 'listClaimsMissingSlots'
  | 'searchClaimVersions'
  | 'setClaimCurrentVersion'
  | 'supersedeClaimVersion'
  | 'updateClaimSlot'
  | 'deleteAll'
>;
```

And [`stores.ts:171-184`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/db/stores.ts#L171-L184):

```ts
export type EntityStore = Pick<import('./repository-entities.js').EntityRepository,
  | 'resolveEntity'
  | 'linkMemoryToEntity'
  | 'getEntitiesForMemory'
  | 'getEntity'
  | 'searchEntities'
  | 'findEntitiesByName'
  | 'findMemoryIdsByEntities'
  | 'findRelatedEntityIds'
  | 'findDeterministicEntity'
  | 'getRelationsForMemory'
  | 'upsertRelation'
  | 'countEntities'
>;
```

### Why narrowing matters

The `ClaimRepository` class has **many more methods** than those seventeen , internal helpers, admin tools, migration utilities, debugging surfaces. Any of them could technically be called by a downstream service. That's exactly the problem `Pick<>` solves.

By exposing `ClaimStore` as a projection of the seventeen methods the claim pipeline actually calls, we get three things for free:

1.  **A contract, not a class.** Consumers depend on a structural type. They can't accidentally reach into implementation internals, and an alternative backend (SQLite, DuckDB, an HTTP adapter, a test mock) only has to implement those seventeen methods, not the whole repository.
2.  **Refactors are safe in one direction.** Adding a new method to `ClaimRepository` can never break consumers of `ClaimStore`. The narrowed surface is invariant to repository growth.
3.  **Dead-code pressure on the repository.** If a method is in the class but not in the `Pick<>`, it's a candidate for deletion. The narrowed type becomes a living record of what's actually on the hot path.

This is the pattern we want across the whole platform layer: **domain consumers depend on the smallest viable surface, and the concrete backend is swappable behind it.**

---

## Implementing a store

Stores are plain interfaces. The shipped `Pg*` implementations in `src/db/pg-*-store.ts` delegate to split repository modules, but they're not the only shape that works.

From [`atomicmemory-core/src/db/pg-memory-store.ts:33-56`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/db/pg-memory-store.ts#L33-L56):

```ts
export class PgMemoryStore implements MemoryStore {
  constructor(private pool: pg.Pool) {}

  async storeMemory(input: StoreMemoryInput) {
    return storeMemory(this.pool, input);
  }
  async getMemory(id: string, userId?: string) {
    return getMemory(this.pool, id, userId, false);
  }
  async listMemories(
    userId: string, limit = 20, offset = 0,
    sourceSite?: string, episodeId?: string,
  ) {
    return listMemories(this.pool, userId, limit, offset, sourceSite, episodeId);
  }
  // ... the rest forwards to repository-read.ts / repository-write.ts ...
}
```

`PgSearchStore` follows the same shape, the constructor takes a pool, and each method forwards to a pure function in the read/links modules. See [`pg-search-store.ts:23-65`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/db/pg-search-store.ts#L23-L65).

Because the store is an interface, **you can implement it any way you want**:

-   An in-memory Map for tests.
-   An HTTP adapter that forwards calls to a remote Atomicmemory service.
-   A SQLite-backed implementation for a single-user desktop install.
-   A composed store that reads from one backend and writes to another (for migrations or replication).

The services above don't change.

---

## How the composition root wires it up

All of the above comes together in `createCoreRuntime`. The runtime container is the one place that knows which concrete implementations we're using.

From [`atomicmemory-core/src/app/runtime-container.ts:194-211`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/app/runtime-container.ts#L194-L211):

```ts
const memory = new MemoryRepository(pool);
const claims = new ClaimRepository(pool);
const trust = new AgentTrustRepository(pool);
const links = new LinkRepository(pool);
const entities = config.entityGraphEnabled ? new EntityRepository(pool) : null;
const lessons = config.lessonsEnabled ? new LessonRepository(pool) : null;

const stores: CoreStores = {
  memory: new PgMemoryStore(pool),
  episode: new PgEpisodeStore(pool),
  search: new PgSearchStore(pool),
  link: new PgSemanticLinkStore(pool),
  representation: new PgRepresentationStore(pool),
  claim: claims,          // ClaimRepository structurally satisfies ClaimStore
  entity: entities,       // narrowed to EntityStore at the boundary
  lesson: lessons,
  pool,
};
```

Two details worth calling out:

-   `claims`, `entities`, and `lessons` are assigned directly, the repository classes satisfy the narrowed store types **because the types were built from them**. No adapter class needed.
-   Feature flags (`entityGraphEnabled`, `lessonsEnabled`) decide whether the backing repository is constructed at all. The store bundle carries the `null` into every consumer that destructures it.

## Compose-your-own-stack

This is the AtomicMemory platform thesis. You should be able to:

-   Keep `PgMemoryStore` and replace `PgSearchStore` with one that talks to a managed vector DB.
-   Keep the write path and swap `SearchStore` for a hybrid store that fans out to multiple backends.
-   Run the whole engine against in-memory stores during CI to get millisecond test iteration.
-   Implement `ClaimStore` on top of a different transactional backend while leaving `MemoryStore` on Postgres.

Every one of those compositions is a matter of implementing a narrow interface and handing the bundle to `createCoreRuntime`. No forks, no patches, no SDK rewrites.

That's what we mean by "pluggable at every seam".

## Related

-   [Providers](/platform/providers), the pluggable embedding + LLM layer that sits alongside stores.
-   [Composition](/platform/composition), how the runtime container wires stores, providers, services, and routes.
