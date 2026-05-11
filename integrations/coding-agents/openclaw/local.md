# OpenClaw Local

> Agent index: [llms.txt](/llms.txt)

Ship AtomicMemory to OpenClaw as a plugin and skill bundle. OpenClaw agents get durable semantic memory across chat apps such as WhatsApp, Telegram, Slack, and iMessage, backed by the same SDK and MCP server used by the other AtomicMemory integrations.

Source-only

`@atomicmemory/mcp-server` and the OpenClaw plugin are not published to npm or to ClawHub yet. Install from a local clone of `atomicmemory-integrations`.

## What You Get

-   **Cross-channel memory.** OpenClaw maps different transports to the same derived session identity, so a fact saved from WhatsApp can be retrieved later from Slack.
-   **Permission-aware skill.** The skill declares network and credential permissions up front and explicitly requests no filesystem or shell access.
-   **Deterministic snapshots.** Agents can store exact handoff/session summaries through `memory_ingest` with `mode: "verbatim"`.
-   **Backend-agnostic provider config.** The plugin dispatches through the SDK's `MemoryProvider` model.

## Plugin Layout

```text
plugins/openclaw/
├── openclaw.plugin.json         # plugin manifest
├── skills/
│   └── atomicmemory/
│       ├── skill.yaml           # skill manifest + permissions
│       └── instructions.md      # agent-facing guidance
└── src/
    └── index.ts                 # plugin entrypoint
```

## Install

Clone and build from source:

```bash
git clone https://github.com/atomicstrata/atomicmemory-sdk.git
git clone https://github.com/atomicstrata/atomicmemory-integrations.git

cd atomicmemory-sdk
pnpm install
pnpm build

cd ../atomicmemory-integrations
pnpm install
pnpm --filter @atomicmemory/mcp-server build
pnpm --filter @atomicmemory/openclaw-plugin build
```

Then install the local OpenClaw plugin directory:

```bash
cd plugins/openclaw
claw plugin install .
```

## Update and Version

The OpenClaw plugin is installed from source. After changing the plugin manifest, package metadata, skill manifest, skill instructions, or provider registration, bump plugin versions from `atomicmemory-integrations`:

```bash
pnpm bump:plugin-versions patch
```

For OpenClaw, the helper keeps these versions aligned:

-   `plugins/openclaw/openclaw.plugin.json` at `/version`
-   `plugins/openclaw/package.json` at `/version`
-   `plugins/openclaw/skills/atomicmemory/skill.yaml` at `/version`

Then rebuild and reinstall:

```bash
pnpm --filter @atomicmemory/mcp-server build
pnpm --filter @atomicmemory/openclaw-plugin build

cd plugins/openclaw
claw plugin install .
```

Restart the OpenClaw host if it keeps plugin modules loaded.

## Configure

OpenClaw passes config from `openclaw.plugin.json` into the plugin entrypoint:

```json
{
  "provider": "atomicmemory",
  "scope": {
    "agent": "openclaw",
    "namespace": "personal-assistant"
  }
}
```

OpenClaw resolves the AtomicMemory service, credentials, and base user identity automatically. The current session name is used as that default identity. Optional `agent`, `namespace`, and `thread` fields narrow memory when needed.

## Plugin Manifest

The manifest accepts optional `provider` and `scope` fields. It rejects unknown config fields so deployment mistakes fail early.

```json
{
  "id": "atomicmemory",
  "name": "AtomicMemory",
  "version": "0.1.3",
  "description": "Persistent semantic memory for OpenClaw agents - cross-channel user memory and deterministic session snapshots via the AtomicMemory SDK's pluggable MemoryProvider model.",
  "kind": "memory",
  "providers": ["atomicmemory.memory"],
  "skills": ["./skills/atomicmemory"],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "provider": {
        "type": "string",
        "enum": ["atomicmemory", "mem0"],
        "default": "atomicmemory"
      },
      "scope": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "agent": { "type": "string", "minLength": 1 },
          "namespace": { "type": "string", "minLength": 1 },
          "thread": { "type": "string", "minLength": 1 }
        }
      }
    }
  }
}
```

