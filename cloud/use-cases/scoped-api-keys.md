# Least-privilege scoped API keys

> Agent index: [llms.txt](/llms.txt)

A single shared credential across every service is a blast radius waiting to happen. Atomic Memory issues API keys per project, so each service reaches only that project's memory - and you can revoke or rotate any key on its own.

## The problem

One master key used everywhere means a single leak exposes all your memory, offboarding a service forces you to re-credential every other one, and you cannot tell which service wrote which memory. Access sprawls, and containment gets expensive.

## How the cloud helps

Keys are scoped to a project. A key created in one project cannot reach another project's memory, so giving each service its own project and key confines it to exactly the memory it needs. Every key can be revoked instantly or rotated in place, and each carries a prefix that ties its calls back to it.

## How it works

Create a key on a project's **API Keys** page with a name. The secret is shown once - store it in your service's configuration:

```ts
const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: "https://api.atomicstrata.ai",
      apiKey: process.env.ATOMICMEMORY_API_KEY,
    },
  },
});
```

That key reaches only its project. Within the project, pass `scope` on each call to isolate memory per user or agent. If a key leaks or a service is decommissioned, revoke it - or rotate it to issue a fresh secret and retire the old one in a single step.

## Key capabilities

-   **Per-project boundary** - a key reaches only the memory in the project it belongs to.
-   **Revoke instantly** - disable a key the moment it leaks or a service is retired.
-   **Rotate in place** - replace a secret without minting a separate key; the old one is revoked automatically.
-   **Attributable** - each key has a prefix that appears on the [traces](/cloud/how-to/traces) its calls produce.
-   **One-time secret** - the full key is revealed once at creation, never stored for later retrieval.

## Outcomes

A leaked or retired service is contained by revoking one key, not re-credentialing your fleet. And because every write carries its key's prefix, you can always trace a memory back to the service that made it.

## Plan considerations

This pattern works best when each service gets its **own Cloud project** (a key is scoped to a project, not shared across projects). Free includes one Cloud project, so giving several services each their own project needs a plan with enough Cloud projects for that — Team or Corporate. See [Plans & Billing](/cloud/how-to/billing) for what each plan includes.

## Get started

Open a project's [API Keys](/cloud/how-to/api-keys) page and create a key per service. Then see [Audit every memory mutation](/cloud/use-cases/audit-every-mutation) to follow each key's writes through the trace log.
