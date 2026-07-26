# LangChain (JS) Local

> Agent index: [llms.txt](/llms.txt)

Open Source support for LangChain JS exposes durable semantic memory through helper functions and LangChain-native tools.

## What you get

-   **Agent tools.** `memory_search` and `memory_ingest` tools built with `@langchain/core/tools`.
-   **Helper functions.** `searchMemory()` and `ingestTurn()` for custom chains, callbacks, and LCEL steps.
-   **Backend-agnostic SDK path.** The adapter uses the Atomic Memory SDK provider registry through your `MemoryClient`.

Already ran am init?

`am init`'s Core uses OpenAI for both extraction and embeddings. If you want this guide's local `transformers` embeddings (embeddings are computed locally; no embedding API calls), keep running Core with the Docker command in step 1 below. Otherwise, skip step 1 and use your `CORE_API_KEY` from `am instance status --show-secrets` instead of `local-dev-key`.

## Quick start

### 1. Start Core

Start local core first. It should be reachable at `http://127.0.0.1:17350`.

```bash
export OPENAI_API_KEY="sk-..."

docker run -d --pull always \
  --name atomicmemory-core \
  -p 127.0.0.1:17350:17350 \
  -e LLM_PROVIDER=openai \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e EMBEDDING_PROVIDER=transformers \
  -e EMBEDDING_DIMENSIONS=384 \
  -v $HOME/.atomicstrata/atomicmemory-docker:/var/lib/atomicmemory/postgres \
  ghcr.io/atomicstrata/atomicmemory-core:latest
```

Important note

This quickstart uses the free local `transformers` embedding model so it can run without a separate embedding API key. For production or higher-recall use, switch core to a stronger paid embedding provider as soon as you are ready.

### 2. Install the adapter

```bash
npm install @atomicmemory/langchain @atomicmemory/sdk @langchain/core@^0.3.80 zod
```

### 3. Use memory tools or helpers

```ts
import { createMemoryTools } from '@atomicmemory/langchain';

const { searchTool, ingestTool } = createMemoryTools(memoryClient, {
  scope: { user: userId, namespace: 'support' },
});
```

```ts
import { ingestTurn, searchMemory } from '@atomicmemory/langchain';

const recalled = await searchMemory(memoryClient, {
  query: userMessage,
  scope: { user: userId, namespace: 'support' },
});

await ingestTurn(memoryClient, {
  messages,
  completion,
  scope: { user: userId, namespace: 'support' },
});
```

Scope is fixed when the tools are created, so the model cannot rebind tools to another user.

## See also

-   [SDK Overview](/sdk/overview)
-   [LangGraph integration](/integrations/frameworks/langgraph-js/local)
