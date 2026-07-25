# Billing

> Agent index: [llms.txt](/llms.txt)

**Billing** manages your organization's subscription and shows how much of your plan you have used. It is scoped to the organization, so a single subscription covers every project the org owns.

## What it does

-   Shows the current plan, its price, and subscription status - active, free trial, canceling, or not subscribed.
-   Tracks live usage against your plan's limits: projects, API keys, and monthly write tokens.
-   Starts or upgrades a subscription through hosted checkout, and opens the billing portal to update payment or cancel.
-   Surfaces renewal and trial-end dates so you know when the next charge lands.

## How it works

Only writes are metered. Every `ingest` consumes processed tokens that count toward a monthly allowance and reset at the end of each billing period; retrieval and storage are unmetered within your plan's limits. When you reach the monthly token cap, writes pause until you upgrade - search and storage keep working.

The **Developer** plan is $29/mo and includes 5M processed tokens per month, 3 projects, 5 organization API keys, and a 30-day activity log. Only organization admins can change the subscription; other members see billing read-only.

info

Reaching the monthly write-token limit pauses ingestion only. Retrieval and storage stay available within your plan limits - upgrade to resume writes.

## Key capabilities

-   **Organization-scoped** - one subscription covers all of the org's projects.
-   **Live usage** - projects, API keys, and write-token consumption against plan limits, with a reset date.
-   **Writes-only metering** - retrieval and storage are unmetered within limits.
-   **Self-serve management** - subscribe, upgrade, or manage payment and cancellation from the portal.
-   **Role-gated** - only org admins can change the plan.

## Related

-   [Usage](/cloud/how-to/usage)
-   [Projects & Workspaces](/cloud/how-to/projects)
-   [Project Settings](/cloud/how-to/settings)
