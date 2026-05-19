# LangChain (JS) Local

> Agent index: [llms.txt](/llms.txt)

AtomicMemory support for LangChain JS exposes durable semantic memory through helper functions and LangChain-native tools.

## What you get

-   **Agent tools.** `memory_search` and `memory_ingest` tools built with `@langchain/core/tools`.
-   **Helper functions.** `searchMemory()` and `ingestTurn()` for custom chains, callbacks, and LCEL steps.
-   **Backend-agnostic SDK path.** The adapter uses the AtomicMemory SDK provider registry through your `MemoryClient`.

## Install

```bash
npm install @atomicmemory/langchain @atomicmemory/sdk @langchain/core@^0.3.80 zod
```

## Usage

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
