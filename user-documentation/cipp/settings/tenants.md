---
description: Centralized Tenant Management and Oversight
---

# Tenants

The Tenants page is a centralized platform for administrators to oversee and manage all tenants within CIPP. This page provides detailed information about each tenant and facilitates actions related to their exclusion status and permissions.

This page also shows tenants that have been excluded or removed due to the number of errors received.

## Action Buttons

<details>

<summary>Force Refresh</summary>

This will force a refresh of your tenants list. NOTE: Your tenants list may temporarily clear while CIPP rebuilds the list

</details>

## Table Details

The main table on this page displays information relating to all tenants that you have added to CIPP. There is a column for how the tenant was added (GDAP or Direct) along with columns regarding if the tenant has been excluded from CIPP, by whom, and when.

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Exclude Tenants</td><td>Excludes the selected tenant(s) from being managed by CIPP. They will no longer display in the tenant selector and standards, alerts, etc. will not apply</td><td>true</td></tr><tr><td>Include Tenants</td><td>Removes an exclusion on selected tenant(s)</td><td>true</td></tr><tr><td>Refresh CPV Permissions</td><td>Refreshes the CPV permissions for the selected tenant(s) [<a href="tenants.md#refreshing-a-tenants-permissions">More information</a>]</td><td>true</td></tr><tr><td>Reset CPV Permissions</td><td>Resets the CPV permissions for the selected tenant(s) by deleting the Service Principal and re-adding it [<a href="tenants.md#resetting-a-tenants-cpv-permissions">More information</a>]</td><td>true</td></tr><tr><td>Remove Tenant</td><td>Available for tenants added via the Direct Add method, this will remove the tenant from CIPP. The app registration remains though, so a user with rights to the tenant should remove the CIPP-SAM app manually.</td><td>true</td></tr><tr><td>Refresh CIPPDB Cache</td><td>Refreshes the CIPP reporting DB cache for the selected tenant. You can select a specific cache collection type to refresh, or trigger all collections at once. See <a href="tenants.md#refreshing-the-cippdb-cache">Refreshing the CIPPDB Cache</a> for details on what each collection requires.</td><td>false</td></tr><tr><td>Trace GDAP</td><td>This will open a modal that will allow you to test the GDAP access for a specific user from your tenant.</td><td>false</td></tr><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

## Refreshing the CIPPDB Cache

The CIPPDB cache powers reporting features such as the MFA reports, Intune device views, and the Report Builder. CIPP automatically refreshes the cache for all tenants on a scheduled cycle, but you can force a refresh for a specific tenant from this page.

Cache collection is split into groups based on the Microsoft licence required to access the underlying APIs. CIPP checks each tenant's licences before queuing a collection group — groups for which the tenant has no licence are silently skipped.

{% hint style="info" %}
Individual cache types within a group may have their own additional licence requirements. These are noted in the table below.
{% endhint %}

| Collection | Cache Types | Required Licence |
|---|---|---|
| **Graph** | Users, Groups, Guests, Service Principals, Apps, Devices, Organization, Roles, Admin Consent Request Policy, Authorization Policy, Authentication Methods Policy, Device Settings, Directory Recommendations, Cross-Tenant Access Policy, Default App Management Policy, Settings, Secure Score, Domains, B2B Management Policy, Device Registration Policy, OAuth2 Permission Grants, App Role Assignments, Licence Overview, BitLocker Keys | None |
| **MFAState** | MFA state for all users, including per-user MFA state and Security Defaults coverage | None — but **Entra ID P1** is required for MFA registration status, method details, and Conditional Access policy coverage. Without P1 those fields will be empty. |
| **CopilotUsage** | Copilot Usage User Detail, User Count Summary, User Count Trend, Readiness Activity | None *(returns empty if no Copilot licences are assigned)* |
| **SharePoint** | SPO Tenant config, Sync Client Restriction, SharePoint Site Usage, OneDrive Usage | SharePoint Online (`SHAREPOINTWAC`, `SHAREPOINTSTANDARD`, `SHAREPOINTENTERPRISE`, `ONEDRIVE_BASIC`, `ONEDRIVE_ENTERPRISE`) |
| **Teams** | Teams Meeting Policy, Client Configuration, External Access Policy, Federation Configuration, Messaging Policy, App Permission Policy, Teams, Teams Activity, Teams Voice | Teams (`MCOSTANDARD`, `MCOEV`, `MCOIMP`, `TEAMS1`) |
| **ExchangeConfig** | Anti-Phish Policies, Malware Filter Policies, Safe Links Policies†, Safe Attachment Policies†, Transport Rules, DKIM Signing Config, Organisation Config, Accepted Domains, Hosted Content Filter Policy, Hosted Outbound Spam Filter Policy, ATP Policy for O365†, Quarantine Policy, Remote Domain, Sharing Policy, Admin Audit Log Config, Preset Security Policy†, Tenant Allow/Block List, OWA Mailbox Policy, Report Submission Policy, Transport Config | Exchange Online |
| **ExchangeData** | CAS Mailboxes, Mailbox Usage, Office Activations, HVE Accounts | Exchange Online |
| **Mailboxes** | All mailboxes, including permissions, calendar rules, and forwarding *(runs as a dedicated activity)* | Exchange Online |
| **ConditionalAccess** | Conditional Access Policies, Credential User Registration Details, User Registration Details | Entra ID P1 (AAD Premium) |
| **IdentityProtection** | Risky Users, Risky Service Principals, Service Principal Risk Detections, Risk Detections, Role Eligibility Schedules, Role Assignment Schedule Instances, Role Management Policies | Entra ID P2 (AAD Premium P2) |
| **Intune** | Managed Devices, Intune Policies, Intune Applications, Assignment Filters, Compliance Policies, Device Encryption States, App Protection Policies, Scripts, Reusable Settings, Detected Apps, MDE Onboarding | Intune / EMS |
| **Compliance** | Sensitivity Labels, DLP Compliance Policies | Microsoft Purview / AIP |

† These cache types require **Microsoft Defender for Office 365** in addition to Exchange Online (`ATP_ENTERPRISE`, `THREAT_INTELLIGENCE`). They will silently skip for Exchange-only tenants that do not have Defender.

{% hint style="info" %}
**PIM Settings** is collected as part of the Graph group (no licence gate at the orchestration level), but requires **Entra ID P2** at the function level. It will silently skip if the tenant does not have AAD Premium P2.

**Sign-in Activity** is added to the Users cache only when the tenant has an **Entra ID P1 or P2** licence. Without it, last sign-in data will not be available in reports.
{% endhint %}

## Refreshing a Tenant's Permissions

CIPP works using the Control Panel Vendor API - Also known as the CPV API. The CPV API is used to add the CIPP application to your managed tenants and allows CIPP to execute actions within these tenants. Each night at 00:00 UTC the permissions are refreshed for all tenants. This makes sure that the application always has the latest set of required access.

For more details, see more about this on the [Refreshing a Tenants Permission](tenants.md#refreshing-a-tenants-permissions) section of our troubleshooting documentation.

## Resetting a Tenant's CPV Permissions

{% hint style="warning" %}
**Note:** The CPV Reset is a powerful tool and should be used only if you cannot manage permissions at all. This action will delete the Service Principal and re-add it, which may be necessary if there are issues with the existing permissions setup.
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
