---
description: >-
  Whenever you push changes to the chosen branch, the Function App updates
  itself automatically if you follow this guide.
---

# Setup automatic API updates

{% hint style="warning" %}
**Note:** If you’re a sponsor using a hosted CIPP instance, you can skip this page—**This is already setup for you.**
{% endhint %}

### Connect to GitHub for Continuous Deployment

If you want your Function App to auto-update whenever you commit to your **CIPP-API** fork, follow these steps:

{% stepper %}
{% step %}
Still in the **Function App** settings, go to **Deployment Center** (sometimes under **Deployment → Deployment Center**).
{% endstep %}

{% step %}
If an existing CI/CD connection is configured, **Disconnect** it to avoid conflicts.
{% endstep %}

{% step %}
Under **Source**, select **GitHub**, then log in if prompted.
{% endstep %}

{% step %}
**Choose** your Organization, Repository, and Branch (where your CIPP - $${\color{red}API}$$ code lives).
{% endstep %}

{% step %}
Leave **“Workflow Option”** set to **“Add a workflow”** (the default).
{% endstep %}

{% step %}
For **Authentication Type**, pick **“Basic Authentication.”** (Azure portal doesn’t support Identity-based auth yet.)
{% endstep %}

{% step %}
Click **Add a workflow**, then **Save.**
{% endstep %}

{% step %}
Repeat this for any additional function apps you may have deployed for [function offloading](../../user-documentation/cipp/advanced/super-admin/function-offloading.md).
{% endstep %}
{% endstepper %}

Your Function App will now be automatically updated pull directly from your GitHub fork whenever you pull the latest version of the CIPP-API repository.
