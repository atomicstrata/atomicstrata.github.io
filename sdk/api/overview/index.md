# Reference overview

> Agent index: [llms.txt](/llms.txt)

The SDK's reference documentation comes in two shapes: **hand-written** contract pages (here, under `API Reference`) and **generated** type / method docs produced from the SDK's source.

## What lives here

Three pages, each covering something human writing adds that generated docs cannot:

-   **[MemoryProvider contract](/sdk/api/memory-provider)**, the interface you implement when [writing a custom provider](/sdk/guides/custom-provider). This is an authoring contract, not a reference listing, the focus is on obligations (required methods, `capabilities()` rules, extension-resolution semantics), not signatures.
-   **[Errors](/sdk/api/errors)**, the `AtomicMemoryError` hierarchy with a handling cheatsheet. Small, stable, and worth reading linearly.

## What's generated

Method signatures, class members, types, and subpath exports, `MemoryClient`, `IngestInput`, `SearchRequest`, `ContextPackage`, `StorageManager`, `EmbeddingGenerator`, and the rest, are generated from the SDK's source via its `typedoc` pipeline.

Until the generated reference is published alongside these docs, point users at the SDK repo's types and JSDoc comments directly:

-   `src/client/memory-client.ts`, `MemoryClient` class
-   `src/memory/types.ts`, public types (`Scope`, `MemoryRef`, `Memory`, `IngestInput`, `SearchRequest`, `SearchResultPage`, `PackageRequest`, `ContextPackage`, `Capabilities`)
-   `src/memory/provider.ts`, `MemoryProvider` + `BaseMemoryProvider` + extension interfaces
-   `src/storage/`, `src/embedding/`, `src/search/`, subpath exports
-   `src/browser.ts`, the slim browser entry

## Why this split

The SDK's TypeScript types are the source of truth for method signatures. Writing them by hand here means maintaining two sources that drift apart. Generated reference docs stay honest automatically; hand-written narrative stays honest because it's explicitly separate from the type surface and describes contracts, not signatures.

## Linking from concept pages

Every concept page that mentions a method or type is meant to link into the generated reference. Until that lands, those links point to source files in the SDK repository. The contract pages under this section remain valid either way, they're not describing the types, they're describing the agreements you make with the SDK when you consume or extend it.
