# Run From Package Mode

{% hint style="info" %}
**Hosted clients get set to Run From Package mode automatically.**

If you choose to sponsor and use the CyberDrain hosted version, you can skip this step.&#x20;
{% endhint %}

1. Go to the Azure portal and find your resource group. Click on the Function App
2. Click on **Function app Configuration** or `Settings` **-> Environment Variables** depending on your version of the Azure Portal.
3. Click on "New Application Setting" or `Add`
4. Add an application setting with the name `WEBSITE_RUN_FROM_PACKAGE` and the value `1`
5. Click Save or `Apply`
6. Click on Deployment Center (or Deployment -> Deployment Center)
7. Click on "Disconnect" and then click OK to confirm the disconnection.
8. Select the source "Github"
9. Login if required
10. Select the Organisation, Repository, and Branch you want for your CIPP-API. Leave the "WorkFlow Option" at the default radio button of "Add a workflow".
11. Select "Basic Authentication" under authentication type. Microsoft currently cannot use Identity based authentication.
12. Click on "Add a worklow". Do not change any other settings.
13. Click save at the top.
14. Restart the Function App
