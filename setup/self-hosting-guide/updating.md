---
description: >-
  Keeping CIPP up-to-date ensures you have the latest features, security
  patches, and bug fixes.
---

# Updating Versions



{% hint style="warning" %}
**Note (Hosted / Sponsored Clients)**\
If you’re using a CyberDrain-hosted instance of CIPP, updates happen automatically—generally within **48 hours** of a new release. You can safely skip the rest of this page.
{% endhint %}

Update your self-hosted CIPP instance to the latest release using the following instructions:

{% hint style="info" %}
Note (Self-Hosted Clients Updating from v6 or earlier)

A few more steps are required to upgrade versions 6 to 7. See the [release notes](https://github.com/KelvinTegelaar/CIPP/releases/tag/v7.0.1) for v7.0.1 and **review the steps in** [**option 2**](updating.md#id-2.-special-case-upgrading-from-v6-or-older-to-v7) **below for how to successfully update in these scenarios.**
{% endhint %}

***

## 1. Sync Your Fork(s) in GitHub

For **typical** updates (e.g., moving from any v7+ patch releases):

{% stepper %}
{% step %}
**Open Your CIPP Fork**

* Go to your fork of the **CIPP** repo on GitHub.
* Click **Sync fork** (or sometimes **Fetch upstream**).
* Choose **Update branch**—be careful **not to discard any commits**.

{% hint style="danger" %}
**IMPORTANT**: If prompted with a question asking "Do you want to Discard (X) Commits" or "Update Branch", ensure you click on "Update Branch" AND **DO NOT PRESS DISCARD**
{% endhint %}
{% endstep %}

{% step %}
**Repeat for CIPP-API**

* Do the same steps in your **CIPP-API** fork so both the front-end and API stay in sync.
{% endstep %}

{% step %}
**Wait for Deployment**

* If you’ve connected your Azure Function App to **GitHub Actions** (Run From Package mode), the updates should roll out automatically within about 30 minutes.
* Check your **Azure Logs** or **GitHub Actions** to confirm a successful deployment
{% endstep %}

{% step %}
**Clear Browser Cache**

* If you see an older version in your browser, try a **Hard Refresh**: open DevTools (F12), then right-click the refresh icon beside the URL bar and select **Hard reload and empty cache.**
{% endstep %}
{% endstepper %}

***

## 2. Updating from v6 (or Older) to v7+

The v7 front-end introduced a **Next.js** + **Material-UI** stack, so older forks might need an extra step:



{% stepper %}
{% step %}
**Check Your Workflow File(s)**

*   In your CIPP repo, open:

    ```
    .github/workflows
    ```
* Look for filenames starting with **azure-static-web-apps** (e.g., `azure-static-web-apps-main.yml`).
* **Important**: If you discarded commits previously, you might not see such a file at all—or it might be renamed.
{% endstep %}

{% step %}
**Set the `output_location` to `"/out"`** (If Missing)

*   In older v7 instructions, we had to manually change:

    ```yaml
    output_location: "" 
    ```

    to:

    ```yaml
    output_location: "/out"
    ```
* **However**, newer versions of the workflow may already include `"/out"`. Double-check your file before making changes.
{% endstep %}

{% step %}
**Commit and Redeploy**

* After editing, commit directly to your main branch.
* A GitHub Actions run should trigger automatically, building and redeploying the Static Web App.
{% endstep %}

{% step %}
**Wait & Verify**

* Give Azure a few minutes to pick up changes. Check the **Actions** tab or the **Azure Logs** for success.
* Clear your cache or try a different browser to confirm the new version is live.
{% endstep %}
{% endstepper %}

***

## “I Accidentally Discarded Changes” (The Common GitHub Pitfall)

If you accidentally chose **Discard (X) Commits** while syncing your fork, you might have lost the original **azure-static-web-apps** workflow file. This often leads to:

* “No changes to commit” messages,
* A stuck or outdated front-end version,
* Confusion about missing `.yml` files.

### Recreate the Workflow File

{% stepper %}
{% step %}
**Check Repository Secrets**

* In your **CIPP** fork, go to **Settings** → **Secrets and variables** → **Actions**.
* Note the name of your Azure Static Web Apps deployment token (e.g., `AZURE_STATIC_WEB_APPS_API_TOKEN_SOMENAME_12345`).
{% endstep %}

{% step %}
**Create a New `.yml` in `.github/workflows`**

* The filename can be anything (`azure-static-web-apps-fix.yml`, `deploy.yml`, etc.)—just make sure it ends in `.yml`.
* [Use an example from the main repo](https://github.com/KelvinTegelaar/CIPP/blob/main/.github/workflows/azure-static-web-apps-main.yml) if you need a reference.
{% endstep %}

{% step %}
**Update References to Your Secrets**

* In that new file, look for lines referencing the token (e.g., `AZURE_STATIC_WEB_APPS_API_TOKEN_...`).
* Replace them with **your** token name from Step 1.
{% endstep %}

{% step %}
**(Optional) Output Location**

* If you’re on v7 or higher and see a line like `output_location: ""`, change it to `"/out"`.
{% endstep %}

{% step %}
**Commit**

* Once you commit, GitHub Actions should fire off a new build if the `on:` triggers are present (typically `push` or `pull_request`).
* Check the **Actions** tab to see if it’s running.
{% endstep %}

{% step %}
**Confirm Deployment**

* After the workflow succeeds, your Static Web App should serve the updated version.
* If you still see the old UI, do a **Hard Refresh** (Open DevTools, then Right Click Refresh Button) or wait up to 30 minutes for Azure’s distribution/CDN to update.
{% endstep %}
{% endstepper %}

## Done & Dusted

At this point, your **CIPP** front-end and API should be updated to the latest release. Keep these key points in mind:

1. **Never click “Discard Commits”** when syncing.
2. **Watch for** the `.github/workflows` files if you suspect deployment issues.
3. **Hard-refresh** or wait for CDN caches to clear for a truly up-to-date view

Congratulations! You’re now up-to-date and ready to use the newest features.
