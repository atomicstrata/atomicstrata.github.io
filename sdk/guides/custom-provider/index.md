# Writing a custom provider

> Agent index: [llms.txt](/llms.txt)

The provider interface is deliberately small. If you want to back `MemoryClient` with something other than the shipped backends (`atomicmemory-core`, Mem0, Hindsight, llmwiki), an internal memory service, a Pinecone-fronted store, a SQLite-over-disk prototype, you write a `MemoryProvider` and register it. Application code keeps calling the same client methods.

## Minimum implementation

Extend `BaseMemoryProvider`, it provides the scope-validation scaffolding and a default `getExtension` that checks your declared capabilities.

```typescript
import {
  BaseMemoryProvider,
  type Capabilities,
  type IngestInput,
  type IngestResult,
  type SearchRequest,
  type SearchResultPage,
  type ListRequest,
  type ListResultPage,
  type MemoryRef,
  type Memory,
} from '@atomicmemory/sdk';

export class MyProvider extends BaseMemoryProvider {
  readonly name = 'my-provider';

  constructor(private readonly config: { endpoint: string }) {
    super();
  }

  capabilities(): Capabilities {
    return {
      ingestModes: ['text', 'messages', 'memory'],
      requiredScope: {
        default: ['user'],
      },
      extensions: {
        update: false,
        package: false,
        temporal: false,
        graph: false,
        forget: false,
        profile: false,
        reflect: false,
        versioning: false,
        batch: false,
        health: true,
      },
      customExtensions: {},
    };
  }

  protected async doIngest(input: IngestInput): Promise<IngestResult> {
    const res = await fetch(`${this.config.endpoint}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`ingest failed: ${res.status}`);
    return res.json();
  }

  protected async doSearch(request: SearchRequest): Promise<SearchResultPage> { /* ... */ }
  protected async doGet(ref: MemoryRef): Promise<Memory | null> { /* ... */ }
  protected async doDelete(ref: MemoryRef): Promise<void> { /* ... */ }
  protected async doList(request: ListRequest): Promise<ListResultPage> { /* ... */ }
}
```

`BaseMemoryProvider` implements the public `ingest` / `search` / `get` / `delete` / `list` methods for you, they run scope validation and error wrapping, then call the protected `do*` hooks above. You only implement the hooks plus `capabilities()` and `name`. Everything else is opt-in.

## Register the provider

Providers are created by factories in the registry. The simplest path is to construct your provider and pass it in via a factory-style registration. See `src/memory/providers/registry.ts` for the shipped registry and the pattern for adding to it.

At `MemoryClient` construction time, reference your provider by name in `providers`:

```typescript
const memory = new MemoryClient({
  providers: {
    'my-provider': { endpoint: 'https://memory.internal.example.com' },
  },
  defaultProvider: 'my-provider',
});
```

## Declaring capabilities accurately

Two rules:

1.  **Don't lie.** If `capabilities().extensions.package` is `true`, your `getExtension('package')` must return a real `Packager`. The default `BaseMemoryProvider.getExtension` returns `this` when the capability is true and relies on the subclass implementing the extension methods on itself.
2.  **Declare `requiredScope` honestly.** The shape is `{ default: Array<keyof Scope>, ingest?: ..., search?: ..., ... }`, a list of required fields for each operation, falling back to `default`. If your backend needs `namespace` to partition correctly, include it in `default` (or the specific operation key). `BaseMemoryProvider.validateScope` will reject requests missing required fields before they reach your network code.

## Implementing an extension

If you want to support context packaging:

```typescript
import type { Packager, PackageRequest, ContextPackage } from '@atomicmemory/sdk';

export class MyProvider extends BaseMemoryProvider implements Packager {
  // ... core methods, capabilities ...

  async package(request: PackageRequest): Promise<ContextPackage> {
    const page = await this.search(request);
    const text = formatInjection(page.results, request.tokenBudget ?? 2000);
    return { text, results: page.results, tokens: approxTokens(text) };
  }
}
```

Set `capabilities().extensions.package = true`. Done, `memory.package()` now works.

## Testing

The SDK's own test suite uses fixture providers under `src/memory/__tests__/`. The pattern works for any custom provider: construct `MemoryClient` with your provider as the default, exercise the public client methods, assert on observable behaviour rather than internal state.

## Next

-   [Provider model](/sdk/concepts/provider-model), the full extension menu you can opt into
-   [Capabilities](/sdk/concepts/capabilities), the contract apps rely on when they call your provider
