---
description: Configuring the Halo PSA Ticketing integration
---

# Halo PSA

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
   \&#xNAN;_This setting will determine who appears to be responsible for these API calls. You may want to create a dedicated agent user for this purpose._ _This agent needs to be an administrator in Halo, other roles maybe possible but have not been tested_
9. Select the **Permissions** tab.
10. Grant the application the permissions required for your purposes.\
    \&#xNAN;_Generally speaking you want to limit the API to only the permissions it needs. For CIPP this currently requires read:tickets, edit:tickets, read:customers, edit:customers._

#### Configure the HaloPSA Integration in CIPP

1. In your CIPP instance head to **CIPP** > **Integrations** > **HALOPSA**
2. Enter your HaloPSA URL in the **HaloPSA Resource Server URL** field adding /api at the end, for example _https://yourcompany.halopsa.com/api_
3. Enter your HaloPSA URL in the **HaloPSA Authorisation Endpoint URL** field adding /auth at the end, for example _https://yourcompany.halopsa.com/auth_
4. If you are self-hosting Halo, you can leave the HaloPSA Tenant blank, otherwise enter the first part of your HaloPSA URL in the \***HaloPSA Tenant** field, for example _yourcompany_
5. Paste in the **Client ID** and **Client Secret** that you captured during the first part in to the respective fields
6. After entering the credentials, click the **Test** button, if you get a green success banner then all good, but if you get a red error banner, double check the settings in both HaloPSA and CIPP and correct where necessary
7. Make sure the **Enable Integration** button is enabled, and then click on the **Submit** button to save the config
8. Select the HaloPSA Ticket Type and HaloPSA Outcome if you would like to override the defaults
9. Map the tenants in CIPP to the customers in Halo in the **Tenant Mapping** screen, either manually or using automap. Remember to click on the **Submit** button to save the mappings

#### Ticket Type

To get the Ticket Type ID, follow these steps:

1. Navigate to Configuration -> Tickets -> Ticket Type
2. Click on the desired ticket type and then the URL will display the ticket type ID.

Example: https://{halo instance url}/config/tickets/tickettype?id=**1**

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
