# List Standards Templates

{% hint style="warning" %}
**Understanding Standards**

This page is a reference to the features of the Standards Templates page in CIPP. To better understand standards, please see the main page for [Standards](./).
{% endhint %}

## Available Standards

Explore CIPP's standards in an easy to digest format using [https://standards.cipp.app](https://standards.cipp.app/). (embedded below for your convenience). You can sort by various features, including when a standard was added to CIPP.

{% @cipp-external-webpage-block/cyberdrain url="https://standards.cipp.app/" fullWidth="true" %}

***

## Page Layout

### **Action Buttons**

{% content-ref url="template.md" %}
[template.md](template.md)
{% endcontent-ref %}

### **Table Details**

| Column           | Description                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Template Name    | The name you set when creating the template                                                                                                                                                                   |
| Tenant           | The tenant or tenants the standard is created for                                                                                                                                                             |
| Excluded Tenants | The tenant or tenants excluded from AllTenants standards                                                                                                                                                      |
| Run Manually     | A Boolean field indicating if the template is set to only be run manually. This displays as false (X in circle) if the template runs on the schedule and a true (✔️) if this template will only run manually. |
| Created At       | Relative time since the template was created                                                                                                                                                                  |
| Updated At       | Relative time since the template was updated                                                                                                                                                                  |
| GUID             | The GUID for the template                                                                                                                                                                                     |

### **Table Actions**

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td><a href="compare.md">View Tenant Report</a></td><td>This will open a CIPP created report that compares the standards template to the settings discovered for the tenant currently selected in the drop down</td><td>false</td></tr><tr><td><a href="template.md">Edit Template</a></td><td>Opens the template configuration page</td><td>false</td></tr><tr><td>Clone &#x26; Edit Template</td><td>Copies the existing template and lets you make changes before saving as a new template</td><td>false</td></tr><tr><td>Run Template Now (Currently Selected Tenant only)</td><td>Runs the template on the tenant selected in the top menu bar</td><td>true</td></tr><tr><td>Run Template Now (All Tenants in Template)</td><td>Runs the template for all configured tenants</td><td>true</td></tr><tr><td>Save to GitHub</td><td>Saves the selected template(s) to your selected GitHub repository</td><td>true</td></tr><tr><td>Delete Template</td><td>Deletes the template</td><td>true</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
