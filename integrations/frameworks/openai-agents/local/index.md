# OpenAI Agents SDK Local

> Agent index: [llms.txt](/llms.txt)

Give OpenAI Agents SDK applications persistent memory backed by AtomicMemory. The adapter searches long-term memory before `run()`, injects retrieved context into model-visible input, and ingests the completed turn after the run finishes.

## Quick start

### 1. Start AtomicMemory core

Start local core first. It should be reachable at `http://127.0.0.1:17350`.

```bash
export OPENAI_API_KEY="sk-..."

docker run -d --pull always \
  --name atomicmemory-core \
  -p 127.0.0.1:17350:17350 \
  -e LLM_PROVIDER=openai \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e EMBEDDING_PROVIDER=transformers \
  -e EMBEDDING_DIMENSIONS=384 \
  -v $HOME/.atomicstrata/atomicmemory-docker:/var/lib/atomicmemory/postgres \
  ghcr.io/atomicstrata/atomicmemory-core:latest
```

Important note

This quickstart uses the free local `transformers` embedding model so it can run without a separate embedding API key. For production or higher-recall use, switch core to a stronger paid embedding provider as soon as you are ready.

### 2. Install the adapter

```bash
npm install @atomicmemory/openai-agents @atomicmemory/sdk
```

### 3. Configure memory

```ts
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'http://127.0.0.1:17350',
      apiKey: 'local-dev-key',
    },
  },
  defaultProvider: 'atomicmemory',
});

await memory.initialize();

const scope = {
  namespace: projectId,
};
```

### 4. Wrap a run

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
```

## Features

-   **Pre-run recall.** Search AtomicMemory before calling `run()`.
-   **Guarded input injection.** Retrieved memories are added to model-visible input because SDK local `context` is not shown to the model.
-   **Post-run ingest.** Completed runs are stored with `mode: "messages"` for extracted memory updates.
-   **Optional function tools.** Agents can call `memory_search` and `memory_ingest` during a run.

## Modes of operation

### Convenience mode

Use `runWithMemory()` when you want one wrapper around recall, `run()`, and ingest.

### Split retrieval and ingest

Use split primitives when your app already controls streaming, sessions, guardrails, or retries:

```ts
import { run } from '@openai/agents';
import { augmentInputWithMemory, ingestAgentTurn } from '@atomicmemory/openai-agents';

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

### Function tools

Use function tools when the agent should decide when memory matters:

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

## Adapter primitives

| API | Maps to | Purpose |
| --- | --- | --- |
| `augmentInputWithMemory()` | `MemoryClient.search` | Search memory before `run()` and return augmented `AgentInputItem[]`. |
| `ingestAgentTurn()` | `MemoryClient.ingest` | Store completed runs, including streamed runs after completion. |
| `runWithMemory()` | search + ingest | Convenience wrapper around recall, `run()`, and ingest. |
| `createMemoryTools()` | `tool()` helper | Expose `memory_search` and `memory_ingest` as function tools. |

## Ingest policy

System inputs are excluded by default because they usually contain app instructions, policies, or retrieved context. Opt in only when system content is user-authored and should be remembered.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Retrieved memory is not visible to the model | Confirm you pass the augmented input to `run()`, not only local `context`. |
| Streamed output is missing from memory | Wait for the stream to complete before calling `ingestAgentTurn()`. |
| Unexpected memory sharing | Use a narrower `scope.namespace`, `scope.agent`, or `scope.thread`. |

## Development

For source builds, adapter development, and local testing, see the [integration contributor notes](/integrations/overview#contributing).

## See also

-   [OpenAI Agents SDK docs](https://openai.github.io/openai-agents-js/)
-   [SDK Overview](/sdk/overview)
-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend)
-   [Scopes and identity](/sdk/concepts/scopes-and-identity)
