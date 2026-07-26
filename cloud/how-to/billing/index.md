# Plans & Billing

> Agent index: [llms.txt](/llms.txt)

**Plans & Billing** shows your Organization's current plan and how much of it you've used. It's scoped to the Organization, so one plan covers every project the org owns.

## Plans

| Plan | Local projects | Cloud projects | How you get it |
| --- | --- | --- | --- |
| **Open Source** | 1 | 0 | Default on signup — free forever |
| **Free** | 1 (kept) | 1 | Self-serve $0 upgrade, right here in Billing |
| **Team** | Custom | Custom | Demo-led — talk to sales |
| **Corporate** | Custom | Custom | Demo-led — talk to sales |

Every Organization starts on **Open Source**: one Connected Local project, full console visibility, no Atomic Memory project. **Upgrade to Free** in Billing to keep that Local project and unlock one Atomic Memory project — it's a self-serve $0 checkout, no sales conversation required. **Team** and **Corporate** cover usage beyond Free's single Cloud project and are demo-led; request a demo rather than self-serve checkout.

info

**Developer** is a legacy plan. Existing subscribers keep their grandfathered limits and billing continues to work, but it is no longer offered to new Organizations — upgrade to **Free** instead.

## How it works

Only writes are metered. Every `ingest` consumes processed tokens that count toward your plan's monthly allowance and reset at the end of each billing period; retrieval and storage are unmetered. When you reach the monthly write-token cap, writes pause until you upgrade or the period resets — search and storage keep working the whole time.

Exact write-token allowances can change per plan and aren't repeated here — see your Organization's current allowance and usage on [Usage & Limits](/cloud/how-to/usage), or in the plan details shown at checkout when you upgrade.

Only Organization admins can change the subscription or upgrade to Free; other members see billing read-only.

info

Reaching the monthly write-token limit pauses ingestion only. Retrieval and storage stay available — upgrade, or wait for the next billing period, to resume writes.

## Key capabilities

-   **Organization-scoped** — one plan covers all of the org's projects.
-   **Type-aware limits** — Local and Cloud project counts are tracked and capped separately, matching what each plan unlocks.
-   **Self-serve Free upgrade** — go from Open Source to Free without a sales call.
-   **Writes-only metering** — retrieval and storage are unmetered within limits.
-   **Demo-led Team/Corporate** — usage beyond Free is a sales conversation, not a self-serve checkout.
-   **Role-gated** — only org admins can change the plan.

## Related

-   [Usage](/cloud/how-to/usage)
-   [Projects](/cloud/how-to/projects)
-   [Project Settings](/cloud/how-to/settings)
