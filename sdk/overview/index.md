# SDK Overview

> Agent index: [llms.txt](/llms.txt)

A TypeScript client for memory and artifact storage, pluggable across backends.

`@atomicmemory/sdk` is a platform utility, not a framework. It gives application code a single, typed API for ingest, search, context assembly, and optional artifact storage, and it stays agnostic to which memory engine sits behind it. The same client can talk to a self-hosted `atomicmemory-core`, a Mem0 or Hindsight service, an llm-wiki-compiler wiki, or a custom backend you wire yourself.

Working in Python? The same surface ships as the [`atomicmemory` package on PyPI](https://pypi.org/project/atomicmemory/); see the [Python SDK](/sdk/python) page.

## Value Prop

-   **Backend-agnostic via `MemoryProvider`.** Every operation routes through the `MemoryProvider` interface. Swap `atomicmemory-core` for Mem0, Hindsight, an llmwiki wiki, or a provider you write, with a config change, not a rewrite. Apps inspect provider capabilities at runtime and gracefully degrade when a backend does not support an extension (packaging, temporal search, versioning, etc.).
-   **Browser / extension / Node / worker-ready.** ESM + CJS dual build, subpath exports, and WASM-based local embeddings via `@huggingface/transformers`. The same package runs in a Chrome extension, a Next.js app, a serverless handler, or a web worker.
-   **Artifact storage client.** `AtomicMemoryClient.storage` wraps core's `/v1/storage/artifacts*` routes for pointer artifacts, managed uploads, metadata reads, verification, and delete flows. Managed providers such as S3 or Filecoin remain optional server configuration.
-   **Client-side primitives for composition.** The `/storage`, `/embedding`, and `/search` subpath exports ship standalone, `StorageManager`, `EmbeddingGenerator`, `SemanticSearch`. You can compose memory features directly from these without ever constructing `MemoryClient`. The SDK is a bundle of reusable parts, not a single mandatory object.

## MemoryClient, the canonical public API

```ts
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
	providers: {
		atomicmemory: {
			apiUrl: 'https://api.atomicstrata.ai',
			apiKey: process.env.ATOMICMEMORY_API_KEY!,
		},
	},
});
await memory.initialize();

await memory.ingest({
	mode: 'text',
	content: 'I prefer aisle seats.',
	scope: { user: 'demo-user' },
});

const page = await memory.search({
	query: 'seat preference',
	scope: { user: 'demo-user' },
	limit: 5,
});

for (const { memory: record } of page.results) {
	console.log(record.content);
}
```

Set `ATOMICMEMORY_API_KEY` to a Cloud project key on the server. The [quickstart](/sdk/quickstart) walks through setup, saving, retrieval, and explicit local configuration. The SDK currently requires the URL and key configuration; zero-config initialization is not available yet. Resolve `scope.user` from your authenticated server session in an application. Text ingest uses extraction, so a single input need not produce one memory.

To expose search and ingest to an AI SDK model, see [Vercel AI SDK memory tools](/integrations/frameworks/vercel-ai-sdk). That guide documents the new package's unreleased status and AI SDK 6 compatibility.

`MemoryClient` composes a `MemoryService` under the hood and exposes the pure memory API: `ingest`, `search`, `package`, `get`, `list`, `delete`, plus `capabilities` / `getExtension` / `getProviderStatus` for capability inspection, and an `atomicmemory` getter that returns the full [Open Source namespace handle](/sdk/api/memory-provider) (lifecycle, audit, lessons, config, agents). The surface is intentionally small, application-layer concerns such as identity resolution, capture policy, or injection gating belong in consumer code, not in the SDK.

Use `AtomicMemoryClient` when you also need storage artifacts. This local example uses a Core token, not a Cloud project key. Set `CORE_API_KEY` to the token shown by `am instance status --show-secrets`, as described in the [local quickstart](/sdk/quickstart#configure-a-local-backend).

```ts
import { AtomicMemoryClient } from '@atomicmemory/sdk';

const storageApiKey = process.env.CORE_API_KEY;
if (!storageApiKey?.trim()) throw new Error('Missing CORE_API_KEY');

const client = new AtomicMemoryClient({
  apiUrl: 'http://localhost:17350',
  apiKey: storageApiKey,
  allowPrivateNetworks: true,
  userId: 'u1',
  memory: {
    providers: {
      atomicmemory: {
        apiUrl: 'http://localhost:17350',
        apiKey: storageApiKey,
        allowPrivateNetworks: true,
      },
    },
  },
});

const artifact = await client.storage.put({
  mode: 'pointer',
  uri: 'ipfs://bafy...',
  contentType: 'application/pdf',
});
```

## Deployment topologies

The first three topologies route through `MemoryClient`. The fourth composes the subpath exports directly, useful when you want client-side semantic search over your app's data without any backend at all. See [Browser primitives](/sdk/guides/browser-primitives).

## Browser-safe entry

For browser applications that talk to a backend-hosted core through `MemoryClient` and don't need on-device storage or embeddings, import from the `./browser` subpath, a slim bundle that omits `storage`, `embedding`, `search`, and `utils`:

Browser-safe describes the bundle, not credential security. Keep Cloud project keys and Core tokens on your server. Browser applications can call your authenticated server instead of receiving those credentials.

```ts
import { MemoryClient } from '@atomicmemory/sdk/browser';
```

## Where to go from here

-   Run through the [Quickstart](/sdk/quickstart) for a 5-minute install and first call.
-   Store or reference files with [Artifact storage](/sdk/guides/artifact-storage).
-   Read the [Provider model](/sdk/concepts/provider-model) to understand how the backend-agnostic story works in detail.
-   If you are looking for the memory engine itself, the server, the HTTP API, the claim schema, start at the [Core introduction](/introduction).
