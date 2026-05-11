# Hermes Agent

> Agent index: [llms.txt](/llms.txt)

AtomicMemory integrates with Hermes as a native Python memory provider. Unlike the MCP-backed coding-agent plugins, Hermes exposes lifecycle hooks directly to memory providers, so the AtomicMemory integration can participate in prefetch, turn sync, and session shutdown without routing through an MCP stdio process.

The provider is backed by `atomicmemory-python`, keeping Hermes-specific code focused on registration, lifecycle hooks, and tool schemas while memory semantics stay in the SDK.

## Deployment targets

### Local

Use this when you want the self-managed Hermes path and need the current clone-from-source workflow.

See [Hermes Local](/integrations/coding-agents/hermes/local).

### Cloud

Coming Soon

Cloud deployment details for Hermes are not documented yet. This page will describe hosted configuration and rollout guidance once those details are finalized.

See [Hermes Cloud](/integrations/coding-agents/hermes/cloud).
