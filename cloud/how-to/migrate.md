# Migrate to Hosted Cloud

> Agent index: [llms.txt](/llms.txt)

Already running a **Local** project? `am migrate export` and `am migrate import` move its memories into a **Cloud** project, so you can keep working against the same data from a managed, shared endpoint instead of your own Core.

## Prerequisites

-   Your Organization is on **Free** or higher. Cloud import requires Free or higher — Open Source doesn't unlock a Hosted Cloud project to import into. See [Plans & Billing](/cloud/how-to/billing).
-   Your Local Core is running and connected (`am init` completed — see the [Platform Quickstart](/quickstart)). `am migrate export` reads directly from your live Core and creates the JSONL transfer file at export time — it's not a backup file you maintain yourself ahead of time.
-   A **Cloud** project already exists to import into — create one from [Add Hosted Cloud](/cloud/quickstart) if you haven't yet.

## Export from your Local project

```bash
am migrate export --project <local-project-slug>
```

This reads every memory your Local project's Core has stored (paginated automatically) and writes it to a local JSONL file — one manifest line (export time, project slug, record count) followed by one record per memory, each carrying its original content, scope, and a checksum. By default the file is written to `./migrate-<local-project-slug>.jsonl` in your current directory; pass `--out <path>` to choose a different location. Add `--user-id <id>` if you're exporting a Core namespace other than `default`. Run `am migrate export --help` for the full flag list.

## Import into your Cloud project

```bash
am migrate import --file <path-to-export.jsonl> --target-project <cloud-project-slug>
```

This reads the exported JSONL file and sends its records to your Hosted Cloud project, where each one is written into that project's memory store with its original content intact — it isn't re-summarized or re-extracted on the way in. The command reports how many records were imported, skipped, and failed. `--mode merge` is the default and the only mode the current CLI supports (`--mode replace-scope` is rejected). Run `am migrate import --help` for the full flag list.

## What actually moves

Migration is **memory-only**. It moves the reconciled memories themselves — not the mutation and retrieval trace history that produced them. Your Cloud project starts a fresh trace history from the moment you begin sending it traffic; your Local project's trace history isn't copied or affected.

## Safe to re-run

`am migrate import` tracks which of a Cloud project's memories came from which imported record. If you run it again against the **same** Cloud project — with the same export file, a re-exported one, or after a prior run was interrupted — records that already landed are skipped rather than duplicated; only new or previously failed records are added. That makes a retry safe by default: re-running the same import against the same target project won't create duplicate memories.

If you're unsure whether an interrupted run finished, the safest sequence is still to check before assuming: open your Cloud project's **Memories** page (or run `am memory search`/`am memory list` against it) to see what already landed, then retry the import — the skip behavior above means retrying doesn't cost you anything even if the first attempt fully succeeded.

## Verify in the console

Open your Cloud project in the console under **Memories** and confirm the migrated claims are there. Cross-check a few against your Local project's Memories page (or `am memory search`) to confirm the content matches. Because trace history doesn't migrate, don't expect to see historical Local traces under the Cloud project's **Traces** — only new activity against the Cloud project appears there going forward.

## Related docs

-   [Add Hosted Cloud](/cloud/quickstart) — create the Cloud project you're migrating into
-   [Cloud CLI](/cloud/cli) — full command reference, including migration
-   [Project Settings](/cloud/how-to/settings) — where a Cloud project's own data export lives
-   [Troubleshooting](/cloud/troubleshooting) — Core and Cloud connection problems
