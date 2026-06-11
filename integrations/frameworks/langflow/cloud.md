# Langflow Cloud

> Agent index: [llms.txt](/llms.txt)

Coming Soon

Hosted Langflow setup is not documented yet.

For self-hosted Langflow connected to local or private AtomicMemory core, use [Langflow Local](/integrations/frameworks/langflow/local).

## Remote core checklist

When you run Langflow separately from AtomicMemory core:

-   Use HTTPS for the AtomicMemory API URL.
-   Store the API key in the Langflow component secret field, not in Provider Config.
-   Configure `ATOMICMEMORY_LANGFLOW_ALLOWED_HOSTS` or `ATOMICMEMORY_LANGFLOW_ALLOW_REMOTE=1` in the Langflow operator environment.
-   Restrict who can edit and run flows, because flow inputs define memory scope.
