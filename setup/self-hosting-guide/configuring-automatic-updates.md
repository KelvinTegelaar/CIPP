# Configuring Automatic Updates

{% hint style="warning" %}
If you’re using the **CyberDrain-hosted** version of CIPP, you can skip this page—updates happen automatically for you.
{% endhint %}

### Overview

Enabling **automatic updates** means that each time CIPP releases a new version, a pull request (PR) is created in your GitHub repository. You simply approve and merge this PR to get the newest changes, no manual forking or syncing required.

### 1. Install the “Pull” GitHub App



{% stepper %}
{% step %}
**Go to** [https://github.com/apps/pull](https://github.com/apps/pull).
{% endstep %}

{% step %}
Click **Install** (or **Configure**, if you’ve used Pull before).
{% endstep %}

{% step %}
**Select** your **CIPP** and **CIPP-API** repositories from the list.
{% endstep %}
{% endstepper %}

### 2. Remove `pull_request` Triggers in Your Existing Workflow

To avoid conflicts, you’ll remove the lines that automatically trigger GitHub Actions on pull requests in your **azure-static-web-apps** workflow file:

{% stepper %}
{% step %}
**Open** your CIPP repository in GitHub.
{% endstep %}

{% step %}
**Navigate** to the folder:

```
.github/workflows
```
{% endstep %}

{% step %}
**Find** the file named something like `azure-static-web-apps-xyz.yml` (the name includes your deployment token and some random words).
{% endstep %}

{% step %}
**Edit** the file (click the pencil icon).
{% endstep %}

{% step %}
**Remove** the following lines (or comment them out):

```yaml
pull_request:
  types: [opened, synchronize, reopened, closed]
  branches:
    - main
```
{% endstep %}

{% step %}
**Commit** these changes directly to your repository’s main branch.
{% endstep %}
{% endstepper %}

> **Why Remove These Lines?**\
> They trigger the workflow whenever a PR is opened or updated—this can cause conflicts once Pull starts handling your updates, because you’ll end up with dueling triggers.

### 3. Approve Your First Automatic Update

When a new version of CIPP is released:

{% stepper %}
{% step %}
**Open** your CIPP repository on GitHub.
{% endstep %}

{% step %}
**Check** the **Pull Requests** tab. You’ll see a new PR created by the Pull app.
{% endstep %}

{% step %}
**Review** the changes.
{% endstep %}

{% step %}
**Click** **Merge** (or **Run Workflow**, if asked) to accept the update.
{% endstep %}
{% endstepper %}

That’s it! Your repository will now stay in sync with the latest CIPP releases by simply merging new pull requests from the Pull app.

***

### Common Questions

**Q: Do I need to remove `pull_request` triggers in both CIPP and CIPP-API repos?**\
A: Yes—if both repos have `pull_request` triggers in their `.yml` workflow files, remove them in each to avoid conflicts.

**Q: What if I accidentally discard the Pull app’s PR?**\
A: You can always open the “Closed” Pull Requests and revert that action, or let Pull create a new one. Just make sure you haven’t re-added the `pull_request` lines.

**Q: Will my Azure deployment automatically pick up changes after I merge the PR?**\
A: Yes—assuming your GitHub Actions workflow triggers on `push` to `main`, the Static Web App and Function App will redeploy within \~30 minutes.

**Q: Do I still need to click “Sync Fork”?**\
A: No—once Pull is set up, you won’t need to manually sync. The Pull app auto-creates a PR whenever upstream changes are detected.

***

### You’re All Set!

With Pull handling your repository’s updates, your **self-hosted CIPP** instance will stay current with minimal effort. Just watch for those PR notifications, merge them, and enjoy the latest features!
