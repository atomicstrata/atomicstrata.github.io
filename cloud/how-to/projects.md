# Projects

> Agent index: [llms.txt](/llms.txt)

**Projects** hold your memory layer. Every memory, API key, trace, and usage record belongs to exactly one project, and every project belongs to an Organization. The Projects page is where you create them and open a project's Overview.

## What it does

-   Lists every project in the current Organization with its type (**Local** or **Cloud**), name, slug, and last activity, and links straight to its Overview. **Cloud** projects show a stored-memory count; **Local** projects may show `n/a` there since memory content stays on your Core.
-   Creates new projects from **New project** — you pick a type, **Local** (Connected Local, backed by your own Core) or **Cloud** (Atomic Memory, fully managed).
-   Your plan determines how many of each type you can have: Open Source includes one Local project and zero Cloud projects; Free keeps your Local project and unlocks one Cloud project. See [Plans & Billing](/cloud/how-to/billing) for what's included.

## How it works

Each project is isolated — its memories, keys, traces, and usage never cross into another project. New projects use the slug `default` (`default-project` is a legacy alias from earlier versions, not something you'll see created today). Where memory data physically lives depends on the project **type** you choose at creation:

-   A **Local** project runs against your own Core — connected with `am init`. Memories stay on your machine; the console still receives a runtime heartbeat and operation traces from that Core, so you get inspectable console visibility without your memory content ever leaving your infrastructure.
-   A **Cloud** project is fully managed by Atomic Memory: memories, traces, and heartbeat all live in Atomic Memory, and you authenticate with a project API key from anywhere.

info

A Local project's Core must be reachable from your browser (`am init` wires this up on `http://127.0.0.1:17350` by default). A Cloud project needs none of this — just an API key.

## Key capabilities

-   **Isolated projects** — memories, keys, traces, and usage stay scoped to a single project.
-   **Local or Cloud** — run Core yourself, or let Atomic Memory host the data.
-   **Type-aware limits** — Local and Cloud project counts are capped separately by your plan, and the page shows usage against each.

## Related

-   [Project Settings](/cloud/how-to/settings)
-   [API Keys](/cloud/how-to/api-keys)
-   [Plans & Billing](/cloud/how-to/billing)
-   [What is Memories](/cloud/how-to/what-is-memories)
