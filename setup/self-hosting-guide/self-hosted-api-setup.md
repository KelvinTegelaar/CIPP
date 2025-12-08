---
description: For users running CIPP in their own Azure environment.
---

# Self-hosted API Setup

{% hint style="warning" %}
This step is optional for anyone who deployed after v7.1.x. If you are coming from v7.1.x or earlier, your Function App identity needs the "Contributor" role assigned to itself. You can do this manually, or with the PowerShell Role Assignment script. Both options are described below.
{% endhint %}

#### Assign the “Contributor” Role to the Function App

If you're self-hosting and running your own Azure Function App, you'll need to grant it proper access:

{% stepper %}
{% step %}
Go to [Azure Portal](https://portal.azure.com).
{% endstep %}

{% step %}
Open the resource group hosting CIPP.
{% endstep %}

{% step %}
Select the **Function App** (not an offloaded app).
{% endstep %}

{% step %}
Navigate to **Access control (IAM)** > **+ Add** > **Add role assignment**.
{% endstep %}

{% step %}
Click on Privileged administrator roles.
{% endstep %}

{% step %}
Choose:

* **Role:** Contributor
* **Assign access to:** User, group, or service principal
* **Select:** The CIPP Function App identity

{% hint style="info" %}
The **Contributor** role should allow the identity to create and manage all types of Azure resources but does not allow them to grant access to others.

In the **Select** field and type `cipp`. As you begin typing, the list of options will narrow, and you should see the Managed Identity for your Function App.
{% endhint %}
{% endstep %}

{% step %}
Click **Save.**
{% endstep %}
{% endstepper %}

***

#### PowerShell Role Assignment (Alternative)

You can also use Azure Cloud Shell:

```powershell
$RGName = Read-Host -Prompt "Resource Group Name"
Connect-AzAccount
$Functions = Get-AzResource -ResourceGroupName $RGName -ResourceType 'Microsoft.Web/sites' | Where-Object { $_.Name -match 'cipp' -and $_.Name -notmatch '-' }
$FunctionApp = Get-AzWebApp -ResourceGroupName $Functions.ResourceGroupName -Name $Functions.Name
$Identity = $FunctionApp.Identity.PrincipalId
New-AzRoleAssignment -ObjectId $Identity -RoleDefinitionName 'Contributor' -Scope $FunctionApp.Id
```

{% embed url="https://shell.azure.com/powershell" fullWidth="false" %}
This script can be run in Azure Cloud Shell. Click the link to be taken to the Azure Portal.
{% endembed %}

***

{% hint style="success" %}
Once configured, head over to the [cipp-api.md](../../user-documentation/cipp/integrations/cipp-api.md "mention") Integration page in your CIPP UI.
{% endhint %}
