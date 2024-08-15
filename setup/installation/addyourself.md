---
description: How to configure CIPP after you've completed installation.
---

# Post-Install Configuration

{% hint style="warning" %}
Hosted clients

If you choose to sponsor and use the CyberDrain hosted version, you can login to the backend management system at [**management.cipp.app**](https://management.cipp.app) to add and remove users.

Using the Management Portal you can click on 'Invite User' which will return the invite link to your directly. You must share this link with the user. This link is not e-mailed or sent to the user in any way.
{% endhint %}

At this point you should have completed all the steps in the installation guide and your deployment has succeeded. Any Red cross means your deployment has failed and you will need to delete the resource group and try deployment again.

you must now follow the rest of these steps to allow yourself to access CIPP, and finish setup.

### Add yourself as a user

* Go to the Azure Portal.
* Go to your CIPP Resource Group.
* Select your CIPP Static Web App `CIPP-SWA-XXXX`.
* Select **Role Management** (Not IAM Role Management).
* Select **invite user**.
* Enter the UPN for your user. This must match your M365 UPN.
* Add the `admin` role for your user.

After logging in successfully, you may move on to the next part of setup by clicking the button below.
