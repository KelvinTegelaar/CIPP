---
description: Enable Run From Package for lower costs
---

# Run From Package Mode

{% hint style="info" %}
Hosted clients get set to Run From Package mode automatically.
{% endhint %}



1. Go to Settings -> Backend
2. Click on "Function app Configuration"
3. Click on "New Application Setting"
4. Add an application setting with the name "WEBSITE\_RUN\_FROM\_PACKAGE" and the value "1"
5. Click Save at the top
6. Click on Deployment Center
7. Click on "Disconnect"
8. Select the source "Github"
9. Login if required
10. Select the Organisation, Repository, and Branch you want for your CIPP-API. Click on "Add a worklow". Do not change any other settings.
11. Click save at the top.
12. Restart the Function App
