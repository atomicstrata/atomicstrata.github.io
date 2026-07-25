# Prototype in the Playground

> Agent index: [llms.txt](/llms.txt)

Before you wire the SDK into an app, you want to know how memory behaves: what a query returns, how a write reconciles, whether the scope is right. The Playground lets you run `ingest` and `search` interactively against a real project and inspect the results - no code to write yet.

## The problem

Validating memory behaviour by editing application code is a slow loop: write a call, run the app, dig through logs, repeat - all before you even know the shape of a useful query. You end up debugging your integration and the memory layer at the same time.

## How the cloud helps

The Playground runs ingest and search from inside the dashboard against the same project your code will use. Managed projects proxy through the cloud API; local projects hit your self-hosted core directly. Every result deep-links into the [Trace Viewer](/cloud/how-to/traces) and the [Memory Explorer](/cloud/how-to/what-is-memories), so you see not just what came back but the decision that produced it.

## How it works

Open the Playground on a project, ingest a message, then run a search query and read the results inline. Each result links to the trace that created it and the stored memory it points to. Once the behaviour is right, the same calls drop straight into your app:

```ts
await memory.search({ query: "seat preference", scope: { user: "user_001" } });
```

tip

In managed mode you paste an API key to run requests; the key stays in your browser's memory only. Grab one from [API Keys](/cloud/how-to/api-keys).

## Key capabilities

-   **Interactive ingest & search** - run the first query with no code at all.
-   **Managed or local** - the same Playground drives either project type.
-   **Traceable results** - every result links to its trace and its stored memory, so you can see why it matched.

## Outcomes

You confirm how memory behaves in minutes instead of build cycles, then copy the exact `ingest` and `search` calls into your application with confidence.

## Get started

Open the [Playground](/cloud/how-to/playground) on any project, run an ingest, then a search. When the results look right, wire the same calls with the SDK - see [One SDK, self-hosted or managed](/cloud/use-cases/one-sdk-self-hosted-or-managed).
