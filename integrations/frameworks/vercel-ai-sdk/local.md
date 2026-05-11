# Vercel AI SDK Local

> Agent index: [llms.txt](/llms.txt)

Source-only

`@atomicmemory/vercel-ai` lives in the integrations repo under `adapters/vercel-ai-sdk`. It is not published to npm yet; install it from a local clone or workspace package until a registry release is cut.

The adapter gives Vercel AI SDK calls the same memory loop used elsewhere in AtomicMemory:

-   retrieve relevant memories before a model call
-   render them as a guarded system message
-   ingest the completed turn after the model returns
-   keep the adapter independent of `ai` package version churn

## Primitives

| API | Use when |
| --- | --- |
| `retrieve()` | Tool-call or multimodal flows where you inject memory into the original AI SDK message array yourself. |
| `augmentWithMemory()` | Text-only flows where prepending a system message to `Message[]` is safe. |
| `ingestTurn()` | Post-call capture. Persists the original messages plus the assistant completion. |
| `withMemory()` | Text-only convenience wrapper around `augmentWithMemory()` + your model call + `ingestTurn()`. |
| `fromModelMessage()` / `fromModelMessages()` | AI SDK v5 bridge from `ModelMessage` content parts into AtomicMemory's text-only `Message` shape. |

The adapter intentionally does **not** import from `ai`. It accepts AtomicMemory SDK `Message` objects (`role` + string `content`) and delegates the model call to your code.

## Install

From the integrations repo:

```bash
pnpm install
pnpm --filter @atomicmemory/vercel-ai build
```

Then depend on the local package from your workspace, or use your package manager's `file:` / workspace linking support. The current source package depends on the local `@atomicmemory/atomicmemory-sdk` checkout, so publish order matters: publish or link the SDK first, then the adapter.

## Configure memory

```ts
import { MemoryClient } from '@atomicmemory/atomicmemory-sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {},
  },
  defaultProvider: 'atomicmemory',
});

await memory.initialize();
```

The adapter resolves the AtomicMemory service, credentials, and base user identity automatically. The current session name is used as that default identity.

Use one stable `scope` for both retrieval and ingest:

```ts
const scope = {
  namespace: projectId,
};
```

## Text-only flow

Use `withMemory()` when your messages are plain string-content messages:

```ts
import { streamText } from 'ai';
import { withMemory } from '@atomicmemory/vercel-ai';

const result = await withMemory({
  client: memory,
  scope,
  messages,
  async run(augmented) {
    const response = streamText({ model, messages: augmented });
    return { text: await response.text };
  },
});
```

## Tool-call or multimodal flow

Do not feed flattened memory messages back into Vercel AI SDK once tool or multimodal parts are present. Flatten only for memory search / ingest, then inject the retrieved system message into your original `ModelMessage[]`.

```ts
import { generateText, type ModelMessage } from 'ai';
import {
  fromModelMessages,
  retrieve,
  ingestTurn,
} from '@atomicmemory/vercel-ai';

const modelMessages: ModelMessage[] = [/* your real conversation */];
const flat = fromModelMessages(modelMessages);

const { systemMessage } = await retrieve(memory, {
  messages: flat,
  scope,
  limit: 8,
});

const { text } = await generateText({
  model,
  messages: systemMessage
    ? [{ role: 'system', content: systemMessage.content }, ...modelMessages]
    : modelMessages,
});

await ingestTurn(memory, {
  messages: flat,
  completion: text,
  scope,
});
```

## Ingest policy

`ingestTurn()` uses SDK `mode: "messages"` so AtomicMemory's AUDN mutation can add, update, delete, or no-op extracted facts instead of accumulating duplicates.

System messages are excluded by default because they usually contain application instructions, policies, or retrieved context. If your system messages are user-authored content worth remembering, opt in explicitly:

```ts
await ingestTurn(memory, {
  messages,
  completion: text,
  scope,
  includeRoles: ['system', 'user', 'assistant', 'tool'],
});
```

## Backend search note

For factual smoke tests with unique strings, names, or numeric identifiers, run `atomicmemory-core` with keyword/hybrid retrieval enabled:

```env
HYBRID_SEARCH_ENABLED=true
# or
RETRIEVAL_PROFILE=quality
```

If core runs in Docker, recreate the app container after editing `atomicmemory-core/.env`:

```bash
docker compose up -d --force-recreate app
```

Verify:

```bash
curl -s http://localhost:3050/v1/memories/health
```

The response should include `"hybrid_search_enabled": true`.

Namespace behavior

Use the same SDK `scope` for `retrieve()` and `ingestTurn()`. Current `atomicmemory-core` can still derive the stored `namespace` from `source_site` during extracted `messages` ingest unless the backend/SDK version explicitly forwards and persists the caller's namespace on ingest. If a smoke test writes successfully but scoped search misses the new fact, inspect the stored memory's `namespace` and verify the search `namespace_scope` matches it.

## See also

-   [SDK Overview](/sdk/overview)
-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend)
-   [Scopes and identity](/sdk/concepts/scopes-and-identity)
