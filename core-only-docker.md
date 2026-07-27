# Core-only Docker

> Agent index: [llms.txt](/llms.txt)

Run Core on your machine with Docker and HTTP — no Cloud account, no `am init`, no console visibility. Use this for air-gapped evaluation, CI, or when you want full control of the container yourself.

For the recommended Open Source path with console visibility, start with the [Open Source Quickstart](/open-source/quickstart).

**You need:** Docker · OpenAI API key

## Start Core

```bash
export OPENAI_API_KEY="sk-..."

docker run -d --pull always \
  --name atomicmemory-core \
  -p 127.0.0.1:17350:17350 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v $HOME/.atomicstrata/atomicmemory-docker:/var/lib/atomicmemory/postgres \
  ghcr.io/atomicstrata/atomicmemory-core:latest
```

Core binds to `127.0.0.1:17350`. The volume mount persists Postgres data at `$HOME/.atomicstrata/atomicmemory-docker`.

Local Docker runs use a default development bearer token:

```text
Authorization: Bearer local-dev-key
```

## Verify health

```bash
curl -H 'Authorization: Bearer local-dev-key' \
  http://localhost:17350/v1/memories/health
```

Expect `"status": "ok"`.

## First ingest and search

```bash
curl -X POST http://localhost:17350/v1/memories/ingest \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer local-dev-key' \
  -d '{"user_id":"alice","conversation":"user: I ship Go backends and TypeScript frontends.","source_site":"quickstart"}'

curl -X POST http://localhost:17350/v1/memories/search \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer local-dev-key' \
  -d '{"user_id":"alice","query":"what stack does alice use?"}'
```

## Manage the container

```bash
docker logs -f atomicmemory-core
docker stop atomicmemory-core && docker start atomicmemory-core
```

Recreate after env or image changes: `docker rm -f atomicmemory-core`, then run the `docker run` command again. Data on disk survives recreation.

## Optional — npm CLI profile

The Node.js [`@atomicmemory/cli`](/cli) package is separate from the Cloud `am` binary:

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

## Production notes

Evaluation defaults are not production-ready. For production, use managed Postgres via `DATABASE_URL`, explicit `CORE_API_KEY` and `STORAGE_KEY_HMAC_SECRET`, hardened CORS, and disable runtime config mutation unless an operator intentionally enables it.

## Contributor setup

To hack on Core itself:

```bash
git clone https://github.com/atomicstrata/atomicmemory.git
cd atomicmemory/packages/core
cp .env.example .env
# edit .env, set OPENAI_API_KEY
docker compose up -d --build
```
