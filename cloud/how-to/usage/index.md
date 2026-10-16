# Usage & Limits

> Agent index: [llms.txt](/llms.txt)

The **Usage** page is the project's meter. It shows how much traffic the memory API has handled, how much you're storing, and where you stand against your Organization's plan limits - the numbers that drive cost.

## What it does

-   Reports **request** counts: ingest, search, and package calls, plus total tokens processed.
-   Reports **storage**: stored memories, stored traces, embedding operations, and bytes used.
-   Charts **request volume over the last 30 days**, split by ingest, search, and package.
-   Surfaces your **plan limits**: project counts and monthly memory operations, with a link to manage the plan. Open Source and Basic have separate Local and Cloud project caps; Pro, Max, and Scale use one combined project cap.

## How it works

Plan limits are **workspace-scoped**: project counts and the monthly memory-operation allowance apply across your whole workspace. Open Source and Basic cap Local and Cloud projects separately; Pro, Max, and Scale cap the combined count. The MO meter resets each billing period. The stat cards and the volume chart below them are **project-scoped** - they count only this project's traffic and storage. When a project has seen no traffic in the last 30 days, the chart is replaced by an empty state rather than a flat line.

info

Because limits are shared across the Organization, usage on one project counts toward the same caps as every other - manage the plan itself from the Billing page.

## Key capabilities

-   **Cost drivers at a glance** - ingest, search, and other request volumes map to weighted memory operations on your plan.
-   **Storage visibility** - see stored memories, traces, and bytes in one place (storage is not charged as MO).
-   **Limit tracking** - watch MO consumption against your plan before you hit the cap.

## Related

-   [Plans & Billing](/cloud/how-to/billing)
-   [The Dashboard](/cloud/how-to/dashboard)
-   [Managing API Keys](/cloud/how-to/api-keys)
