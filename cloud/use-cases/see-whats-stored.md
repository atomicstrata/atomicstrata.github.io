# See what's stored - and why

> Agent index: [llms.txt](/llms.txt)

Most memory systems are a black box: you put data in and hope the right thing comes back out. AtomicMemory Cloud is built to be inspected. Every stored fact is visible on the Memories page, and every fact links back to the trace that produced it - so "what does my assistant know, and why" is a page you open, not a question you guess at.

## The problem

When memory is opaque, a wrong answer has no obvious cause. Was the fact never stored? Stored under a different scope? Overwritten by something newer? Without a view into the reconciled state, debugging is guesswork and reviewers have no way to audit what an assistant actually knows about a user.

## How the cloud helps

The [Memories](/cloud/how-to/what-is-memories) page renders the current, reconciled state of your project - every claim the layer holds, newest first, filterable by scope. Each memory carries the reasoning behind it and a link to the mutation trace that created or last changed it. Nothing is hidden: the state your application retrieves from is the state you can read on the page.

## How it works

Write a fact, then retrieve it. The results come from the same reconciled state the inspector renders:

```ts
await memory.ingest({
  messages: [{ role: "user", content: "I'm vegetarian." }],
  scope: { user: "user_001" },
});

const { results } = await memory.search({
  query: "dietary restrictions",
  scope: { user: "user_001" },
});
```

Because search reads from the reconciled state, the Memories page is a faithful preview of what your app recalls at query time. From any memory, jump to its [trace](/cloud/how-to/traces) to see the decision - add, update, delete, or no-op - that produced it.

tip

The Memories page shows the *result*; the Traces page shows the *reasoning* behind it. Start at the fact, follow the link to see how it got there.

## Key capabilities

-   **Reconciled state, visible** - every stored claim on one page, newest first.
-   **Scoped views** - filter by project, user, or agent to see exactly what one assistant would recall.
-   **Fact-to-trace** - jump from any memory to the mutation trace that created or changed it.

## Outcomes

You can answer "what does the assistant know about this user, and why" without digging through logs. Reviewers audit memory state directly, and wrong answers become traceable instead of mysterious.

## Get started

Open the [Memories](/cloud/how-to/what-is-memories) page for a project, or ingest a fact from the [Playground](/cloud/how-to/playground) and watch it appear in the reconciled state. From there, follow any fact to its trace.
