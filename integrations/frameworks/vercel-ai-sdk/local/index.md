# Vercel AI SDK Local

> Agent index: [llms.txt](/llms.txt)

Connect your server-side AI SDK application to local Core. Use the [memory tools guide](/integrations/frameworks/vercel-ai-sdk) for installation status and the complete model-call example.

## Start Core

Follow the [Open Source quickstart](/open-source/quickstart) to run Core with `am init --local`.

Read the Core token from your local instance:

```bash
am instance status --show-secrets
```

Use that `CORE_API_KEY` value in your application's server environment:

```bash
export CORE_API_KEY='<CORE_API_KEY from your instance>'
export AI_GATEWAY_API_KEY='<your Vercel AI Gateway key>'
```

A Cloud `amc_` project key is not a Core token. See [Authentication](/cloud/authentication).

## Connect the application

Use these credentials with the [local client configuration](/integrations/frameworks/vercel-ai-sdk#configure-a-local-backend), then pass its tools into the model call. Bind `scope.user` to your authenticated server user. Do not use a namespace-only scope as a substitute for user identity.

The renamed `@atomicmemory/vercel-ai-sdk` package is unreleased. Its [workspace example](https://github.com/atomicstrata/atomicmemory/tree/main/examples/vercel-ai-sdk) is available after public source sync. The canonical guide's npm command applies only after publication.

Existing automatic retrieval and ingest helpers remain separate from the new tools. See [Keep automatic capture separate](/integrations/frameworks/vercel-ai-sdk#keep-automatic-capture-separate).

## Verify the memory operation

Inspect tool results and `tool-error` parts. A model's final answer does not prove that a write happened. If search misses a fact, confirm that ingest and search used the same authenticated user, backend URL, and credential.

For direct SDK calls and provider configuration, see [SDK quickstart](/sdk/quickstart) and [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend).
