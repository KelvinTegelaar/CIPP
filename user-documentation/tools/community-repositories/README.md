---
description: Connect to GitHub community repositories for easy template creation!
---

# Community Repositories

Extending the functionality of selecting a tenant as a template library, CIPP is also now able to connect to GitHub to seamlessly import templates shared by the MSP community.

{% hint style="info" %}
This page is powered by the GitHub integration. CIPP will be able to populate some of this information, even if you don't set up your own Personal Access Token on the integration page. See the GitHub integration page for more.
{% endhint %}

### Actions

| Action            | Description                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Find a Repository | Opens a modal to allow you to locate additional community GitHub repositories to add to your list. You can search by GitHub user or organization or enter a repository in "owner/repo" format. |
| Create Repository | Opens a modal to allow you to create a new GitHub repository. Requires you to use your own Personal Access Token on the GitHub integration.                                                    |

### Table Rows

| Row                         | Description                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Name                        | The name of the GitHub repo                                                                           |
| Owner                       | The owner (user or org) of the GitHub repor                                                           |
| URL                         | A URL with a copy button to take you directly to the repo in GitHub                                   |
| Visibility                  | Public or Private                                                                                     |
| Write Access                | A Boolean field indicating if CIPP has write access to the repo.                                      |
| Upload Branch               | Indicates which branch of the repo is being used for the template library                             |
| Id                          | The GitHub ID of the repo                                                                             |
| Description                 | The description set on the repo in GitHub                                                             |
| Full Name                   | The full name of the GitHub repo in "owner/repo" format                                               |
| Default Branch              | The default branch name for the repo                                                                  |
| Repo Permissions - Admin    | A Boolean field that indicates if the GitHub integration has been granted admin rights to the repo    |
| Repo Permissions - Maintain | A Boolean field that indicates if the GitHub integration has been granted maintain rights to the repo |
| Repo Permissions - Push     | A Boolean field that indicates if the GitHub integration has been granted push rights to the repo     |
| Repo Permissions - Triage   | A Boolean field that indicates if the GitHub integration has been granted triage rights to the repo   |
| Repo Permissions - Pull     | A Boolean field that indicates if the GitHub integration has been granted pull rights to the repo     |

### Per-Row Actions

| Action            | Description                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| View Templates    | Opens a new page where you can see the templates contained in the repo                                                                          |
| Delete            | Deletes the repo from your list of available community repositories. NOTE: Does not delete the repo in GitHub if this is a private repo you own |
| Set Upload Branch | For repositories that you own, this will set the branch that you upload templates to                                                            |

***

{% include "../../../.gitbook/includes/feature-request.md" %}
