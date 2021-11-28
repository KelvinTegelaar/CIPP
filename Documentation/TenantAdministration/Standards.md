The Standards page allows you to (re)set specific standards over your entire client base. The wizard allows you to select the most common settings and corrects them every 3 hours by default. If a user disables a setting it'll automatically be restored.

In the next version, we will be adding more standardized options and settings, we'll also allow you to send an alert to either your RMM system or e-mail. Below are the standards explained

## Meet the Standards

| Standard | Impact | Description |
|----------|--------|-------------|
| Enable Unified Audit Log | Low | Enables organisation customisation and the unified audit log for the tenant, allow you to use the logging engine Microsoft has. We have opted not to enable Mailbox logging as this is enabled default on all mailboxes now, and changing the settings is not recommended.|
| Enable Security Defaults | Medium/High | Enables Microsoft's Security Defaults for Azure AD. For more info about Security Defaults, Check out Microsoft's blog [here](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/concept-fundamentals-security-defaults), Or CyberDrain's blog [here](https://www.cyberdrain.com/automating-with-powershell-enabling-secure-defaults-and-sd-explained/)|
| Set mailbox Sent items Delegation | Low | This makes sure that e-mails sent from shared mailboxes, or people with full-access, end up in the mailbox of the shared mailbox instead of the sender, allowing you to easily keep them together. |
| Require Admin Consent for Applications | Medium |This setting enables users to no longer add applications themselves, but instead have an admin approve the permissions. This prevents several oauth phishing attacks which have proven popular lately.|
|Do not expire passwords|Low|Sets passwords to never expire for tenant, recommended to use in conjunction with secure passwords.|
|Enable usernames instead of pseudo aonoymised names in reports|Low|Microsoft announced some of the APIs and reports will no longer contain names, to comply with legal requests by specific countries. This proves an issue for a lot of MSPs because those reports are required for engineers to monitor and react on. This changes that setting to allow to see usernames again.|
|Enable Self service password reset|Medium|Enables Self Service password Reset for *All Users*. Communication is important as it will Requires users to register 2 authentication methods if they have not already.|
|Enable Modern Authentication|Low|Enables Modern Authentication. If your tenant is newer then 2018 this should already be enabled.|
|Disable Basic Authentication|High|Disables most forms of user basic authentication, allows smtp authentication as MS does not consider this a legacy protocol(yet). It's important to review Sign-ins reports to identify impact for each customer. It will cut off any connection and block future connections using legacy authentication, or which do not support modern authentication.|
|Disable Shared Mailbox AAD account|Medium|Shared mailboxes allow logon to them by users if the password is reset, this a security risk as you do not know who has this password. Microsoft's recommendation is disabling the user account. Would be a good idea to review Sign-ins to establish impact.|
|Enable auto expanding archives|Medium/High|Enables auto-expanding archiving for Archive Mailboxes. Note: Has impacts on inactive mailboxes and recovering deleted mailboxes and once enabled cannot be disabled after. [Microsoft Documents](https://docs.microsoft.com/en-gb/microsoft-365/compliance/enable-autoexpanding-archiving?view=o365-worldwide#before-you-enable-auto-expanding-archiving).|
|Enable Spoofing warnings for Outlook|Low|Adds external tags/indentifers to email messages In outlook. [See Bleeping Computer Article](https://www.bleepingcomputer.com/news/microsoft/microsoft-365-adds-external-email-tags-for-increased-security/amp/)| 
|Enable per-user MFA for all users|Medium/High|Allows you to deploy per-user MFA for all the users in the tenant. Does not allow any exclusions. If you'd like to make exclusions, please use Conditional Access instead.|

### Impact Levels

* **Low Impact** - Changes which have no user-facing impact or minimal impact.
* **Medium Impact** - Changes which have a user impact that can be managed with a little communication.
* **High Impact** - Changes which should be carefully thought through and ideally managed with customers - may have significant impacts on how users interact with Microsoft 365.

## Current known issues / Limitations

- These jobs run asynchronously every 3 hours per default, you can check the log for the current operation by looking for "Standards API"
- The job engine might slow down other APIs temporarily if it has a lot to process.(loads of settings, loads of tenants).
