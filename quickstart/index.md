# Quickstart

> Agent index: [llms.txt](/llms.txt)

Start a local memory service from the published Docker image, then run your first ingest and search.

## Prerequisites

-   **Docker**
-   **An OpenAI API key** for the shortest one-key quickstart. OpenAI serves both embeddings and extraction in the default image configuration.

That is all. The image brings its own Postgres with pgvector and stores data in the mounted directory you provide.

## Step 1, Start core

Run the published image:

```bash
export OPENAI_API_KEY="sk-..."

docker run -d --pull always \
  --name atomicmemory-core \
  -p 127.0.0.1:17350:17350 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v $HOME/.atomicstrata/atomicmemory-docker:/var/lib/atomicmemory/postgres \
  ghcr.io/atomicstrata/atomicmemory-core:latest
```

The container binds core to `127.0.0.1:17350`. The volume mount persists the embedded Postgres database on your host at `$HOME/.atomicstrata/atomicmemory-docker`, so your local memory data survives container restarts, image upgrades, and container recreation.

For local Docker runs, core defaults `DATABASE_URL` to embedded Postgres and sets a local development API key:

```text
Authorization: Bearer local-dev-key
```

## Optional, Manage The Container

Watch startup logs:

```bash
docker logs -f atomicmemory-core
```

Stop and restart the same container:

```bash
docker stop atomicmemory-core
docker start atomicmemory-core
```

Recreate it after changing environment variables or pulling a newer image:

```bash
docker rm -f atomicmemory-core
```

Then run the Step 1 command again. The database stays on disk at `$HOME/.atomicstrata/atomicmemory-docker`.

## Optional, Configure The CLI

Install the CLI if you want terminal commands on top of the running service:

```bash
npm install -g @atomicmemory/cli

printf '%s\n' 'local-dev-key' | \
atomicmemory init \
  --profile local \
  --provider atomicmemory \
  --api-url http://127.0.0.1:17350 \
  --trust-surface local \
  --user "$USER" \
  --namespace quickstart \
  --api-key-stdin \
  --save-api-key
```

## Step 2, Verify health

Hit the memory subsystem health endpoint to confirm the server is live and see the active runtime config.

```bash
curl -H 'Authorization: Bearer local-dev-key' \
  http://localhost:17350/v1/memories/health
```

You should get back a JSON object with `"status": "ok"` and a `config` snapshot showing the selected embedding and LLM providers.

## Step 3, First ingest

Send a conversation and let AtomicMemory extract structured facts, embed them, and run AUDN to decide what to store.

```bash
curl -X POST http://localhost:17350/v1/memories/ingest \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer local-dev-key' \
  -d '{"user_id":"alice","conversation":"user: I ship Go backends and TypeScript frontends.","source_site":"quickstart"}'
```

The response reports `facts_extracted`, `memories_stored`, `stored_memory_ids`, and `updated_memory_ids`, that is AUDN telling you what survived dedup and contradiction checks.

## Step 4, First search

Query the memories you just created. AtomicMemory runs semantic retrieval, applies the active retrieval profile, and packages the result. Hybrid retrieval (vector + BM25/FTS with RRF fusion) is available through the `quality` profile or per-request config overrides, but the default `balanced` profile keeps it off.

```bash
curl -X POST http://localhost:17350/v1/memories/search \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer local-dev-key' \
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

If you are changing core itself, clone the repo and run the source stack instead of the published image:

```bash
git clone https://github.com/atomicstrata/atomicmemory.git
cd atomicmemory/packages/core
cp .env.example .env
# edit .env, set OPENAI_API_KEY
docker compose up -d --build
```

## Running in production

The local image defaults are intentionally optimized for one-command evaluation. For production, run the same image with managed Postgres via `DATABASE_URL`, explicit `CORE_API_KEY` and `STORAGE_KEY_HMAC_SECRET` secrets, hardened CORS, and the `CORE_RUNTIME_CONFIG_MUTATION_ENABLED` gate disabled unless an operator intentionally enables runtime config writes.
