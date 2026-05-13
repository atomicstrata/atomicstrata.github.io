# Mastra Local

> Agent index: [llms.txt](/llms.txt)

AtomicMemory support for Mastra is planned. The adapter will wrap `MemoryClient` as a Mastra-compatible memory provider for agents that need durable recall across runs.

Planned

This adapter is on the roadmap. The API below is the intended shape, not a shipped package.

## What you get

-   **Mastra memory adapter.** A planned `atomicMemory()` adapter for Mastra agents.
-   **Lifecycle mapping.** Mastra memory hooks mapped to AtomicMemory search and ingest.
-   **Backend-agnostic SDK path.** The adapter will use the AtomicMemory SDK provider registry.

## Planned API

| API | Purpose |
| --- | --- |
| `atomicMemory()` | Mastra memory adapter backed by AtomicMemory. |
| Lifecycle mapping | Mastra memory hooks mapped to AtomicMemory search and ingest. |
| Telemetry envelope | AtomicMemory observability surfaced through Mastra telemetry. |

## Intended usage

```ts
import { Agent } from '@mastra/core';
import { atomicMemory } from '@atomicmemory/mastra';

const agent = new Agent({
  name: 'support',
  instructions: 'Answer with durable customer context when relevant.',
  model,
  memory: atomicMemory({
    client: memoryClient,
    scope: { user: userId, namespace: 'support' },
  }),
});
```

## See also

-   [SDK Overview](/sdk/overview)
-   [Vercel AI SDK integration](/integrations/frameworks/vercel-ai-sdk/local)
