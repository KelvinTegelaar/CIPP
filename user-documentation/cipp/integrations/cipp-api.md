# CIPP-API

{% hint style="warning" %}
Self-hosted clients, please see the [self-hosted-api-setup.md](../../../setup/self-hosting-guide/self-hosted-api-setup.md "mention") for how to setup and configure your API for use before proceeding with this page.

If you're using a **hosted CIPP instance**, you can follow the instructions below to set up and manage your API clients with no additional steps.
{% endhint %}

### **Creating an API Client (App Registration)**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Creating an API client:
   1. If you need to create an API Client
      1. Click on Actions > Create New Client.
      2. Fill out the form with the App Name.
   2. If you've already created an App Registration and would like to import it:
      1. Click on Actions > Add Existing Client.
      2. Select the API Client from the list.
   3. Ensure that you Enable the client in order to save it to the Function App authentication settings.
   4. Optionally set the [#custom-roles](../../../setup/installation/roles.md#custom-roles "mention") and Allowed IP Ranges for additional security.
   5. Submit the form to create the client. Remember to copy the Application secret to a secure location.
3. Once you have the API Client(s) configured, click Actions > Save Azure Configuration, this updates the Function App authentication settings with the new Client IDs.

{% hint style="info" %}
The IP Range list supports both IPv4 and IPv6 addresses as standalone IP addresses or in CIDR Notation (e.g. 12.34.56.78/24 or 1.1.1.1).
{% endhint %}

{% hint style="info" %}
Custom Roles will limit which API endpoints each API Client can access. This can be used to limit all API calls to read only for example.
{% endhint %}

### **Disabling an API client**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Find the API client in the table and click on the 3 dots in the Actions column > Edit.
3. Flip the Enabled switch off and click Submit.
4. At the top of the page, go to Actions and click Save Azure Configuration.

### **Rotating Secrets**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Find the API client in the table and click on the 3 dots in the Actions column > Reset Application Secret.
3. Copy the new Secret to a secure location.

### **Troubleshooting**

* If you are getting permission errors when creating an API Client, check the CIPP-SAM application to ensure the permissions listed in the error are added and consented by an admin.
* If you have multiple CIPP-SAM apps, use the [#permissions-check](../settings/permissions.md#permissions-check "mention") to figure out which one you're using.

{% hint style="info" %}
**Want to Build Against the API?**

For full authentication examples, usage patterns, and endpoint information, see the [setup-and-authentication.md](../../../api-documentation/setup-and-authentication.md "mention") section within the API Documentation section.
{% endhint %}

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.



