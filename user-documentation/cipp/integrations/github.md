# GitHub

This integration allows you to manage GitHub repositories from CIPP, including the Community Repositorities functionality. Requires a GitHub Personal Access Token (PAT) with a minimum of repo:public\_repo permissions. If you plan on saving your templates to GitHub or accessing private/internal repositories, you will need to grant the whole repo scope. You can create a PAT in your GitHub account settings, see the GitHub Token documentation for more info. If you do not enable the extension, a read-only API will be provided.

{% hint style="info" %}
CIPP has a built in token that will be able to provide you with read-only access to community repositories.
{% endhint %}

### Setting Up the GitHub Integration

{% stepper %}
{% step %}
### Create a GitHub Personal Access Token

See [GitHub's documentation](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) on how to create this and a description of the various access rights.

{% hint style="warning" %}
We do not recommend utilization of a fine-grained PAT. Given the differences in access rights scoping between the traditional PAT and the fine-grained PAT, unexpected issues will arise with the fine-grained PAT.
{% endhint %}
{% endstep %}

{% step %}
### Add the PAT to CIPP

Paste your GitHub PAT into the "GitHub Personal Access Token" box.
{% endstep %}

{% step %}
### Toggle On Integration

Flip the "Enable Integration" toggle to on.
{% endstep %}

{% step %}
### Save Integration Settings

Click the "Submit" button and wait for confirmation of settings updated
{% endstep %}

{% step %}
### Test the Integration

Verify that your PAT has been successfully configured by clicking the "Test" button and reviewing the response for success or any errors.
{% endstep %}
{% endstepper %}

### Actions

| Action              | Description                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 👁️ View Results    | Clicking this button will pop out a table showing you the results of the most recent connection attempt to GitHub |
| ⬇️ Download Results | Clicking this button will download the most recent connection attempt to GitHub in a CSV formatted file           |

***

{% include "../../../.gitbook/includes/feature-request.md" %}
