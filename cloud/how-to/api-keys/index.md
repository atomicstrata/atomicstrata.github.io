# Managing API Keys

> Agent index: [llms.txt](/llms.txt)

The **API Keys** page is where a cloud project's credentials live. Every request your application makes to the memory API is authenticated by a key issued here. Keys are per project; local projects don't use them - the browser reaches your local proxy directly, so this page shows an empty state instead.

## What it does

-   Creates a key from a **name** and an **environment** (Development, Staging, or Production).
-   Reveals each new secret **exactly once**, then retains only its masked prefix.
-   Lists every key with its status, environment, prefix, creation time, and last use.

## How it works

The full secret is shown a single time in a reveal banner the moment a key is created or rotated - copy it then, because it is never displayed again. Your application supplies it as an environment variable alongside the API URL:

```bash
export ATOMICMEMORY_API_KEY="<paste-your-secret>"
export ATOMICMEMORY_API_URL="<your-api-url>"
```

**Rotating** a key issues a fresh secret and revokes the old one in the same step; the replacement records which key it superseded (`rotated from`), so the lineage stays auditable. **Revoking** permanently disables a key. Both actions invalidate a live credential, so each asks for inline confirmation before it fires - a misclick must not silently break a production integration.

warning

A secret is shown only at creation or rotation and never again. If you lose it, rotate the key to mint a new one - the original cannot be recovered.

## Key capabilities

-   **One-time secrets** - the plaintext key is revealed once; only the prefix is stored afterward.
-   **Rotate in place** - swap the secret while preserving the key's identity and its rotated-from history.
-   **Environment tags** - mark each key dev, staging, or prod to keep surfaces separated.

## Related

-   [The Dashboard](/cloud/how-to/dashboard)
-   [Usage & Limits](/cloud/how-to/usage)
-   [Reading the Audit Log](/cloud/how-to/audit-log)
