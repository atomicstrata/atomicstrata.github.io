# Using the Hindsight backend

> Agent index: [llms.txt](/llms.txt)

`HindsightProvider` is the SDK's HTTP client for [Hindsight](https://github.com/vectorize-io/hindsight), Vectorize's memory engine built around per-user memory *banks* with retain, recall, and reflect operations. It works with Hindsight Cloud or a self-hosted Hindsight server.

> **Support status.** Hindsight compatibility is available for core operations plus packaging, reflection, and health. Prefer `atomicmemory-core` when you need AtomicMemory-specific capabilities such as temporal search, versioning, audit trails, lessons, and runtime config.

## Wire it up

```typescript
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    hindsight: {
      apiUrl: 'http://localhost:8888',
      apiKey: process.env.HINDSIGHT_API_KEY, // optional bearer token
      timeout: 30000,
      apiVersion: 'v1',        // default
      projectId: 'default',    // default
    },
  },
});

await memory.initialize();
```

Two optional tuning fields control recall depth and context size: `defaultBudget` (`'low' | 'mid' | 'high'`) sets the fallback recall search depth, and `defaultMaxTokens` sets the fallback token budget for `package`/recall requests.

## Scope maps to banks

Hindsight groups memories into per-user banks, and the provider derives the bank from `scope.user` - so **every operation needs a user scope**:

```typescript
const page = await memory.search({
  query: 'seat preference',
  scope: { user: 'demo' },
});
```

`scope.agent`, `scope.namespace`, and `scope.thread` become Hindsight tags (`agent:…`, `namespace:…`, `thread:…`) and are matched strictly on recall.

## Capability differences

`HindsightProvider` implements the six core operations (`ingest`, `search`, `get`, `delete`, `list`, `capabilities`) plus the `package`, `reflect`, and `health` extensions. It does **not** implement:

-   `update`, in-place updates
-   `temporal`, point-in-time search
-   `versioning`, per-memory history
-   `graph`, `forget`, `profile`, `batch`

Two provider-specific behaviors to plan around:

-   **Verbatim ingest is rejected.** `ingest({ mode: 'verbatim' })` throws `UnsupportedOperationError` - Hindsight always processes what it retains. `text` and `messages` modes are supported.
-   **Search results carry no relevance score.** Hindsight recall does not return per-hit scores, so `score` is always `0` on results. Don't sort or threshold by score with this backend.

Use the capability-probing pattern from [Capabilities](/sdk/concepts/capabilities) to handle differences gracefully:

```typescript
const caps = memory.capabilities();

if (caps.extensions.reflect) {
  const insight = await memory.reflect({ query, scope });
}
```

## Hindsight-specific extensions

Beyond the standard surface, the provider advertises two custom extensions for Hindsight's async ingestion model:

```typescript
const caps = memory.capabilities();
// caps.customExtensions: 'hindsight.retain', 'hindsight.operations'

// Raw retain response (bank id, operation ids, usage)
const retain = memory.getExtension('hindsight.retain');
const res = await retain.retain(input);

// Poll background operations
const ops = memory.getExtension('hindsight.operations');
const page = await ops.list({ user: 'demo' });
const op = await ops.get({ user: 'demo' }, res.operation_id);
```

## When to pick Hindsight

-   You're already running Hindsight (Cloud or self-hosted) and want it behind the same client as your other memory backends
-   You want Hindsight's retain/recall/reflect model - including LLM-synthesized insights via `reflect` - without coding to its API directly
-   You're comparing memory engines behind a single client

For greenfield deployments where temporal queries, versioning, and verbatim storage matter, `atomicmemory-core` is the supported first-class path.

## Next

-   [Using the Mem0 backend](/sdk/guides/mem0-backend), the same pattern against Mem0
-   [Swapping backends](/sdk/guides/swapping-backends), migrating memories between providers
-   [Capabilities](/sdk/concepts/capabilities), the runtime contract that makes provider differences safe
