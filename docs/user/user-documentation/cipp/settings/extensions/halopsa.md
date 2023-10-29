---
description: Configuring the HaloPSA integration
---

# HaloPSA

#### Creating an API application in Halo

1. In your Halo instance head to **Configuration** > **Integrations** > **Halo PSA API**
2. Click on **View Applications**
3. Click on **New** to add a new API application.
4. Enter the **Application Name**.\
   For example _CIPP Integration_
5. Make sure **Active** is checked.
6. Set the **Authentication Method** to _Client ID and Secret (Services)_.
7. Store the **Client ID** and **Client Secret** securely.
8. Set the **Login Type** and **Agent to login as** appropriately.\
   _This setting will determine who appears to be responsible for these API calls. You may want to create a dedicated agent user for this purpose._
9. Select the **Permissions** tab.
10. Grant the application the permissions required for your purposes.\
    _Generally speaking you want to limit the API to only the permissions it needs. For CIPP this currently requires read:tickets, edit:tickets, read:customers, edit:customers._

#### Enter credentials in CIPP

Enter the information found in **Configuration** > **Integrations** > **Halo PSA API** in CIPP. If you are self-hosting Halo, you can leave the HaloPSA Tenant blank.

After entering the credentials, click **Test Extension.** If the test is successful Alerts will automatically become a HaloPSA ticket.

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
