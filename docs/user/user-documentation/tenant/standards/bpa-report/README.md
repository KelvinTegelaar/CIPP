---
description: Audit your tenant against best practices.
---

# Best Practice Analyser

The Best Practice Analyser is a series of checks that run on all your 365 tenants. The best practice idea of this has been widely discussed with many MSPs. Most of these best practices derive from the standards in CIPP. The Best Practice Analyser is entirely read only. It makes no changes to your tenants. The best practice Analyser runs once every day.

### Getting Started

In the left hand menu, navigate to **Tenant Administration > Standards > Best Practice Analyser**. If this is your first ever run you may see an error initially because there is no data, you can wait for the automatic daily job that generates the data.

### Refreshing / Generating the Data

At the top of the page there is button called **Force Refresh All Data**. You should only use this once.

### Interpreting Results

The reporting here follows a standard colour theme. Red is bad and not something that should be happening on your tenant. Orange is either a warning or subjective. It doesn't necessarily indicate something is wrong. Green means there are no issues or the setting's configured in a manner that's meets the best practice.

### The Standards

Below is a list of the standards that are currently implemented:

#### Unified Audit Log Enabled

This best practice checks that on your tenants that the Unified Audit Log's enabled. The Unified Audit Log is Microsoft 365's primary logging for user, group, application, domain and, directory activities.

You should have the Unified Audit Log enabled on your tenant.

#### Security Defaults Enabled

This best practice is a check to see if Security Defaults' enabled. Security Defaults refers to Microsoft's pre-configured security settings that applied to tenants to enable MFA, block legacy authentication protocols and more.

Whether to enable security defaults or not is subjective, which is why not having security defaults enabled triggers an orange warning status.

#### Message Copy for Sent As

You can select the badge in this column to view individual accounts where Message Copy for Sent As isn't enabled. This checks that sent items are automatically saved in the shared or delegated mailbox.

Access to mailboxes in Microsoft 365 can delegated to other people to enable delegates to access the mailbox and send mail as them. These people are often called the delegate and the delegator, respectively.

In this example the delegator is manager and the delegate is assistant. When an assistant has access to a manager's mailbox, it's called delegated access. People often set up delegated access and send permissions to let an assistant to manage a manager's calendar where they have to send and respond to meeting requests. When an assistant sends mail as, or on behalf of, a manager, the sent message goes to sent items in the assistant's mailbox and not in the managers'. It's possible to set it so that the manager gets it put in to their sent items too.

This best practice is a check to see if those who have send as / on behalf permissions store sent mails in the delegator's mailbox.

Whether to enable message copy for sent as or not is subjective, which is why not having message copy for sent as triggers an orange warning status.

#### User Can't Consent to Apps

This best practice checks whether users can give consent to apps that use OpenID Connect and / or OAuth for sign-in and requests to access data. Applications originate from a variety of sources, created in your own organization, from another Office 365 organization or, public / created by third-party vendors. It's best practice that users shouldn't be able to give consent to apps without administrator review.

Users being able to consent to applications triggers a red danger status as this represents a security risk you should mitigate.

#### Passwords don't Expire

This setting is checking whether the tenant has set passwords to expire or not. Current research strongly indicates that mandated password changes do more harm than good. Both the [United Kingdom's National Cyber Security Centre (NCSC)](https://www.ncsc.gov.uk/blog-post/problems-forcing-regular-password-expiry) and the [United States' National Institute of Standards and Technology (NIST)](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf) recommend that timed password expiry isn't used.

Having password expiry configured triggers a red danger status as this represents a security risk you should mitigate.

#### Privacy in Reports Enabled

A number of the reports that pre-generate in Microsoft 365 contain personally identifiable information (like a users name). In 2021 [Microsoft announced](https://techcommunity.microsoft.com/t5/microsoft-365-blog/privacy-changes-to-microsoft-365-usage-analytics/ba-p/2694137) that they were pseudonymising user-level information by default across many Microsoft 365 reports and APIs. Microsoft implemented this change to protect user privacy and help companies comply with various local privacy laws.

Having this setting enabled can make reporting difficult. For the sake of more exact reporting information, which provides many security benefits it's recommended that you don't have this enabled.

Whether to enable privacy in reports or not is subjective, which is why having privacy in reports triggers an orange warning status.

#### Self-Service Password Reset Enabled

Microsoft 365 has an organisational setting that when enabled, provides the ability for users to reset their own passwords through a forgot your password process with strong authentication requirements. This check has three possible results.

* Self-service password reset is off for all users
* Self-service password reset is on for all users
* Self-service password reset is on for specific users.

Whether to enable self-service password reset or not is subjective, which is why not having self service password resets enabled triggers an orange warning status.

#### Modern Auth Enabled

Modern authentication is a core security feature of Microsoft 365 and provides authentication features like MFA, smart cards, third-party authentication providers using Security Assertion Markup Language (SAML).

Not having modern authentication enabled triggers a red danger status.

#### Shared Mailboxes Logins Not Enabled

You can select the badge in this column to view shared mailbox accounts with login enabled.

This setting is checking to see if you have shared mailboxes attached to a valid account that can still login. Usually shared mailboxes shouldn't have a account attached to them with an active login. Commonly when a user leaves a business, they're converted from a licensed user account to a shared mailbox, with the license removed to save money. Often this still leaves an active account linked to the shared mailbox, even with the password changed this increases risk.

Having shared mailboxes with enabled accounts triggers a red danger status.

#### Unused Licenses

You can select the badge in this column to view unused licenses.

This checks all licenses in every tenant and compares the purchased number with the number consumed. Where there is a difference in this number this is normally because you have licenses that you are paying for, but aren't utilising.

This excludes certain commonly under-utilised licenses, for example free licenses or trials.

For more licenses / SKUs you think should added to this checks' exclusions please raise a [feature request](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) in GitHub.

Having unused licenses triggers an orange warning status.

### Common Problems

You must give adequate time for the best practice Analyser to run. In an environment with 100 tenants this takes on average 15 minutes.

Check that your permissions are correct by navigating to **CIPP Settings > Configuration Settings > Run Permission Check**.

Make sure both CIPP-API and CIPP are fully up-to-date. There is extensive logging in the log files in the CIPP-API Function App.

{% hint style="info" %}
Partial Data If you are only seeing partial data after waiting a while for the data to populate, it's likely an issue with your Refresh Token used across the analyser.

You can test this with the Access Check by navigating to **CIPP Settings > Configuration Settings > Tenant Access Check**.
{% endhint %}

### API Calls

The following APIs are called on this page:

{% swagger src="../../../../.gitbook/assets/openapicipp.json" path="/BestPracticeAnalyser_List" method="get" %}
[openapicipp.json](../../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
