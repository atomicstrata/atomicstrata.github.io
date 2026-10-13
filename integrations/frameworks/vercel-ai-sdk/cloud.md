# Vercel AI SDK Cloud

> Agent index: [llms.txt](/llms.txt)

Configure your server-side memory client with the Cloud API endpoint and a project API key. Use the [memory tools guide](/integrations/frameworks/vercel-ai-sdk) for the complete initialized example and unreleased package status.

## Set server credentials

Create a Cloud project API key through [Managing API keys](/cloud/how-to/api-keys). Configure your application's server environment:

```bash
export ATOMICMEMORY_API_KEY='<your Cloud amc_ project key>'
export AI_GATEWAY_API_KEY='<your Vercel AI Gateway key>'
```

Do not use a Core token at this endpoint. Keep the project key out of browser bundles. The SDK uses the values you pass to its configuration. It does not read an init-managed CLI profile for you. See [Authentication](/cloud/authentication).

Use this client setup before constructing the tools:

```ts
import { MemoryClient } from '@atomicmemory/sdk';

const memory = new MemoryClient({
	providers: {
		atomicmemory: {
			apiUrl: 'https://api.atomicstrata.ai',
			apiKey: process.env.ATOMICMEMORY_API_KEY!,
		},
	},
});
await memory.initialize();
```

The URL remains explicit because zero-config Cloud initialization is not supported yet. AI SDK reads the Gateway key automatically. For direct model-provider credentials instead, see [Keep your existing model provider](/integrations/frameworks/vercel-ai-sdk#keep-your-existing-model-provider).

## Bind the authenticated user

Initialize `MemoryClient`, then pass `memoryTools({ client: memory, scope: { user: serverAuthenticatedUserId } })` as shown in the [canonical guide](/integrations/frameworks/vercel-ai-sdk#run-a-tool-enabled-model-call).

The Cloud key selects the project. The user scope selects the memory subject within that project. Resolve the user ID from your authenticated server session. Do not accept a user ID chosen by the model or an unauthenticated request.

Use user-only scope for these tools. Cloud's v1 mapping treats an explicit thread as a replacement for the requested user subject, not an independent conversation partition. The tools reject `thread`, `namespace`, and `agent`. See [Scopes and identity](/sdk/concepts/scopes-and-identity).

## Check the validation limits

The new package is not yet on npm. The local fixture tests pass on Node.js 22.23.3 and 24.21.0 with AI SDK 6.0.300. This configuration is not evidence of a live hosted Cloud or live-model test. Do not infer Edge runtime support, commit guarantees, or completed correction resolution from the example.

For local Core, use [Local setup](/integrations/frameworks/vercel-ai-sdk/local).
