# Plans & Billing

> Agent index: [llms.txt](/llms.txt)

**Plans & Billing** shows your workspace's current plan and how much of it you've used. One plan covers every project in the workspace. The account menu and the API call a workspace an organization.

## Plans

| Plan | How you get it |
| --- | --- |
| **Open Source** | Default on sign-in; one Local project, no Cloud project |
| **Basic** | $0 upgrade in Billing; one Local and one Cloud project |
| **Pro**, **Max**, **Scale** | Choose a paid plan in Billing, or redeem an eligible timed plan coupon |
| **Enterprise** | Contact sales for a custom agreement |

Billing shows your workspace's current plan and the available changes. **Basic** is the plan named `free` in the API and some older billing records. Plan allowances appear in [Usage & Limits](/cloud/how-to/usage). Only workspace admins can change the plan or redeem a coupon.

info

**Founding Developer** is a legacy plan. Existing subscribers keep their subscription; new subscribers choose Pro, Max or Scale.

## How it works

Plans meter **memory operations (MO)**. Each API operation has a weight; writing a memory is one kind of operation. Ingest, search/expand, and lighter reads all draw from the same monthly MO allowance; deletes are free. Storage itself is not charged as MO.

Approximate weights (same contract as Cloud pricing):

| Action | Memory operations |
| --- | --- |
| Ingest with extraction | 3 |
| Ingest verbatim | 1 |
| Search and expand | 1 |
| Get and list | 0.1 (1 per 10 calls) |
| Delete | free |

Document count is not the meter. A month with ~3,300 fully extracted documents can land near a 10,000-operation allowance because each extraction-weighted ingest costs **3 MO** (3,300 × 3 ≈ 9,900). Each search or expand then adds **1 MO** on top of that ingest total. Verbatim ingest is cheaper (1 MO); get/list are lighter still.

Exact allowances vary by plan and are not repeated here. See your workspace's current allowance and usage on [Usage & Limits](/cloud/how-to/usage), or the plan details at checkout when you upgrade.

Only workspace admins can change the subscription or choose another plan; other members see billing read-only.

info

Reaching the monthly MO limit pauses billable API work (ingest, search, expand, and other metered calls) until you upgrade or the period resets. Storage of what you already wrote stays available.

## Key capabilities

-   **Workspace-scoped**. One plan covers all of the workspace's projects.
-   **Project limits**. Open Source and Basic cap Local and Cloud projects separately. Pro, Max, and Scale cap the combined count.
-   **Self-serve plans**. Choose Basic, Pro, Max or Scale in Billing.
-   **MO metering**. Ingest, search/expand, and reads draw from the monthly operation allowance (deletes free; storage not charged as MO).
-   **Enterprise agreements**. Contact sales for custom usage and terms.
-   **Role-gated**. Only workspace admins can change the plan.

## Redeem a coupon

If you have a coupon, open **Have a coupon? Redeem it here** in Billing. A workspace admin reviews and explicitly redeems the benefit. A shared coupon link keeps its code through account and workspace setup. See [Redeem a coupon](/cloud/how-to/redeem-coupons) for the steps, expiry behavior, and eligibility requirements.

## Related

-   [Usage](/cloud/how-to/usage)
-   [Projects](/cloud/how-to/projects)
-   [Project Settings](/cloud/how-to/settings)
