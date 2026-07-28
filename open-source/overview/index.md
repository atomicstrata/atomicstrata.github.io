# Atomic Memory Open Source

> Agent index: [llms.txt](/llms.txt)

**Atomic Memory Open Source is the self-hosted alternative.** You run the Core engine yourself, on your own machine or your own infrastructure. You own the stack, the data, and every component, and you choose where each one runs.

It implements the same memory model as the managed product: write a fact in the right scope, retrieve it for the next task, correct it when it changes, and inspect what happened. The difference is who operates it.

Comparing hosting models?

See [Cloud vs Open Source](/cloud-vs-open-source) for the side-by-side, or switch to the **Atomic Memory** tab for the managed documentation.

## Start here

1.  1Run the engine`am init` starts Core in Docker and verifies the pipeline.
2.  2Write and retrieveStore one preference and search for it.
3.  3Go deeperRead the architecture behind the engine.

**→ [Open Source Quickstart](/open-source/quickstart)** — install the CLI, run `am init`, and complete the memory loop locally.

## What you operate

-   **Core** — the engine that stores and retrieves memories, backed by Postgres with pgvector. See [Architecture](/platform/architecture).
-   **Stores and providers** — you choose the vector store, the embedding model, and the LLM. See [Stores](/platform/stores) and [Providers](/platform/providers).
-   **Artifact storage** — where source material lives. See [Artifact storage](/platform/artifact-storage).

## Ways to run it

-   **Connected Local** — Core on your machine, connected to the console for runtime health and operation traces. Memory content stays local. This is what [the Quickstart](/open-source/quickstart) sets up.

## Next steps

-   [Quickstart](/open-source/quickstart) — the fastest path to a working engine
-   [How memory works](/how-memory-works) — scopes, corrections, provenance
-   [CLI reference](/cli) — every `am` command
-   [Cloud vs Open Source](/cloud-vs-open-source) — pick a hosting model
