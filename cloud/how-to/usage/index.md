# Usage & Limits

> Agent index: [llms.txt](/llms.txt)

The **Usage** page is the project's meter. It shows how much traffic the memory API has handled, how much you're storing, and where you stand against your Organization's plan limits - the numbers that drive cost.

## What it does

-   Reports **request** counts: ingest, search, and package calls, plus total tokens processed.
-   Reports **storage**: stored memories, stored traces, embedding operations, and bytes used.
-   Charts **request volume over the last 30 days**, split by ingest, search, and package.
-   Surfaces your **plan limits** - Local and Cloud project counts, tracked separately by type, and monthly write tokens - with a link to manage the plan.

## How it works

Plan limits are **Organization-scoped**: your Local and Cloud project counts (tracked separately by type) and monthly write-token allowance apply across your whole Organization, and the write-token meter resets each billing period. The stat cards and the volume chart below them are **project-scoped** - they count only this project's traffic and storage. When a project has seen no traffic in the last 30 days, the chart is replaced by an empty state rather than a flat line.

info

Because limits are shared across the Organization, usage on one project counts toward the same caps as every other - manage the plan itself from the Billing page.

## Key capabilities

-   **Cost drivers at a glance** - request and token counts map directly to what you're billed for.
-   **Storage visibility** - see stored memories, traces, and bytes in one place.
-   **Limit tracking** - watch write-token consumption against your plan before you hit the cap.

## Related

-   [Plans & Billing](/cloud/how-to/billing)
-   [The Dashboard](/cloud/how-to/dashboard)
-   [Managing API Keys](/cloud/how-to/api-keys)
