---
description: Configure the NinjaOne Integration
---

# NinjaOne

{% hint style="info" %}
Please Note the NinjaOne CIPP integration requires NinjaOne version 5.6 or above. This will be rolling out regionally starting the end of November and going through mid-December.
{% endhint %}

The NinjaOne integration provides several different options to give you control over what is synchronised from CIPP to NinjaOne.

Data is synchronized automatically once every 24 hours from Microsoft 365 / CIPP to NinjaOne.

The Intune Device Compliance Status utilizes Graph Webhook subscriptions and should update this field inside NinjaOne within minutes of a change occurring in Microsoft 365.

{% hint style="info" %}
For Tenant and Device information custom fields are used. For detailed Users and License information NinjaOne Documentation is used. If you do not currently have access to NinjaOne Documentation please reach out to your account manager.
{% endhint %}

## Configuring the integration

### Step 1 - Obtain API Credentials

1. First login to your NinjaOne instance as a System Administrator user.
2. Browse to **Administration -> Apps -> API** (/#/administration/apps/api)
3. Select Add in the top right.
4.  Under Application Platform select API Services (machine-to-machine)\


    <figure><img src="../../../../../../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>
5. Fill out the details for the API Application:
   1. Enter a Name such as '**CIPP Integration**'.
   2. Leave Redirect URIs blank.
   3. Select the '**Monitoring**' and '**Management**' scopes.
   4. Select the Allowed Grant Type of '**Client Credentials**'
   5.  Click Save in the top right.\


       <figure><img src="../../../../../../.gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>
6. After clicking Save make sure to save the displayed secret securely.
7. Close the API application.
8. In the table copy the '**Client ID**' and also save this securely.

### Step 2 - Create Custom Fields

For synchronizing Tenant and Device data into NinjaOne CIPP makes use of custom fields. These fields need to be created manually in NinjaOne. You can choose which fields you would like to populate inside NinjaOne, so if you only wish to populate certain sections that is possible.

The fields that you can configure are:

| Field Label                  | Type    | Definition Scope | Description                                                                                                                              |
| ---------------------------- | ------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Microsoft 365 Tenant Links   | WYSIWYG | Organization     | Provides quick links from NinjaOne to M365 and the CIPP Portals.                                                                         |
| Microsoft 365 Tenant Summary | WYSIWYG | Organization     | Provides a summary overview of the Microsoft 365 Tenant inside NinjaOne.                                                                 |
| Microsoft 365 User Summary   | WYSIWYG | Organization     | Provides a table listing the first 100 users in a tenant with details such as OneDrive and Exchange usage and their associated devices . |
| Microsoft 365 Device Links   | WYSIWYG | Device           | Provides links from devices in NinjaOne to the Microsoft and CIPP portals.                                                               |
| Microsoft 365 Device Summary | WYSIWYG | Device           | Provides an overview of a device such as compliance status and group membership.                                                         |
| Intune Device Compliance     | TEXT    | Device           | Sets a TEXT field inside NinjaOne with the current device compliance state, that can be monitored using custom field conditions.         |

To add the custom fields:

1. Inside the NinjaOne portal browse to **Administration** -> **Devices** -> **Global Custom Fields**
2. Click add in the top right.
3. Enter a label for how you wish the field to be displayed inside Ninja One.
4. The name should be generated automatically, but you can customize this if you wish.
5. Select the Type which matches the type for the field from the table above.
6.  Click Create\


    <figure><img src="../../../../../../.gitbook/assets/image (4).png" alt=""><figcaption></figcaption></figure>
7. On the next screen, set the Technician Permission to '**Read Only**'
8. Leave the Automations permission set to None. (**Note:** the exception to this is the Intune Device Compliance field, which you should set to read only, if you wish to use a condition monitor on this field)
9. Set the API permission to Read/Write.
10. **Optional:** For the WYSIWYG fields you can choose if you wish for them to be expanded by default in Advanced Settings
11. Save the settings and repeat for all the fields you wish to synchronize.\


    <figure><img src="../../../../../../.gitbook/assets/image (5).png" alt=""><figcaption></figcaption></figure>



### Step 3 - CIPP Settings

You should now be ready to configure settings inside CIPP

1. Inside CIPP browse to **Settings** -> **CIPP** -> **Application Settings**
2. Select the **Extensions** tab.
3. In the NinjaOne Integration section please enter the instance name you use to connect to NinjaOne:
   * app.ninjarmm.com
   * eu.ninjarmm.com
   * oc.ninjarmm.com
   * ca.ninjarmm.com
   * us2.ninjarmm.com
4. Enter the Client ID you created in NinjaOne Client ID
5. Enter the Client Secret in NinjaOne API Client Secret.
6. If you have **NinjaOne Documentation** enabled you can choose to Synchronize detailed User information and License information. This will use Documentation Templates and Apps and Services Documents to create a document for each user and license in a tenant.
7. Select if you wish to only synchronize information on users which have a license assigned in NinjaOne toggle the '**Only Synchronize Licensed Users**' option. This will apply to both the Users summary table and the detailed user Synchronization.
8.  Set the configuration to enabled to enable automatic synchronization once every 24 hours.\


    <figure><img src="../../../../../../.gitbook/assets/image (6).png" alt=""><figcaption></figcaption></figure>
9. Click the Set Extension Settings button.
10. Once the settings are saved click the '**Test Extension**' you should see a message at the top of the page saying '**Successfully Connected to NinjaOne**', if you do not see this please check your API credentials and instance name.

### Step 4 - Mapping CIPP to NinjaOne

After the API settings are set you can now map NinjaOne items to Microsoft 365 / CIPP Items.

1. Inside CIPP select the **Extension Mappings** tab under **Settings** -> **CIPP** -> **Application Settings**

#### Field Mapping

1. Scroll down to the **NinjaOne Field Mapping Table.**
2. For each field you wish to populate in NinjaOne select the custom field from the dropdown menu.
3. If the field is not displayed, make sure you have configured the correct API Permissions, Definition Scope and Type in NinjaOne.
4. Click Set Mappings

#### Organization Mapping

1. Scroll down to the **NinjaOne Organization Mapping Table.**
2. You have two options for mapping organizations&#x20;
   * Manually pick the NinjaOne Organization from the dropdown lists and match them to the Microsoft 365 tenants. Then click the Set Mappings button.
   * Select the **Automap NinjaOne Organizations** button.
     * This will first try to match Microsoft 365 tenants where the name exactly matches in both.
     * After that it will download the devices from both Intune and NinjaOne and match based on devices which have the same serial numbers in both.
     * **NOTE:** Automapping runs in the background and can take some time. The page will need to be refreshed to see completed matches.
     * Please check the CIPP Logbook to see when this completes.

### Support

For support please visit the CIPP Discord [https://discord.gg/cyberdrain](https://discord.gg/cyberdrain)







