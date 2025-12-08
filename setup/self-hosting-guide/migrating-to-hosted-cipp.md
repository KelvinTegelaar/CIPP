# Migrating to Hosted CIPP

When you start a **CIPP sponsorship**, you can either:

* Continue self-hosting and receive support for that setup, **or**
* Use the **version hosted by CyberDrain** (fully managed).

If you decide to **migrate** from a self-hosted instance to our **hosted** environment, follow these steps:

***

### 1. Back Up Your Self-Hosted Instance

{% stepper %}
{% step %}
**Log In** to your **self-hosted** CIPP instance.
{% endstep %}

{% step %}
Go to **Application Settings** → click **Run Backup**.
{% endstep %}

{% step %}
**Download** the generated backup file.

* Store this file in a safe location (it contains all your CIPP config).
{% endstep %}
{% endstepper %}

***

### 2. Deploy Your Hosted Instance

{% stepper %}
{% step %}
**Go to** CIPP's [Management Portal](https://management.cipp.app/) and log in with the GitHub account you used to sponsor.

{% hint style="warning" %}
NOTE: If you sponsor with an organization GitHub account, please send in a message to helpdesk@cyberdrain.com with your personal GitHub username so that we can manually add that user to the portal. You cannot log in to the management portal with organization accounts.
{% endhint %}
{% endstep %}

{% step %}
**Deploy** your hosted CIPP instance by filling out the required information.
{% endstep %}

{% step %}
**Accept** the initial invite and log into the newly created hosted environment.
{% endstep %}
{% endstepper %}

***

### 3. Transfer Your Key Vault Secrets

{% stepper %}
{% step %}
Return to your **self-hosted** instance → **Application Settings** → **Backend**.
{% endstep %}

{% step %}
Click **Go to Keyvault**. Keep this tab open.
{% endstep %}

{% step %}
In your **hosted** instance, open the **SAM Setup Wizard**.
{% endstep %}

{% step %}
Select **“I have an existing application and would like to manually enter my tokens.”**
{% endstep %}

{% step %}
**Copy** each value from your self-hosted Key Vault (step 2) into the corresponding fields in your hosted environment.
{% endstep %}

{% step %}
Click **Next** to finish the wizard.
{% endstep %}
{% endstepper %}

***

### 4. Restore Your Backup

{% stepper %}
{% step %}
In your **hosted** CIPP instance, navigate to **Application Settings** → **Restore Backup**.
{% endstep %}

{% step %}
**Upload** the backup file you downloaded in Step 1.
{% endstep %}

{% step %}
Wait for the restore to complete—CIPP will import your original configuration and data.
{% endstep %}
{% endstepper %}

***

### 5. (Optional) Custom Domain Cleanup

* If you used a **custom domain** on your self-hosted instance, remove it there first so you can reuse it in the hosted environment.
* In the **Management Portal**, add your custom domain to the hosted CIPP instance following the on-screen instructions.

***

### That’s It!

Your instance and settings now live in the fully managed, **CyberDrain-hosted** version of CIPP.

Congratulations on a smooth migration! Enjoy your new, hosted CIPP with automatic updates and support.
