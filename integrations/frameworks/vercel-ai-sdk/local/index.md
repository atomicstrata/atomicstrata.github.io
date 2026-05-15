# Vercel AI SDK Local

> Agent index: [llms.txt](/llms.txt)

Give Vercel AI SDK applications persistent memory backed by AtomicMemory. The adapter retrieves relevant memories before a model call, injects them as guarded context, and ingests the completed turn after the model returns.

## Quick start

### 1. Install the adapter

```bash
npm install @atomicmemory/vercel-ai @atomicmemory/sdk
```

### 2. Configure memory

```ts
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'http://127.0.0.1:3050',
      apiKey: 'local-dev-key',
    },
  },
  defaultProvider: 'atomicmemory',
});

await memory.initialize();

const scope = {
  namespace: projectId,
};
```

### 3. Wrap a model call

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

## Features

-   **Pre-call recall.** Search AtomicMemory before `generateText`, `streamText`, or your own AI SDK runner.
-   **Guarded context injection.** Retrieved memories are added as context, not treated as application instructions.
-   **Post-call ingest.** Completed turns are stored with `mode: "messages"` so AtomicMemory can add, update, delete, or no-op extracted facts.
-   **Version isolation.** The adapter accepts AtomicMemory SDK message shapes and does not import from `ai`.

## Modes of operation

### Text-only convenience mode

Use `withMemory()` when messages are plain string-content messages and prepending a guarded system message is safe.

### Split retrieval and ingest

Use split primitives for tool-call or multimodal flows so your original AI SDK message parts stay intact:

```ts
import { generateText, type ModelMessage } from 'ai';
import { fromModelMessages, ingestTurn, retrieve } from '@atomicmemory/vercel-ai';

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

## Adapter primitives

| API | Maps to | Purpose |
| --- | --- | --- |
| `retrieve()` | `MemoryClient.search` | Search memory and return an injectable system message. |
| `augmentWithMemory()` | `MemoryClient.search` | Prepend guarded memory context for text-only message arrays. |
| `ingestTurn()` | `MemoryClient.ingest` | Store completed turns with `mode: "messages"`. |
| `withMemory()` | search + ingest | Convenience wrapper around recall, model call, and ingest. |
| `fromModelMessage()` / `fromModelMessages()` | message conversion | Flatten AI SDK v5 content parts for memory search or ingest. |

## Ingest policy

System messages are excluded by default because they usually contain app instructions, policies, or retrieved context. Opt in only when system content is user-authored and should be remembered.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Scoped search misses a new fact | Confirm retrieval and ingest use the same `scope`. |
| Exact identifiers are hard to find | Run `atomicmemory-core` with hybrid search enabled for factual smoke tests. |
| Tool or multimodal messages break | Use `retrieve()` instead of `augmentWithMemory()` so original message parts stay intact. |

### Backend tuning

For factual smoke tests with unique strings, names, or numeric identifiers, run `atomicmemory-core` with keyword/hybrid retrieval enabled:

```env
HYBRID_SEARCH_ENABLED=true
# or
RETRIEVAL_PROFILE=quality
```

If core runs from the published Docker image, restart it with the retrieval override:

```bash
docker rm -f atomicmemory-core

docker run -d --pull always \
  --name atomicmemory-core \
  -p 127.0.0.1:3050:3050 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e RETRIEVAL_PROFILE=quality \
  -v $HOME/.atomicstrata/atomicmemory-docker:/var/lib/atomicmemory/postgres \
  ghcr.io/atomicstrata/atomicmemory-core:latest
```

Verify the backend reports hybrid search:

```bash
curl -s -H 'Authorization: Bearer local-dev-key' \
  http://localhost:3050/v1/memories/health
```

The response should include `"hybrid_search_enabled": true`.

Use the same SDK `scope` for `retrieve()` and `ingestTurn()`. If a smoke test writes successfully but scoped search misses the new fact, inspect the stored memory's `namespace`; older backend/SDK combinations may derive it from `source_site` during extracted `messages` ingest.

## Development

For source builds, adapter development, and local testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [SDK Overview](/sdk/overview)
-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend)
-   [Scopes and identity](/sdk/concepts/scopes-and-identity)
