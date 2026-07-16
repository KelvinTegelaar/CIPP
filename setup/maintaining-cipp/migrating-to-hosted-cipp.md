# Migrating to Hosted CIPP

When you start a **CIPP sponsorship**, you can either:

* Continue self-hosting and receive support for that setup, **or**
* Use the **version hosted by CyberDrain** (fully managed).

If you decide to **migrate** from a self-hosted instance to our **hosted** environment, follow these steps:

***

### 1. Back Up Your Self-Hosted Instance

{% hint style="warning" %}
NOTE: Please ensure your function app is set to run on PowerShell 7.4, otherwise the backups may be corrupted.
{% endhint %}

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

The CIPP Key Vault holds four secrets you'll need to enter into the hosted setup wizard:

{% stepper %}
{% step %}
Return to your **self-hosted** instance → **Application Settings** → **Backend**.
{% endstep %}

{% step %}
Click **Go to Keyvault**. This opens the Azure portal on your Key Vault's **Overview** blade. Keep this tab open.
{% endstep %}

{% step %}
**Grant yourself permission to read the secrets.**

By default, even the user who deployed CIPP does not have data plane access to the secret values; only management plane access to the vault itself. Add yourself under **Access policies** — not under **Access control (IAM)**.

1. In the Key Vault's left navigation, click **Access policies**.
2. Click **+ Create**.
3. On the **Permissions** tab, under **Secret permissions**, tick: **List**, **Get**, **Set**, **Delete**, **Recover**, **Backup**, and **Restore**. Leave Key and Certificate permissions unticked. Click **Next**.
4. On the **Principal** tab, search for your own account, select it, then click **Next**.
5. Skip the **Application** tab by clicking **Next**.
6. On the **Review + create** tab, click **Create**.

{% hint style="info" %}
If **Access policies** is missing from the left navigation, your Key Vault is using the Azure RBAC permission model rather than the vault access policy model. Switch it under **Settings** → **Access configuration**, or grant yourself the **Key Vault Secrets Officer** role under **Access control (IAM)** instead.
{% endhint %}

{% hint style="info" %}
The policy usually takes effect within 30–60 seconds. If you get a "Caller is not authorized" error in the next step, wait a moment and refresh.
{% endhint %}
{% endstep %}

{% step %}
**Open the secrets list.**

In the Key Vault's left navigation, expand **Objects** and click **Secrets**. You should see the four secrets listed above.
{% endstep %}

{% step %}
**Reveal and copy each secret value.**

For each of the four secrets:

1. Click the secret name (e.g. `ApplicationID`).
2. Click the row for the **current version** (the GUID shown under "Current Version").
3. At the bottom of the version page, click **Show Secret Value**.
4. Click the **copy** icon to the right of the revealed value.
5. Switch to your hosted CIPP tab and paste the value into the matching field in the setup wizard (see the table at the top of this section).
6. Use the browser back button twice to return to the secrets list, and repeat for the next secret.

{% hint style="warning" %}
Treat these values like passwords. The Application Secret and Refresh Token together grant unattended access to every customer tenant connected through your CIPP-SAM application. Don't paste them into anything other than the hosted setup wizard.
{% endhint %}
{% endstep %}

{% step %}
In your **hosted** instance, open the CIPP **Setup Wizard** (if you haven't already) and select **"I have an existing application and would like to manually enter my tokens."**
{% endstep %}

{% step %}
Confirm all four fields are populated, then click \*\*Next\*\* to finish the wizard.
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

### 6. (Optional) Function Offloading

If you previously had offloading enabled in your Self-Hosted environment, you likely copied this setting over to hosted during the restore step. If this has occurred, you will notice that certain background tasks will not run until you take action.  You have a couple options for how to handle this:

* **(Recommended)** Submit a ticket to request offloading in your new hosted environment. This is the best option for performance.
* Disable offloading in CIPP > Advanced > Super Admin > Function Offloading

***

### That’s It!

Your instance and settings now live in the fully managed, **CyberDrain-hosted** version of CIPP.

Congratulations on a smooth migration! Enjoy your new, hosted CIPP with automatic updates and support.
