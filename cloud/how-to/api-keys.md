# Managing API Keys

> Agent index: [llms.txt](/llms.txt)

The **API Keys** page issues and manages **Atomic Memory** credentials. Every request your application makes to the Atomic Memory memory API is authenticated by a key issued here. Before you rotate or revoke one, make sure you're looking at the right kind of credential — see the table below.

## Three credentials, three jobs

| Credential | Project type | Used for | Managed here? |
| --- | --- | --- | --- |
| Atomic Memory API key (`amc_…`) | Cloud | Memory API calls (ingest, search) from anywhere | Yes — this page |
| Local project's Cloud key | Local | Heartbeat and trace sync back to the console — never memory calls | No — issued automatically by `am init` if one doesn't already exist |
| Core token / `CORE_API_KEY` | Local | Memory calls (ingest, search) against your own Core | No — lives in your Core environment |

This page only covers the first row. See [Authentication](/cloud/authentication#which-credential-do-i-need) for the full decision guide across all three.

## What it does

-   Creates an Atomic Memory key from a **name**.
-   Reveals each new secret **exactly once**, then retains only its masked prefix.
-   Lists every key with its status, prefix, creation time, and last use.

## How it works

The full secret is shown a single time in a reveal banner the moment a key is created or rotated — copy it then, because it is never displayed again. Your application supplies it as an environment variable alongside the API URL:

```bash
export ATOMICMEMORY_API_KEY="<paste-your-secret>"
export ATOMICMEMORY_API_URL="https://api.atomicstrata.ai"
```

**Rotating** a key issues a fresh secret and revokes the old one in the same step; the replacement records which key it superseded (`rotated from`), so the lineage stays auditable. **Revoking** permanently disables a key. Both actions invalidate a live credential, so each asks for inline confirmation before it fires - a misclick must not silently break a production integration.

warning

A secret is shown only at creation or rotation and never again. If you lose it, rotate the key to mint a new one - the original cannot be recovered.

## Key capabilities

-   **One-time secrets** - the plaintext key is revealed once; only the prefix is stored afterward.
-   **Rotate in place** - swap the secret while preserving the key's identity and its rotated-from history.
-   **Atomic Memory only** — Local projects authenticate memory calls against your own Core with a Core token / `CORE_API_KEY`, not a key from this page.

## Related

-   [Authentication](/cloud/authentication) - which credential goes where
-   [The Dashboard](/cloud/how-to/dashboard)
-   [Usage & Limits](/cloud/how-to/usage)
-   [Reading the Audit Log](/cloud/how-to/audit-log)
