---
description: Deploying multiple function apps to increase performance
---

# Function Offloading

{% hint style="danger" %}
This is an advanced configuration of CIPP currently in beta. Please proceed with caution.
{% endhint %}

{% hint style="info" %}
Hosted CIPP users can request this deployment via the helpdesk. Once deployed, proceed to the "Enabling Function Offloading" section of this page.
{% endhint %}

## Deploying Additional CIPP Function Apps to a Resource Group Using an ARM Template

This guide explains how to deploy additional function apps for CyberDrain Improved Partner Portal (CIPP) to an existing resource group using the provided ARM template.

### Prerequisites

Before starting, ensure you have the following:

* An existing deployment of CIPP in your Azure portal.
* Access to an Azure subscription with an existing resource group.
* Understanding of Azure function app deployments.

### ARM Template Overview

#### Parameters Used

* **backendFuncType**: The type of function app to deploy. Valid values are `proc`, `auditlog`, `standards`, and `usertasks`. For the first offloading function, you should always deploy the `proc` type. You can deploy additional function apps for specific workloads beyond that.

{% hint style="warning" %}
If you have migrated your resources to another resource group or subscription, you will want to use the second template below for Custom Function Apps.
{% endhint %}

<details>

<summary>ARM Template for Offloading (Default)</summary>

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "backendFuncType": {
      "type": "string",
      "metadata": {
        "description": "Type of function app"
      },
      "allowedValues": ["proc", "auditlog", "standards", "usertasks"]
    }
  },
  "variables": {
    "suffix": "[substring(toLower(uniqueString(resourceGroup().id, resourceGroup().location)),0,5)]",
    "mainFuncAppName": "[toLower(concat('cipp', variables('suffix')))]",
    "funcAppName": "[toLower(concat('cipp', variables('suffix'),'-',parameters('backendFuncType')))]",
    "funcStorageName": "[tolower(concat('cippstg', variables('suffix')))]",
    "serverFarmName": "[concat('cipp-srv-', variables('suffix'),parameters('backendFuncType'))]"
  },
  "resources": [
    {
      "type": "Microsoft.Web/serverfarms",
      "apiVersion": "2018-02-01",
      "name": "[variables('serverFarmName')]",
      "location": "[resourceGroup().location]",
      "sku": {
        "name": "Y1",
        "tier": "Dynamic",
        "size": "Y1",
        "family": "Y",
        "capacity": 0
      },
      "properties": {
        "perSiteScaling": false,
        "maximumElasticWorkerCount": 1,
        "isSpot": false,
        "reserved": false,
        "isXenon": false,
        "hyperV": false,
        "targetWorkerCount": 0,
        "targetWorkerSizeId": 0,
        "name": "[variables('serverFarmName')]",
        "computeMode": "Dynamic"
      }
    },
    {
      "apiVersion": "2015-08-01",
      "type": "Microsoft.Web/sites",
      "identity": {
        "type": "SystemAssigned"
      },
      "name": "[variables('funcAppName')]",
      "location": "[resourceGroup().location]",
      "kind": "functionapp",
      "dependsOn": [
        "[resourceId('Microsoft.Web/serverfarms',variables('serverFarmName'))]"
      ],
      "properties": {
        "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', variables('serverFarmName'))]",
        "siteConfig": {
          "Use32BitWorkerProcess": false,
          "powerShellVersion": "7.4",
          "appSettings": [
            {
              "name": "AzureWebJobsStorage",
              "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', variables('funcStorageName'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('funcStorageName')),'2015-05-01-preview').key1)]"
            },
            {
              "name": "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING",
              "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', variables('funcStorageName'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('funcStorageName')),'2015-05-01-preview').key1)]"
            },
            {
              "name": "WEBSITE_CONTENTSHARE",
              "value": "[variables('funcAppName')]"
            },
            {
              "name": "FUNCTIONS_EXTENSION_VERSION",
              "value": "~4"
            },
            {
              "name": "FUNCTIONS_WORKER_RUNTIME",
              "value": "powershell"
            },
            {
              "name": "WEBSITE_RUN_FROM_PACKAGE",
              "value": "1"
            },
            {
              "name": "CIPP_PROCESSOR",
              "value": "true"
            },
            {
              "name": "AzureFunctionsWebHost__hostid",
              "value": "[variables('funcAppName')]"
            }
          ]
        }
      }
    },
    {
      "name": "[concat(variables('funcAppName'), '/ZipDeploy')]",
      "type": "Microsoft.Web/sites/extensions",
      "apiVersion": "2021-02-01",
      "location": "[resourceGroup().location]",
      "dependsOn": [
        "[resourceId('Microsoft.Web/sites', variables('funcAppName'))]"
      ],
      "properties": {
        "packageUri": "https://cippreleases.blob.core.windows.net/cipp-api/latest.zip"
      }
    },
    {
      "type": "Microsoft.KeyVault/vaults/accessPolicies",
      "name": "[concat(variables('mainFuncAppName'), '/add')]",
      "apiVersion": "2019-09-01",
      "location": "[resourceGroup().location]",
      "dependsOn": [
        "[resourceId('Microsoft.Web/sites', variables('funcAppName'))]"
      ],
      "properties": {
        "accessPolicies": [
          {
            "tenantId": "[subscription().tenantid]",
            "objectId": "[reference(resourceId('Microsoft.Web/sites', variables('funcAppName')),'2019-08-01', 'full').identity.principalId]",
            "permissions": {
              "keys": [],
              "secrets": ["all"],
              "certificates": []
            }
          }
        ]
      }
    }
  ],
  "outputs": {}
}
```



</details>

<details>

<summary>ARM Template for Offloading (Custom Function App)</summary>

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "funcAppName": {
      "type": "string",
      "metadata": {
        "description": "Function app name"
      }
    },
    "backendFuncType": {
      "type": "string",
      "metadata": {
        "description": "Type of function app"
      },
      "allowedValues": [
        "proc",
        "auditlog",
        "standards",
        "usertasks"
      ]
    }
  },
  "variables": {
    "funcAppName": "[concat(parameters('funcAppName'),'-',parameters('backendFuncType'))]",
    "suffix": "[replace(parameters('funcAppName'), 'cipp', '')]",
    "funcStorageName": "[tolower(concat('cippstg', variables('suffix')))]",
    "serverFarmName": "[concat('cipp-srv-', variables('suffix'),parameters('backendFuncType'))]"
  },
  "resources": [
    {
      "type": "Microsoft.Web/serverfarms",
      "apiVersion": "2018-02-01",
      "name": "[variables('serverFarmName')]",
      "location": "[resourceGroup().location]",
      "sku": {
        "name": "Y1",
        "tier": "Dynamic",
        "size": "Y1",
        "family": "Y",
        "capacity": 0
      },
      "properties": {
        "perSiteScaling": false,
        "maximumElasticWorkerCount": 1,
        "isSpot": false,
        "reserved": false,
        "isXenon": false,
        "hyperV": false,
        "targetWorkerCount": 0,
        "targetWorkerSizeId": 0,
        "name": "[variables('serverFarmName')]",
        "computeMode": "Dynamic"
      }
    },
    {
      "apiVersion": "2015-08-01",
      "type": "Microsoft.Web/sites",
      "identity": {
        "type": "SystemAssigned"
      },
      "name": "[variables('funcAppName')]",
      "location": "[resourceGroup().location]",
      "kind": "functionapp",
      "dependsOn": [
        "[resourceId('Microsoft.Web/serverfarms',variables('serverFarmName'))]"
      ],
      "properties": {
        "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', variables('serverFarmName'))]",
        "siteConfig": {
          "Use32BitWorkerProcess": false,
          "powerShellVersion": "7.4",
          "appSettings": [
            {
              "name": "AzureWebJobsStorage",
              "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', variables('funcStorageName'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('funcStorageName')),'2015-05-01-preview').key1)]"
            },
            {
              "name": "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING",
              "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', variables('funcStorageName'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('funcStorageName')),'2015-05-01-preview').key1)]"
            },
            {
              "name": "WEBSITE_CONTENTSHARE",
              "value": "[variables('funcAppName')]"
            },
            {
              "name": "FUNCTIONS_EXTENSION_VERSION",
              "value": "~4"
            },
            {
              "name": "FUNCTIONS_WORKER_RUNTIME",
              "value": "powershell"
            },
            {
              "name": "WEBSITE_RUN_FROM_PACKAGE",
              "value": "1"
            },
            {
              "name": "CIPP_PROCESSOR",
              "value": "true"
            }
          ]
        }
      }
    },
    {
      "name": "[concat(variables('funcAppName'), '/ZipDeploy')]",
      "type": "Microsoft.Web/sites/extensions",
      "apiVersion": "2021-02-01",
      "location": "[resourceGroup().location]",
      "dependsOn": [
        "[resourceId('Microsoft.Web/sites', variables('funcAppName'))]"
      ],
      "properties": {
        "packageUri": "https://cippreleases.blob.core.windows.net/cipp-api/latest.zip"
      }
    },
    {
      "type": "Microsoft.KeyVault/vaults/accessPolicies",
      "name": "[concat(parameters('funcAppName'), '/add')]",
      "apiVersion": "2019-09-01",
      "location": "[resourceGroup().location]",
      "dependsOn": [
        "[resourceId('Microsoft.Web/sites', variables('funcAppName'))]"
      ],
      "properties": {
        "accessPolicies": [
          {
            "tenantId": "[subscription().tenantid]",
            "objectId": "[reference(resourceId('Microsoft.Web/sites', variables('funcAppName')),'2019-08-01', 'full').identity.principalId]",
            "permissions": {
              "keys": [],
              "secrets": [ "all" ],
              "certificates": []
            }
          }
        ]
      }
    }
  ],
  "outputs": {}
}

```

