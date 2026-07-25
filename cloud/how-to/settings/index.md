# Project Settings

> Agent index: [llms.txt](/llms.txt)

**Project Settings** configures a single project and manages its lifecycle - from renaming it to exporting its data or deleting it outright. Billing and organization controls are surfaced here too, so you can manage the whole project without leaving the page.

## What it does

-   Renames the project; the new name shows in the dashboard and in API responses.
-   Displays the project type (**Local** or **Cloud**) and, for a Local project, the Local API URL the dashboard calls.
-   Shows how retention works for this project's type: **Local** retention is managed by your own Core instance; **Cloud** retention uses managed defaults instead. Neither is configurable from this page.
-   Bundles billing, organization management, data export, and project deletion into one place.

## How it works

**General** - the project name is editable and saved on submit; the project type and Local URL are fixed at creation and shown read-only. Retention is type-aware and not adjustable here: a **Local** project's memories and traces are retained by your own Core, on your own schedule; a **Cloud** project uses Cloud's managed retention defaults instead.

**Billing** - a compact view of the same organization subscription you manage on the [Billing](/cloud/how-to/billing) page.

**Organization** - opens your organization profile to manage members and roles.

**Data** (Cloud projects only) - export every memory and trace for the project as JSONL. This is a one-way backup/download of that Cloud project's own data - it's different from the `am migrate export`/`am migrate import` CLI workflow, which moves memories *from* a Local project *into* a Cloud project. See [Migrate to Hosted Cloud](/cloud/how-to/migrate) if you're looking for that instead.

**Danger zone** - delete the project. For a **Cloud** project this permanently removes its managed memories and traces along with the project itself. For a **Local** project, deletion removes the project from the console only - it does not stop your independently running Core or delete anything stored there.

warning

Deleting a **Cloud** project is permanent - it removes the project along with every memory and trace it contains, and cannot be undone. Deleting a **Local** project only removes it from the console; your Core keeps running and your local data stays exactly as it was.

Success looks like: after you rename a project, the new name shows up in the dashboard and in subsequent API responses. After an export, you get a downloadable `.jsonl` file containing the memories and traces you requested. After a deletion, the project is gone from your project list either way. For a **Cloud** project, its managed memories and traces are deleted and its API keys stop working. For a **Local** project, deletion only ends the console's tracking of that project - your Core keeps running and calls straight to it keep working exactly as before.

## Key capabilities

-   **Rename** - update the display name used across the dashboard and API.
-   **Data residency at a glance** - see whether the project is Local or Cloud, and the Local API URL for a Local project.
-   **Type-aware retention** - see who manages retention for this project: your own Core for Local, Cloud's managed defaults for Cloud.
-   **Organization management** - jump to members and roles.
-   **Export** - download a Cloud project's memories and traces as JSONL.
-   **Delete** - for a Cloud project, permanently removes it and all of its managed data; for a Local project, removes it from the console without touching your independently running Core or its data.

## Related

-   [Projects](/cloud/how-to/projects)
-   [Billing](/cloud/how-to/billing)
-   [API Keys](/cloud/how-to/api-keys)
-   [Migrate to Hosted Cloud](/cloud/how-to/migrate) — bring a Local project's memories into a Cloud project
