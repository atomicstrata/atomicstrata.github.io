# Errors

> Agent index: [llms.txt](/llms.txt)

Every error the SDK throws descends from `AtomicMemoryError`. Catching that one base class gives you the whole tree; catching a specific subclass gives you programmatic handling for that failure mode.

## The hierarchy

| Class | Thrown when | Retryable? | Typical handling |
| --- | --- | --- | --- |
| `AtomicMemoryError` | Base class; abstract in practice | n/a | Catch for "anything from the SDK"; inspect subclass to branch |
| `ConfigurationError` | Invalid or missing config at construction / init | No | Fix config; do not retry |
| `NetworkError` | HTTP failure, timeout, DNS failure talking to a backend | Yes (bounded) | Retry with backoff; surface a user-friendly error after N attempts |
| `StorageError` | Adapter I/O failure (IndexedDB quota, transaction abort, corruption) | Partially | Retry for transient; escalate for persistent (the resilience layer does this automatically) |
| `EmbeddingError` | Model download failure, inference error, WASM init | Sometimes | Retry once; fall back to a simpler path if available |
| `SearchError` | Search-specific failures not attributable to network or storage | Rarely | Surface to caller; inspect cause |
| `MemoryProviderError` | Provider returned an error envelope the SDK could not translate | Depends on `cause` | Inspect; most are upstream infrastructure issues |
| `InvalidScopeError` | Request scope missing required fields for the active provider | No | Programmer error; fix the call site |
| `UnsupportedOperationError` | Called an extension the active provider does not support | No | Guard with `capabilities()` before the call |

## Handling patterns

**Catch broadly, branch on type:**

```typescript
import {
  AtomicMemoryError,
  NetworkError,
  UnsupportedOperationError,
} from '@atomicmemory/sdk';

try {
  await memory.package(request);
} catch (err) {
  if (err instanceof UnsupportedOperationError) {
    // Provider does not support packaging; fall back
    const page = await memory.search(request);
    return formatFallback(page.results);
  }
  if (err instanceof NetworkError) {
    // Retry or show a transient-failure UI
    throw err;
  }
  if (err instanceof AtomicMemoryError) {
    // Log and surface generically
    logger.error('SDK error', { name: err.name, message: err.message });
    throw err;
  }
  throw err;
}
```

**Prefer prevention over catch:**

-   `InvalidScopeError` should never fire in production; validate scope at the call site or at the edge of your app.
-   `UnsupportedOperationError` should never fire in well-written code; check `capabilities().extensions` before calling extension methods.
-   `ConfigurationError` should fail loudly at boot, not during a user request.

## Retry policy

The SDK's storage and network layers include a `RetryEngine` that handles transient failures automatically (exponential backoff, bounded attempts). You do not typically retry at the application level on top of that, doubling up retries tends to compound latency without improving success rate.

If you need custom retry behaviour, the `RetryPolicy` type is exported from the error-handling module; construct your own `RetryableOperation` around a bare provider call.

## Error metadata

Every `AtomicMemoryError` subclass carries a `name` (for logging / telemetry) and a `message` (for humans). Network and provider errors additionally expose a `cause` where available, threading the original exception through for debugging.

## Next

-   [MemoryProvider contract](/sdk/api/memory-provider), which errors your provider implementation should throw
-   [Capabilities](/sdk/concepts/capabilities), the guard that prevents `UnsupportedOperationError`
