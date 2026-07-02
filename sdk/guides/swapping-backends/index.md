# Swapping backends

> Agent index: [llms.txt](/llms.txt)

The SDK's provider architecture makes the **capability** of swapping backends real; this guide covers the operational story.

Two scenarios come up in practice: runtime swap (flip providers without restarting the app) and migration (move memories from provider A to provider B).

## Runtime swap

`MemoryClient` is initialized with a `providers` map and an optional `defaultProvider`; swapping means destroying the current client and constructing a new one. There is no live reconfigure path, by design, providers hold HTTP clients, caches, and init state, and a clean reconstruction is easier to reason about than partial rewiring.

```typescript
import { MemoryClient } from '@atomicmemory/sdk';

async function withProvider(defaultProvider: 'atomicmemory' | 'mem0') {
  const memory = new MemoryClient({
    providers: {
      atomicmemory: {
        apiUrl: 'http://localhost:17350',
        apiKey: 'local-dev-key',
      },
      mem0: { apiUrl: 'http://localhost:8000' },
    },
    defaultProvider,
  });
  await memory.initialize();
  return memory;
}

// Somewhere in your app
const memory = await withProvider('atomicmemory');
// ... use memory ...
// Switch:
const memory2 = await withProvider('mem0');
```

The same pattern covers any registered provider — `hindsight`, the llmwiki providers, or one you write — since selection is just the `providers` map plus `defaultProvider`.

If you have an in-flight operation on the old client, let it complete before the swap, destroying the client mid-request is not a supported path.

## Migration: moving memories between providers

Use `list` on the source, `ingest` on the target. Example:

```typescript
async function migrate(
  source: MemoryClient,
  target: MemoryClient,
  scope: { user: string },
) {
  let cursor: string | undefined = undefined;
  let migrated = 0;

  do {
    const page = await source.list({ scope, limit: 100, cursor });
    for (const record of page.memories) {
      await target.ingest({
        mode: 'memory',
        content: record.content,
        kind: record.kind,
        metadata: record.metadata,
        scope,
        provenance: { source: 'migration' },
      });
      migrated += 1;
    }
    cursor = page.cursor;
  } while (cursor);

  console.log(`Migrated ${migrated} memories`);
}
```

## Capability gaps are real

When `source.capabilities().extensions` declares features that `target.capabilities().extensions` does not, the migration is **lossy** along those dimensions:

| Source has | Target does not | Consequence |
| --- | --- | --- |
| Versioning (version history) | Unsupported | Target holds only the latest version; history is dropped |
| Temporal (as-of timestamps) | Unsupported | Target loses the temporal metadata; queries like `searchAsOf` will not work |
| Packaging (structured context) | Unsupported | No immediate loss on migration; affects read-time behavior only |
| Custom extensions | Unsupported | Any data stored via `customExtensions` does not survive |

Always run `source.capabilities()` and `target.capabilities()` before migrating and document which dimensions will not survive. A dry-run against a sample is cheap and informative.

## Stateful caches and retries

If your migration job crashes, resume by finding the last successfully-migrated `memory.id` and starting `source.list` from there. The `cursor` returned by `list` is the natural checkpoint, persist it.

## Next

-   [Capabilities](/sdk/concepts/capabilities), the runtime contract that makes gaps visible
-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend), the production checklist that applies to the target side of migrations
