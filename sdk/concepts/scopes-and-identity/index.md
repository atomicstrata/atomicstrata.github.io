# Scopes and identity

> Agent index: [llms.txt](/llms.txt)

Memory requests carry a `scope`. The active provider determines which scope fields it supports and how it maps them to backend requests. The generic type alone does not establish isolation.

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

Every `ingest`, `search`, `get`, `delete`, `list`, and `package` request includes a scope. Do not assume that every provider sends every field, or that ingest and search apply the same partitioning rules.

The minimum required scope is determined by the active provider's `capabilities().requiredScope`, which declares a `default` list of required fields plus optional per-operation overrides. A personal-memory provider might require only `['user']`; a workspace-oriented provider might require `['user', 'namespace']` on ingest.

## Where identity comes from

`MemoryClient` does not resolve user identity. Applications obtain the user ID from their authenticated server session:

```typescript
await memory.ingest({
  mode: 'text',
  content: 'Prefers aisle seats.',
  scope: { user: currentSession.userId },
  provenance: { source: 'manual' },
});
```

The SDK treats the identity as opaque. Scope does not authenticate a caller or replace application and backend authorization. Do not take another user's identity from model arguments or an unauthenticated request field.

## AtomicMemory provider boundaries

For generic AtomicMemory `ingest` and `search` calls:

-   `user` is required and maps to `user_id` on both requests.
-   `namespace` maps to a search filter, not an ingest partition. It does not provide symmetric write and read namespace isolation.
-   `agent` is not forwarded by these operations.
-   `thread` maps to `session_id`. Local Core and Cloud do not interpret this field identically.

For Cloud v1, the project API key fixes the project, and the requested user identifies a memory subject. An explicit thread replaces that subject rather than adding an independent conversation partition. Do not use a shared thread value to claim per-user isolation.

The [Vercel AI SDK tools](/integrations/frameworks/vercel-ai-sdk) bind an immutable, user-only scope in trusted server code. They reject `namespace`, `thread`, and `agent` rather than silently ignoring those fields. Their model inputs cannot select an identity, provider, or credential.

Other providers can support different scope dimensions. Check the provider's documented operation behavior before relying on workspace, agent, or conversation isolation.

## Scope validation

`BaseMemoryProvider.validateScope` rejects requests that are missing scope fields the provider declared required, before any network call is made. Custom providers extend this by overriding `capabilities().requiredScope` to reflect their own partitioning rules.

## Next

-   [Provider model](/sdk/concepts/provider-model), how each provider declares its `requiredScope`
-   Core's [platform/scope](/platform/scope), the HTTP-level scope model and visibility rules
