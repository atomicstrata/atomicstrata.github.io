# MemoryProvider contract

> Agent index: [llms.txt](/llms.txt)

This is the authoring contract for anyone implementing a `MemoryProvider`. It describes **what you owe the SDK** when you plug a backend in, not the full type surface (for that, see the [reference overview](/sdk/api/overview)).

## Core obligations

Every provider must implement these methods. No exceptions.

| Method | Obligation |
| --- | --- |
| `name: string` | Stable identifier used for registry lookup and capability reports. Match the key used in `MemoryClient`'s `providers` config. |
| `ingest(input)` | Accept one of the declared `ingestModes` (`text`, `messages`, `memory`). Return `IngestResult` describing what was created / updated / unchanged. |
| `search(request)` | Return a `SearchResultPage`. Honour `limit`, `cursor`, `scope`. Scope-invisible data must not surface. |
| `get(ref)` | Return the memory or `null`, never throw for "not found". |
| `delete(ref)` | Idempotent. Deleting a missing memory is not an error. |
| `list(request)` | Paginate via `cursor`. Respect `scope` and `filter`. |
| `capabilities()` | Return the full `Capabilities` object, honestly (see below). |

Extending `BaseMemoryProvider` is the supported path. It provides scope-validation scaffolding and a default `getExtension` implementation that relies on your declared capabilities.

## The honesty rule for capabilities

`capabilities()` is a declaration, not a hope. Apps read it and branch. Misrepresenting capabilities breaks callers in ways that are hard to debug.

-   If `extensions.package` is `true`, `getExtension('package')` must return a real `Packager`. The default `BaseMemoryProvider.getExtension` returns `this` when the capability is true, so the subclass must implement `package(request)` on itself.
-   `requiredScope` is `{ default: Array<keyof Scope>, ingest?: ..., search?: ..., ... }`. If `'user'` appears in `default` (or any per-operation override), every request for that operation missing `scope.user` should be rejected before any network call. `BaseMemoryProvider.validateScope` does this for you when called.
-   `ingestModes` lists the shapes you accept. Rejecting an unlisted mode is fine; accepting one outside the list is not.

## Extension resolution

The default `getExtension<T>(name)` on `BaseMemoryProvider`:

1.  Looks up `name` in `capabilities().extensions`.
2.  If the flag is `true`, returns `this` (your subclass, which must implement the extension's methods).
3.  Otherwise checks `capabilities().customExtensions` and returns the registered object.
4.  Otherwise returns `undefined`.

Subclasses override `getExtension` only when they need to return a different object for a standard extension, rare. The typical path is: declare the capability, implement the methods on your subclass, inherit the default resolution.

## Extension interfaces (reference list)

| Capability key | Interface | What it adds |
| --- | --- | --- |
| `package` | `Packager` | `package(req)` returning a token-bounded `ContextPackage` |
| `temporal` | `TemporalSearch` | `searchAsOf(req)` for point-in-time queries |
| `versioning` | `Versioner` | `history(ref)` returning version timeline |
| `update` | `Updater` | `update(ref, content)` in-place |
| `graph` | `GraphSearch` | `searchGraph(req)` traversing relationships |
| `forget` | `Forgetter` | `forget(ref, reason)` explicit deletion with metadata |
| `profile` | `Profiler` | `profile(scope)` generating user/scope summaries |
| `reflect` | `Reflector` | `reflect(query, scope)` generating insights |
| `batch` | `BatchOps` | `batchIngest(inputs)` and similar bulk APIs |
| `health` | `Health` | `health()` returning a liveness status |

If you want to offer a capability not on this list, use `customExtensions`, the registry passes arbitrary objects through `getExtension(name)`. Apps that use custom extensions cast the return value to the expected type.

## Lifecycle

-   **`initialize?()`**, optional. Runs once after construction. The right place for health checks, warm-up, long-lived connections.
-   **`close?()`**, optional. Release connections, flush caches. Callers invoke it directly on the provider when they need teardown; `MemoryClient` itself does not drive it.

Both are async. Both may throw; `initialize` errors propagate to the caller of `MemoryClient.initialize()`.

## Error expectations

Throw errors from the SDK's error hierarchy when you can, `NetworkError` for wire failures, `ConfigurationError` for bad config, `UnsupportedOperationError` when a caller requests something you don't implement. See [Errors](/sdk/api/errors). If you throw something else, wrap it at the boundary; do not let arbitrary errors leak through `MemoryService`, callers rely on the hierarchy for programmatic handling.

## Minimal example

See [Writing a custom provider](/sdk/guides/custom-provider) for the end-to-end minimal implementation that satisfies this contract.

## Next

-   [Errors](/sdk/api/errors), the error hierarchy your provider should throw into
-   [Capabilities](/sdk/concepts/capabilities), the runtime contract apps rely on when they consume your provider
