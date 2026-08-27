# Python SDK

> Agent index: [llms.txt](/llms.txt)

The [`atomicmemory` package on PyPI](https://pypi.org/project/atomicmemory/) is a Python port of the TypeScript SDK. It mirrors the public surface 1:1, so everything in this section's Concepts and Guides applies; this page covers the Python dialect: Pydantic models, `httpx` sync and async clients, snake\_case method names, and context-manager lifecycles.

## Install

```bash
pip install atomicmemory                    # core client + local search + SQLite store
pip install 'atomicmemory[embeddings]'      # adds sentence-transformers for local embeddings
```

## Quickstart: Hosted Cloud

Use the API key from `am init` (see the [CLI reference](/cli)) or create one with `am key create`:

```python
from atomicmemory import MemoryClient

with MemoryClient(
    providers={
        "atomicmemory": {
            "api_url": "https://api.atomicstrata.ai",
            "api_key": "amc_...",
        }
    }
) as memory:
    memory.initialize()

    memory.ingest(
        {
            "mode": "text",
            "content": "Simulation batch 17 showed two distinct trajectory regimes.",
            "scope": {"user": "demo"},
        }
    )

    page = memory.search(
        {
            "query": "What happened in simulation batch 17?",
            "scope": {"user": "demo"},
        }
    )
    for hit in page.results:
        print(hit.memory.content, hit.score)
```

`MemoryClient` takes the same provider map as the TypeScript client, in snake\_case. For a self-hosted backend, point `api_url` at your Core instance (`http://localhost:17350` after the [Open Source quickstart](/open-source/quickstart)) and use a key from `am connect env`.

## The full client: memory plus storage

`AtomicMemoryClient` wraps the memory namespace together with artifact storage and takes a single connection config:

```python
from atomicmemory import AtomicMemoryClient

with AtomicMemoryClient({
    "apiUrl": "http://localhost:17350",
    "apiKey": "server-api-key",
    "userId": "demo",
}) as client:
    client.memory.initialize()

    page = client.memory.search({"query": "seat preference", "scope": {"user": "demo"}})

    artifact = client.storage.put({
        "mode": "pointer",
        "uri": "https://example.com/manual.pdf",
        "contentType": "application/pdf",
    })
    print(artifact.artifact_id)
```

## Async

Every client has an async twin with the same surface:

```python
import asyncio
from atomicmemory import AsyncMemoryClient

async def main() -> None:
    async with AsyncMemoryClient(
        providers={"atomicmemory": {"api_url": "http://localhost:17350"}}
    ) as memory:
        await memory.initialize()
        page = await memory.search({"query": "seat preference", "scope": {"user": "demo"}})
        for hit in page.results:
            print(hit.memory.content)

asyncio.run(main())
```

`AsyncAtomicMemoryClient` does the same for the full client.

## AtomicMemory-specific features

With the `atomicmemory` provider configured, a typed handle exposes backend-specific routes in the categories `lifecycle`, `audit`, `lessons`, `config`, and `agents`:

```python
trail = client.memory.atomicmemory.audit.trail(memory_id="mem-123", user_id="demo")
health = client.memory.atomicmemory.config.health()
```

## Differences from the TypeScript SDK

-   Method and field names are snake\_case (`page.results`, `hit.memory.content`, `artifact.artifact_id`); connection config keys in `AtomicMemoryClient` match the TypeScript spelling (`apiUrl`, `apiKey`, `userId`).
-   Results are Pydantic models, not plain dicts.
-   Clients are context managers; use `with` / `async with` (or call `close()`).
-   Sync and async are separate classes rather than one promise-based client.

The [provider model](/sdk/concepts/provider-model) and [scopes and identity](/sdk/concepts/scopes-and-identity) concepts carry over unchanged.
