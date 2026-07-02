# Capabilities

> Agent index: [llms.txt](/llms.txt)

Not every memory backend supports every operation. `atomicmemory-core` ships context packaging and temporal search; Mem0 supports neither; Hindsight supports packaging and reflection but not temporal search. A custom provider you write might support neither. The SDK's design is to make these differences **runtime-queryable** rather than baked into types, so the same application code can target any configured backend.

## The Capabilities object

Every provider returns a `Capabilities` object from its `capabilities()` method, declaring what it supports:

```typescript
const caps = memory.capabilities();
// {
//   ingestModes: ['text', 'messages', 'memory'],
//   requiredScope: { default: ['user'], ingest: ['user', 'namespace'] },
//   extensions: { package: true, temporal: true, versioning: true, health: true, ... },
//   customExtensions: { ... },
// }
```

Three fields matter in practice:

-   **`ingestModes`**, which shapes of input the provider accepts. Most providers accept all three; some specialize.
-   **`requiredScope`**, which scope fields must be present in a request. A `default` array lists the fields required across all operations, with optional per-operation overrides keyed by operation name (`ingest`, `search`, `get`, `delete`, `list`, `package`, `update`, ...). A workspace-only provider might require `namespace` in `default`; a personal-memory provider might require only `user`.
-   **`extensions`**, a record of capability keys to booleans. `package`, `temporal`, `versioning`, `update`, `graph`, `forget`, `profile`, `reflect`, `batch`, `health`. If `extensions.package` is `true`, the provider supports `memory.package()`. If `false`, calling `memory.package()` raises `UnsupportedOperationError`.

## The extension probe

The public way to get at an extension is `provider.getExtension<T>(name)`:

```typescript
import type { Packager } from '@atomicmemory/sdk';

const packager = provider.getExtension<Packager>('package');
if (packager) {
  const pkg = await packager.package(request);
  // use pkg.text directly as injected context
}
```

The extension key matches the capability key (`'package'`, not `'packager'`), this is the contract, and it matches the implementation (`src/memory/memory-service.ts:188`).

## Why apps must check

An app that calls `memory.package()` without first confirming the capability is declaring a dependency on a specific backend. That's fine if you know you're always talking to `atomicmemory-core`, but it defeats the purpose of the SDK's backend-agnostic design.

The recommended pattern for portable code:

```typescript
const { extensions } = memory.capabilities();

if (extensions.package) {
  const pkg = await memory.package(request);
  return pkg.text;
} else {
  // Graceful degradation: fall back to search + local formatting
  const page = await memory.search(request);
  return formatResults(page.results);
}
```

## Capabilities are read once

`capabilities()` is not a runtime guard, it is a declaration. Providers do not change their capabilities after initialization, so reading the object once at startup is fine. Cache it if you check frequently.

## Next

-   [Provider model](/sdk/concepts/provider-model), the interface the capabilities describe
-   [Swapping backends](/sdk/guides/swapping-backends), the operational story when capabilities differ across providers
