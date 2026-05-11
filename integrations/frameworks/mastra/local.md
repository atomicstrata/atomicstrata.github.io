# Mastra Local

> Agent index: [llms.txt](/llms.txt)

Planned

This adapter is on the roadmap. The shape below is the intended API, not a shipped package.

## Intended shape

Mastra's agent primitive accepts a pluggable memory interface. `@atomicmemory/mastra` will wrap `MemoryClient` to satisfy it:

```ts
import { Agent } from '@mastra/core';
import { atomicMemory } from '@atomicmemory/mastra';

const agent = new Agent({
  name: 'support',
  instructions: '…',
  model,                             // any Mastra-compatible model
  memory: atomicMemory({
    client: memoryClient,
    scope: { user: userId, namespace: 'support' },
  }),
});
```

The adapter maps Mastra's memory lifecycle hooks (`beforeStep`, `afterStep`) onto AtomicMemory's search / ingest calls and surfaces the `observability` envelope through Mastra's telemetry.

## See also

-   [SDK Overview](/sdk/overview)
-   [Vercel AI SDK integration](/integrations/frameworks/vercel-ai-sdk/local)
