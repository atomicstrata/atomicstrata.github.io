# Share a read-only memory view

> Agent index: [llms.txt](/llms.txt)

Sometimes the people who most want to see what your assistant remembers are the ones who shouldn't have a console login. The public share view renders a read-only memory list that needs no sign-in and locks every path out of itself.

## The problem

A reviewer, a stakeholder, or a teammate wants to inspect what the memory layer has stored - but provisioning them a full console account is overkill, and you don't want them editing, deleting, or wandering into the rest of the workspace.

## How the cloud helps

The share view fetches a memory endpoint directly in the viewer's browser and renders the same read-only memory list the console uses. The surrounding chrome is locked: every nav link and every row action bounces to `/login`. A viewer can read memories but can't reach the console, and there is no write path at all. You can optionally scope the view to a single end-user.

## How it works

Point the viewer at a reachable memory endpoint with `baseUrl`, and optionally narrow it to one user with `userId`:

```text
/share/memories?baseUrl=<your-memory-endpoint>&userId=user_001
```

The viewer opens straight into the locked, read-only list - no sign-in, no mutation controls, and no navigation out of the view.

warning

Anyone with the link can open the view - there is no per-viewer sign-in. Share links only for memory endpoints and user scopes you are comfortable exposing read-only.

## Key capabilities

-   **No sign-in for viewers** - read-only access with nothing to provision.
-   **Locked chrome** - every nav link and row action bounces to `/login`; the console stays out of reach.
-   **Optional user scope** - add `userId` to show one end-user's memories only.

## Outcomes

Stakeholders see exactly what the assistant remembers - scoped and read-only - without an account and without any way to change what's stored.

## Get started

Point a `/share/memories` link at your memory endpoint, add `&userId=` to scope it, and send it. To understand what viewers will see, read [What is Memories](/cloud/how-to/what-is-memories); to choose which project's endpoint to expose, see [Projects](/cloud/how-to/projects).
