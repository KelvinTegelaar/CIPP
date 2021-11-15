<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Best Practice Analyser

The Best Practice Analyser is a series of checks that run against all of your 365 tenants. The Best Practice concept of this has been wideless discussed with numerous MSPs. Most of these Best Practices have been derived from the standards portion of CIPP. The Best Practice Analyser is entirely read only. It will not make any changes to your tenants.
## Current known issues / Limitations

The final plan will be to have the data refresh once a day. With version 1.2.0 you will need to refresh the data manually.
## How do I get started?

In the left hand menu, navigate to **Tenant Administration > Standards > Best Practice Analyser**. If this is your first ever run you may see an error initially because there is no data; this is expected.
## How do I refresh or generate the data?

At the top of the page there is button called **Force Refresh All Data**. You only need to click this once.

---

# Interpreting Results
The reporting here generally follows a standard colour theming.
Red is bad and generally not something that should be happening on your tenant.
Orange is either a warning or subjective. It does not necessarily indicate something is wrong.
Green means there are no issues or the setting is set in a manner that is generally agreed as Best Practice.

## Unified Audit Log Enabled
This Best Practice checks that on your tenants that the Unified Audit Log is enabled. This is 365's major log and contains user, group, application, domain and directory activities. This absolutely should be enabled.

## Security Defaults Enabled
This Best Practice is a check to see if Security Defaults are enabled. Security Defaults are preconfigured security settings that apply against your tenant that ensure things like MFA is enabled, legacy authentication protocols are blocked etc. The enabling of this is subjective, which is why it being turned off denotes an orange warning.

## Message Copy for Sent As
This is a clickable button which will show you individual accounts where this is not enabled. This refers to the Automatic saving of sent items in delegators mailbox. Mailboxes in Microsoft 365 or Office 365 can be set up so that someone (such as an executive assistant) can access the mailbox of another person (such as a manager) and send mail as them. These people are often called the delegate and the delegator, respectively. We'll call them "assistant" and "manager" for simplicity's sake. When an assistant is granted access to a manager's mailbox, it's called delegated access. People often set up delegated access and send permissions to allow an assistant to manage a manager's calendar where they need to send and respond to meeting requests. By default, when an assistant sends mail as, or on behalf of, a manager, the sent message is stored in the assistant's Sent Items folder and not in the Managers. It is possible to set it so that the Manager gets it put in to their sent items too. This Best Practice is checking that these settings are enabled for people who has Send As and Send on Behalf. The enabling of this is subjective, which is why when it's off it denotes an orange warning.

## User Cannot Consent to Apps
This Best Practice checks whether users can give consent to apps that use OpenID Connect and OAuth 2.0 for sign-in and requests to access data. An app can be created from within your own organization, or it can come from another Office 365 organization or a third-party. It is a well known best practice that users **SHOULD NOT** be able to give consent to apps. If this setting is on, this denotes a red warning. This is a security risk you should mitigate.

## Passwords do not Expire
This setting is checking whether the tenant has set passwords to expire or not. It is general best practice now that passwords **SHOULD NOT** expire. If Password Expiry is on, this will generate a red alert.

## Privacy in Reports Enabled
A number of the reports that pre-generate in Microsoft 365 have personally identifiable information (like a users name). This makes reporting very difficult. We believe this is better disabled to enable for more accurate reporting, which brings security benefits on its own. This however is subjective, so if Privacy in Reports is Enabled, you will receive an orange warning.

## Self Service Password Reset Enabled
This is an organisational setting that when enabled allows users to reset their own passwords through a forgot your password type identification. There are three possible results here. Self Service Password Reset is Off all Users, On all User, On Specific Users. The enabling of this is subjective so when this is not enabled you will receive an orange warning.

## Modern Auth Enabled
Modern authentication is a core security component of 365 and allows for authentication features like MFA, smart cards, third-party SAML providers etc. This should absolutely be enabled, and when it isn't you will be presented with a red error.

## Shared Mailboxes Logins Disabled
This is a clickable button, which will show a modal popup with the accounts that are meeting this criteria. This is a check to see if you have shared mailboxes attached to a valid account that can still login. Shared mailboxes in nearly all cases should not have a login account attached to it. We see this mostly when a user leaves a business, they are converted from a paid license to a free shared mailbox, and the license is removed. This still leaves an active account linked to the shared mailbox, even if the password has been changed this increases risk unnecessarily. Where you have any of these accounts, the result is red.

## Unused Licenses
This is a clickable button which will show you where you have unused licenses. This goes through all the licenses that are assigned in every tenant and compares the purchased number with the number consumed. Where there is a difference in this number this is normally because you have licenses that you are paying for, but are not being used. We are whitelisting common licenses that don't matter, for example unassigned free licenses or trials. If you have any SKUs you wish us to whitelist from this check please raise an enhancement request in Github.

# I am having Problems
Please ensure that you have given adequate time for the Best Practice Analyser to run. In an environment with 100 tenants this takes on average 15 minutes. Please ensure that your permissions are correct by going in to **CIPP Settings > Configuration Settings > Run Permission Check**. Make sure your CIPP-API and CIPP modules are both fully up-to-date. There is extensive logging in the log file in the root of the CIPP-API Function App.

# I have something to add or an idea for Best Practices
Excellent! Please add them to the Github Issues as a feature request



