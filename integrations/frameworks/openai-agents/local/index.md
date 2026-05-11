# OpenAI Agents SDK Local

> Agent index: [llms.txt](/llms.txt)

Source-only

`@atomicmemory/openai-agents` lives in the integrations repo under `adapters/openai-agents-sdk`. It is not published to npm yet; install it from a local clone or workspace package until a registry release is cut.

The adapter wires AtomicMemory into the [OpenAI Agents SDK for TypeScript](https://openai.github.io/openai-agents-js/) without replacing the SDK's own session layer:

-   retrieve relevant long-term memories before `run()`
-   inject retrieved memories as a guarded `system()` input item
-   ingest the completed turn after `run()`
-   expose optional `memory_search` and `memory_ingest` function tools through the SDK's `tool()` helper

The OpenAI Agents SDK separates local run context from model-visible context. Local `context` is available to tools and hooks, but the model only sees conversation input. That is why this adapter injects retrieved memories into the run input instead of only storing them in `context`.

## Primitives

| API | Use when |
| --- | --- |
| `augmentInputWithMemory()` | You want to search memory before `run()` and pass the augmented `AgentInputItem[]` yourself. |
| `ingestAgentTurn()` | You want explicit post-run capture after `run()`, including streamed runs after `completed`. |
| `runWithMemory()` | You want a convenience wrapper around pre-run retrieval, your `run()` call, and post-run ingest. |
| `createMemoryTools()` | You want the agent to call `memory_search` or `memory_ingest` as function tools during a run. |

## Install

From the integrations repo:

```bash
pnpm install
pnpm --filter @atomicmemory/openai-agents build
```

Then depend on the local package from your workspace, or use your package manager's `file:` / workspace linking support. The current source package depends on the local `@atomicmemory/atomicmemory-sdk` checkout, so publish order matters: publish or link the SDK first, then the adapter.

## Configure memory

```ts
import { MemoryClient } from '@atomicmemory/atomicmemory-sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {},
  },
  defaultProvider: 'atomicmemory',
});

await memory.initialize();

const scope = {
  namespace: projectId,
};
```

The adapter resolves the AtomicMemory service, credentials, and base user identity automatically. The current session name is used as that default identity. Use the same `scope` for retrieval, tools, and ingest when you want namespace- or agent-level partitioning on top of that default.

## Convenience flow

```ts
import { Agent, run } from '@openai/agents';
import { runWithMemory } from '@atomicmemory/openai-agents';

const agent = new Agent({
  name: 'Support assistant',
  instructions: 'Answer accurately and use durable memory when relevant.',
});

const { result, retrieved } = await runWithMemory({
  client: memory,
  scope,
  input: 'What did we decide about billing retries?',
  run: (input) => run(agent, input),
});

console.log(result.finalOutput, retrieved.length);
```

`runWithMemory()` passes `AgentInputItem[]` to your supplied runner. It returns the original run result plus retrieved-memory and ingest telemetry.

## Split retrieval and ingest

Use the split primitives when your app already controls streaming, sessions, guardrails, or run retries.

```ts
import { run } from '@openai/agents';
import {
  augmentInputWithMemory,
  ingestAgentTurn,
} from '@atomicmemory/openai-agents';

const { input, retrieved } = await augmentInputWithMemory(memory, {
  scope,
  input: 'Summarize this customer account.',
  limit: 8,
});

const result = await run(agent, input, { context: { customerId } });

await ingestAgentTurn(memory, {
  scope,
  input,
  result,
  metadata: { source: 'openai-agents', event: 'run_completed' },
});
```

For streamed runs, wait for the SDK result to settle and pass text explicitly if `finalOutput` is not the exact content you want to store:

```ts
const stream = await run(agent, input, { stream: true });
await stream.completed;

await ingestAgentTurn(memory, {
  scope,
  input,
  output: String(stream.finalOutput ?? ''),
});
```

## Function tools

`createMemoryTools()` returns two OpenAI Agents SDK function tools:

-   `memory_search` - semantic retrieval with the configured AtomicMemory scope
-   `memory_ingest` - stores durable preferences, decisions, conventions, or facts

```ts
import { Agent } from '@openai/agents';
import { createMemoryTools } from '@atomicmemory/openai-agents';

const agent = new Agent({
  name: 'Memory-aware assistant',
  instructions:
    'Use memory_search when prior context may matter. Use memory_ingest for durable user preferences, decisions, or stable facts.',
  tools: createMemoryTools(memory, {
    scope,
    metadata: { source: 'openai-agents-tool' },
  }),
});
```

Use tools for agent-decided memory access. Use `augmentInputWithMemory()` or `runWithMemory()` when every run should get deterministic memory retrieval before the first model call.

## Ingest policy

`ingestAgentTurn()` uses SDK `mode: "messages"` so AtomicMemory's AUDN mutation can add, update, delete, or no-op extracted facts instead of accumulating duplicates.

System messages are excluded by default because they usually contain app instructions, policies, or retrieved context. If your system inputs are user-authored content worth remembering, opt in explicitly:

```ts
await ingestAgentTurn(memory, {
  input,
  result,
  scope,
  includeRoles: ['system', 'user', 'assistant', 'tool'],
});
```

## See also

-   [OpenAI Agents SDK docs](https://openai.github.io/openai-agents-js/)
-   [SDK Overview](/sdk/overview)
-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend)
-   [Scopes and identity](/sdk/concepts/scopes-and-identity)
