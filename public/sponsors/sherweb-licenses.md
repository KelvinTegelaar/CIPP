# CIPP Licence Report — Sherweb AM One-Pager (Inbound / NCE Expirations)

*Internal enablement. Use case: an **inbound** customer being moved onto Sherweb, where the AM needs to know **when the customer's existing NCE subscriptions expire/renew**. Every statement is taken from the CIPP / CIPP-API source code — no assumptions. Sources cited at the bottom.*

---

## The one thing to get right

For an **inbound** tenant, use the **Licence Report** (Tenant → Reports → Licence Report).
It reads the customer's licensing **live from Microsoft Graph**, so it works on any tenant CIPP can reach — **before** they're a Sherweb customer.

> ⚠️ Do **not** point AMs at the "Sherweb Licence Report" for inbound prospects. That page only returns data once the tenant is already a **mapped Sherweb customer** with the Sherweb integration enabled. For an inbound tenant it will be empty / error. (Covered at the end so AMs know the difference.)

The NCE expiration/renewal data lives in the **TermInfo** column of the Licence Report.

---

## Where the NCE expiration data is

**Menu:** Tenant → Reports → **Licence Report** · **API:** `/api/ListLicenses` · **Permission:** `Tenant.Directory.Read`
Pick the **single tenant** (not All Tenants) to get a **live** Graph pull for that inbound customer.

One row per licensed SKU. The renewal/expiry data is in the **TermInfo** button on each row:

| Field in TermInfo | What it tells the AM |
| --- | --- |
| **NextLifecycle** | The actual **renewal/expiration date** of the NCE subscription — this is the number to plan the migration around |
| **DaysUntilRenew** | Days from today until that date. **Goes negative** if already past due |
| **Term** | Commitment length: `Monthly`, `Yearly`, `3 Year`, `Trial`, or `Term unknown or non-NCE license` |
| **Status** | Subscription status |
| **IsTrial** | Whether it's a trial |
| **CreatedDateTime** | When the current term started |
| **SubscriptionId / CSPSubscriptionId / OCPSubscriptionId** | Subscription identifiers |

**How Term is derived** (gap between `createdDateTime` and `nextLifecycleDateTime`):
- `isTrial = true` → **Trial** *(checked first — overrides the day math)*
- 25–35 days → **Monthly**
- 36–1089 days → **Yearly**
- 1090–1100 days → **3 Year**
- anything else → **Term unknown or non-NCE license**

The rest of each row is the simple seat math (the "self-explanatory chart"):

| Column | Meaning |
| --- | --- |
| **License** | Friendly name (Admin Portal name → CSV conversion table → raw SKU as fallback) |
| **CountUsed** | Seats assigned (`consumedUnits`) |
| **CountAvailable** | Free seats (`prepaidUnits.enabled − consumedUnits`) |
| **TotalLicenses** | Seats purchased (`prepaidUnits.enabled`) |
| **AssignedUsers / AssignedGroups** | Buttons → who/what holds the licence |

---

## What to tell AMs — and the honest limitations

**The pitch:** "CIPP shows us, per SKU, exactly when your current NCE commitments renew and whether you're on monthly / annual / 3-year terms, so we can time your move to Sherweb around your renewal dates instead of eating early-termination pain."

Be straight about these so an AM doesn't get caught out on a demo:

1. **The renewal date is behind a button, not a column.** `NextLifecycle` / `DaysUntilRenew` live *inside* the **TermInfo** popup on each row. You currently **cannot sort or filter the table by "soonest to renew"** — you open TermInfo per SKU. (There's a known developer TODO to surface this better.) If a partner wants a ranked "what expires next" view, that's a current UI gap, not an existing feature — don't promise it.
2. **TermInfo only populates for true NCE subscriptions.** Legacy / non-NCE licences show little or no term data and read as `Term unknown or non-NCE license`. The renewal-date story only holds for NCE.
3. **It reflects Microsoft's view of the tenant**, regardless of who sells the seats. That's exactly why it works for inbound — it doesn't need the customer to be on Sherweb yet. It also means it won't tell you the billing partner, just the licences and their NCE dates.
4. **Single-tenant view is live; All Tenants is cached ~1 hour** (`cachelicenses` table; first load may say "Loading data for all tenants. Please check back in 1 minute"). For an inbound demo, use the single tenant — it's live.
5. **Excluded SKUs are hidden** — anything in the `ExcludedLicenses` config table won't appear.

### Data sources (so AMs/engineers can answer "where's this from?")
- `/subscribedSkus` — seat counts
- `/directory/subscriptions` — **NCE renewal/term data (this is the expiration source)**
- `/users` & `/groups` filtered to those with licences — assignments
- `admin.microsoft.com/.../m365licensing/v3/licensedProducts` — friendly names

---

## After they've moved to Sherweb (not for inbound)

Once the customer **is** a Sherweb customer and the tenant is **mapped in the Sherweb integration**, the **Sherweb Licence Report** (Tenant → Reports → Sherweb Licence Report, `/api/listCSPLicenses`) becomes useful. It pulls the actual **Sherweb subscriptions** from Sherweb's billing API and shows `purchaseDate`, `quantity`, and the **renewal date as a real column** (`commitmentTerm.renewalConfiguration.renewalDate`), plus buttons to **add / increase / decrease / cancel** seats directly.
Until the integration is enabled and the tenant mapped, it returns: *"Unable to retrieve CSP licenses, ensure that you have enabled the Sherweb integration and mapped the tenant in the integration settings."* — which is why it's the wrong page for inbound prospects.

---

### Source references (for verification)
- `CIPP-API/Modules/CIPPCore/Public/Get-CIPPLicenseOverview.ps1` — columns, TermInfo logic, term-day ranges, NCE source, exclusions
- `CIPP-API/Modules/CIPPHTTP/.../Tenant/Reports/Invoke-ListLicenses.ps1` — live single-tenant vs. 1-hour cached All-Tenants
- `CIPP/src/pages/tenant/reports/list-licenses/index.js` — displayed columns + the TermInfo TODO
- `CIPP/src/layouts/config.js` — menu labels & permissions
- `CIPP/src/pages/tenant/reports/list-csp-licenses/index.jsx`, `CIPP-API/.../Invoke-ListCSPLicenses.ps1`, `.../Sherweb/Get-SherwebCurrentSubscription.ps1` — Sherweb (post-migration) report

