# Manage Drift

This page and the other tabs are a way for you to manage your tenants and their drift away from the desired settings in your drift standards template.

### Manage Drift Overview

{% embed url="https://app.storylane.io/share/xnqdcveexfod" %}

### Page Actions

| Action                                            | Description                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Refresh Data                                      | Pulls in the latest settings from the tenant to compare against the drift standard. |
| Run Standard Now (Currently Selected Tenant only) | Runs the template on the tenant selected in the top menu bar                        |
| Run Standard Now (All Tenants in Template)        | Runs the template for all configured tenants                                        |

### Page Details

The page is broken up into several sections for ease of viewing.

#### Drift Overview

This handy chart shows you the status of the standards included in the drift standards template.

#### Current Deviations

This section has two action buttons at the top:

| Action       | Description                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bulk Actions | Displays the actions from each individual card below for bulk application and the additional action of `Remove Drift Customization` which resets all customer, and all tenant applied accepted deviations from the drift standard. |
| What if      |                                                                                                                                                                                                                                    |

Each card contains the following information:

| Detail         | Description                                          |
| -------------- | ---------------------------------------------------- |
| Standard Name  | Name of the standard                                 |
| Description    | The description of what the standard is              |
| Expected Value | The expected value from the drift standards template |
| Current Value  | The actual value returned from the tenant            |
| Status         | Will display the drift status of the standard        |

#### Card Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Accept Deviation - Customer Specific</td><td>Will place a customer specific override on the drift standard</td><td>true</td></tr><tr><td>Accept Deviation</td><td>Will override the drift standard for all tenants</td><td>true</td></tr><tr><td>Deny Deviation - Remediate to align with template</td><td>Forces the standard to alignment with the values set in the drift standard template</td><td>true</td></tr><tr><td>Deny Deviation - Delete</td><td>Will delete the conditional access policy that does not align with the drift standard</td><td>true</td></tr><tr><td>Remove Drift Customization</td><td>Only available as a bulk action, this will remove all customization from the drift management and reset to comparing to the standard</td><td>true</td></tr></tbody></table>
