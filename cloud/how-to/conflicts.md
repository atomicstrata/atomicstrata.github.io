# Resolving Conflicts

> Agent index: [llms.txt](/llms.txt)

The **Conflict queue** is where a project admin reviews competing beliefs the memory layer could not reconcile on its own, and applies a resolution. Most contradictions are resolved automatically by AUDN reconciliation at ingest time; the queue exists for the smaller set that need a human call, not as the primary way you manage memory disagreements day to day.

## What it does

-   Lists the open conflicts for the project, if there are any, each pairing two competing claims.
-   Shows a selected conflict side by side as **Claim A** and **Claim B** for review.
-   Applies an admin resolution action, with an optional reason attached to the decision.

## How it works

Conflicts arise when the memory layer holds competing claims it can't confidently reconcile. The same AUDN reconciliation surfaced on [mutation traces](/cloud/how-to/traces) settles most contradictions automatically; the ones it can't are what land in this queue.

Select a conflict from the list to see both claims. Enter an optional resolution reason, then choose one of four actions:

-   **Reject** - decline the competing claim.
-   **Request evidence** - hold the conflict pending stronger support.
-   **Promote** - accept the competing claim.
-   **Escalate** - route it for further review.

What "success" looks like depends on the action:

-   **Reject** and **Promote** are terminal - the memory itself reflects the decision right away. Look it up in [Memory Explorer](/cloud/how-to/what-is-memories) or the [Playground](/cloud/how-to/playground), or open the resulting [mutation trace](/cloud/how-to/traces), and only the accepted claim remains.
-   **Request evidence** and **Escalate** don't resolve the conflict yet - the competing claims stay exactly as they were. Success is the conflict's status reflecting that pending next step (awaiting evidence, or escalated for further review), not a final memory outcome.

Either way, that's your confirmation of what actually happened - not whatever the queue's own UI happens to show next.

## If you don't see a queue, or it's empty

The conflict queue is scoped to **Cloud** projects with an admin role, and governance conflict resolution is still rolling out during the beta - an empty or unavailable queue is the normal state for most projects right now, not a sign anything is wrong.

If you're trying to understand or fix a specific memory disagreement instead of waiting on the queue:

-   **Inspect the trace** - open the relevant [mutation trace](/cloud/how-to/traces) to see the AUDN decision the memory layer already made (add, update, supersede, or no-op), its confidence, and the reason it gave.
-   **Correct the memory directly** - ingest the corrected claim through the [Playground](/cloud/how-to/playground) or your application. Reconciliation treats it as an update or supersede against the existing memory - no manual queue action required.

info

The conflict queue is admin-only and scoped to Cloud projects - Local projects don't expose it. Governance conflict resolution is still rolling out during the beta, so treat an empty or unavailable queue as expected, not a bug.

## Key capabilities

-   **Automatic reconciliation first** - AUDN reconciliation resolves most competing claims automatically at ingest time, with no admin action needed; only the smaller set it can't confidently resolve reaches this queue for review, where it's available.
-   **Side-by-side review** - compare Claim A and Claim B before deciding.
-   **Documented decisions** - attach a reason to any resolution action.
-   **Scoped to Cloud admins** - only Cloud project admins can view or act on the queue; Local projects route conflict handling through trace inspection and re-ingestion instead.

## Related

-   [What is Memories](/cloud/how-to/what-is-memories)
-   [Understanding Traces](/cloud/how-to/traces)
-   [Using the Playground](/cloud/how-to/playground)
