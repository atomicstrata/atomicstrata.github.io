# Artifact Storage

> Agent index: [llms.txt](/llms.txt)

Artifact storage is the optional raw-byte layer behind documents and storage artifacts. Memories, claims, embeddings, and search indexes still live in core's normal stores. Artifact storage is only about external files or raw bytes that a deployment wants to register, upload, verify, retrieve, or delete through AtomicMemory.

By default, core runs in **pointer-only** mode. That means AtomicMemory can record artifact metadata and external URIs without storing the bytes itself. Managed storage providers such as `local_fs`, `s3`, and `filecoin` are enabled only when the operator opts in.

## Storage Modes

| Mode | What core stores | Backend required |
| --- | --- | --- |
| `pointer_only` | Metadata plus an external URI. Core never fetches the URI. | No |
| `managed_blob` | Raw bytes through a configured storage provider. | Yes |

Pointer-only mode is the default:

```bash
# Default when RAW_STORAGE_MODE is unset
RAW_STORAGE_MODE=pointer_only
```

Managed mode is explicit:

```bash
RAW_STORAGE_MODE=managed_blob
RAW_STORAGE_PROVIDER=local_fs # local_fs | s3 | filecoin
RAW_STORAGE_PREFIX=local/dev
```

If `RAW_STORAGE_MODE=managed_blob` is set without the provider-specific configuration, core fails at startup. There is no fallback provider.

## Bundled Providers

| Provider | Addressing | Availability | Delete semantics | Typical use |
| --- | --- | --- | --- | --- |
| `local_fs` | Location-addressed | Immediate | Delete | Local development and single-node deployments |
| `s3` | Location-addressed | Immediate | Delete | Cloud object storage |
| `filecoin` | Content-addressed | Eventual | Tombstone / stop managing | Decentralized archival workflows |

`RAW_STORAGE_LEGACY_PROVIDERS` can register prior providers for read/delete of older rows after a deployment changes its active provider. New managed writes go to the active `RAW_STORAGE_PROVIDER`; historical rows dispatch by the provider recorded on the artifact row.

## Pointer Artifacts

Pointer artifacts are metadata records. The server validates the URI scheme against `RAW_STORAGE_POINTER_URI_SCHEMES`, stores the URI and metadata, and then stops. It does not download, proxy, hash, or verify the pointed-to content.

Use pointer artifacts when:

-   the bytes already live in another trusted system
-   you want to reference IPFS, S3, HTTPS, or another external URI
-   the deployment should not hold raw files
-   managed storage is not configured

Pointer mode works even when there is no active storage backend.

## Managed Artifacts

Managed artifacts upload bytes through core. The active backend writes the bytes, returns a provider URI and metadata, and core persists an artifact row.

Immediate providers such as `local_fs` and `s3` return `stored` once the bytes are available. Eventual providers such as Filecoin may return `pending`; a reconciler later promotes the artifact/document state to available or failed.

The direct storage API supports managed upload for location-addressed providers. In v1, direct managed Filecoin artifact uploads through `/v1/storage/artifacts` are intentionally not supported. Filecoin-backed document raw upload and pointer workflows are the supported paths until the direct artifact reconciler is expanded.

## Filecoin Lifecycle

Filecoin is optional and only participates when managed storage is enabled with `RAW_STORAGE_PROVIDER=filecoin`.

Filecoin data should be treated as publicly retrievable by CID unless it is encrypted before upload. For Filecoin managed document uploads, AtomicMemory requires the raw-content codec in staging and production:

```bash
RAW_CONTENT_CODEC=aes_gcm
RAW_CONTENT_CODEC_KEYS=v1:<base64url-32-byte-key>
RAW_CONTENT_CODEC_ACTIVE_KEY_ID=v1
```

With `RAW_CONTENT_CODEC=aes_gcm`, core encrypts raw document bytes before the storage provider receives them. `RAW_CONTENT_CODEC=none` is allowed with `RAW_STORAGE_PROVIDER=filecoin` only when `RAW_STORAGE_DEPLOYMENT_ENV=local`; use it only for local development with non-sensitive data.

### Filecoin Environment Variables

Use the current `RAW_STORAGE_FILECOIN_*` names for new deployments:

