# List Standards Templates

{% hint style="warning" %}
**Understanding Standards**

This page is a reference to the features of the Standards Templates page in CIPP. To better understand standards, please see the main page for [Standards](../).
{% endhint %}

## Available Standards

Explore CIPP's standards in an easy to digest format using [https://standards.cipp.app](https://standards.cipp.app/). (embedded below for your convenience). You can sort by various features, including when a standard was added to CIPP.

{% @cipp-external-webpage-block/cyberdrain url="https://standards.cipp.app/" fullWidth="true" %}

***

## Page Layout

### **Actions**

{% content-ref url="../template.md" %}
[template.md](../template.md)
{% endcontent-ref %}

### **Table Columns**

| Column           | Description                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Template Name    | The name you set when creating the template                                                                                                                                                                   |
| Tenant           | The tenant or tenants the standard is created for                                                                                                                                                             |
| Excluded Tenants | The tenant or tenants excluded from AllTenants standards                                                                                                                                                      |
| Run Manually     | A Boolean field indicating if the template is set to only be run manually. This displays as false (X in circle) if the template runs on the schedule and a true (✔️) if this template will only run manually. |
| Created At       | Relative time since the template was created                                                                                                                                                                  |
| Updated At       | Relative time since the template was updated                                                                                                                                                                  |
| GUID             | The GUID for the template                                                                                                                                                                                     |

### **Per-Row Actions**

| Action                                            | Description                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [View Tenant Report](../compare.md)               | This will open a CIPP created report that compares the standards template to the settings discovered for the tenant currently selected in the drop down |
| [Edit Template](../template.md)                   | Opens the template configuration page                                                                                                                   |
| Clone & Edit Template                             | Copies the existing template and lets you make changes before saving as a new template                                                                  |
| Run Template Now (Currently Selected Tenant only) | Runs the template on the tenant selected in the top menu bar                                                                                            |
| Run Template Now (All Tenants in Template)        | Runs the template for all configured tenants                                                                                                            |
| Delete Template                                   | Deletes the template                                                                                                                                    |

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
