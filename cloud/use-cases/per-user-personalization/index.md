# Per-user personalization with scopes

> Agent index: [llms.txt](/llms.txt)

One deployment of your assistant serves everyone who signs in. Each of those users needs a memory that reflects only their own history - never the person in the next session. Atomic Memory gives you that separation through **scope**: every write and every read is tagged, and the memory layer keeps each scope apart.

## The problem

Personalization for many users is really an isolation problem. If every user's facts land in one shared space, User A's "reply in Spanish" and User B's "I'm vegan" pile up together, and the wrong preference surfaces for the wrong person. Partitioning that yourself is the usual tax: a tenant column on every table, a `WHERE` clause on every query, and a single missed filter away from leaking one user's context into another's answers.

## How the cloud helps

Scope *is* the partition. Every `ingest` and `search` carries a scope, and the memory layer stores and retrieves each scope's memory separately. Tag a write with `scope.user` and a search for that user reads only their memory - you get per-user separation without building a partitioning layer or hand-writing a filter. Scopes form a small hierarchy:

-   `project` - facts that belong to the whole app, shared across all users.
-   `user` - one end-user's own preferences and history.
-   `agent` - a single assistant or persona within the app.

## How it works

Write each user's memory under their own `scope.user`:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "Reply to me in Spanish." }],
  scope: { user: "user_a" },
});

await memory.ingest({
  messages: [{ role: "user", content: "I'm vegan - never suggest meat." }],
  scope: { user: "user_b" },
});
```

A search reads only the scope you ask for, so one user never sees another's memory:

```ts
const { results } = await memory.search({
  query: "language and dietary preferences",
  scope: { user: "user_a" },
});
// results reflect user_a's language preference - never user_b's diet
```

Facts that belong to the whole application, not one person, go in project scope instead:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "Our support hours are 9-5 ET." }],
  scope: { project: "acme_support" },
});
```

You can confirm the separation on the [Memories](/cloud/how-to/what-is-memories) page by filtering the inspector to a single scope - you see exactly what one user's assistant would recall.

tip

Use a stable id from your own auth system as `scope.user`. Because it is the isolation key, it must be the same value every session - a rotating session id or a changing email scatters one person's memory across scopes.

## Key capabilities

-   **Scope hierarchy** - `project` for app-wide facts, `user` for each end-user, `agent` for a specific assistant.
-   **Scoped reads** - a search returns only the scope you pass, so you never hand-write a tenant filter.
-   **Verifiable separation** - filter the Memories inspector by scope to see what each user can recall.

## Outcomes

One deployment personalizes for thousands of users at once, each with a memory that reflects only their own history. You onboard a new user by choosing a new `scope.user` - there is nothing to provision per user.

## Get started

Create a project, grab an API key from **API Keys**, and make your first scoped `ingest` / `search` calls from the [Playground](/cloud/how-to/playground) or the SDK. Filter the [Memories](/cloud/how-to/what-is-memories) page by scope to watch isolation hold.
