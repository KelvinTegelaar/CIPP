---
description: Configuring the Halo PSA Ticketing integration
---

# Halo PSA Ticketing

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
   &#xNAN;_&#x54;his setting will determine who appears to be responsible for these API calls. You may want to create a dedicated agent user for this purpose._ _This agent needs to be an administrator in Halo, other roles maybe possible but have not been tested_
9. Select the **Permissions** tab.
10. Grant the application the permissions required for your purposes.\
    &#xNAN;_&#x47;enerally speaking you want to limit the API to only the permissions it needs. For CIPP this currently requires read:tickets, edit:tickets, read:customers, edit:customers._

#### Enter credentials in CIPP

Enter the information found in **Settings** > **CIPP** > **Extensions Settings** > **Halo PSA Ticketing** in CIPP. If you are self-hosting Halo, you can leave the HaloPSA Tenant blank.

After entering the credentials, click **Test Extension.** If the test is successful Alerts will automatically become a HaloPSA ticket.

#### Ticket Type

To get the Ticket Type ID, follow these steps:

1. Navigate to Configuration -> Tickets -> Ticket Type
2. Click on the desired ticket type and then the URL will display the ticket type ID.

Example: https://{halo instance url}/config/tickets/tickettype?id=**1**

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
