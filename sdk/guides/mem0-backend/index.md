# Using the Mem0 backend

> Agent index: [llms.txt](/llms.txt)

`Mem0Provider` is the SDK's HTTP client for [Mem0](https://mem0.ai). It demonstrates the backend-agnostic design in practice: the same client, the same methods, a different engine behind the interface.

> **Support status.** Verify the current support stance with the project before building on this path. Mem0 compatibility is exercised in tests and works for the core operations, but `Mem0Provider`'s position in the roadmap is an open question. Prefer `atomicmemory-core` when you need a first-class path.

## Wire it up

```typescript
import { MemoryClient } from '@atomicmemory/atomicmemory-sdk';

const memory = new MemoryClient({
  providers: {
    mem0: {
      apiUrl: 'http://localhost:8000',
      apiKey: process.env.MEM0_API_KEY,
      timeout: 30000,
    },
  },
});

await memory.initialize();
```

## Capability differences

`Mem0Provider` implements the six core operations (`ingest`, `search`, `get`, `delete`, `list`, `capabilities`) plus the `health` extension. It does **not** implement:

-   `package`, context packaging with token budgets
-   `temporal`, point-in-time search
-   `versioning`, per-memory history
-   `update`, in-place updates
-   `graph`, `forget`, `profile`, `reflect`, `batch`

Code that calls `memory.package()` on a Mem0-backed client will raise `UnsupportedOperationError`. Use the capability-probing pattern from [Capabilities](/sdk/concepts/capabilities) to handle this gracefully:

```typescript
const caps = memory.capabilities();

if (caps.extensions.package) {
  const pkg = await memory.package(request);
  injectContext(pkg.text);
} else {
  const page = await memory.search(request);
  injectContext(formatFallback(page.results));
}
```

## When to pick Mem0

-   You're already invested in Mem0's hosted platform or OSS deployment
-   You want to compare memory engines behind a single client
-   You're migrating from Mem0 and want a transition path without rewriting application code

For greenfield deployments where packaging, temporal queries, and versioning matter, `atomicmemory-core` is the supported first-class path.

## Next

-   [Swapping backends](/sdk/guides/swapping-backends), migrating memories between providers
-   [Capabilities](/sdk/concepts/capabilities), the runtime contract that makes provider differences safe
