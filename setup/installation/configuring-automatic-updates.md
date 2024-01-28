# Configuring Automatic Updates

{% hint style="warning" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip this step.
{% endhint %}

If you would like CIPP to upgrade to the latest version fully automatic, you'll need to execute the following steps:

* Browse to [https://github.com/apps/pull](https://github.com/apps/pull) and click "Install"
* Select the repositories CIPP and CIPP-API
* go to your **CIPP** respository and browse to the folder .Github\Workflows.
* In this folder you'll find a file named  similar to "AZURE\_STATIC\_WEB\_APPS\_API\_TOKEN\_RANDOM\_WORD\_047D97703"
* Open this file and click the edit button, then remove the following lines of code from this file:

```yaml
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main
```

* Save the file. Commit this file directly to your repository.

At the next update you must approve the workflow to run. You do this by browsing to "Pull Requests" on your Github repositories. You will see a new PR. Click on the "Run Workflow" button and then "Merge". This allows Pull to from then on automatically update your instance.
