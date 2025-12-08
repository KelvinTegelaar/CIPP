---
description: >-
  Domains in CIPP don’t always update instantly. This page explains how and when
  the Domain Analyser refreshes, why some domains might not appear, and what
  happens if you delete one.
---

# Domain Analyser Updates & Data Refreshing

### Domain Visibility

Sometimes a domain is missing from the analyser even though it appears elsewhere in the dashboard. Common reasons include:

* Only **verified Microsoft 365 domains** are included.
* Certain service domains (for example `*.microsoftonline.com`, `exclaimer.cloud`, `codetwo.online`) are automatically excluded.
* If the tenant’s **default domain was changed**, the “All Tenants” view and the tenant-specific view may temporarily differ until the next scheduled run.
* Newly added domains only appear after the next nightly analysis or if you refresh manually.

***

### Deleting & Restoring Domains

* Clicking **Delete from analyser** removes the domain from CIPP’s list, but it **does not remove it from Microsoft 365**.
* Deleted domains will reappear automatically during the nightly run (**00:00 UTC**).
* You can restore them immediately by clicking **Run Analysis Now**.
* If a domain was actually removed from Microsoft 365 or is no longer verified, it will not return.

***

### Refreshing Results

Use **Run Analysis Now** if you want to refresh the analyser outside the normal daily cycle. This is useful for:

* Refreshing results after adding or verifying a domain.
* Repopulating a deleted domain without waiting 24 hours.
* Forcing an update if you suspect results are stale.

{% hint style="info" %}
For most tenants, this is rarely needed. The nightly job keeps results up to date automatically.
{% endhint %}

***

### Troubleshooting

* **Domain missing after adding** → Run Analysis Now or wait until midnight UTC.
* **Domain missing in analyser but visible in dashboard** → Often caused by default vs. initial domain mismatch; re-run analysis.
* **Deleted domain not returning** → Confirm the domain still exists and is verified in Microsoft 365.
* **Analysis not updating** → Check CIPP permissions (`Domain.Read.All`) and make sure both CIPP and CIPP-API are up to date.
