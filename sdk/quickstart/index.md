# SDK quickstart

> Agent index: [llms.txt](/llms.txt)

Save a preference, then retrieve it with `MemoryClient`. Start with the smallest Cloud setup, then configure a local backend or multiple providers.

## Prerequisites

-   Node.js 22 or newer.
-   A [Cloud project API key](/cloud/how-to/api-keys). For a self-hosted backend instead, follow the [Open Source quickstart](/open-source/quickstart) and use the local configuration below.

Keep backend credentials on your server, not in browser bundles.

## 1. Install the SDK

```bash
npm install @atomicmemory/sdk
npm install --save-dev tsx
```

## 2. Configure your key

Create `.env` in your application directory:

```dotenv
ATOMICMEMORY_API_KEY=<your Cloud project key>
```

## 3. Initialize the client

Create `memory.ts`:

```typescript
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
const scope = { user: 'demo-user' };
```

This is the smallest currently supported Cloud configuration. The SDK still requires `apiUrl` and does not automatically read the environment key. `new MemoryClient()` without configuration is not supported yet.

With one configured provider, it becomes the default. You do not need `defaultProvider`. `demo-user` is for this single-user example; use your authenticated server user in an application.

## 4. Save a preference

Add this to `memory.ts`:

```typescript
const ingestResult = await memory.ingest({
	mode: 'text',
	content: 'I prefer tea.',
	scope,
});
console.log(ingestResult.created, ingestResult.updated, ingestResult.unchanged);
```

The result reports memory IDs. Text ingest uses backend extraction, so one input can produce several memories. These arrays are not a terminal commit receipt or a guarantee that a correction replaced an older fact.

## 5. Retrieve the preference

Append a search using the same scope:

```typescript
const page = await memory.search({ query: 'preferred drink', scope });
for (const { memory: record } of page.results) {
	console.log(record.content);
}
```

Run the completed file:

```bash
node --env-file=.env --import tsx memory.ts
```

Inspect the returned memories for the tea preference. Extraction and retrieval depend on your backend; an empty search is a valid result.

To check persistence, remove the ingest block and its result log, then run the file again. The new process has no conversation history. The search still uses the same backend, key, and user.

## Configure a local backend

Replace the Cloud client setup with this configuration. Start Core with `am init --local`, then read its `CORE_API_KEY` with `am instance status --show-secrets`. Put that value in your server environment:

```dotenv
CORE_API_KEY=<your local instance token>
```

```typescript
const localMemory = new MemoryClient({
	providers: {
		atomicmemory: {
			apiUrl: 'http://127.0.0.1:17350',
			apiKey: process.env.CORE_API_KEY!,
			allowPrivateNetworks: true,
		},
	},
});
await localMemory.initialize();
```

Use `localMemory.ingest` and `localMemory.search` with the same request shapes. A Cloud project key is not a Core token. Permit private-network access only for a trusted backend.

## Change the HTTP timeout

The AtomicMemory provider defaults to a 30,000 ms timeout and API version `v1`. Set only the options you need to change:

```typescript
const configuredMemory = new MemoryClient({
	providers: {
		atomicmemory: {
			apiUrl: 'https://api.atomicstrata.ai',
			apiKey: process.env.ATOMICMEMORY_API_KEY!,
			timeout: 10_000,
		},
	},
});
await configuredMemory.initialize();
```

See [Using the AtomicMemory backend](/sdk/guides/atomicmemory-backend) for the full configuration reference.

## Configure multiple providers

If you configure multiple providers, use `defaultProvider` to choose which one receives memory operations:

```typescript
const multiProviderMemory = new MemoryClient({
	providers: {
		atomicmemory: {
			apiUrl: 'https://api.atomicstrata.ai',
			apiKey: process.env.ATOMICMEMORY_API_KEY!,
		},
		mem0: { apiUrl: 'http://127.0.0.1:8888', pathPrefix: '', allowPrivateNetworks: true },
	},
	defaultProvider: 'atomicmemory',
});
await multiProviderMemory.initialize();

console.log(multiProviderMemory.capabilities('mem0'));
```

In this example, ingest and search use AtomicMemory. `capabilities('mem0')` inspects the other initialized provider; it does not switch the default. See [Provider model](/sdk/concepts/provider-model) for capabilities and unsupported operations.

## Ingest a conversation

Instead of a single text fact, send messages for backend extraction:

```typescript
const conversationResult = await memory.ingest({
	mode: 'messages',
	messages: [
		{ role: 'user', content: 'I prefer aisle seats.' },
		{ role: 'assistant', content: 'Noted.' },
	],
	scope,
});
```

Your application decides which conversations may be saved. For verbatim records and content policy, see [Using the AtomicMemory backend](/sdk/guides/atomicmemory-backend).

## What next

-   Let a model choose when to search and save with [Vercel AI SDK memory tools](/integrations/frameworks/vercel-ai-sdk). Check the unreleased-package notice before installation.
-   Handle provider failures with [SDK errors](/sdk/api/errors).
-   Use `AtomicMemoryClient` for [artifact storage](/sdk/guides/artifact-storage). Its Filecoin paths require Node.js 24 or newer.
-   Look up other operations in the [API reference](/sdk/api/overview).
