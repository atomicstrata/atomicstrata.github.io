# Artifact Storage

> Agent index: [llms.txt](/llms.txt)

The SDKs expose core's artifact-storage API for applications that need to register external files or upload raw bytes. This is separate from memory ingest/search. Artifact storage is optional on the server: pointer artifacts work without a managed backend, while managed uploads require core to run with `RAW_STORAGE_MODE=managed_blob`.

## TypeScript

Use `AtomicMemoryClient.storage` for artifact operations:

```ts
import { AtomicMemoryClient } from '@atomicmemory/sdk';

const client = new AtomicMemoryClient({
  apiUrl: 'http://localhost:17350',
  apiKey: process.env.ATOMICMEMORY_API_KEY!,
  userId: 'demo-user',
  memory: {
    providers: {
      atomicmemory: {
        apiUrl: 'http://localhost:17350',
        apiKey: process.env.ATOMICMEMORY_API_KEY!,
      },
    },
  },
});

const capabilities = await client.storage.capabilities();
console.log(capabilities.provider, capabilities.supportsDirectUpload);
```

### Pointer Artifact

Pointer mode stores metadata and an external URI. Core never fetches the URI.

```ts
const artifact = await client.storage.put({
  mode: 'pointer',
  uri: 'ipfs://bafy...',
  contentType: 'application/pdf',
  metadata: { source: 'manual-upload' },
});

const meta = await client.storage.get({ artifactId: artifact.artifactId });
console.log(meta.status, meta.uri);
```

### Managed Artifact

Managed mode uploads bytes through the active core storage backend. Check capabilities first; pointer-only deployments and Filecoin direct storage in v1 report `supportsDirectUpload: false`.

```ts
const capabilities = await client.storage.capabilities();
if (!capabilities.supportsDirectUpload) {
  throw new Error('This deployment does not support direct managed upload');
}

const artifact = await client.storage.put({
  mode: 'managed',
  body: Buffer.from('hello'),
  contentType: 'text/plain',
  discloseContentHash: true,
});

const body = await client.storage.getContent({ artifactId: artifact.artifactId });
console.log(await body.text());
```

### Read, Verify, Delete

```ts
const head = await client.storage.head({ artifactId: artifact.artifactId });
const verification = await client.storage.verify({ artifactId: artifact.artifactId });

await client.storage.delete(
  { artifactId: artifact.artifactId },
  { policy: 'artifact_only' },
);
```

Use `policy: 'with_documents'` only when you intentionally want to soft-delete documents linked to the artifact.

## Python

The Python SDK exposes the same storage API with Python field names.

```python
from atomicmemory import StorageClient

with StorageClient({
    "apiUrl": "http://localhost:17350",
    "apiKey": "server-api-key",
    "userId": "demo-user",
}) as client:
    artifact = client.put({
        "mode": "pointer",
        "uri": "ipfs://bafy...",
        "contentType": "application/pdf",
    })
    print(artifact.artifact_id)

    meta = client.get({"artifact_id": artifact.artifact_id})
    print(meta.status)
```

For large managed objects, use streaming reads rather than buffering the whole response:

```python
with StorageClient({
    "apiUrl": "http://localhost:17350",
    "apiKey": "server-api-key",
    "userId": "demo-user",
}) as client:
    with client.stream_content({"artifact_id": artifact.artifact_id}) as response:
        for chunk in response.iter_bytes():
            process(chunk)
```

Async applications can use `AsyncStorageClient` with the same method names.

## Filecoin Caveat

Filecoin is a core storage provider, not a required SDK dependency. SDK clients see Filecoin through provider-agnostic fields such as `provider`, `status`, `identifiers`, `lifecycle`, `replication`, `verification`, and `retrieval`.

Filecoin/IPFS data should be treated as publicly retrievable by CID unless the server encrypts it before upload. For Filecoin-backed document bytes, staging and production core deployments must set `RAW_CONTENT_CODEC=aes_gcm`, `RAW_CONTENT_CODEC_KEYS`, and `RAW_CONTENT_CODEC_ACTIVE_KEY_ID`. `RAW_CONTENT_CODEC=none` is only accepted for local Filecoin development. The provider itself is configured with `RAW_STORAGE_FILECOIN_*` variables; see [Artifact storage](/platform/artifact-storage#filecoin-environment-variables) for the full environment variable table.

In v1, direct managed Filecoin uploads through managed-mode `client.storage.put` raise `FilecoinDirectStorageNotSupportedError`. Use pointer artifacts or the document raw-upload workflow for Filecoin-backed document bytes until direct Filecoin artifact reconciliation is enabled.

## Error Handling

Both SDKs expose typed storage errors for common cases:

-   artifact not found
-   artifact still referenced by documents
-   pointer content requested through `getContent` / `get_content`
-   direct Filecoin managed upload not supported
-   invalid storage response

Branch on capabilities before attempting optional operations, and branch on typed errors for runtime conflicts.

## Related

-   [Artifact Storage](/platform/artifact-storage), the core runtime model
-   [Storage adapters](/sdk/concepts/storage-adapters), client-side key/value storage, a different subsystem
-   [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend), configuring the memory provider that talks to core
