# One SDK, Local or Cloud

> Agent index: [llms.txt](/llms.txt)

The same `MemoryClient` talks to your own `atomicmemory-core` running on your machine for a **Local** project, or to the Cloud API for a **Cloud** project. You pick where memory lives per project - and change your mind later without touching a single call site.

## The problem

Infrastructure decisions tend to happen too early. Choose **Local** for control and you own a datastore before you've validated the product; choose **Cloud** and you worry about lock-in. Either way, betting wrong usually means rewriting your integration once the real requirements show up.

## How the cloud helps

The SDK contract is identical in both directions. A project is either **Local** - your app talks straight to your own Core - or **Cloud**, proxied through the Cloud API. The console adapts its ingest and search wiring to match. Start against a Local project, ship on the Cloud endpoint, or take the open-source Core in-house later: the code that calls `ingest` and `search` never changes.

## How it works

Only the `apiUrl` differs between Local and Cloud. Everything else - including every `ingest` and `search` call - stays the same:

```ts
import { MemoryClient } from "@atomicmemory/sdk";

// Local project → http://localhost:8080
// Cloud project  → https://api.atomicstrata.ai
const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: process.env.ATOMICMEMORY_API_URL,
      apiKey: process.env.ATOMICMEMORY_API_KEY,
    },
  },
});

await memory.ingest({
  messages: [{ role: "user", content: "I prefer aisle seats." }],
  scope: { user: "user_001" },
});
```

## Key capabilities

-   **One contract** - the same `ingest` / `search` calls run against a Local or Cloud project, so integration code is portable by default.
-   **Local or Cloud projects** - the console adapts wiring per project; you choose where memory lives without changing your app.
-   **No lock-in** - the Cloud API and the open-source Core (Postgres + pgvector) share the SDK contract, so you can migrate any time.

## Outcomes

You prototype against a Local project, ship on the Cloud endpoint, and keep the door open to self-hosting later - all without a rewrite, because the SDK is the only surface your app ever sees.

## Get started

Create a **Local** or **Cloud** project on the [Projects](/cloud/how-to/projects) page, grab a key from [API Keys](/cloud/how-to/api-keys), and point `apiUrl` at your endpoint. Try both from the [Playground](/cloud/how-to/playground), or read [Prototype in the Playground](/cloud/use-cases/prototype-in-the-playground).
