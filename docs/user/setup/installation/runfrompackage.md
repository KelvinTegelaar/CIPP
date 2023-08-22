---
id: runfrompackage
title: Run from Package mode
slug: /gettingstarted/postinstall/runfrompackage
description: Enable Run From Package for lower costs
---

# Run From Package Mode

{% hint style="info" %}
Hosted clients get set to Run From Package mode automatically.
{% endhint %}

1. Go to CIPP
2. Visit each page you want to save the contents of, e.g. Standards, Intune Templates, Applications, Alerts, Visiting the page automatically migrates the data to Azure Tables.
3. Go to Settings -> Backend
4. Click on "Function app Configuration"
5. Click on "New Application Setting"
6. Add an application setting with the name "WEBSITE\_RUN\_FROM\_PACKAGE" and the value "1"
7. Click Save at the top
8. Click on Deployment Center
9. Click on "Disconnect"
10. Select the source "Github"
11. Login if required
12. Select the Organisation, Repository, and Branch you want for your CIPP-API. Click on "Add a worklow". Do not change any other settings.
13. Click save at the top.
14. Restart the Function App
