# LangGraph (JS) Local

> Agent index: [llms.txt](/llms.txt)

Planned

This adapter is on the roadmap. The shape below is the intended API, not a shipped package.

## Intended shape

LangGraph models agents as state graphs. `@atomicmemory/langgraph` will expose AtomicMemory as a checkpointer-adjacent memory layer — durable semantic memory that lives across graph runs, complementing LangGraph's run-scoped checkpointers:

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

Nodes can call `store.search(query)` and `store.put(fact)` directly, or use the shipped `recall` / `remember` helper nodes.

## See also

-   [SDK Overview](/sdk/overview)
-   [LangChain (JS) integration](/integrations/frameworks/langchain-js/local)
