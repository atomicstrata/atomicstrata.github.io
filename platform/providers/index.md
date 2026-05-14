# Providers

> Agent index: [llms.txt](/llms.txt)

Embeddings and LLM calls in AtomicMemory are **pluggable providers behind single-method interfaces**. You pick OpenAI, Anthropic, Google, Groq, Ollama, a local WASM model, or any OpenAI-compatible endpoint at deploy time via environment variables. Nothing above the provider boundary changes, no code, no imports, no service wiring.

That is the second pillar of the platform layer: the services that call `embedText()` and `chat()` don't know, and can't know, which provider is serving the call. The selection is made once at composition-root time and erased behind an interface.

## The two interfaces

Both provider families are tiny. That's deliberate: the less surface the interface has, the more backends can satisfy it, and the harder it is to leak provider-specific concepts into business logic.

### EmbeddingProvider

From [`atomicmemory-core/src/services/embedding.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/embedding.ts):

```ts
export type EmbeddingTask = 'query' | 'document';

export interface EmbeddingProvider {
  embed(text: string, task: EmbeddingTask): Promise<number[]>;
  embedBatch(texts: string[], task: EmbeddingTask): Promise<number[][]>;
}
```

Two methods. One for single embeddings, one for batch. The `task` argument lets providers apply query/document-specific behavior without leaking provider details into ingest or search. Every backend, OpenAI REST, Ollama's native API, local WASM via transformers.js, Voyage AI, any OpenAI-compatible endpoint , satisfies exactly this shape.

### LLMProvider

From [`atomicmemory-core/src/services/llm.ts:60-74`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/llm.ts#L60-L74):

```ts
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  seed?: number;
}

export interface LLMProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
}
```

One method. Chat messages in, completion text out. JSON mode, seed, and temperature are passed as options, any backend that can't honor one of them (for instance, Anthropic ignores `seed`) degrades gracefully inside the adapter, never leaking the difference to callers.

---

## The supported providers

### Embeddings

| Provider name (`EMBEDDING_PROVIDER=`) | Backend |
| --- | --- |
| `openai` | OpenAI embeddings REST API |
| `ollama` | Ollama native `/api/embed` endpoint |
| `openai-compatible` | Any OpenAI-schema endpoint (LM Studio, vLLM, TGI, …) |
| `transformers` | Local WASM via `@huggingface/transformers` + ONNX Runtime |
| `voyage` | Voyage AI embeddings with compatible document/query model pairs |

Declared in [`config.ts:14`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/config.ts#L14):

```ts
export type EmbeddingProviderName =
  'openai' | 'ollama' | 'openai-compatible' | 'transformers' | 'voyage';
```

### LLM

| Provider name (`LLM_PROVIDER=`) | Backend |
| --- | --- |
| `openai` | OpenAI chat completions |
| `anthropic` | Anthropic Messages API |
| `google-genai` | Google Gemini via OpenAI-compatible endpoint |
| `groq` | Groq via OpenAI-compatible endpoint |
| `ollama` | Ollama native `/api/chat` endpoint |
| `openai-compatible` | Any OpenAI-schema endpoint (LM Studio, vLLM, …) |

Declared in [`config.ts:15`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/config.ts#L15):

```ts
export type LLMProviderName =
  EmbeddingProviderName | 'groq' | 'anthropic' | 'google-genai';
```

Note the subtype relationship: the LLM provider union builds on the embedding provider names, then adds chat-only providers. Embedding-only providers such as `transformers` and `voyage` have no chat backend.

---

## The factory is the only place the provider name is visible

This is the crux of the provider-agnostic boundary. The entire codebase above `embedding.ts` never matches on provider name. The `switch` happens once, inside the factory, and is erased the moment the provider is returned.

From [`embedding.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/embedding.ts):

