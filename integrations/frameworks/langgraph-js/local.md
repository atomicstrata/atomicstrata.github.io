# LangGraph (JS) Local

> Agent index: [llms.txt](/llms.txt)

AtomicMemory support for LangGraph JS provides durable semantic memory next to LangGraph's run-scoped checkpointers.

## What you get

-   **Retrieve node.** `createMemoryRetrieveNode()` searches memory before the model step.
-   **Ingest node.** `createMemoryIngestNode()` persists the completed turn after the model step.
-   **Backend-agnostic SDK path.** The adapter uses the AtomicMemory SDK provider registry through your `MemoryClient`.

## Install

```bash
npm install @atomicmemory/langgraph @atomicmemory/sdk @langchain/langgraph@^0.4.0
```

## Usage

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