</details>

### Deploying the ARM Template

You can deploy the ARM template to your Azure resource group using the Azure Portal, Azure CLI or PowerShell.

#### Deploying a Custom ARM Template via Azure Portal

To deploy a custom ARM template using the Azure Portal, follow these steps:

1. **Navigate to the Azure Portal**: Go to [https://portal.azure.com](https://portal.azure.com) and sign in with your credentials.
2. **Deploy**: In the search bar at the top of the portal, type **"Deploy a custom template"** and select the result that appears.
   1. If you are using the Custom Function App template, you will be prompted at this stage to enter your Azure Function App name.
3. **Template Options**:
   * On the **Custom deployment** page, click the **Build your own template in the editor** option.
4. **Paste the ARM Template**:
   * Delete any default content in the editor, then paste your ARM template.
   * Once the template is pasted, click **Save**.
5. **Configure Parameters**:
   * Select the **backend function type**.
   * Click **Review + Create**.
6. **Deploy**:
   * Review the deployment settings and parameters.
   * Ensure there are no template validation failures.
   * Click **Create** to initiate the deployment process.

Once the deployment starts, you can monitor its progress through the **Notifications** section in the Azure Portal.

#### Deploying with Azure CLI

Use the following command to deploy the template using the Azure CLI:

```bash
az deployment group create --resource-group <your-resource-group> --template-file <path-to-FunctionZipDeployArm.json>   --parameters backendFuncType=<type>
```

Replace `<your-resource-group>`, `<path-to-FunctionZipDeployArm.json>` and `<type>` with the appropriate values. The `<type>` should be one of `proc`, `auditlog`, `standards`, or `usertasks`.

#### Deploying with PowerShell

Alternatively, you can deploy the template using PowerShell with the following command:

```powershell
New-AzResourceGroupDeployment `
  -ResourceGroupName <your-resource-group> `
  -TemplateFile <path-to-FunctionZipDeployArm.json> `
  -backendFuncType <type>
```

## Enabling Function Offloading

After successful deployment of the offloading function apps, follow these steps to enable Function Offloading in CIPP.

1. Navigate to CIPP > Advanced > SuperAdmin
2. Under Function Offloading, toggle the Offload Functions button and hit Save.

***

### Automatic Updates

After setting up your additional function apps, make sure to enable CI/CD from the Deployment Center on each of them to ensure they stay on the same version as your main function app. Please see the [Run from Package ](../../../../setup/self-hosting-guide/runfrompackage.md)document for more information.

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
