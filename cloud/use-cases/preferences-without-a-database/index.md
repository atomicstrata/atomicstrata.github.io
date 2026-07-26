# Store preferences without a database

> Agent index: [llms.txt](/llms.txt)

Preferences are the classic reason to reach for a database: a settings table, a preferences key-value store, a column for every toggle. But the preferences that make an assistant feel personal show up in conversation, change over time, and rarely fit a fixed schema. Atomic Memory lets you capture them through the same `ingest` and `search` you already use - no store to design.

## The problem

The moment your assistant should remember "keep answers short" or "I bill to the EU entity," you reach for storage: design a preferences table, pick the columns, write the UPSERT, and add a migration every time a new kind of preference appears. Much of what users tell you doesn't map to a column at all, and when a preference changes you still have to find and overwrite the right row yourself.

## How the cloud helps

You ingest the preference as ordinary conversation and search it back when you build the prompt - the memory *is* the store, so there is no schema to define. And because writes are reconciled rather than appended, a changed preference updates the standing fact instead of leaving two contradictory rows behind. The memory layer decides whether each write is an add, update, delete, or no-op, so evolving a preference costs you no lookup, no UPSERT, and no migration.

## How it works

Capture a preference the moment it comes up - nothing to design first:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "Use metric units and keep answers short." }],
  scope: { user: "user_001" },
});
```

Later the user changes their mind. You ingest it exactly the same way - no row to look up, no UPSERT to write:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "Actually, switch me to imperial units." }],
  scope: { user: "user_001" },
});
```

Reconciliation turns that second write into an *update* of the standing preference, not a new row. Read the current state back when you assemble the prompt:

```ts
const { results } = await memory.search({
  query: "unit and formatting preferences",
  scope: { user: "user_001" },
});
// returns the current preference: imperial units, short answers
```

info

Every reconciliation is inspectable: the decision (update, no-op, …) shows on [Traces](/cloud/how-to/traces), the reconciled result on [Memories](/cloud/how-to/what-is-memories), and any disagreement between sources on [Conflicts](/cloud/how-to/conflicts).

## Key capabilities

-   **Reconciled, not appended** - a preference change updates the standing fact; the layer records whether it was an add, update, delete, or no-op.
-   **No schema, no migrations** - a new kind of preference is just more memory, never a new column.
-   **Natural-language facts** - store anything a user tells you, not only what fits a settings row.

## Outcomes

Your assistant honors durable preferences without you owning a preferences store. What it remembers grows as users tell you more, and it stays current as they change their minds - with no schema review and no migration to ship.

## Get started

Create a project, grab an API key from **API Keys**, and run an ingest-then-change-then-search cycle in the [Playground](/cloud/how-to/playground) to watch a preference reconcile in place. Then wire the same `ingest` / `search` calls into your app.
