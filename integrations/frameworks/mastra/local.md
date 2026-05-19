# Mastra Local

> Agent index: [llms.txt](/llms.txt)

AtomicMemory support for Mastra exposes durable memory search and ingest as Mastra tools around your SDK `MemoryClient`.

## What you get

-   **Agent tools.** `memory_search` and `memory_ingest` tools created with Mastra `createTool()`.
-   **Helper functions.** `searchMemory()` and `ingestTurn()` for custom Mastra workflows.
-   **Backend-agnostic SDK path.** The adapter uses the AtomicMemory SDK provider registry through your `MemoryClient`.

## Install

```bash
npm install @atomicmemory/mastra @atomicmemory/sdk @mastra/core zod
```

## Usage

```ts
import { createMemoryTools } from '@atomicmemory/mastra';

const { searchTool, ingestTool } = createMemoryTools(memoryClient, {
  scope: { user: userId, namespace: 'support' },
});
```

Register those tools on the Mastra agent that should be able to retrieve or store durable memory. Scope is fixed when the tools are created, so the model cannot rebind tools to another user.

## See also

-   [SDK Overview](/sdk/overview)
-   [Vercel AI SDK integration](/integrations/frameworks/vercel-ai-sdk/local)
