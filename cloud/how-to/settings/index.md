# Project Settings

> Agent index: [llms.txt](/llms.txt)

**Project Settings** configures a single project and manages its lifecycle - from renaming it to exporting its data or deleting it outright. Billing and organization controls are surfaced here too, so you can manage the whole project without leaving the page.

## What it does

-   Renames the project; the new name shows in the dashboard and in API responses.
-   Displays the project type (managed or local) and, for a local project, the Local API URL the dashboard calls.
-   Shows memory- and trace-retention defaults (retention is not configurable yet).
-   Bundles billing, organization management, data export, and project deletion into one place.

## How it works

**General** - the project name is editable and saved on submit; the project type and local URL are fixed at creation and shown read-only. Retention appears as defaults - 90 days for memories, 30 days for traces - and is not adjustable today.

**Billing** - a compact view of the same organization subscription you manage on the [Billing](/cloud/how-to/billing) page.

**Organization** - opens your organization profile to manage members and roles.

**Data** (managed projects only) - export every memory and trace for the project as JSONL.

**Danger zone** - delete the project, which permanently removes it along with all of its memories and traces.

warning

Deleting a project is permanent. It removes the project along with every memory and trace it contains, and cannot be undone.

## Key capabilities

-   **Rename** - update the display name used across the dashboard and API.
-   **Data residency at a glance** - see whether memory data is managed or local, and the local URL when self-hosted.
-   **Organization management** - jump to members and roles.
-   **Export** - download a managed project's memories and traces as JSONL.
-   **Delete** - permanently remove a project and all of its data.

## Related

-   [Projects & Workspaces](/cloud/how-to/projects)
-   [Billing](/cloud/how-to/billing)
-   [API Keys](/cloud/how-to/api-keys)
