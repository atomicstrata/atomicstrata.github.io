# Scopes and identity

> Agent index: [llms.txt](/llms.txt)

Every SDK operation carries a **scope**, the partition the memory lives in. Scope is what separates Alice's memory from Bob's, the personal workspace from the team workspace, one agent's lessons from another.

> Core is canonical for the HTTP-level scope semantics. See [platform/scope](/platform/scope) for the wire-format view. This page covers what the SDK presents on the client side.

## The Scope type

```typescript
type Scope = {
  user?: string;
  agent?: string;
  namespace?: string;  // typically workspace or tenant
  thread?: string;     // conversation / session
};
```

Every `ingest`, `search`, `get`, `delete`, `list`, and `package` request includes a scope. The fields are additive: the more you specify, the narrower the partition.

The minimum required scope is determined by the active provider's `capabilities().requiredScope`, which declares a `default` list of required fields plus optional per-operation overrides. A personal-memory provider might require only `['user']`; a workspace-oriented provider might require `['user', 'namespace']` on ingest.

## Where identity comes from

`MemoryClient` does not resolve user identity. Applications pass whatever `user` / `namespace` strings their own session layer produces:

```typescript
await memory.ingest({
  mode: 'text',
  content: 'Prefers aisle seats.',
  scope: { user: currentSession.userId },
  provenance: { source: 'manual' },
});
```

Where `currentSession.userId` comes from, an auth service, a JWT, a hard-coded identifier for a CLI tool, is an application concern. The SDK treats the string as opaque and passes it to the active provider.

## Scope patterns

| Pattern | Scope shape | Use case |
| --- | --- | --- |
| Personal | `{ user }` | Single-user assistant, personal memory |
| Team workspace | `{ user, namespace }` | Shared memory within an org/project |
| Per-agent memory | `{ user, namespace, agent }` | Multi-agent systems where agents keep their own memories |
| Per-conversation | `{ user, thread }` | Scratch memory tied to a single session |

A memory written at `{ user: 'alice', namespace: 'team-acme' }` is not visible to a search at `{ user: 'alice' }` unless the provider opts into upward-narrowing (most do not, on purpose, this is what makes the isolation real).

## Scope validation

`BaseMemoryProvider.validateScope` rejects requests that are missing scope fields the provider declared required, before any network call is made. Custom providers extend this by overriding `capabilities().requiredScope` to reflect their own partitioning rules.

## Next

-   [Provider model](/sdk/concepts/provider-model), how each provider declares its `requiredScope`
-   Core's [platform/scope](/platform/scope), the HTTP-level scope model and visibility rules
