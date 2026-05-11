# Scope

> Agent index: [llms.txt](/llms.txt)

`MemoryScope` is AtomicMemory's canonical read-path contract: a single tagged union that dispatches every search, expand, get, list, and delete between a **user-scoped** world (single human, personal memory) and a **workspace-scoped** world (multiple agents collaborating over shared and private memories, with SQL-enforced visibility).

The scope is the security boundary. Routes parse it, the service layer dispatches on it, and the repository layer enforces it in SQL. There is no path that skips it.

The SDK's [Scopes and identity](/sdk/concepts/scopes-and-identity) page covers the client-side `Scope` type and how `UserAccountsManager` resolves identity in browser / server contexts. This page is the canonical reference for the HTTP-level scope semantics below the SDK.

## The contract

`MemoryScope` is a discriminated union with exactly two variants. The workspace variant carries `agentId` (the calling agent, required for visibility checks) and an optional `agentScope` (which agents' memories to include in results).

atomicmemory-core/src/services/memory-service-types.ts:142-144

```ts
export type MemoryScope =
  | { kind: 'user'; userId: string }
  | { kind: 'workspace'; userId: string; workspaceId: string; agentId: string; agentScope?: import('../db/repository-types.js').AgentScope };
```

Three properties of this contract matter:

1.  **`userId` is always present.** Workspace memories still belong to a user account. The workspace is a collaboration boundary inside the user's tenancy, not a replacement for it.
2.  **`agentId` is required on workspace reads.** There is no "anonymous workspace read", the caller always declares which agent is asking, so the visibility SQL has something to compare against.
3.  **`agentScope` is separate from `agentId`.** `agentId` answers "who is asking"; `agentScope` answers "whose memories do I want back." They are orthogonal (see [Agent scope](#agent-scope) below).

## Dispatch: the scoped* method family

The `MemoryService` exposes one scope-aware method per read operation. Each one checks `scope.kind` and routes to the user-path or workspace-path implementation. No route handler needs to know which branch it's on.

atomicmemory-core/src/services/memory-service.ts:90-129

```ts
/** Scope-dispatching search: routes to user or workspace search based on scope.kind. */
async scopedSearch(scope: MemoryScope, query: string, options: ScopedSearchOptions = {}): Promise<RetrievalResult> {
  if (scope.kind === 'workspace') {
    const ws: WorkspaceContext = { workspaceId: scope.workspaceId, agentId: scope.agentId };
    return performWorkspaceSearch(this.deps, scope.userId, query, ws, {
      agentScope: scope.agentScope,
      limit: options.limit,
      referenceTime: options.referenceTime,
      retrievalOptions: options.retrievalOptions,
    });
  }
  if (options.fast) {
    return performFastSearch(this.deps, scope.userId, query, options.sourceSite, options.limit, options.namespaceScope);
  }
  return performSearch(this.deps, scope.userId, query, options.sourceSite, options.limit, options.asOf, options.referenceTime, options.namespaceScope, options.retrievalOptions);
}

/** Scope-dispatching expand with agent visibility enforcement for workspace operations. */
async scopedExpand(scope: MemoryScope, memoryIds: string[]) {
  if (scope.kind === 'workspace') return crud.expandMemoriesInWorkspace(this.deps, scope.workspaceId, memoryIds, scope.agentId);
  return crud.expandMemories(this.deps, scope.userId, memoryIds);
}

/** Scope-dispatching get with agent visibility enforcement for workspace operations. */
async scopedGet(scope: MemoryScope, id: string) {
  if (scope.kind === 'workspace') return crud.getMemoryInWorkspace(this.deps, id, scope.workspaceId, scope.agentId);
  return crud.getMemory(this.deps, id, scope.userId);
}

/** Scope-dispatching delete with agent visibility enforcement. Returns false if not found/not visible. */
async scopedDelete(scope: MemoryScope, id: string): Promise<boolean> {
  if (scope.kind === 'workspace') return crud.deleteMemoryInWorkspace(this.deps, id, scope.workspaceId, scope.agentId);
  await crud.deleteMemory(this.deps, id, scope.userId);
  return true;
}

/** Scope-dispatching list with agent visibility enforcement for workspace operations. */
async scopedList(scope: MemoryScope, limit: number = 20, offset: number = 0, sourceSite?: string, episodeId?: string) {
  if (scope.kind === 'workspace') return crud.listMemoriesInWorkspace(this.deps, scope.workspaceId, limit, offset, scope.agentId);
  return crud.listMemories(this.deps, scope.userId, limit, offset, sourceSite, episodeId);
}
```

The pattern is deliberate: routes construct a scope once, hand it to the service, and the service picks the right repository call. The legacy non-scoped methods (`search`, `list`, `get`, `delete`) still exist and are marked `@deprecated`, they remain only so existing callers keep compiling while they migrate.

## HTTP: building the scope at the edge

At the HTTP boundary, `toMemoryScope` is the single function that turns raw request params into a typed `MemoryScope`. It is called from `/search`, `/search/fast`, `/expand`, `/list`, `/:id`, and `DELETE /:id`.

atomicmemory-core/src/routes/memories.ts:658-665

```ts
function toMemoryScope(
  userId: string,
  workspace: WorkspaceContext | undefined,
  agentScope: AgentScope | undefined,
): MemoryScope {
  if (!workspace) return { kind: 'user', userId };
  return { kind: 'workspace', userId, workspaceId: workspace.workspaceId, agentId: workspace.agentId, agentScope };
}
```

The rule: if `workspace_id` is absent from the request, you get a `user`\-scoped call. If it is present, the route **must** have also received an `agent_id`, or the request is rejected before it ever reaches the service layer.

## The agent_id requirement (a security fix disguised as an API change)

Early versions of the API accepted workspace queries without `agent_id`, silently treating them as "all agents in workspace." That let any caller with a valid `user_id` + `workspace_id` read every agent's memory in that workspace, including memories explicitly marked `agent_only`.

The current contract closes that hole: every workspace read must carry an `agent_id`, and the route layer returns `400 Bad Request` when it doesn't.

atomicmemory-core/src/routes/memories.ts:226-246

```ts
function registerListRoute(router: Router, service: MemoryService): void {
  router.get('/list', async (req: Request, res: Response) => {
    try {
      const { userId, limit } = parseUserIdAndLimit(req.query);
      const offset = parseInt(String(req.query.offset ?? '0'), 10);
      const workspaceId = optionalQueryString(req.query.workspace_id);
      const agentId = optionalUuidQuery(req.query.agent_id, 'agent_id');
      const sourceSite = optionalQueryString(req.query.source_site);
      const episodeId = optionalUuidQuery(req.query.episode_id, 'episode_id');
      if (workspaceId && !agentId) {
        throw new InputError('agent_id is required for workspace queries');
      }
      const memories = workspaceId
        ? await service.scopedList({ kind: 'workspace', userId, workspaceId, agentId: agentId! }, limit, offset)
        : await service.list(userId, limit, offset, sourceSite, episodeId);
      res.json({ memories, count: memories.length });
    } catch (err) {
      handleRouteError(res, 'GET /v1/memories/list', err);
    }
  });
}
```

Concretely, this request fails:

```http
GET /v1/memories/list?user_id=u-123&workspace_id=ws-abc
HTTP/1.1 400 Bad Request
{ "error": "agent_id is required for workspace queries" }
```

And this one succeeds:

```http
GET /v1/memories/list?user_id=u-123&workspace_id=ws-abc&agent_id=a-planner
HTTP/1.1 200 OK
{ "memories": [...], "count": 7 }
```

The same check appears in the `GET /:id` and `DELETE /:id` handlers , `workspaceId && !agentId` throws an `InputError` before any service call.

## Visibility enforcement: SQL, not application logic

Once `agent_id` reaches the repository layer, a single SQL clause decides what the caller can see. Visibility is not filtered in TypeScript after the rows come back, it is part of the `WHERE` clause that produces the rows in the first place. A memory the caller can't see is invisible to every code path, not just the ones that remembered to check.

atomicmemory-core/src/db/repository-vector-search.ts:210-236

```ts
/**
 * Build visibility enforcement clause for workspace search.
 * Ensures agents can only see memories they have access to.
 */
function buildVisibilityClauseForSearch(
  callerAgentId: string | undefined,
  params: unknown[],
  nextParam: number,
): { sql: string; paramsAdded: number } {
  if (!callerAgentId) return { sql: '', paramsAdded: 0 };
  params.push(callerAgentId);
  return {
    sql: `AND (
      visibility = 'workspace'
      OR visibility IS NULL
      OR (visibility = 'agent_only' AND agent_id = $${nextParam})
      OR (visibility = 'restricted' AND (
        agent_id = $${nextParam}
        OR EXISTS (
          SELECT 1 FROM memory_visibility_grants g
          WHERE g.memory_id = memories.id AND g.grantee_agent_id = $${nextParam}
        )
      ))
    )`,
    paramsAdded: 1,
  };
}
```

Read top-to-bottom, the rules are:

| Memory `visibility` | Who can see it |
| --- | --- |
| `'workspace'` | Any agent in the workspace (the default shared case). |
| `NULL` | Any agent in the workspace (legacy rows, treated as `'workspace'`). |
| `'agent_only'` | Only the agent whose `agent_id` matches `memories.agent_id`. |
| `'restricted'` | The owning agent, **plus** any agent with an explicit row in `memory_visibility_grants`. |

A few things worth calling out about this clause:

-   It parameterizes `callerAgentId` once and reuses the placeholder, there's no string interpolation of agent IDs anywhere in the SQL path.
-   It composes with the `AgentScope` clause (built by `buildAgentScopeClause` in the same file). Scope narrows *which agents' memories* you want; visibility narrows *which of those you're allowed to see*. Both run.
-   It degrades safely: if `callerAgentId` is `undefined`, the function returns an empty clause. That branch is only reachable from paths where visibility doesn't apply (e.g., dedup on ingest). HTTP reads always supply `agent_id`.

## Agent scope

`agentScope` is the "which agents' memories do I want back" knob on a workspace search. It is orthogonal to `agentId`, which is "who is asking."

```ts
type AgentScope = 'all' | 'self' | 'others' | string | string[];
```

-   `'all'` (default): every agent's memories in the workspace, subject to visibility.
-   `'self'`: only the calling agent's memories.
-   `'others'`: every agent except the caller.
-   A single agent ID: memories owned by that agent.
-   An array of agent IDs: memories owned by any of them.

You can pass `agent_scope: 'others'` when the calling agent wants to look up what its teammates have discovered without re-finding its own notes. Or `agent_scope: ['a-planner', 'a-researcher']` to constrain a search to a specific sub-team. Visibility still runs on top, you cannot see an `agent_only` memory just because you listed its owner in `agent_scope`.

## Designing with scope

A few patterns that fall out of this contract:

-   **Single-tenant personal memory** (chat assistant, personal agent): only ever construct `{ kind: 'user', userId }`. You never touch the workspace variant, and the workspace columns stay `NULL` in your database.
-   **Multi-agent workspace with shared notes**: default writes use `visibility: 'workspace'`, so every agent sees them. Only escalate to `'agent_only'` or `'restricted'` when an agent needs a scratchpad or a targeted handoff.
-   **Auditing / admin reads**: there is no "admin" scope. If you need an admin tool to see everything, build it as an agent in the workspace and grant it explicit visibility on the memories it needs. The SQL clause is the source of truth; there is no second path that bypasses it.

The upshot is that scope is compose-at-the-edges. You don't configure "workspace mode" on the server; you pass a scope per request. A single deployment serves personal users and multi-agent workspaces simultaneously, and the type system guarantees you can't accidentally write a workspace read that forgets to declare which agent is asking.
