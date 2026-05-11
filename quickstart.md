# Quickstart

> Agent index: [llms.txt](/llms.txt)

Docker up, first ingest, first search, in under 2 minutes.

## Prerequisites

-   **Docker** (Docker Desktop or Docker Engine with `docker compose`)
-   **An LLM / embedding provider**, either:
    -   An **OpenAI API key** (default path, zero extra setup), or
    -   A local **Ollama** install if you prefer to run everything on your machine, see [providers](/platform/providers) for the env vars to swap in

That is all. The Docker stack brings its own Postgres with pgvector.

## Step 1, Clone and start

Clone the core repo, copy the sample env file, drop in your API key, and bring the stack up.

```bash
git clone https://github.com/atomicmemory/atomicmemory-core.git
cd atomicmemory-core
cp .env.example .env
# edit .env, set OPENAI_API_KEY
docker compose up -d --build
```

The `-d` runs detached; `--build` compiles the image on first run. Migrations execute automatically on container start, so the database is ready when the server binds to port `3050`.

## Step 2, Verify health

Hit the memory subsystem health endpoint to confirm the server is live and see the active runtime config.

```bash
curl http://localhost:3050/v1/memories/health
```

You should get back a JSON object with `"status": "ok"` and a `config` snapshot showing the selected embedding and LLM providers.

## Step 3, First ingest

Send a conversation and let AtomicMemory extract structured facts, embed them, and run AUDN to decide what to store.

```bash
curl -X POST http://localhost:3050/v1/memories/ingest \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"alice","conversation":"user: I ship Go backends and TypeScript frontends.","source_site":"quickstart"}'
```

The response reports `facts_extracted`, `memories_stored`, `stored_memory_ids`, and `updated_memory_ids`, that is AUDN telling you what survived dedup and contradiction checks.

## Step 4, First search

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
-   **Workspace-scoped memory**, separate personal memory from team memory with first-class scope dispatch. See [scope](/platform/scope).
-   **Full API reference**, every endpoint, request, and response shape. Start with [ingest](/api-reference/http/ingest-memory).

## Using the TypeScript SDK

If you're building in TypeScript or JavaScript, the [SDK Quickstart](/sdk/quickstart) shows the same ingest-and-search round trip above, typed, with the SDK's policy layer (capture / injection gates) in front of the same core endpoints. The SDK is not required, everything above is just HTTP, but it handles the ergonomics, the scope helpers, and the backend-agnostic routing if you want to target more than one memory engine from the same code.

## Running in production

The Docker Compose stack above is the same shape you would deploy to a server or a managed container platform. For hardened production guidance, managed Postgres, secret handling, CORS, and the `CORE_RUNTIME_CONFIG_MUTATION_ENABLED` gate, follow the deployment section of the [core repo README](https://github.com/atomicmemory/atomicmemory-core#deployment).
