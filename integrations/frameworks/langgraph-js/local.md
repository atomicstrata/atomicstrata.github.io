# LangGraph (JS) Local

> Agent index: [llms.txt](/llms.txt)

AtomicMemory support for LangGraph JS provides durable semantic memory next to LangGraph's run-scoped checkpointers.

## What you get

-   **Retrieve node.** `createMemoryRetrieveNode()` searches memory before the model step.
-   **Ingest node.** `createMemoryIngestNode()` persists the completed turn after the model step.
-   **Backend-agnostic SDK path.** The adapter uses the AtomicMemory SDK provider registry through your `MemoryClient`.

## Quick start

### 1. Start AtomicMemory core

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
npm install @atomicmemory/langgraph @atomicmemory/sdk @langchain/langgraph@^0.4.0
```

### 3. Add retrieve and ingest nodes

```ts
import {
  createMemoryIngestNode,
  createMemoryRetrieveNode,
} from '@atomicmemory/langgraph';

const recall = createMemoryRetrieveNode(memoryClient, {
  scope: { user: userId },
  getQuery: (state) => state.messages.at(-1)?.content ?? '',
  applyContext: (_state, context) => ({ memoryContext: context }),
});

const remember = createMemoryIngestNode(memoryClient, {
  scope: { user: userId },
  getMessages: (state) => state.messages,
  getCompletion: (state) => state.finalAnswer,
});
```

The factories emit plain async state-node functions, so they can be registered with your graph without adding runtime framework ownership to AtomicMemory.

## See also

-   [SDK Overview](/sdk/overview)
-   [LangChain integration](/integrations/frameworks/langchain-js/local)
