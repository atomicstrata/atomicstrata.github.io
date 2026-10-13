# Errors

> Agent index: [llms.txt](/llms.txt)

Memory provider operations use the `MemoryProviderError` hierarchy. Other SDK utilities use a separate `AtomicMemoryError` hierarchy. Catching `AtomicMemoryError` does not catch every memory provider failure.

## The hierarchy

| Class | Thrown when | Retryable? | Typical handling |
| --- | --- | --- | --- |
| `MemoryProviderError` | Provider HTTP failure or operation failure | Depends on operation | Inspect provider and operation in trusted diagnostics |
| `MemoryTransportError` | Connection failure, timeout, or cancellation | Not automatically | Distinguish abort from transient failure. A failed write can have an uncertain backend outcome |
| `RateLimitError` | Provider HTTP 429 | After delay, if safe | Inspect `retryAfterMs` when present |
| `PendingIngestError` | AtomicMemory ingest returns HTTP 202, available in SDK 1.1.2 | Not automatically | The backend outcome is uncertain. Inspect it before resubmitting |
| `AtomicMemoryError` | Base class for other SDK utility errors | n/a | Does not include the memory provider hierarchy |
| `ConfigurationError` | Invalid or missing config at construction / init | No | Fix config; do not retry |
| `NetworkError` | Network failures in other SDK utilities | Depends on operation | Not the memory provider transport error class |
| `StorageError` | Adapter I/O failure (IndexedDB quota, transaction abort, corruption) | Partially | Retry for transient; escalate for persistent (the resilience layer does this automatically) |
| `EmbeddingError` | Model download failure, inference error, WASM init | Sometimes | Retry once; fall back to a simpler path if available |
| `SearchError` | Search-specific failures not attributable to network or storage | Rarely | Surface to caller; inspect cause |
| `InvalidScopeError` | Request scope missing required fields for the active provider | No | Programmer error; fix the call site |
| `UnsupportedOperationError` | Called an extension the active provider does not support | No | Guard with `capabilities()` before the call |

## Handling patterns

**Catch broadly, branch on type:**

```typescript
import {
  type IngestResult,
  type MemoryClient,
  MemoryProviderError,
  MemoryTransportError,
  PendingIngestError,
} from '@atomicmemory/sdk';

export async function saveMemory(
  memory: MemoryClient,
  authenticatedUserId: string,
  content: string,
): Promise<IngestResult> {
  try {
    return await memory.ingest({ mode: 'text', content, scope: { user: authenticatedUserId } });
  } catch (err) {
    if (err instanceof PendingIngestError || err instanceof MemoryTransportError) {
      throw new Error('Memory write outcome is unconfirmed. Inspect backend state before retrying.');
    }
    if (err instanceof MemoryProviderError) {
      console.error('Memory operation failed', {
        name: err.name,
        provider: err.provider,
        operation: err.operation,
      });
    }
    throw new Error('Memory write failed.');
  }
}
```

**Prefer prevention over catch:**

-   `InvalidScopeError` should never fire in production; validate scope at the call site or at the edge of your app.
-   `UnsupportedOperationError` should never fire in well-written code; check `capabilities().extensions` before calling extension methods.
-   `ConfigurationError` should fail loudly at boot, not during a user request.

## Retry policy

The shared memory-provider HTTP client does not automatically retry. Do not infer memory retry behavior from the `RetryEngine` used by other SDK utilities. Retrying an uncertain write can repeat a mutation. Require a backend idempotency contract before adding automatic write retries.

If you need custom retry behaviour, the `RetryPolicy` type is exported from the error-handling module; construct your own `RetryableOperation` around a bare provider call.

## Error metadata

Memory provider errors carry `name`, `message`, `provider`, and `operation`, with `cause` when available. `MemoryTransportError` also exposes `url` and `code`. Treat messages and causes as sensitive because an HTTP failure can include backend response text.

## Cancellation and ingest responses

The SDK 1.1.2 changes required by the unreleased [Vercel AI SDK tools](/integrations/frameworks/vercel-ai-sdk) add per-call cancellation to ingest and search. The AtomicMemory provider forwards the caller's abort signal and combines it with its timeout. This does not promise cancellation support for every provider.

Cancellation is not rollback. A backend write that completed before cancellation can remain stored. An unexpected HTTP 202 ingest response is rejected rather than mapped to empty ID arrays. Even a normal ingest result is not a terminal commit receipt or a completed-correction guarantee.

For AI SDK calls, inspect `steps[].content` or `fullStream` for `tool-error` parts. Tool execution can fail without the outer generation call throwing. Keep this handling separate from direct SDK exception handling.

## Next

-   [MemoryProvider contract](/sdk/api/memory-provider), which errors your provider implementation should throw
-   [Capabilities](/sdk/concepts/capabilities), the guard that prevents `UnsupportedOperationError`
