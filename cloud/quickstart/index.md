# Cloud Quickstart

> Agent index: [llms.txt](/llms.txt)

Get from zero to your first inspectable memory in under five minutes using the hosted console and CLI.

**Console:** [memory.atomicstrata.ai](https://memory.atomicstrata.ai)  
**API:** `https://api.atomicstrata.ai`

1.  1Sign up
2.  2Onboarding
3.  3Create API key
4.  4Install CLI
5.  5Configure + ingest
6.  6Verify in console

## Prerequisites

-   A web browser
-   Terminal access for the CLI (optional but recommended)

## Step 1 - Sign up

Open [memory.atomicstrata.ai](https://memory.atomicstrata.ai) and click **Get started**. Create an account at `/signup`.

## Step 2 - Onboarding

After sign-up, you land on `/app`. If you have no projects or no API keys on a cloud project, you are redirected to **`/app/onboarding`**.

The console idempotently provisions:

1.  A personal organization (named from your account display name)
2.  A default project (`slug: default-project`, environment: `dev`)

## Step 3 - Create your first API key

Click **Create API key** in the onboarding modal. The backend returns the full secret **exactly once** - copy it before closing the modal.

API keys use the format:

```text
Authorization: Bearer amc_<env>_<random>
```

## Step 4 - Install the CLI

```bash
curl -fsSL https://get.atomicstrata.ai/install.sh | sh
```

This installs `atomicmemory` and the short alias **`am`**. See [Cloud CLI](/cloud/cli) for full install options.

## Step 5 - Configure and ingest

```bash
export ATOMICMEMORY_API_URL=https://api.atomicstrata.ai
export ATOMICMEMORY_API_KEY=amc_dev_xxxxxxxxxxxxxxxx

am memory ingest "I prefer aisle seats when flying."
```

Under the hood this calls `POST /v1/memories/ingest` on the cloud gateway. Example wire body:

```json
{
  "user_id": "default",
  "source_site": "cli",
  "conversation": "I prefer aisle seats when flying."
}
```

Batch ingest from a file:

```bash
am memory ingest --file ./memories.jsonl
```

## Step 6 - Verify in the console

Open **Memories** in the project sidebar. The ingested claim should appear with `status: active` and an inline evidence excerpt.

If a mutation trace was recorded, click **View trace** to open the AUDN detail at `/app/projects/{id}/traces/{traceId}`.

## SDK alternative

Same flow with the TypeScript SDK:

```bash
npm install @atomicmemory/sdk
```

```typescript
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'https://api.atomicstrata.ai',
      apiKey: process.env.ATOMICMEMORY_API_KEY,
    },
  },
});

await memory.ingest({
  messages: [{ role: 'user', content: 'I prefer aisle seats when flying.' }],
  scope: { user: 'user_001' },
});

const results = await memory.search({
  query: 'seat preference',
  scope: { user: 'user_001' },
});
```

## cURL alternative

```bash
curl -X POST https://api.atomicstrata.ai/v1/memories/ingest \
  -H "Authorization: Bearer $ATOMICMEMORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "default",
    "source_site": "curl",
    "conversation": "I prefer aisle seats when flying."
  }'
```

## What to do next

-   Try the **Playground** in the console - ingest and search without leaving the browser
-   Explore the [Developer Console](/cloud/console) - traces, usage, API keys
-   Read [Authentication](/cloud/authentication) - when to use API keys vs dashboard JWT
-   Point MCP or agent integrations at Cloud - see [Integrations](/integrations/overview)