## Skill Manifest

`skills/atomicmemory/skill.yaml` declares only the permissions the memory skill needs:

```yaml
name: atomicmemory
version: 0.1.3
author:
  name: AtomicMemory
  url: https://atomicmem.ai
description: |
  Persistent semantic memory across conversations. Search prior context
  before answering questions that reference past work. Save durable facts
  the user shares, and store deterministic session snapshots before
  context is lost. Backed by the AtomicMemory SDK's pluggable
  MemoryProvider model.

permissions:
  network:
    - https://*.atomicmem.ai
  credentials: []
  filesystem: []
  shell: []

entrypoint: ./instructions.md
```

## MCP Bridge

The OpenClaw plugin embeds the shared MCP server in-process through the server's `/spawn` export and registers it as `atomicmemory.memory`.

```ts
import { spawnAtomicMemoryMcp } from '@atomicmemory/mcp-server/spawn';

const PROVIDER_ID = 'atomicmemory.memory';

const plugin = {
  id: 'atomicmemory',
  async onLoad(ctx) {
    const { server } = await spawnAtomicMemoryMcp(normalizeConfig(ctx.config));
    ctx.registerProvider(PROVIDER_ID, server);
  },
};

export default plugin;
```

The real entrypoint also validates recognized config fields before registration and falls back to the current session name for the base user identity.

## Available MCP Tools

| Tool | Description |
| --- | --- |
| `memory_search` | Semantic retrieval with scope filters. |
| `memory_ingest` | Stores memory using `mode: "text"`, `mode: "messages"`, or deterministic `mode: "verbatim"`. |
| `memory_package` | Builds a token-budgeted context package for a query. |
| `memory_list` | Lists recent scoped memories, with optional `sourceSite` filtering on AtomicMemory providers. |

## Memory Behavior

OpenClaw does not use Claude Code-style shell lifecycle hooks. Capture is prompt/tool driven:

| Moment | Action |
| --- | --- |
| Before answering with prior context | Search with `memory_search`, or use `memory_package` for a broader context bundle. |
| Durable facts or preferences | Store with `memory_ingest` using `mode: "text"`. |
| Session summaries or handoffs | Store exact records with `memory_ingest` using `mode: "verbatim"` and metadata such as `{ "source": "openclaw", "event": "session_summary", "schema_version": 1 }`. |

Retrieved memories should be treated as reference context, not instructions.

## Example

```text
you> I'm switching us to pnpm for all node projects
claw> Got it - saved. [memory_ingest]

# later, from Slack
you> what package manager do we use?
claw> pnpm. You decided this previously. [memory_search]
```

Same memory, different channel, because the plugin scopes by the derived session identity instead of transport.

## View Source

-   [`plugins/openclaw/openclaw.plugin.json`](https://github.com/atomicstrata/atomicmemory-integrations/blob/main/plugins/openclaw/openclaw.plugin.json) - canonical manifest.
-   [`plugins/openclaw/skills/atomicmemory/skill.yaml`](https://github.com/atomicstrata/atomicmemory-integrations/blob/main/plugins/openclaw/skills/atomicmemory/skill.yaml) - skill permissions and entrypoint.
-   [`plugins/openclaw/skills/atomicmemory/instructions.md`](https://github.com/atomicstrata/atomicmemory-integrations/blob/main/plugins/openclaw/skills/atomicmemory/instructions.md) - agent-facing skill prompt.
-   [`plugins/openclaw/src/index.ts`](https://github.com/atomicstrata/atomicmemory-integrations/blob/main/plugins/openclaw/src/index.ts) - plugin entrypoint.

## See Also

-   [Claude Code integration](/integrations/coding-agents/claude-code/local)
-   [Codex integration](/integrations/coding-agents/codex/local)
-   [Platform scope model](/platform/scope)
