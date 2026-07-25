# Deletion & retention by scope

> Agent index: [llms.txt](/llms.txt)

When someone asks to be forgotten, you need to remove their memory - and only theirs. AtomicMemory Cloud partitions memory by scope, so personal, user-scoped facts can be deleted without touching the shared context your team relies on.

## The problem

If memory is one undifferentiated store, "delete this user" is either impossible to target or dangerous - you risk erasing shared knowledge along with personal data. Retention becomes all-or-nothing, and every deletion request turns into a manual, error-prone hunt.

## How the cloud helps

Every memory carries a scope - project, user, or agent. Because personal facts are written under `scope.user`, you can remove exactly one person's memory while project-scoped, shared context stays in place. Deletion is reconciled and recorded like any other mutation, so removals are on the record.

## How it works

Personal facts are written under a user scope:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "My home airport is SFO." }],
  scope: { user: "user_001" },
});
```

In the **Memories** inspector, filter by that user's scope to see everything stored for them, then delete those memories. Shared, project-scoped memory does not match the filter and is left untouched. Writes can also reconcile to a `delete` decision when new input retires an old fact.

info

Retention is what you choose to keep versus remove - there is no silent expiry. Memory persists until a reconciled write or a deletion removes it, and every removal is captured as a mutation trace.

## Key capabilities

-   **Per-scope isolation** - user-scoped memory is separate from shared project memory.
-   **Scoped deletion** - filter the [Memories](/cloud/how-to/what-is-memories) inspector to a user and remove only their memory.
-   **Reconciled deletes** - later input can retire a fact through an `update` or `delete` decision.
-   **Auditable removal** - every deletion is recorded as a mutation trace you can review.

## Outcomes

You satisfy right-to-be-forgotten and data-subject requests per person, without collateral loss of team context - and you can prove the removal happened.

## Get started

Open the [Memories](/cloud/how-to/what-is-memories) inspector, filter by a user scope, and delete. See [Audit every memory mutation](/cloud/use-cases/audit-every-mutation) for how removals are recorded.
