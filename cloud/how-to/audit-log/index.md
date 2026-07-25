# Reading the Audit Log

> Agent index: [llms.txt](/llms.txt)

The **Audit Log** is the administrative record for a cloud project. It captures changes to the project's configuration - API keys, settings, and lifecycle events - so you can answer who did what, and when. It is scoped per project and, like other managed surfaces, applies to cloud projects only; local projects show an empty state.

## What it does

-   Lists the project's administrative events, most recent first.
-   Shows, for each event, the **time**, the **action**, the **actor** who performed it, and the **resource** it touched.
-   Loads the latest batch of events (up to 100) for the active project.

## How it works

The log is a read-only table. Each row pairs an action with the actor's user ID and, where an event targets a specific object, a `resourceType:resourceId` reference - otherwise the resource column shows a dash. Timestamps are absolute, so events line up with the moment they were recorded.

Keep the distinction with [Traces](/cloud/how-to/traces) clear: the Audit Log tracks *administrative* actions on the project itself, while Traces track the *memory mutations* your application drives through ingest and search.

info

An empty log simply means no administrative actions have been recorded for this project yet - it fills in as keys are created, settings change, and lifecycle events occur.

## Key capabilities

-   **Accountable** - every entry names the actor behind the change.
-   **Scoped** - each project keeps its own independent record.
-   **Config-focused** - surfaces credential, settings, and lifecycle changes, not data-plane traffic.

## Related

-   [Managing API Keys](/cloud/how-to/api-keys)
-   [Understanding Traces](/cloud/how-to/traces)
-   [The Dashboard](/cloud/how-to/dashboard)
