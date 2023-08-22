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

1. Go to your CIPP instance.
2. Go to Settings by clicking on the arrow next to the Cyberdrain logo -> CIPP -> Settings -> Backend
3. Click on "Function app Configuration"
4. Click on "New Application Setting"
5. Add an application setting with the name "WEBSITE\_RUN\_FROM\_PACKAGE" and the value "1" then click ok.
6. Click Save at the top
7. Click on Deployment Center
8. Click on "Disconnect"
9. Select the source "Github"
10. Login if required and consent to the GitHub 0Auth request. 
11. Select the Organisation, Repository, and Branch you want for your CIPP-API. Click on "Add a worklow". Do not change any other settings.
12. Click save at the top, if you get a GitHub error "Run failed: PSScriptAnalyzer" you can ignore it.
13. Click overview on the left and then restart the function app from the top bar.
