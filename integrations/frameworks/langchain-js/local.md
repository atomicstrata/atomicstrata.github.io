# LangChain (JS) Local

> Agent index: [llms.txt](/llms.txt)

Planned

This adapter is on the roadmap. The shape below is the intended API, not a shipped package.

## Intended shape

`@atomicmemory/langchain` will expose two surfaces:

### As a BaseChatMemory

Drop AtomicMemory in anywhere a LangChain chat memory is expected:

```ts
import { ConversationChain } from 'langchain/chains';
import { AtomicMemoryChatMemory } from '@atomicmemory/langchain';

const memory = new AtomicMemoryChatMemory({
  client: memoryClient,
  scope: { user: userId },
});

const chain = new ConversationChain({ llm, memory });
```

### As tools

Expose `memory_search` / `memory_ingest` as LangChain `Tool`s for agent executors that prefer explicit tool calls over implicit memory injection:

```ts
import { createAtomicMemoryTools } from '@atomicmemory/langchain';

const tools = createAtomicMemoryTools(memoryClient, { scope });
const executor = await initializeAgentExecutorWithOptions([...tools], llm);
```

## See also

-   [SDK Overview](/sdk/overview)
-   [LangGraph integration](/integrations/frameworks/langgraph-js/local)
