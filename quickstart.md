# Quickstart

> Agent index: [llms.txt](/llms.txt)

Install core, start a local memory service, and run your first ingest and search.

## Prerequisites

-   **Node.js 22+**
-   **Docker** if you want the packaged Postgres/pgvector development stack
-   **Provider credentials or local provider config** for embeddings and memory extraction:
    -   **OpenAI** is the shortest one-key quickstart because it can serve both embeddings and extraction.
    -   **Anthropic**, **Google Gemini**, **Groq**, **Voyage**, and OpenAI-compatible services are supported for the provider roles they implement.
    -   **Ollama**, **transformers**, and **Claude Code local auth** cover local/personal workflows. See [providers](/platform/providers) for the exact env vars.

That is all. The local stack brings its own Postgres with pgvector.

## Step 1, Install

Install the CLI and core package:

```bash
npm install -g @atomicmemory/cli
npm install @atomicmemory/core
```

## Step 2, Start core

Create a local profile, set your provider key, and start the packaged service:

```bash
atomicmemory init \
  --profile local \
  --provider atomicmemory \
  --api-url http://127.0.0.1:3050 \
  --trust-surface local \
  --user "$USER" \
  --namespace quickstart

export OPENAI_API_KEY="sk-..."
npx @atomicmemory/core start --profile local
```

The local service binds to port `3050`. In development mode it can start the packaged Postgres/pgvector stack for you; in production, point it at managed Postgres and explicit provider credentials.

## Step 3, Verify health

Hit the memory subsystem health endpoint to confirm the server is live and see the active runtime config.

```bash
curl http://localhost:3050/v1/memories/health
```

You should get back a JSON object with `"status": "ok"` and a `config` snapshot showing the selected embedding and LLM providers.

## Step 4, First ingest

Send a conversation and let AtomicMemory extract structured facts, embed them, and run AUDN to decide what to store.

```bash
curl -X POST http://localhost:3050/v1/memories/ingest \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"alice","conversation":"user: I ship Go backends and TypeScript frontends.","source_site":"quickstart"}'
```

The response reports `facts_extracted`, `memories_stored`, `stored_memory_ids`, and `updated_memory_ids`, that is AUDN telling you what survived dedup and contradiction checks.

## Step 5, First search

Query the memories you just created. AtomicMemory runs semantic retrieval, applies the active retrieval profile, and packages the result. Hybrid retrieval (vector + BM25/FTS with RRF fusion) is available through the `quality` profile or per-request config overrides, but the default `balanced` profile keeps it off.

```bash
curl -X POST http://localhost:3050/v1/memories/search \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"alice","query":"what stack does alice use?"}'
```

The response carries three things worth noting:

-   **`memories`**, ranked results with `similarity`, composite `score`, and `importance`
-   **`injection_text`**, a pre-formatted markdown block, date-stamped and grouped by source, ready to paste directly into an LLM system prompt
-   **`observability`**, stable trace metadata (timing, retrieval mode, citations) so you can wire evals and dashboards without reverse-engineering internals

## What next

-   **Swap to a local embedding model**, run entirely offline with `transformers` (WASM) or `ollama`. See [providers](/platform/providers).
-   **Register or upload artifacts**, pointer artifacts work by default; managed storage providers such as S3 or Filecoin are optional. See [artifact storage](/platform/artifact-storage).
-   **Workspace-scoped memory**, separate personal memory from team memory with first-class scope dispatch. See [scope](/platform/scope).
-   **Full API reference**, every endpoint, request, and response shape. Start with [ingest](/api-reference/http/ingest-memory).

## Using the TypeScript SDK

If you're building in TypeScript or JavaScript, the [SDK Quickstart](/sdk/quickstart) shows the same ingest-and-search round trip above, typed, with the SDK's policy layer (capture / injection gates) in front of the same core endpoints. The SDK is not required, everything above is just HTTP, but it handles the ergonomics, the scope helpers, and the backend-agnostic routing if you want to target more than one memory engine from the same code.

## Contributor setup

If you are changing core itself, clone the repo and run the source stack:

```bash
git clone https://github.com/atomicstrata/atomicmemory-core.git
cd atomicmemory-core
cp .env.example .env
# edit .env, set OPENAI_API_KEY
docker compose up -d --build
```

## Running in production

The local stack above is the development shape. For production, run `@atomicmemory/core` with managed Postgres, explicit provider credentials, hardened CORS, and the `CORE_RUNTIME_CONFIG_MUTATION_ENABLED` gate disabled unless an operator intentionally enables runtime config writes.
