# Recommended Roles

As CIPP is an application that touches many parts of M365 selecting the roles might be difficult. The following roles are recommended for CIPP, but you may experiment with less permissive groups at your own risk.

{% hint style="warning" %}
Please note that any relationship that contains the `Global Administrator`/`Company Administrator` role will NOT be eligible for auto extend.
{% endhint %}

The table below outlines the recommended roles for use in CIPP, describing what each role enables. Click on the Role Name to navigate to Microsoft's [Entra ID built-in roles](https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#cloud-app-security-administrator) page for detailed information about each specific role.

## Roles

<table><thead><tr><th width="282">Role Name</th><th>What it allows for</th></tr></thead><tbody><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#application-administrator"><strong>Application Administrator</strong></a></td><td>Can create and manage all applications, service principals, app registration, enterprise apps, consent requests. Cannot manage directory roles, security groups.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#authentication-policy-administrator"><strong>Authentication Policy Administrator</strong></a></td><td>Configures authentication methods policy, MFA settings, manages Password Protection settings, creates/manages verifiable credentials, Azure support tickets. Restrictions on updating sensitive properties, deleting/restoring users, legacy MFA settings.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#billing-administrator"><strong>Billing Administrator</strong></a><strong>*</strong></td><td>Can perform common billing related tasks like updating payment information.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#cloud-app-security-administrator"><strong>Cloud App Security Administrator</strong></a></td><td>Manages all aspects of the Defender for Cloud App Security in Azure AD, including policies, alerts, and related configurations.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#cloud-device-administrator"><strong>Cloud Device Administrator</strong></a></td><td>Enables, disables, deletes devices in Azure AD, reads Windows 10 BitLocker keys. Does not grant permissions to manage other properties on the device.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#domain-name-administrator"><strong>Domain Name Administrator</strong></a><strong>*</strong></td><td>Can manage domain names in cloud and on-premises.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#exchange-administrator"><strong>Exchange Administrator</strong></a></td><td>Manages all aspects of Exchange Online, including mailboxes, permissions, connectivity, and related settings. Limited access to related Exchange settings in Azure AD.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#global-reader"><strong>Global Reader</strong></a><strong>*</strong></td><td>Can read everything that a Global Administrator can but not update anything.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#intune-administrator"><strong>Intune Administrator</strong></a></td><td>Manages all aspects of Intune, including all related resources, policies, configurations, and tasks.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#privileged-authentication-administrator"><strong>Privileged Authentication Administrator</strong></a></td><td>Sets/resets authentication methods for all users (admin or non-admin), deletes/restores any users. Manages support tickets in Azure and Microsoft 365. Restrictions on managing per-user MFA in legacy MFA portal.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#privileged-role-administrator"><strong>Privileged Role Administrator</strong></a></td><td>Manages role assignments in Azure AD, Azure AD Privileged Identity Management, creates/manages groups, manages all aspects of Privileged Identity Management, administrative units. Allows managing assignments for all Azure AD roles including Global Administrator.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#security-administrator"><strong>Security Administrator</strong></a></td><td>Can read security information and reports, and manages security-related features, including identity protection, security policies, device management, and threat management in Azure AD and Office 365.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#sharepoint-administrator"><strong>SharePoint Administrator</strong></a></td><td>Manages all aspects of SharePoint Online, Microsoft 365 groups, support tickets, service health. Scoped permissions for Microsoft Intune, SharePoint, and OneDrive resources.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#teams-administrator"><strong>Teams Administrator</strong></a></td><td>Manages all aspects of Microsoft Teams, including telephony, messaging, meetings, teams, Microsoft 365 groups, support tickets, and service health.</td></tr><tr><td><a href="https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#user-administrator"><strong>User Administrator</strong></a></td><td>Manages all aspects of users, groups, registration, and resets passwords for limited admins. Cannot manage security-related policies or other configuration objects.</td></tr></tbody></table>

{% hint style="warning" %}
\*- A previous version of this document merely suggested that these roles were recommended. CIPP is transitioning to requiring these as part of your baseline GDAP deployment given the depth of features being added to the product that require them. It is recommended that these be added to your [GDAP Role Mapping](../../user-documentation/tenant/gdap-management/roles/add.md) and add these three roles to your [Role Template](../../user-documentation/tenant/gdap-management/role-templates/).
{% endhint %}

## Handling the Additional Recommended Roles

With v10.1, CIPP added the three previously suggested roles to the core recommended roles as part of the code. This is causing many who have been using CIPP for a while to show the missing roles when doing a permission check. Here's our recommended way to best handle resolving these issues:

{% stepper %}
{% step %}
### Map the Additional Roles

Go to `Tenant Administration` > `GDAP Management` > `Role Mappings` and click `Map GDAP Roles`. Select `Billing Administrator`, `Domain Name Administrator`, and `Global Reader` in the dropdown. Hit `Submit` and CIPP will create the `M365 GDAP` groups.
{% endstep %}

{% step %}
### Add the CIPP Service Account to the New Role Groups

If you've added your partner/internal tenant to CIPP, use `Identity Management` > `Administration` > `Users` to add the service account to the three additional security groups. If not, manually complete this in Entra or the Microsoft 365 Admin portal.
{% endstep %}

{% step %}
### Recreate the CIPP Defaults Role Template

In `Tenant Administration` > `GDAP Management` > `Role Templates`, locate your CIPP Defaults role template and delete it. A prompt will show asking if you would like to create the CIPP Defaults template. Click the button to create the defaults. This new template will include all 15 roles.
{% endstep %}

{% step %}
### Generate New GDAP Relationships

{% hint style="warning" %}
You cannot add GDAP roles to an existing relationship and there is no supported way to automate this.
{% endhint %}

From the `Invites` tab, use the `New Invite` action to generate enough invite links with the new CIPP Defaults template to establish new relationships with all your GDAP clients.&#x20;
{% endstep %}

{% step %}
### Consent to New GDAP Relationships

A Global Administrator in each client tenant will need to consent to the new relationship.
{% endstep %}

{% step %}
### (Optional) Terminate Old GDAP Relationships

From `Tenant Administration` > `GDAP Management` > `Relationships`, select your old relationships and use the action `Terminate Relationship`. This can either be done one by one or using the check boxes and bulk actions.
{% endstep %}
{% endstepper %}
