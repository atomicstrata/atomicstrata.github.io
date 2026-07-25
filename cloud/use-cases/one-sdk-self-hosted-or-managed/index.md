# One SDK, self-hosted or managed

> Agent index: [llms.txt](/llms.txt)

The same `MemoryClient` talks to a self-hosted `atomicmemory-core` running on your machine or to the managed cloud API. You pick where memory lives per project - and change your mind later without touching a single call site.

## The problem

Infrastructure decisions tend to happen too early. Self-host for control and you own a datastore before you've validated the product; reach for a managed service and you worry about lock-in. Either way, betting wrong usually means rewriting your integration once the real requirements show up.

## How the cloud helps

The SDK contract is identical in both directions. A project is either `local`

-   your app talks straight to a self-hosted core - or `managed`, proxied through the cloud API. The console adapts its ingest and search wiring to match. Start against a local core, ship on the managed endpoint, or take the open-source core in-house later: the code that calls `ingest` and `search` never changes.

## How it works

Only the `apiUrl` differs between self-hosted and managed. Everything else - including every `ingest` and `search` call - stays the same:

```ts
import { MemoryClient } from "@atomicmemory/sdk";

// self-hosted core → http://localhost:8080
// managed cloud    → https://api.atomicstrata.ai
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

-   **One contract** - the same `ingest` / `search` calls run against local or managed, so integration code is portable by default.
-   **Local or managed projects** - the console adapts wiring per project; you choose where memory lives without changing your app.
-   **No lock-in** - the managed API and the open-source core (Postgres + pgvector) share the SDK contract, so you can migrate any time.

## Outcomes

You prototype against a local core, ship on the managed endpoint, and keep the door open to self-hosting later - all without a rewrite, because the SDK is the only surface your app ever sees.

## Get started

Create a `local` or `managed` project on the [Projects](/cloud/how-to/projects) page, grab a key from [API Keys](/cloud/how-to/api-keys), and point `apiUrl` at your endpoint. Try both from the [Playground](/cloud/how-to/playground), or read [Prototype in the Playground](/cloud/use-cases/prototype-in-the-playground).
