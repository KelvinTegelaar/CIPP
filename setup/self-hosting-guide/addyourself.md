---
description: How to configure CIPP after you've completed installation.
---

# Post-Install Configuration

{% hint style="warning" %}
**For Hosted Clients**

If you’re using a **CyberDrain hosted instance of CIPP:**

1. **Log in** at [management.cipp.app](https://management.cipp.app/) to manage users.
2. From the **Management Portal**, click **Invite User**, and assign the first user the "superadmin" role.

**NOTE:** Clicking on Invite User will return the invite link to you directly. You must share this link with the user. **It is not e-mailed or sent to the user in any way.**
{% endhint %}

Once your **CIPP** installation completes successfully, follow the steps below to finalize access and roles.

> **Tip:** If you see a red “X” in your deployment status, the install failed. **Delete the resource group** in the Azure Portal and redeploy.

### For Self-Hosted Deployments

### Add Yourself as an Admin

{% stepper %}
{% step %}
**Open the Azure Portal** and locate your **CIPP Resource Group**.
{% endstep %}

{% step %}
Find the **CIPP Static Web App** (e.g., **CIPP-SWA-XXXX**).
{% endstep %}

{% step %}
Click **Role Management** (not IAM Role Management).
{% endstep %}

{% step %}
Select **Invite User**.
{% endstep %}

{% step %}
In the “UPN” field, enter the **Microsoft 365 UPN** (user principal name) of the person you want to add (likely yourself upfront).
{% endstep %}

{% step %}
Assign the **superadmin** role.
{% endstep %}

{% step %}
Save your changes.
{% endstep %}
{% endstepper %}

### Test Your Access

{% stepper %}
{% step %}
**Go to** the URL for your Static Web App (SWA).
{% endstep %}

{% step %}
Log in with the **same UPN** you just added.
{% endstep %}

{% step %}
If successful, you’ll have admin privileges within CIPP.
{% endstep %}
{% endstepper %}

***

### Next Steps

With user access established, you can:

* **Invite other team members** or clients (using the same Role Management process or the [management portal](https://management.cipp.app) for hosted users.).
* **Configure** advanced settings (e.g., custom domains, environment variables, or additional roles).
