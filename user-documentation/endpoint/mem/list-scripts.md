---
description: Intune script management
---

# Scripts

CIPP can allow you to manage your existing Intune scripts for easier viewing, editing, and deployment.

### Table Rows

| Row                     | Description                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| Script Type             | Lists the tyep of script: Windows, MacOS, Remediation, or Linux            |
| Display Name            | The display name for the script                                            |
| Description             | The description set on the script                                          |
| Run As Account          | The account designated to run as                                           |
| Last Modified Date Time | The relative time since the script was last modified                       |
| Enforce Signature Check | A Boolean field indicating if the script is set to enforce signature check |
| Run As32Bit             | A Boolean field indicating if the script is set to run in 32Bit mode       |
| ID                      | The GUID of the script                                                     |
| Created Date Time       | The relative time since the script was created                             |
| File Name               | The file name including extension for the script                           |
| Role Scoping Tag Ids    | List of Scope Tag IDs for this PowerShellScript instance                   |

### Per-Row Actions

| Action        | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Edit Script   | Opens a modal to edit the script file. Click the save icon in the top right to save changes or X to close out. |
| Delete Script | Opens a modal to confirm deletion of the script                                                                |
| More Info     | Opens Extended Info flyout                                                                                     |

***

{% include "../../../.gitbook/includes/feature-request.md" %}
