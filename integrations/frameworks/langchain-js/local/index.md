# LangChain (JS) Local

> Agent index: [llms.txt](/llms.txt)

AtomicMemory support for LangChain JS is planned. The adapter will expose durable semantic memory through LangChain-native memory and tool surfaces.

Planned

This adapter is on the roadmap. The API below is the intended shape, not a shipped package.

## What you get

-   **Chat memory surface.** A planned `AtomicMemoryChatMemory` for chains that expect LangChain memory.
-   **Agent tools.** Planned `memory_search` and `memory_ingest` tools for agent executors.
-   **Backend-agnostic SDK path.** The adapter will use the AtomicMemory SDK provider registry.

## Planned API

| API | Purpose |
| --- | --- |
| `AtomicMemoryChatMemory` | Drop-in chat memory for chains that expect LangChain memory. |
| `createAtomicMemoryTools()` | Create `memory_search` and `memory_ingest` tools for agent executors. |

## Intended usage

```ts
import { ConversationChain } from 'langchain/chains';
import { AtomicMemoryChatMemory } from '@atomicmemory/langchain';

const memory = new AtomicMemoryChatMemory({
  client: memoryClient,
  scope: { user: userId },
});

const chain = new ConversationChain({ llm, memory });
```

```ts
import { createAtomicMemoryTools } from '@atomicmemory/langchain';

const tools = createAtomicMemoryTools(memoryClient, { scope });
const executor = await initializeAgentExecutorWithOptions([...tools], llm);
```

## See also

-   [SDK Overview](/sdk/overview)
-   [LangGraph integration](/integrations/frameworks/langgraph-js/local)
