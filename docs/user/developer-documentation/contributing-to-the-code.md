# Contributing to the Code

Contributions to CIPP are welcome by everyone. There's a couple of things to keep in mind:

* Speed and Security are two of the fundamental pillars of CIPP, if it isn't fast, it isn't good and, if it isn't secure, it's not getting merged.
* We try to use native APIs over PowerShell Modules. PowerShell modules tend to slow the entire processing. We currently only have `Az.Keyvault` and `Az.Accounts` loaded and prefer to keep it that way.
* You should understand the structure and technologies used in the CIPP and CIPP-API repositories.
* Avoid adding your deploy workflow file to your development branch. They cause annoyance when they appear in PRs. If you want to both deploy and develop it's probably better to create two instances of the repository.

When contributing, or planning to contribute, please create an issue [on GitHub](https://github.com/KelvinTegelaar/CIPP/issues).

* If you are fixing a bug, file a complete bug report and assign it to yourself. You can do this by commenting "I would like to work on this please" on the issue.
* If you are adding a feature, please add "Feature Request" to the title and assign it to yourself. You can do this by commenting "I would like to work on this please" on the issue.

{% hint style="info" %}
Assigning Yourself an Issue You can assign yourself an issue on GitHub by creating a comment that says `I would like to work on this please!`. You must enter that text verbatim!&#x20;
{% endhint %}

### Pull Requests

We don't accept PRs or commits to `main`. The branch `main` is always the current release version. Both CIPP and CIPP-API have at least two branches `dev` and `main` or `master`. Please make any PR to `dev`, when `dev` gets promoted to a release the maintainers PR changes in `dev` into `main`.

### Function Naming Standards

We follow a naming standard, as based on the name a user might get access to an API or not. The current naming standard is as follows:

* ListBla - Everything that generates a list (users)
* EditBla - Anything that edits an existing object (edit user)
* AddBla - Anything that adds an object (add user)
* RemoveBla - Anything that deletes or removes an object (remove user)
* ExecBla - Anything that executes an action (send MFA request to user)

### Creating two instances

* Make a clone of your forked repository.
* Optional: mark this repository as private.
* Add the following GitHub action, this synchronises the repositories every hour:

```yaml
name: Pull from master schedule
on:
  schedule:
    - cron:  '0 * * * *'
jobs:
  repo-sync:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        persist-credentials: false
    - name: repo-sync
      uses: repo-sync/github-sync@v2
      with:
        source_repo: "KelvinTegelaar/CIPP"
        source_branch: "master"
        destination_branch: "master"
        github_token: ${{ secrets.PAT }}
```

* Go to settings of the repository.
* Select add secret.
* Name the secret "PAT"
* Enter the value: a self created [personal access token](https://github.com/settings/tokens).
