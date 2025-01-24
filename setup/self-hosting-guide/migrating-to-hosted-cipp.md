# Migrating to Hosted CIPP

When you start a **CIPP sponsorship**, you can either:

* Continue self-hosting and receive support for that setup, **or**
* Use the **version hosted by CyberDrain** (fully managed).

If you decide to **migrate** from a self-hosted instance to our **hosted** environment, follow these steps:

***

### 1. Back Up Your Self-Hosted Instance

1. **Log In** to your **self-hosted** CIPP instance.
2. Go to **Application Settings** → click **Run Backup**.
3. **Download** the generated backup file.
   * Store this file in a safe location (it contains all your CIPP config).

***

### 2. Deploy Your Hosted Instance

1. **Go to** CIPP's [Management Portal](https://chatgpt.com/c/6792ed35-a9b4-8009-a8af-7f23f4ebc621) and log in with the GitHub account you used to sponsor.
2. **Deploy** your hosted CIPP instance by filling out the required information.
3. **Accept** the initial invite and log into the newly created hosted environment.

***

### 3. Transfer Your Key Vault Secrets

1. Return to your **self-hosted** instance → **Application Settings** → **Backend**.
2. Click **Go to Keyvault**. Keep this tab open.
3. In your **hosted** instance, open the **SAM Setup Wizard**.
4. Select **“I have an existing application and would like to manually enter my tokens.”**
5. **Copy** each value from your self-hosted Key Vault (step 2) into the corresponding fields in your hosted environment.
6. Click **Next** to finish the wizard.

***

### 4. Restore Your Backup

1. In your **hosted** CIPP instance, navigate to **Application Settings** → **Restore Backup**.
2. **Upload** the backup file you downloaded in Step 1.
3. Wait for the restore to complete—CIPP will import your original configuration and data.

***

### 5. (Optional) Custom Domain Cleanup

* If you used a **custom domain** on your self-hosted instance, remove it there first so you can reuse it in the hosted environment.
* In the **Management Portal**, add your custom domain to the hosted CIPP instance following the on-screen instructions.

***

### That’s It!

Your instance and settings now live in the fully managed, **CyberDrain-hosted** version of CIPP.&#x20;

Congratulations on a smooth migration! Enjoy your new, hosted CIPP with automatic updates and support.
