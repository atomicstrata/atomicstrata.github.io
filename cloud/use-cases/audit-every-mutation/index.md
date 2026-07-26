# Audit every memory mutation

> Agent index: [llms.txt](/llms.txt)

Memory that changes silently is impossible to defend. When an auditor or an incident asks what your agent remembered - and when it changed - you need a record you can read, not a black box. Atomic Memory captures every change to memory as an inspectable mutation trace.

## The problem

Most memory systems either overwrite state in place or append opaque blobs. Neither lets you answer the questions that matter after the fact: which claim changed, when, under whose credentials, and why. Reconstructing that from application logs is slow and rarely complete.

## How the cloud helps

Every write is reconciled into a decision - add, update, delete, supersede, clarify, or no-op - and each decision is recorded as a **mutation trace**. The trace carries the incoming input, the extracted claim, the previous and new values, the scope it applied to, the API key that made the call, and a timestamp. Administrative actions - creating or revoking keys, changing settings - are recorded separately in the **Audit log**.

## How it works

A single reconciled write leaves a complete record:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "Actually, I moved to New York." }],
  scope: { user: "user_001" },
});
```

That call produces a mutation trace with an `update` decision - the prior claim, the new claim, the confidence behind it, and the prefix of the key that wrote it. Open [Traces](/cloud/how-to/traces) and filter to mutations to read every change in reconciled order. Nothing changes in memory without leaving that record.

## Key capabilities

-   **Decisioned, not appended** - every write is an add / update / delete / supersede / clarify / no-op decision, each with a stated reason.
-   **Attributable by key** - each trace records the API key prefix that made the call, so every change ties back to a specific service.
-   **Scoped and timestamped** - filter by scope and read changes in order to reconstruct a precise timeline.
-   **Admin trail alongside** - the [Audit log](/cloud/how-to/audit-log) records key and settings changes made by console users.

## Outcomes

When compliance asks what the agent remembered and when it changed, you answer from the record instead of reconstructing it. Incident review becomes reading a trace, not archaeology.

## Get started

Open [Traces](/cloud/how-to/traces) and filter to mutations, then review the [Audit log](/cloud/how-to/audit-log) for administrative actions. Pair it with [least-privilege API keys](/cloud/use-cases/scoped-api-keys) so every change is attributable to one service.
