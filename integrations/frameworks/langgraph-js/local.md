# LangGraph (JS) Local

> Agent index: [llms.txt](/llms.txt)

AtomicMemory support for LangGraph JS is planned. The adapter will provide durable semantic memory next to LangGraph's run-scoped checkpointers.

Planned

This adapter is on the roadmap. The API below is the intended shape, not a shipped package.

## What you get

-   **Durable graph memory.** A planned store-like memory layer that survives across graph runs.
-   **Helper nodes.** Planned `recall` and `remember` nodes for retrieval and ingest inside a graph.
-   **Backend-agnostic SDK path.** The adapter will use the AtomicMemory SDK provider registry.

## Planned API

| API | Purpose |
| --- | --- |
| `AtomicMemoryStore` | Store-like access to durable memories across graph runs. |
| `recall` / `remember` helper nodes | Graph nodes for retrieval and ingest inside a state graph. |

## Intended usage

```ts
import { StateGraph } from '@langchain/langgraph';
import { AtomicMemoryStore } from '@atomicmemory/langgraph';

const store = new AtomicMemoryStore({
  client: memoryClient,
  scope: { user: userId },
});

const graph = new StateGraph(State)
  .addNode('recall', recallNode)
  .addNode('respond', respondNode)
  .compile({ store });
```

Nodes can call `store.search(query)` and `store.put(fact)` directly, or use the planned helper nodes.

## See also

-   [SDK Overview](/sdk/overview)
-   [LangChain integration](/integrations/frameworks/langchain-js/local)
