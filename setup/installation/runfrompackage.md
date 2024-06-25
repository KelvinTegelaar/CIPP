---
description: Enable Run From Package for lower costs
---

# Run From Package Mode

{% hint style="info" %}
Hosted clients get set to Run From Package mode automatically.
{% endhint %}

{% hint style="warning" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip this step.
{% endhint %}

In the CIPP Application

1. Go to CIPP -> Application Settings -> TAB Backend
2. Click on "Function app Configuration"
3. Click on "New Application Setting"
4. Add an application setting with the name "WEBSITE\_RUN\_FROM\_PACKAGE" and the value "1"
5. Click Save at the top
6. Click on Deployment Center
7. Click on "Disconnect"
8. Select the source "Github"
9. Login if required
10. Select the Organisation, Repository, and Branch you want for your CIPP-API.&#x20; Leave the "WorkFlow Option" at the default radio button of "Add a workflow".
11. Select "Basic Authentication" under authentication type. Microsoft currently cannot use Identity based authentication.
12. Click on "Add a worklow". Do not change any other settings.
13. Click save at the top.
14. Restart the Function App

{% hint style="warning" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip this step.
{% endhint %}
