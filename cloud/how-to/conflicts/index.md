# Resolving Conflicts

> Agent index: [llms.txt](/llms.txt)

The **Conflict queue** is where a project admin reviews competing beliefs the memory layer could not reconcile on its own, and applies a resolution. It is the human-in-the-loop backstop for the reconciliation that normally happens automatically.

## What it does

-   Lists the open conflicts for the project, each pairing two competing claims.
-   Shows a selected conflict side by side as **Claim A** and **Claim B** for review.
-   Applies an admin resolution action, with an optional reason attached to the decision.

## How it works

Conflicts arise when the memory layer holds competing claims it can't confidently reconcile. The same AUDN reconciliation surfaced on [mutation traces](/cloud/how-to/traces) settles most contradictions automatically; the ones it can't are what land in this queue.

Select a conflict from the list to see both claims. Enter an optional resolution reason, then choose one of four actions:

-   **Reject** - decline the competing claim.
-   **Request evidence** - hold the conflict pending stronger support.
-   **Promote** - accept the competing claim.
-   **Escalate** - route it for further review.

info

The conflict queue is admin-only and available on managed (cloud) projects - local self-hosted projects do not expose it. Governance conflict resolution is still rolling out during the beta, so an empty queue is expected while it ships.

## Key capabilities

-   **Human-in-the-loop** - nothing silently overwrites a competing belief; unresolved conflicts wait for an admin.
-   **Side-by-side review** - compare Claim A and Claim B before deciding.
-   **Documented decisions** - attach a reason to any resolution action.
-   **Scoped to admins** - only project admins can view or act on the queue.

## Related

-   [What is Memories](/cloud/how-to/what-is-memories)
-   [Understanding Traces](/cloud/how-to/traces)
-   [Using the Playground](/cloud/how-to/playground)