| Variable | Required | Description |
| --- | --- | --- |
| `RAW_STORAGE_MODE` | Yes | Set to `managed_blob` to let core store raw document bytes. |
| `RAW_STORAGE_PROVIDER` | Yes | Set to `filecoin`. The old `foc` provider value is not accepted. |
| `RAW_STORAGE_PREFIX` | Yes | Storage namespace prefix. Must be relative and must not contain `..`. |
| `RAW_STORAGE_DEPLOYMENT_ENV` | Yes | `local`, `staging`, or `production`. Filecoin plaintext is allowed only in `local`. |
| `RAW_CONTENT_CODEC` | Yes for staging/production | Set to `aes_gcm` for Filecoin in staging and production. |
| `RAW_CONTENT_CODEC_KEYS` | Yes with AES-GCM | Comma-separated `keyId:base64url-32-byte-key` entries. |
| `RAW_CONTENT_CODEC_ACTIVE_KEY_ID` | Yes with AES-GCM | Key id used for new encrypted writes. |
| `RAW_STORAGE_FILECOIN_DRIVER` | Yes | `synapse` or `filecoin_pin`. Use `synapse` unless testing the CAR-first driver. |
| `RAW_STORAGE_FILECOIN_NETWORK` | Yes | `calibration` or `mainnet`. Live tests should use `calibration`. |
| `RAW_STORAGE_FILECOIN_PRIVATE_KEY` | Yes | `0x`\-prefixed 32-byte private key. Never commit this value. |
| `RAW_STORAGE_FILECOIN_SOURCE` | Yes | Non-empty source label for provider-side metadata. |
| `RAW_STORAGE_FILECOIN_WITH_CDN` | Yes | Strict boolean: `true` or `false`. |

Local live-test env files may still carry legacy `RAW_STORAGE_FOC_*` aliases for older scripts. Keep those aliases aligned with `RAW_STORAGE_FILECOIN_*`, but do not rely on them for current core startup.

Filecoin differs from local disk and S3 in three important ways:

-   **Content addressing.** The provider URI is a content-addressed commitment such as an IPFS/Filecoin CID.
-   **Eventual availability.** A successful provider acceptance can still require later reconciliation before retrieval is confirmed.
-   **Tombstone semantics.** AtomicMemory can stop managing its own reference, but decentralized storage does not imply universal byte erasure.

Core projects Filecoin metadata through a public allowlist before returning it to clients. Internal sidecars, provider hints, proofs, credentials, and recovery details stay server-side.

### Live Encryption Smoke

Core includes an opt-in live integration test for encrypted Filecoin document uploads. It runs the document upload pipeline against calibration Filecoin, confirms the provider stores ciphertext, and decodes the retrieved bytes with the AES-GCM codec.

```bash
FILECOIN_LIVE_DOCUMENT_UPLOAD_TESTS=1 \
  dotenv -e .env.test -e .env.foc.local -- npx vitest run \
  "src/services/__tests__/document-upload-filecoin-live.test.ts" \
  --reporter=verbose --testTimeout=900000
```

## Security And Privacy

Artifact storage has stricter boundaries than ordinary memory rows:

-   Filecoin/IPFS storage is content-addressed and publicly retrievable by CID; staging and production Filecoin deployments must use `RAW_CONTENT_CODEC=aes_gcm`
-   storage keys are derived from a PII-safe HMAC prefix rather than raw user IDs
-   pointer URIs are allowlisted by scheme
-   provider metadata is redacted before reaching public responses
-   `content_hash` is opt-in because hashes can be identifying
-   pointer content is never fetched or proxied by the server
-   managed content reads require an artifact ID and authorization at core

If a managed artifact references a provider that is no longer registered, core fails loudly with a storage-backend-unavailable error instead of falling back to the active provider.

## Related Surfaces

Artifact storage appears in three public surfaces:

-   Core HTTP routes under `/v1/storage/artifacts*` for capabilities, put, get, content, head, delete, and verify.
-   Document raw-upload routes, which can use managed storage providers for raw document bytes.
-   SDK storage clients in TypeScript and Python, described in [Artifact storage](/sdk/guides/artifact-storage).

Do not confuse artifact storage providers with [embedding / LLM providers](/platform/providers) or SDK [memory providers](/sdk/concepts/provider-model). They are different layers with different contracts.
