# Quickstart: run the engine yourself

> Agent index: [llms.txt](/llms.txt)

**Outcome:** run Atomic Memory Open Source locally, store one travel preference, retrieve it later, and inspect the activity in the console.

**You need:** Docker, an OpenAI API key, and macOS or Linux.

This guide uses the CLI’s default local scope. When your app uses the SDK or HTTP API, you provide the scope explicitly — see [How memory works](/how-memory-works).

1.  1Run the engine`am init` signs in, starts Core, and verifies the pipeline.
2.  2Remember a preference`am memory ingest` writes one durable fact.
3.  3Use it later`am memory search` retrieves it; the console shows the trace.

## 1. Install and initialize

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh
source "$HOME/.atomicmemory/env"

export OPENAI_API_KEY="sk-..."
am init
```

`am init` opens a browser for secure sign-in, starts Core in Docker, connects your console, and verifies the memory pipeline. Success looks like **Verified** in the terminal and an **Online** runtime in the dashboard.

Your memories remain on your machine. A Connected Local project sends runtime heartbeats and operation traces to the console so you can see that the pipeline is healthy; it does not send your memory content there.

Already created a project in the console? Run `am init --project <slug>`.

## 2. Remember a travel preference

Tell the assistant something it should know next time:

```bash
am memory ingest "I prefer aisle seats when I fly."
```

The command writes a memory from that sentence. Keep the exact wording simple: in a real application, you would normally send a user turn or a short conversation instead.

## 3. Retrieve it for the next task

Ask the question that needs the preference:

```bash
am memory search "Which seat should I book?"
```

Success looks like a result about the aisle-seat preference. That result is the context your application can use before it asks a model to answer the person.

## 4. Inspect the result

Open the dashboard link from the CLI output, or visit [memory.atomicstrata.ai](https://memory.atomicstrata.ai). Confirm that the runtime is **Online**, then open **Memories** to see the stored content and **Traces** to see the ingest and search operations.

If something fails, run `am doctor --smoke`, then use [Troubleshooting](/cloud/troubleshooting).

## What you just built

You completed the smallest durable-memory loop: write a preference, retrieve it for a later request, and inspect the operations that made it happen. Next, see how scopes, corrections, and version history make that loop safe in a real app: [How memory works](/how-memory-works).

## Next steps

-   [How memory works](/how-memory-works) — scopes, corrections, provenance, and lifecycle
-   [SDK Quickstart](/sdk/quickstart) — add explicit scopes in TypeScript
-   [Core-only Docker](/core-only-docker) — run the engine without a console connection
-   [Cloud vs Open Source](/cloud-vs-open-source) — compare hosting models
