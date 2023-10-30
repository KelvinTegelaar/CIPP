---
description: Manage Autopilot profiles across your Microsoft 365 tenants.
---

# Add Profile

The following two pages in CIPP give you the ability to manage Autopilot Profiles:

### Add Profile

This page provides the ability for you to add Autopilot profiles, Autopilot deployment profiles are groups of settings you can deploy to devices. You can create various profile types with this Wizard.

#### Details <a href="#addprofile-details" id="addprofile-details"></a>

* Display Name
* Description
* Unique Name Template
* Convert all Targeted Devices to Autopilot
* Assign to all Devices
* Self-Deploying Mode
* Hide Terms and Conditions
* Hide Privacy Settings
* Hide Change Account Options
* Setup User as Standard User (Leave unchecked to setup user as a local administrator)
* White Glove OOBE
* Automatically Configure Keyboard

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddPolicy" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
