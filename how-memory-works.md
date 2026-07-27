# How memory works

> Agent index: [llms.txt](/llms.txt)

**Outcome:** understand what Atomic Memory stores, how it retrieves useful context, and how you correct a memory without losing its history.

**Prerequisite:** finish the [Quickstart](/quickstart), or read its short write-and-retrieve loop first.

## The lifecycle

How one preference becomes durable memory — and changes safely over time.

1.  **1\. Conversation**“I prefer aisle seats when I fly.”
2.  **2\. Scope**Keep it with the right person: user\_001.
3.  **3\. Mutation decision**Add, update, delete, or leave the record unchanged.
4.  **4\. Durable memory**Seat preference: aisle
5.  **5\. Retrieve**“Which seat should I book?”
6.  **6\. Assistant response**“I’ll look for an aisle seat.”

Source: chatVersion: v2Changed: just now

Earlier record**v1 · Aisle seat**

→

Corrected record**v2 · Window seat**

A correction preserves the history instead of silently overwriting it.

Memory is a lifecycle, not a black box. Your application gives Atomic Memory an input and a boundary. The engine decides whether that input creates, changes, removes, or leaves a memory unchanged. Later, your application searches the same boundary and puts useful results into the next model interaction.

## 1. Write within a scope

Every memory operation belongs to a **scope**. A user scope is the common starting point: it prevents one person’s travel preference from turning up for someone else.

With the TypeScript SDK, scope is part of the call:

```ts
await memory.ingest({
  messages: [{role: 'user', content: 'I prefer aisle seats when I fly.'}],
  scope: {user: 'user_001'},
});
```

The scope is an application decision. Atomic Memory uses the value you provide; your authentication layer should ensure that it belongs to the signed-in person.

## 2. Turn input into a durable record

On ingest, Atomic Memory can make an **AUDN** decision:

| Decision | Meaning |
| --- | --- |
| Add | Store a new useful fact. |
| Update | Refine an existing memory. |
| Delete | Remove a memory that should no longer participate in retrieval. |
| No-op | Keep the current state because the new input adds nothing durable. |

This prevents an application from treating every message as a permanent fact. The original input and the resulting memory can be inspected through the platform’s memory and trace surfaces.

## 3. Retrieve the context that helps now

Use the same scope when you search:

```ts
const results = await memory.search({
  query: 'Which seat should I book?',
  scope: {user: 'user_001'},
});
```

Retrieval returns relevant memories, not an entire lifetime of conversation. Your application decides how to place those results into the model prompt or agent workflow. See the [SDK architecture](/sdk/concepts/architecture) for the client dispatch model.

## 4. Correct what changed

People change their minds. If the person now prefers a window seat, that new statement should replace the active preference while keeping an accountable history. Atomic Memory versions the change instead of making it impossible to answer “why did the assistant change its recommendation?”

This also helps with contradictions. When two claims disagree, treat that as a memory decision to inspect and resolve, not as a reason to silently mix both facts into the next answer. The [memory history API](/api-reference/http/get-memory-history) shows the version chain for a record.

## 5. Inspect and operate memory

When an assistant behaves unexpectedly, follow the trail:

1.  Open the stored memory and check its content, scope, and source.
2.  Open the matching trace to see the ingest or search operation.
3.  Correct, supersede, or delete the memory deliberately.
4.  Search again in the same scope to verify the result.

**Provenance** is that trail: where a memory came from, when it changed, and which version is active. It makes memory a piece of application state you can reason about — not a hidden prompt fragment.

## Where to go next

Put the lifecycle to work with the [SDK Quickstart](/sdk/quickstart), the [HTTP API](/api-reference/http/conventions), or an [integration](/integrations/overview). To watch it happen on real traffic, open the [Developer Console](/cloud/console).
