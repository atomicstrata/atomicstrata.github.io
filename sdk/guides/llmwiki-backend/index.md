# Using the llmwiki backends

> Agent index: [llms.txt](/llms.txt)

`@atomicmemory/llmwiki` connects AtomicMemory to [llm-wiki-compiler](https://github.com/atomicstrata/llm-wiki-compiler) (llmwiki), which compiles raw sources into an interlinked markdown wiki. Unlike the single-client Mem0 and Hindsight backends, the llmwiki integration is **three distinct paths** — pick by what you need:

| Path | What it does | Writable? |
| --- | --- | --- |
| **Import** (CLI bridge) | One-time import of a `wiki.json` export into your existing AtomicMemory backend as verbatim records | via your backend |
| **`SnapshotLLMWikiProvider`** | Serve a `wiki.json` export directly as a read-only memory provider — no runtime store at all | No |
| **`LiveLLMWikiProvider`** | Drive a live llmwiki project as a memory provider: ingest stores llmwiki *sources*, `compile()` rebuilds the wiki | Yes |

> **Support status.** The package is ESM-only and requires Node 22+. The Snapshot and Import paths need no extra dependencies; the Live path additionally requires the optional peer `llm-wiki-compiler@^0.9.0`.

```bash
npm i @atomicmemory/llmwiki @atomicmemory/sdk
npm i llm-wiki-compiler@^0.9.0   # only for the Live path
```

## Path 1: Import a wiki export (CLI, recommended)

llmwiki can emit its compiled wiki as a typed JSON envelope (`llmwiki export --target json --project-id my-kb`). The bridge maps each page to one **verbatim** memory record in your existing backend, preserving all advisory metadata (citations, confidence, provenance, contradictions) under `memory.metadata.llmwiki.*`:

```bash
atomicmemory import --type llmwiki ./wiki.json --user alice --namespace team-kb
```

Add `--dry-run` to inspect the envelope without ingesting. The CLI wraps the re-import probe, per-page failure capture, and a non-zero exit on partial failure — verbatim ingest is append-only, so re-running an import on the same `projectId` is refused unless you explicitly pass `--allow-append-only --accept-duplicates`.

Every page gets a deterministic external ID, `llmwiki/<projectId>/<pageDirectory>/<slug>` — **treat `projectId` as a tenant key and keep it globally unique per user**; colliding projectIds produce silent duplicate records, not overwrites.

SDK-direct import (`loadLLMWikiExport` + `toAtomicMemoryIngestInputs` + `provider.ingest()`) is available when you need the bridge inside application code, but you take on error handling and rollback yourself.

## Path 2: Snapshot provider (read-only)

Serve a `wiki.json` directly — queryable knowledge with no store, no network, and a hard read-only safety boundary. Good for CI, review environments, and serverless readers.

```typescript
import { MemoryClient } from '@atomicmemory/sdk';
import { loadLLMWikiExport, snapshotLlmwikiProviderFactory } from '@atomicmemory/llmwiki';

const exportData = await loadLLMWikiExport('./wiki.json');

const memory = new MemoryClient({
  providers: {
    llmwiki: { exportData, scope: { user: 'alice' } },
  },
  defaultProvider: 'llmwiki',
});
await memory.initialize({ llmwiki: snapshotLlmwikiProviderFactory });

const page = await memory.search({ query: 'chunking', scope: { user: 'alice' } });
```

Snapshot semantics to plan around:

-   **Read-only.** `ingestModes` is `[]`; `ingest`/`delete` throw with code `E_LLMWIKI_PROVIDER_READONLY`. `search`, `get`, `list`, and the `package` extension work.
-   **Single-tenant by construction.** Every request's scope must exactly match the construction scope, or the call throws `E_LLMWIKI_PROVIDER_SCOPE_MISMATCH`. Construct one provider per user.
-   **Lexical search.** Case-insensitive matching over title, summary, tags, and body — not embeddings. Default limit is 25.
-   **In-memory.** The whole export stays in RAM for the provider's lifetime; call `dispose()` when done in long-running servers.

## Path 3: Live provider (writable)

`LiveLLMWikiProvider` drives a live llmwiki project through the `llm-wiki-compiler` SDK. Provider operations do CRUD over llmwiki **sources** (not compiled pages), and compilation is a separate, explicit step:

```typescript
import { MemoryClient } from '@atomicmemory/sdk';
import { liveLlmwikiLazyEntry } from '@atomicmemory/llmwiki/register';

const memory = new MemoryClient({
  providers: {
    'llmwiki-live': { root: './wiki', projectId: 'my-proj', scope: { user: 'alice' } },
  },
  defaultProvider: 'llmwiki-live',
});
// llm-wiki-compiler loads only now — missing peer throws E_LLMWIKI_COMPILER_MISSING
await memory.initialize({ 'llmwiki-live': liveLlmwikiLazyEntry() });

await memory.ingest({ mode: 'text', text: '...', scope: { user: 'alice' } });

// after a batch of ingests, rebuild the wiki (LLM step; needs llmwiki credentials)
const provider = memory.getProvider();
await provider.compile({ user: 'alice' });
```

The `@atomicmemory/llmwiki/register` entry point keeps startup light: the compiler is imported only when the provider is constructed during `initialize()`. Importing `@atomicmemory/llmwiki/live` directly (for `new LiveLLMWikiProvider(...)`) loads it eagerly instead.

Live semantics to plan around:

-   **Ingest stores sources.** `text`, `messages`, and `verbatim` modes all store an llmwiki source document; the IDs returned (`llmwiki-source/<projectId>/<filename>`) are exactly what `get`/`delete` accept. Metadata beyond `title` is not preserved on the source.
-   **Pass `provenance.sourceId` for reliable upsert.** With it, re-ingesting the same id updates in place; without it, identity derives from `title + text` and inconsistent titles fork new sources.
-   **`compile()` never happens implicitly.** Ingest is cheap and local; the LLM compile step runs only when you call it.
-   **Search is lexical and loads every source body per call** — fine for modest projects, not for huge ones.

## Trust model

Imported wiki content is third-party text, persisted verbatim and later injected into LLM prompts by `search()`/`package()`. The bridge does not sanitize it; its defense is a trust marker — every record carries `metadata.llmwiki.trustLevel = "external-import"`, and `package()` wraps bodies in untrusted-source fences. Only import wikis whose authors you trust, and keep the trust marker intact in any downstream packaging code.

## Errors

Everything the package throws is an `LLMWikiBridgeError` with a stable `.code` (e.g. `E_LLMWIKI_EXPORT_INVALID_SHAPE`, `E_LLMWIKI_PROJECT_ID_INVALID`, `E_LLMWIKI_COMPILER_MISSING`). Branch on the code, not the message.

## When to pick llmwiki

-   You maintain curated knowledge as an llmwiki wiki and want it queryable behind the standard memory client
-   You want a portable, read-only knowledge snapshot with zero infrastructure (Snapshot)
-   You want agent-written notes to accumulate as wiki sources and compile into interlinked pages (Live)

For conversational/episodic memory with semantic search, temporal queries, and versioning, `atomicmemory-core` is the first-class path — llmwiki complements it as the curated-knowledge side.

## Next

-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend), the first-class runtime store
-   [Capabilities](/sdk/concepts/capabilities), the runtime contract that makes provider differences safe
-   [Writing a custom provider](/sdk/guides/custom-provider), the interface llmwiki's providers implement
