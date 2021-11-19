<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Standards

The Standards page allows you to (re)set specific standards over your entire client base. The wizard allows you to select the most common settings and corrects them every 3 hours by default. If a user disables a setting it'll automatically be restored.

In the next version, we will be adding more standardized options and settings, we'll also allow you to send an alert to either your RMM system or e-mail. Below are the standards explained
## Enable the Unified Audit Log

Enables organisation customisation and the unified audit log for the tenant, allow you to use the logging engine Microsoft has. We have opted not to enable Mailbox logging as this is enabled default on all mailboxes now, and changing the settings is not recommended.
## Enable Security Defaults

Enables Microsoft's Security Defaults for Azure AD. For more info about Security Defaults, Check out Microsoft's blog [here](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/concept-fundamentals-security-defaults), Or CyberDrain's blog [here](https://www.cyberdrain.com/automating-with-powershell-enabling-secure-defaults-and-sd-explained/)

## Set mailbox Sent items Delegation

This makes sure that e-mails sent from shared mailboxes, or people with full-access, end up in the mailbox of the shared mailbox instead of the sender, allowing you to easily keep them together. 
## Require Admin Consent for Applications

This setting enables users to no longer add applications themselves, but instead have an admin approve the permissions. This prevents several oauth phishing attacks which have proven popular lately.

## Do not expire passwords

Does what it says on the tin.

## Enable usernames instead of pseudo aonoymised names in reports

Microsoft announced some of the APIs and reports will no longer contain names, to comply with legal requests by specific countries. This proves an issue for a lot of MSPs because those reports are required for engineers to monitor and react on. This changes that setting to allow to see usernames again.

## Enable Self service password reset

Does what it says on the tin. Requires users to register 2 formats to reset their password themselves without admin intervention.

## Enable Modern Authentication

Enables Modern Auth. Is already enabled if your tenant has been created after 2018.

## Disable Basic Authentication

Disables most forms of user basic authentication, allows smtp authentication as MS does not consider this a legacy protocol(yet)

## Disable Shared Mailbox AAD account

Shared mailboxes allow logon to them by users if the password is reset, this a security risk as you do not know who has this password. Microsoft's recommendation is disabling the user account.

## Enable auto expanding archives

Allows archives to expand.

## Enable per-user MFA for all users

Allows you to deploy per-user MFA for all the users in the tenant. Does not allow any exclusions. If you'd like to make exclusions, please use Conditional Access instead.
# Current known issues / Limitations

- These jobs run asynchronously every 3 hours per default, you can check the log for the current operation by looking for "Standards API"
- The job engine might slow down other APIs temporarily if it has a lot to process.(loads of settings, loads of tenants).