---
description: View & Edit Quarantine Policies and Global settings
---

# Quarantine Policies

### **Action Buttons**

{% content-ref url="edit.md" %}
[edit.md](edit.md)
{% endcontent-ref %}

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

## **Global Quarantine Settings**

### **Table Details**

The properties returned are for the Exchange PowerShell command `Get-QuarantinePolicy -QuarantinePolicyType GlobalQuarantinePolicy`. For more information on the command please see the Microsoft documentation:

* [Get-QuarantinePolicy](https://learn.microsoft.com/en-us/powershell/module/exchange/get-quarantinepolicy?view=exchange-ps#example-3)

<table><thead><tr><th>Column</th><th>Description</th><th data-type="checkbox">More Info Available</th></tr></thead><tbody><tr><td>Notification Frequency</td><td>Shows the interval for quarantine notification to end users</td><td>false</td></tr><tr><td>Branding</td><td>Indicates if organization Branding is enabled. Company logo must be uploaded in the Admin center by following the instructions in <a href="https://go.microsoft.com/fwlink/?linkid=2139901">this documentation</a></td><td>false</td><tr><td>Custom Sender Address</td><td>Shows the sender address if set</td><td>false</td></tr><tr><td>Custom Language</td><td>Shows which languages are configured. Clicking more info shows Sender display name, Subject and Disclaimer for each language. Maximum 3 languages can be configured</td><td>true</td></tr></tbody></table>

***

## **Quarantine Policies**

### **Table Details**

The properties returned are for the Exchange PowerShell command `Get-QuarantinePolicy`. For more information on the command please see the Microsoft documentation:

* [Get-QuarantinePolicy](https://learn.microsoft.com/en-us/powershell/module/exchange/get-quarantinepolicy?view=exchange-ps)

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Policy</td><td>Edit the selected quarantine policy/policies</td><td>true</td></tr><tr><td>Delete Policy</td><td>Deletes the selected quarantine policy/policies</td><td>true</td><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.