```ts
function createEmbeddingProvider(): EmbeddingProvider {
  const config = requireConfig();
  switch (config.embeddingProvider) {
    case 'openai':
      return new OpenAICompatibleEmbedding(
        config.openaiApiKey, config.embeddingModel,
        undefined, config.embeddingDimensions,
      );
    case 'ollama':
      return new OllamaEmbedding(
        config.embeddingModel, config.ollamaBaseUrl,
      );
    case 'openai-compatible':
      return new OpenAICompatibleEmbedding(
        config.embeddingApiKey ?? config.openaiApiKey,
        config.embeddingModel,
        config.embeddingApiUrl,
        config.embeddingDimensions,
      );
    case 'transformers':
      return new TransformersEmbedding(config.embeddingModel);
    case 'voyage':
      if (!config.voyageApiKey) {
        throw new Error('VOYAGE_API_KEY is required when EMBEDDING_PROVIDER=voyage');
      }
      return new VoyageEmbedding(
        config,
        config.voyageApiKey,
        config.voyageDocumentModel,
        config.voyageQueryModel,
        config.embeddingDimensions,
      );
    default:
      throw new Error(
        `Unknown embedding provider: ${config.embeddingProvider}`,
      );
  }
}
```

And the LLM factory, from [`llm.ts:259-289`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/llm.ts#L259-L289):

```ts
export function createLLMProvider(): LLMProvider {
  const config = requireConfig();
  switch (config.llmProvider) {
    case 'openai':
      return new OpenAICompatibleLLM(config.openaiApiKey, config.llmModel);
    case 'ollama':
      return new OllamaLLM(config.llmModel, config.ollamaBaseUrl);
    case 'groq':
      return new OpenAICompatibleLLM(
        config.groqApiKey ?? '',
        config.llmModel,
        'https://api.groq.com/openai/v1',
      );
    case 'anthropic':
      return new AnthropicLLM(config.anthropicApiKey ?? '', config.llmModel);
    case 'google-genai':
      return new OpenAICompatibleLLM(
        config.googleApiKey ?? '',
        config.llmModel,
        'https://generativelanguage.googleapis.com/v1beta/openai/',
      );
    case 'openai-compatible':
      return new OpenAICompatibleLLM(
        config.llmApiKey ?? config.openaiApiKey,
        config.llmModel,
        config.llmApiUrl,
      );
    default:
      throw new Error(`Unknown LLM provider: ${config.llmProvider}`);
  }
}
```

Two things to notice:

1.  **Three providers (Groq, Google Gemini, OpenAI-compatible) reuse `OpenAICompatibleLLM`.** The OpenAI SDK's wire format is the industry default, so the adapter is written once and pointed at different `baseURL`s. That's what "openai-compatible" costs us, nothing.
2.  **Anthropic gets its own adapter** because the Messages API has a different message shape (system prompt is top-level, assistant/user messages are separate). The adapter normalizes it to `chat(messages, options)` and callers never see the difference.

---

## Changing provider with zero code change

This is the headline. Here's the ingest pipeline calling `embedText`:

```ts
import { embedText } from './services/embedding.js';

// Inside the ingest service, no provider name anywhere.
const embedding = await embedText(userMessage, 'document');
await stores.memory.storeMemory({
  userId, content: userMessage, embedding, importance, sourceSite,
});
```

The same call site runs against OpenAI:

```bash
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=sk-…
```

Or against a local Ollama:

```bash
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=snowflake-arctic-embed2
OLLAMA_BASE_URL=http://localhost:11434
```

Or against fully-local WASM with zero network:

```bash
EMBEDDING_PROVIDER=transformers
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
```

Or against an OpenAI-compatible server (LM Studio, vLLM, TGI, a corporate proxy):

```bash
EMBEDDING_PROVIDER=openai-compatible
EMBEDDING_MODEL=bge-large-en-v1.5
EMBEDDING_API_URL=http://internal-embed.corp:8080/v1
EMBEDDING_API_KEY=…   # optional
```

Or against Voyage AI with compatible document/query models:

```bash
EMBEDDING_PROVIDER=voyage
EMBEDDING_DIMENSIONS=1024
VOYAGE_DOCUMENT_MODEL=voyage-4-large
VOYAGE_QUERY_MODEL=voyage-4-lite
VOYAGE_API_KEY=pa-…
```

The ingest service, the search service, the AUDN decision loop, the repair loop, none of them have a single `if (provider === 'ollama')` branch. That is the provider-agnostic boundary working as designed.

---

## Provider quirks stay inside the adapter

Being agnostic doesn't mean being naïve. Real embedding models have real quirks, and the adapter layer is where those quirks live, never above. Two examples from the shipped code:

### Instruction prefixes

Some embedding models (mxbai, nomic) need task-specific prefixes on query text but not document text. The provider-agnostic `embedText` function handles that before dispatch. From [`embedding.ts:292-308`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/embedding.ts#L292-L308):

```ts
function getInstructionPrefix(model: string, task: EmbeddingTask): string {
  if (task === 'document') return '';

  if (model.includes('mxbai-embed-large')) {
    return 'Represent this sentence for searching relevant passages: ';
  }
  if (model.includes('nomic-embed-text')) {
    return 'search_query: ';
  }
  return '';
}
```

Callers pass `'query'` or `'document'` as a semantic tag. The prefix (if any) is model-specific, and the logic lives in one place.

### ONNX Runtime serialization (WASM provider)

The local WASM provider has a known concurrency issue, ONNX Runtime's mutex corrupts under concurrent async calls. Rather than leak a "don't call concurrently" caveat into every consumer, the adapter serializes internally. From [`embedding.ts:168-218`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/embedding.ts#L168-L218):

```ts
class TransformersEmbedding implements EmbeddingProvider {
  private model: string;
  private pipelinePromise: Promise<TransformersPipeline> | null = null;
  private inferenceQueue: Promise<void> = Promise.resolve();

  private serialized<T>(fn: (extractor: TransformersPipeline) => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.inferenceQueue = this.inferenceQueue.then(async () => {
        try {
          const extractor = await this.getPipeline();
          resolve(await fn(extractor));
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async embed(text: string): Promise<number[]> {
    return this.serialized(async (extractor) => {
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data as Float32Array);
    });
  }

  // embedBatch follows the same pattern.
}
```

The rule: **every provider-specific workaround lives inside the adapter.** The `EmbeddingProvider` interface is the same shape for every backend.

---

## Cost telemetry is cross-cutting

Every provider adapter, OpenAI, Anthropic, Ollama, Google, Groq, calls `writeCostEvent()` with the same shape after each request. That gives you one cost log across heterogeneous backends, keyed by provider, model, and stage. You can swap models and still see apples-to-apples cost data in a single stream.

See the `recordOpenAICost` helper in [`llm.ts:147-164`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/llm.ts#L147-L164) for the OpenAI-compatible path; every other adapter writes the same event shape inline.

---

## Writing your own provider

Because `EmbeddingProvider` and `LLMProvider` are interfaces, not base classes, adding a new backend is mechanical:

1.  Implement the one-or-two-method interface.
2.  Add a case to the factory switch.
3.  Extend `EmbeddingProviderName` or `LLMProviderName` in `config.ts`.
4.  Wire any required API keys or model names into `RuntimeConfig`.
5.  Include all provider-specific identity fields in the cache/provider key.

There are no base classes to extend, no lifecycle hooks to implement, no plugin registry to register with. The provider layer is as small as the `EmbeddingProvider` and `LLMProvider` signatures say it is.

## Startup-only selection

Provider and model selection is **composition-time** by design. Server deployments normally bind that config from env at startup. In-process harnesses can instead pass a full `RuntimeConfig` to `createCoreRuntime({ pool, config })` when they need an isolated benchmark run with a different embedding stack.

The modules hold their config as module-local state, bound by the composition root. From [`embedding.ts`](https://github.com/atomicstrata/atomicmemory-core/blob/main/src/services/embedding.ts):

```ts
export function initEmbedding(config: EmbeddingConfig): void {
  embeddingConfig = config;
  provider = null;
  providerKey = '';
  embeddingCache.clear();
}
```

That's deliberate. Hot-swapping embedding providers inside an already-running runtime would invalidate the embedding cache, invalidate pgvector index assumptions, and potentially mix embedding widths in the same table. We sidestep all of that by making provider selection fixed for a runtime. Benchmark harnesses should create a fresh isolated runtime or process for each embedding configuration.

## Naming

This page is about **embedding and LLM providers** inside the engine, OpenAI, Ollama, Anthropic, etc. Two other provider concepts live at different layers:

-   **Memory providers** ([`MemoryProvider`](/sdk/concepts/provider-model)), the SDK interface a memory backend implements so the SDK can route through it.
-   **Artifact storage providers** ([artifact storage](/platform/artifact-storage)), the optional core backends (`local_fs`, `s3`, `filecoin`) that store raw artifact bytes when a deployment opts into managed storage.

Different layer, different contract.

## Related

-   [Stores](/platform/stores), the other half of the platform layer: pluggable storage behind narrow interfaces.
-   [Artifact Storage](/platform/artifact-storage), optional raw-byte storage for documents and artifacts.
-   [Composition](/platform/composition), how providers, stores, and services are wired together at startup.
