# Browser entry

> Agent index: [llms.txt](/llms.txt)

The SDK ships a slim entry point for applications that run in the browser against a backend-hosted memory engine. This guide covers what that entry exports and when to reach for it over the root package.

## The ./browser subpath

```typescript
import { MemoryClient } from '@atomicmemory/sdk/browser';
```

The `./browser` entry exports `MemoryClient`, the `MemoryProvider` interface and base class, both shipped provider adapters, and the core types. It intentionally omits `storage`, `embedding`, `search`, and `utils`, three bundles that pull in IndexedDB helpers, the transformers WASM runtime, and their dependencies. If your app talks to a remote backend and has no need for on-device persistence or local embeddings, this is the smaller import.

## When to use ./browser

-   You're building a browser app or extension that calls `atomicmemory-core` or a remote Mem0 instance.
-   The backend handles embeddings and storage server-side.
-   Bundle size matters.

## When to use the root package

-   You want client-side semantic search over bundled data without a backend, see [Browser primitives](/sdk/guides/browser-primitives).
-   You're composing `StorageManager`, `EmbeddingGenerator`, or `SemanticSearch` directly for custom pipelines.
-   You want one import surface that covers both the client and the primitives.

Both entries expose the same `MemoryClient`. The root re-exports everything from `./browser` plus the additional subsystems.

## Chrome extension storage

The SDK does **not** ship a `ChromeStorageAdapter`. If you want to back storage with `chrome.storage.local`, write a custom adapter, see [Storage adapters](/sdk/concepts/storage-adapters). The interface is small.

## Next

-   [Browser primitives](/sdk/guides/browser-primitives), composing the subpath exports for on-device semantic search
-   [Storage adapters](/sdk/concepts/storage-adapters), the interface you implement for Chrome-extension storage
