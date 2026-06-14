# CIPP-API & MCP

{% hint style="warning" %}
Self-hosted clients, please see the [self-hosted-api-setup.md](../../../setup/maintaining-cipp/self-hosted-api-setup.md "mention") for how to setup and configure your API for use before proceeding with this page.

If you're using a **hosted CIPP instance**, you can follow the instructions below to set up and manage your API clients with no additional steps.
{% endhint %}

## **Creating an API Client (App Registration)**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Creating an API client:
   1. If you need to create an API Client
      1. Click on Actions > Create New Client.
      2. Fill out the form with the App Name.
   2. If you've already created an App Registration and would like to import it:
      1. Click on Actions > Add Existing Client.
      2. Select the API Client from the list.
   3. Ensure that you Enable the client in order to save it to the Function App authentication settings.
   4. Optionally set the [#custom-roles](../../../setup/self-hosting-guide/roles.md#custom-roles "mention") and Allowed IP Ranges for additional security.
   5. Select if you want MCP Access Allowed for this client. Enabling MCP Access converts this client into the MCP resource app and it can no longer be used as a normal API client. Only one client per tenant can hold this role. See [#enable-the-mcp-feature](cipp-api.md#enable-the-mcp-feature "mention") for more information.
   6. Submit the form to create the client. Remember to copy the Application secret to a secure location.
3. Once you have the API Client(s) configured, click Actions > Save Azure Configuration, this updates the Function App authentication settings with the new Client IDs.

{% hint style="info" %}
The IP Range list supports both IPv4 and IPv6 addresses as standalone IP addresses or in CIDR Notation (e.g. 12.34.56.78/24 or 1.1.1.1).
{% endhint %}

{% hint style="info" %}
Custom Roles will limit which API endpoints each API Client can access. This can be used to limit all API calls to read only for example.
{% endhint %}

## Using an API Client

After creating your first API client, the page will update to include additional information that is necessary for your automation:

* Token URL: This URL is what you will need when authenticating your automation to your CIPP instance. See [setup-and-authentication.md](../../../api-documentation/setup-and-authentication.md "mention") for more information.
* Tenant ID: This is the tenant ID for the tenant used to authenticate CIPP where your CIPP service account lives, this may take 5-15 minutes before it updates from when you create your first API client and press save.
* API URL: This will be the base URL required for all post-authenticated calls. Note that most automation tools will require you to append `/api` to this base URL for successful responses.

## **Disabling an API Client**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Find the API client in the table and click on the 3 dots in the Actions column > Edit.
3. Flip the Enabled switch off and click Submit.
4. At the top of the page, go to Actions and click Save Azure Configuration.

## **Rotating Secrets**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Find the API client in the table and click on the 3 dots in the Actions column > Reset Application Secret.
3. Copy the new Secret to a secure location.

## **Troubleshooting**

* If you are getting permission errors when creating an API Client, check the CIPP-SAM application to ensure the permissions listed in the error are added and consented by an admin.
* If you have multiple CIPP-SAM apps, use the [#permissions-check](../settings/permissions.md#permissions-check "mention") to figure out which one you're using.

{% hint style="info" %}
**Want to Build Against the API?**

For full authentication examples, usage patterns, and endpoint information, see the [setup-and-authentication.md](../../../api-documentation/setup-and-authentication.md "mention") section within the API Documentation section.
{% endhint %}

## CIPP MCP

The CIPP MCP allows you to add CIPP to any AI you use and immediately talk to it in natural language. For example, you can ask "List all tenants with unassigned licenses" or "list all users for tenant MySpecialTenant.com". To setup the MCP, follow these instructions:

{% stepper %}
{% step %}
### Enable the MCP Feature

In CIPP: **CIPP → Application Settings → Features** → turn on **MCP Server**.
{% endstep %}

{% step %}
### Create the MCP API Client

Open the [cipp-api.md](cipp-api.md "mention") page and **Create New Client** (or edit an existing one). Set:

| Field                  | Value                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Role**               | `Readonly` (recommended) — or a custom read role. This becomes what the AI can do.               |
| **IP range**           | `Any` — the connector calls in from Anthropic's servers, so you can't pin it to your office IPs. |
| **Enable this client** | On                                                                                               |
| **MCP Access Allowed** | **On**                                                                                           |
{% endstep %}

{% step %}
### Save to Azure

Click **Actions → Save to Azure**. This does all the Entra/Azure configuration for you automatically; however you might need to add your specific MCP providers authentication URL to your app. do that as follows:

1. Open the [Azure portal](https://portal.azure.com/) → **Microsoft Entra ID** → **App registrations**.
2. Select **All applications** and open your MCP client app — the one you flagged _MCP Access Allowed_ (search by its name, or by its Application/Client ID).
3. Go to **Authentication**.
4. Under **Platform configurations**, click **Add a platform → Web** (or use the existing **Web** platform if one is already listed).
5. Under **Redirect URIs**, add your provider's callback URL (for Claude: `https://claude.ai/api/mcp/auth_callback`), then **Configure / Save**.

The instance restarts — give it up to \~60 seconds before connecting.
{% endstep %}

{% step %}
### Add the Connector in Your LLM

To add the MCP to your LLM follow the instructions provided by the LLM provider, in most cases you'll need to enter your **CIPP API URL and OAUTH credentials.** These credentials are the ID and secret returned to you by the setup.

the URL used is `https://<your-cipp-api-url>/api/ExecMCP`

Click **Connect**. You'll be redirected to your normal Microsoft / CIPP sign-in — log in and approve. Your LLM completes the connection and CIPP's read tools appear.

{% hint style="info" %}
Every AI has a slightly different setup. Please reference the docs for your provider on how to connect the CIPP MCP tooling. Alternatively, ask your AI directly how to connect to the MCP with a prompt like: `Read the CIPP MCP setup instructions at https://docs.cipp.app/user-documentation/cipp/integrations/cipp-api#cipp-mcp and walk me through how to set up and configure the CIPP MCP integration with my AI. Give me the steps in order, include the exact field values I need to set, the redirect/callback URL, and the format of the ExecMCP endpoint URL. Note anything I have to copy and store securely.`
{% endhint %}
{% endstep %}

{% step %}
### Verify

Ask your AI something like:

> _Using CIPP, list all my tenants._

If tools show up and return data, you're done.
{% endstep %}
{% endstepper %}

## Scoping Copilot Tool Imports

Copilot limits the number of tools that you can import to 70. If you don't do any additional configuration, it will randomly select 70 from the list. The way to limit this is by the use of query parameters added to your CIPP API URL.

### By Tag

`<cipp url>/api/ExecMCP?tags=Identity,Exchange`

The list of tags available is:

* Identity
* Tenant
* Security
* Endpoint
* Teams-Sharepoint
* Email-Exchange
* Tools
* CIPP

### By Tool

You can also use the actual API endpoint name to limit just the explicit number of tools that you want to import:

`<cipp url>/api/ExecMCP?tools=ListUsers,ListGroups`

### By Limit

`<cipp url>/api/ExecMCP?first=70` or `<cipp url>/api/ExecMCP?limit=70`

***

{% include "../../../.gitbook/includes/feature-request.md" %}
