# Projects & Workspaces

> Agent index: [llms.txt](/llms.txt)

**Projects** are the workspaces that hold your memory layer. Every memory, API key, trace, and usage record belongs to exactly one project, and every project belongs to an organization. The Projects page is where you create them, group them by environment, and drop into a project's workspace.

## What it does

-   Lists every project in the current organization, grouped by environment (`dev`, `staging`, `prod`) with a filter across all four buckets.
-   Shows each project's name, slug, environment, stored-memory count, and last activity, and links straight to its Overview.
-   Creates new projects from **New project** - you pick a type, **Cloud (managed)** or **Local (self-hosted)**, and, for cloud, an environment.
-   Enforces your plan's project limit: at the cap, creation is blocked and an upgrade prompt appears.

## How it works

A project is an isolated workspace - its memories, keys, traces, and usage never cross into another project. Where that memory data physically lives depends on the project **type** you choose at creation.

A **managed** project is hosted by AtomicMemory: you ingest and search with a project API key from anywhere. A **local** project runs against your own `atomicmemory-core` on your machine - the dashboard talks to it directly from the browser, and the cloud stores only the project's metadata (name, slug, type), never its memories.

info

For a local project, your self-hosted core must serve `/v1/*` with CORS allowing this dashboard's origin. Managed projects need none of this - you just create an API key.

## Key capabilities

-   **Isolated workspaces** - memories, keys, traces, and usage stay scoped to a single project.
-   **Managed or self-hosted** - let AtomicMemory host the data, or point a project at a core you run yourself.
-   **Environment lanes** - keep `dev`, `staging`, and `prod` separate and filterable.
-   **Plan-aware limits** - project count is bounded by your plan, and the page shows your organization's usage against it.

## Related

-   [Project Settings](/cloud/how-to/settings)
-   [API Keys](/cloud/how-to/api-keys)
-   [Billing](/cloud/how-to/billing)
-   [What is Memories](/cloud/how-to/what-is-memories)
