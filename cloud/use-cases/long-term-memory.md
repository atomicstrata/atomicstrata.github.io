# Long-term memory across sessions

> Agent index: [llms.txt](/llms.txt)

Most assistants forget everything the moment a conversation ends. The next session starts cold - the user re-explains their preferences, their context, their history. AtomicMemory Cloud gives your app a memory that persists across sessions and is scoped to each user.

## The problem

Conversation history in a prompt window is not memory. It is bounded, it is per-session, and it grows expensive fast. To make an assistant feel like it *knows* a user, you need durable facts you can retrieve later - which usually means designing a schema, running a database, and writing the retrieval logic yourself.

## How the cloud helps

The memory layer stores durable, reconciled facts per user and returns the relevant ones at query time. You `ingest` what happens in a session and `search` for what matters in the next - no schema, no vector database to operate, no retrieval code to maintain.

## How it works

Write memories as they happen, scoped to the end-user:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "I always fly out of SFO." }],
  scope: { user: "user_001" },
});
```

At the start of the next session, retrieve what is relevant to the task:

```ts
const { results } = await memory.search({
  query: "preferred departure airport",
  scope: { user: "user_001" },
});
```

Because writes are reconciled rather than appended, a later "Actually, I moved to New York" updates the standing fact instead of contradicting it - and you can see exactly what changed on the [Memories](/cloud/how-to/what-is-memories) page.

## Key capabilities

-   **Per-user scope** - each user's memory is isolated by `scope.user`.
-   **Reconciled writes** - new facts update existing ones instead of piling up.
-   **Zero infrastructure** - no database or embedding pipeline to run.

## Outcomes

Your assistant greets returning users already knowing their context, sessions start warm instead of cold, and you ship personalization without owning a memory store.

## Get started

Create a project, grab an API key from **API Keys**, and make your first `ingest` / `search` calls from the [Playground](/cloud/how-to/playground) or the SDK.
