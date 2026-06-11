# Langflow Local

> Agent index: [llms.txt](/llms.txt)

Add durable, cross-session memory to Langflow flows with AtomicMemory custom components.

## What you get

-   **Chat Memory.** Read-only LangChain message history backed by AtomicMemory list operations.
-   **Search Context.** Query-driven recall that can return packaged prompt context or search-only results.
-   **Store Message.** Explicit writes from a flow into durable memory.
-   **Delete Memories in Scope.** Confirm-gated cleanup for test data or user-requested erasure.
-   **SDK-backed integration.** Components call the Python `atomicmemory` SDK rather than hand-rolled HTTP.

## Quick start

### 1. Start AtomicMemory core

Start local core before starting Langflow. The default local endpoint is `http://127.0.0.1:17350`, and the local quickstart key is `local-dev-key`.

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

### 2. Install the Python package

Install the AtomicMemory Langflow package into the same Python environment that runs Langflow:

```bash
pip install atomicmemory-langflow
```

If Langflow is not already installed in that environment:

```bash
pip install "atomicmemory-langflow[langflow]"
```

### 3. Install the Langflow component entry files

Copy the AtomicMemory component entry files into your Langflow components root:

```bash
npx -y @atomicmemory/langflow-plugin \
  --target ~/.langflow/components \
  --python "$(command -v python)"
```

`--target` is the Langflow components root. The installer creates the `atomicmemory/` category directory below it.

### 4. Restart Langflow

Start or restart Langflow with the same components root:

```bash
LANGFLOW_COMPONENTS_PATH=~/.langflow/components langflow run
```

The components appear in the Langflow sidebar under the **atomicmemory** category.

### 5. Configure the components

For local core:

| Field | Value |
| --- | --- |
| Provider | `atomicmemory` |
| API URL | `http://127.0.0.1:17350` |
| API Key | `local-dev-key` |
| User ID | A stable user id, for example `demo-user` |
| Session ID | Optional conversation or thread id |

Keep `User ID` stable across sessions when you want cross-session recall.

## Flow pattern

Use explicit write and explicit recall in the flow graph:

```text
Chat Input
  -> Store Message (AtomicMemory)
  -> Search Context (AtomicMemory)
  -> Prompt
  -> Model
  -> Chat Output
```

Run one session with a user fact:

```text
Remember that I prefer dark mode and I am allergic to peanuts.
```

Then run a new session with the same `User ID`:

```text
What should you keep in mind about me?
```

`Search Context` is user-scoped across sessions by default. Turn on its advanced `Scope to session` toggle only when retrieval should stay inside the current Langflow session.

## Component reference

### Chat Memory

Use **Chat Memory** when a Langflow component expects a message-history backend. It is read-only by design and does not auto-ingest every turn.

By default, Chat Memory fails closed if AtomicMemory is unreachable. Turn on `Fail open on error` only for flows where an empty history is safer than stopping the run.

### Search Context

Use **Search Context** before a prompt or agent step. It retrieves relevant memory for the current input and can return either packaged prompt context or search-only results.

Packaged context requires a backend that supports AtomicMemory's package extension. If packaging is unavailable, the component fails closed rather than silently degrading.

### Store Message

Use **Store Message** for deliberate writes. Store important user turns, assistant conclusions, research findings, or workflow state that should survive the current Langflow run.

Ingest runs extraction and embedding in core, so writes can take several seconds depending on the configured LLM and embedding providers.

### Delete Memories in Scope

Use **Delete Memories in Scope** for test cleanup or explicit erasure. It requires confirmation in the component configuration so accidental deletes do not run silently.

## Security notes

-   Put secrets only in the **API Key** field. Do not put API keys or bearer tokens in **Provider Config**, because flow JSON is easier to export and share.
-   `Provider Config` is allowlist-only for tuning keys such as `timeoutSeconds` and `apiVersion`.
-   The current integration accepts only the `atomicmemory` provider, even if a flow is modified through the API.
-   Remote API URLs are blocked by default. Operators can allow remote hosts through `ATOMICMEMORY_LANGFLOW_ALLOW_REMOTE=1` or `ATOMICMEMORY_LANGFLOW_ALLOWED_HOSTS`.
-   Localhost is not a complete SSRF boundary. In shared Langflow deployments, treat flow authors as trusted or add network egress controls.
-   Retrieved memory is ordinary prompt context, not a system message.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Components do not appear | Confirm `LANGFLOW_COMPONENTS_PATH` points at the directory used by `--target`, then restart Langflow. |
| Import error for `atomicmemory_langflow` | Install `atomicmemory-langflow` into the same Python environment that runs Langflow. |
| Core connection fails | Confirm core is reachable at `http://127.0.0.1:17350` and the API key matches the core configuration. |
| Store creates no useful facts | Confirm core has a working LLM and embedding provider, then retry with a concrete factual message. |
| Search Context is empty | Confirm a prior Store Message wrote memories for the same `User ID`; use a query that references the stored context. |
| Cross-session recall does not work | Keep `User ID` the same and leave `Scope to session` off in Search Context. |
| Remote core URL is rejected | Set the operator-level remote-host allowlist environment variables before starting Langflow. |

## See also

-   [SDK Overview](/sdk/overview)
-   [Scope and identity](/sdk/concepts/scopes-and-identity)
