---
description: >-
  Whenever you push changes to the chosen branch, the Function App updates
  itself automatically using Run From Package.
---

# Run From Package Mode

{% hint style="warning" %}
**Note:** If you’re a sponsor using a hosted CIPP instance, you can skip this page—**Run From Package** is already set for you.
{% endhint %}

Most Azure Function Apps can be deployed using various methods, but **Run From Package** is a streamlined, read-only approach that pins your Function App’s code to a zip file. This method:

* Ensures consistent deployment (updates happen atomically when the package is replaced).
* Makes rollback and troubleshooting simpler.
* Often leads to faster cold starts since your code is pre-packaged and ready to go.

***

### 1. Verify “Run From Package” in Your Existing Deployment

If you used our **ARM template** from the [Installation](install.md) page, your Function App should already be in **Run From Package** mode, deploying from the `latest.zip` file. To confirm:

1. **Open Azure Portal** → Locate the **Function App** in your resource group.
2. Go to **Configuration** (or **Settings → Application Settings**, depending on portal version).
3. Look for an **Application Setting** named `WEBSITE_RUN_FROM_PACKAGE`.
   * It should be set to `1`.
   * If it is, great—your Function App is already running from a package zip.

***

### 2. (Optional) Connect to GitHub for Continuous Deployment

If you want your Function App to auto-update whenever you commit to your **CIPP-API** fork, follow these steps:

1. Still in the **Function App** settings, go to **Deployment Center**  (sometimes under **Deployment → Deployment Center**).
2. If an existing CI/CD connection is configured, **Disconnect** it to avoid conflicts.
3. Under **Source**, select **GitHub**, then log in if prompted.
4. **Choose** your Organization, Repository, and Branch (where your CIPP-API code lives).
5. Leave **“Workflow Option”** set to **“Add a workflow”** (the default).
6. For **Authentication Type**, pick **“Basic Authentication.”** (Azure portal doesn’t support Identity-based auth yet.)
7. Click **Add a workflow**, then **Save**.
8. Finally, **Restart** your Function App to ensure changes take effect.

***

### 3. Done!

Your Function App will now pull updates directly from your GitHub fork whenever you push commits to the selected branch. For day-to-day development, this means less manual deployment and faster iteration on your CIPP-API codebase.

If you run into any snags:

* **Check** the Azure Portal’s **Logs** under your Function App.
* **Review** your GitHub Actions logs for build/deployment errors.

That’s it! You’re now set up for streamlined, package-based deployments with automatic updates.
