# Frequently Asked Questions

<details>
<summary>Why can't I install CIPP using the "Deploy to Azure" button?</summary>

If you're experiencing issues with installation please report these in `#cipp-issues` on the [CIPP Discord](https://discord.gg/cyberdrain)

</details>

<details>
<summary>Why can't I get details for a particular tenant / any tenants?</summary>

1. If you have a guest account in a tenant that has the same UPN as    you used to generate your tokens - you will experience issues.
1. Conditional access may block the correct functioning of the tokens - check your CA policies and also make sure you're not geo-blocking the function app's location.
1. You cannot use third party MFA on the account used to generate SAM tokens.

If your entire tenant list does not load, there is a big chance there is something wrong with your token configuration. Check the [troubleshooting](/troubleshooting) page for more information.
</details>

<details>
<summary>I'm trying to redeploy or move my CIPP installation and it's not working. Something about a GitHub token.</summary>

If you installed CIPP prior to the release of version 2, you will have deployed the `master` branch of your CIPP repository fork. Since version 2 if you want to redeploy using the [click to deploy installation](/docs/user/gettingstarted/installation) you will need to [rename the `master` branch to `main`](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch) and then redeploy.

</details>
