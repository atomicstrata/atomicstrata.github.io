# Atomic Memory, explained

> Agent index: [llms.txt](/llms.txt)

An AI model can use the words in its current context window. **Memory** lets your application carry useful context into the next conversation — deliberately, within the right boundary, and with a record you can inspect later.

Atomic Memory is managed memory for that job. Your application writes a fact in the right scope, retrieves it for the next task, corrects it when it changes, and can inspect every step. You call an API; there is no engine to operate.

Start with a complete loop

The [Quickstart](/quickstart) writes a memory, retrieves it in a later request, and lets you confirm both operations in the console.

## What durable memory changes

Imagine a travel assistant. In one chat, a person says: “I prefer aisle seats when I fly.” On a later day, the person asks which seat to book. The assistant should not have to guess, or rely on an old chat still fitting in the model’s context window.

Memory gives the application a deliberate path between those moments:

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

The diagram is a mental model, not hidden magic. Your application chooses the scope, Atomic Memory records the memory and its lineage, and retrieval returns useful context for the next model call. If the preference changes, the new record can supersede the old one without erasing the reason it changed.

## Three ideas to carry with you

### Scope keeps memory in the right place

A **scope** is the boundary a memory belongs to. Most applications begin with a user scope: one person’s preferences should not appear in another person’s conversation. Teams can add workspace or agent boundaries as their product needs them. Learn more in [Scopes and identity](/sdk/concepts/scopes-and-identity).

### Retrieval brings back only what helps

**Retrieval** searches the relevant scope for context that can help answer the current request. It is not a transcript dump: the point is to give the model a small, relevant starting point for the next response.

### Provenance keeps memory accountable

**Provenance** is the trail back to where a memory came from and how it changed. It is what lets you inspect a surprising answer, correct a bad fact, and understand which version is active.

## What you get

-   **Console visibility** — every ingest, search, and mutation writes an inspectable trace with its call type, timing, and reconciliation decision. Memory Explorer shows the actual stored content.
-   **Portable integrations** — the same SDK, MCP tools, and HTTP API back your agents and frameworks. See [Integrations](/integrations/overview).
-   **Nothing to operate** — no database to run, no engine to upgrade.

## Next step

Run the [Quickstart](/quickstart). You will create one memory, retrieve it, and see where to inspect it before moving on to the full [memory lifecycle](/how-memory-works).
