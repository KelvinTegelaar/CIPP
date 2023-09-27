---
id: permissions
title: Permissions
slug: /gettingstarted/postinstall/permissions
description: How to ensure your SAM app for CIPP has the correct permissions.
---

# Permissions

### Manual Permissions

At times you will need to change permissions for the CIPP-SAM application that is used by CIPP to access your tenants. Use the following instructions to update these permissions.

* Go to the [Azure Portal](https://portal.azure.com).
* Select [**Azure Active Directory**](https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ActiveDirectoryMenuBlade/Overview), now select [**App Registrations**](https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ActiveDirectoryMenuBlade/RegisteredApps).
* Find your Secure App Model application. You can search based on the Application ID.
* Go to **API Permissions** and select **Add a permission**.
* Choose "Microsoft Graph" and "Delegated permission" or "Application Permissions"
* Add the permission you need
* Finally, select "Grant Admin Consent" for Company Name.

### Permissions

For full functionality, CIPP needs the following permissions for the Secure Application Model registration. You can remove any permissions if you don't want the application to be able to use that functionality. This may cause you to see errors in the application.

{% hint style="info" %}
Duplicate Permissions Some permissions may appear duplicated in the Delegated and Application permissions tables below. This is _by design_ and you do need to add both permissions!
{% endhint %}

{% hint style="warning" %}
Some permissions may come from other APIs than just Graph. you will see this both in the application, and the permission list below by having a name between brackets, e.g. (WindowsDefenderATP). This means you will need to click on "APIs my Organisation uses" instead of "Microsoft Graph" when adding these permissions. Look for the exact name between the brackets to find the correct resource to add.
{% endhint %}

**LIST OF DELEGATED PERMISSIONS USED BY CIPP:**

| API / Permissions name                                  | Description                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| ActivityFeed.Read (Office 365 Management API)           | Read activity data for your organization                                 |
| AllSites.FullControl (Office 365 SharePoint Online)     | Have full control of all site collections                                |
| Application.Read.All                                    | Read applications                                                        |
| Application.ReadWrite.All                               | Read and write all applications                                          |
| AuditLog.Read.All                                       | Read audit log data                                                      |
| BitlockerKey.Read.All                                   | Read BitLocker keys                                                      |
| Channel.Create                                          | Create channels                                                          |
| Channel.ReadBasic.All                                   | Read the names and descriptions of channels                              |
| Channel.Delete.All                                      | Delete Channels                                                          |
| ChannelMember.Read.All                                  | Read the members of channels                                             |
| ChannelMember.ReadWrite.All                             | Add and remove members from channels                                     |
| ChannelMessage.Edit                                     | Edit users' channel messages                                             |
| ChannelMessage.Read.All                                 | Read users' channel messages                                             |
| ChannelMessage.Send                                     | Send channel messages                                                    |
| ChannelSettings.Read.All                                | Read the names, descriptions, and settings of channels                   |
| ChannelSettings.ReadWrite.All                           | Read and write the names, descriptions, and settings of channels         |
| ConsentRequest.Read.All                                 | Read consent requests                                                    |
| DelegatedAdminRelationship.ReadWrite.All                | Manage Delegated Admin relationships with customers                      |
| Device.Command                                          | Communicate with user devices                                            |
| Device.Read                                             | Read user devices                                                        |
| Device.Read.All                                         | Read all devices                                                         |
| DeviceLocalCredential.Read.All                          | Read device local credential passwords                                   |
| DeviceManagementApps.ReadWrite.All                      | Read and write Microsoft Intune apps                                     |
| DeviceManagementConfiguration.ReadWrite.All             | Read and write Microsoft Intune Device Configuration and Policies        |
| DeviceManagementManagedDevices.PrivilegedOperations.All | Perform user-impacting remote actions on Microsoft Intune devices        |
| DeviceManagementManagedDevices.ReadWrite.All            | Read and write Microsoft Intune devices                                  |
| DeviceManagementServiceConfig.Read.All                  | Read Microsoft Intune configuration                                      |
| DeviceManagementRBAC.ReadWrite.All                      | Read and write Microsoft Intune RBAC settings                            |
| DeviceManagementServiceConfig.ReadWrite.All             | Read and write Microsoft Intune configuration                            |
| Directory.AccessAsUser.All                              | Access directory as the signed in user                                   |
| Domain.Read.All                                         | Read domain data                                                         |
| Group.ReadWrite.All                                     | Read and write all groups                                                |
| GroupMember.ReadWrite.All                               | Read and write group memberships                                         |
| Mail.Send                                               | Send mail as a user                                                      |
| Mail.Send.Shared                                        | Send mail on behalf of others                                            |
| Member.Read.Hidden                                      | Read hidden memberships                                                  |
| offline\_access                                         | Maintain access to data you have given it access to                      |
| openid                                                  | Sign users in                                                            |
| Organization.ReadWrite.All                              | Read and write organization information                                  |
| Policy.Read.All                                         | Read your organization's policies                                        |
| Policy.ReadWrite.ApplicationConfiguration               | Read and write your organization's application configuration policies    |
| Policy.ReadWrite.AuthenticationFlows                    | Read and write authentication flow policies                              |
| Policy.ReadWrite.AuthenticationMethod                   | Read and write authentication method policies                            |
| Policy.ReadWrite.Authorization                          | Read and write your organization's authorization policy                  |
| Policy.ReadWrite.ConditionalAccess                      | Read and write conditional access policy                                 |
| Policy.ReadWrite.ConsentRequest                         | Read and write consent request policy                                    |
| Policy.ReadWrite.DeviceConfiguration                    | Read and write your organization's device configuration policies         |
| PrivilegedAccess.Read.AzureResources                    | Read privileged access to Azure resources                                |
| PrivilegedAccess.ReadWrite.AzureResources               | Read and write privileged access to Azure resources                      |
| profile                                                 | View users' basic profile                                                |
| Reports.Read.All                                        | Read all usage reports                                                   |
| ReportSettings.ReadWrite.All                            | Read and write admin report settings                                     |
| RoleManagement.ReadWrite.Directory                      | Read and write directory RBAC settings                                   |
| SecurityActions.ReadWrite.All                           | Read and update your organization's security actions                     |
| SecurityEvents.ReadWrite.All                            | Read and update your organization's security events                      |
| SecurityIncident.Read.All                               | Read incidents                                                           |
| SecurityIncident.ReadWrite.All                          | Read and write to incidents                                              |
| ServiceHealth.Read.All                                  | Read service health                                                      |
| ServiceMessage.Read.All                                 | Read service announcement messages                                       |
| SharePointTenantSettings.ReadWrite.All                  | Read and change SharePoint and OneDrive tenant settings                  |
| Sites.ReadWrite.All                                     | Edit or delete items in all site collections                             |
| (Skype and Teams Tenant Admin AP)user\_impersonation    | Access Microsoft Teams and Skype for Business data as the signed in user |
| TeamMember.ReadWrite.All                                | Add and remove members from teams                                        |
| TeamMember.ReadWriteNonOwnerRole.All                    | Add and remove members with non-owner role for all teams                 |
| TeamsActivity.Read                                      | Read users' teamwork activity feed                                       |
| TeamsActivity.Send                                      | Send a teamwork activity as the user                                     |
| TeamsAppInstallation.ReadForChat                        | Read installed Teams apps in chats                                       |
| TeamsAppInstallation.ReadForTeam                        | Read installed Teams apps in teams                                       |
| TeamsAppInstallation.ReadForUser                        | Read users' installed Teams apps                                         |
| TeamsAppInstallation.ReadWriteForChat                   | Manage installed Teams apps in chats                                     |
| TeamsAppInstallation.ReadWriteForTeam                   | Manage installed Teams apps in teams                                     |
| TeamsAppInstallation.ReadWriteForUser                   | Manage users' installed Teams apps                                       |
| TeamsAppInstallation.ReadWriteSelfForChat               | Allow the Teams app to manage itself in chats                            |
| TeamsAppInstallation.ReadWriteSelfForTeam               | Allow the app to manage itself in teams                                  |
| TeamsAppInstallation.ReadWriteSelfForUser               | Allow the Teams app to manage itself for a user                          |
| TeamSettings.Read.All                                   | Read teams' settings                                                     |
| TeamSettings.ReadWrite.All                              | Read and change teams' settings                                          |
| TeamsTab.Create                                         | Create tabs in Microsoft Teams                                           |
| TeamsTab.Read.All                                       | Read tabs in Microsoft Teams                                             |
| TeamsTab.ReadWrite.All                                  | Read and write tabs in Microsoft Teams                                   |
| TeamsTab.ReadWriteForChat                               | Allow the Teams app to manage all tabs in chats                          |
| TeamsTab.ReadWriteForTeam                               | Allow the Teams app to manage all tabs in teams                          |
| TeamsTab.ReadWriteForUser                               | Allow the Teams app to manage all tabs for a user                        |
| Team.Create                                             | Create teams                                                             |
| Team.ReadBasic.All                                      | Read the names and descriptions of teams                                 |
| ThreatAssessment.ReadWrite.All                          | Read and write threat assessment requests                                |
| UnifiedGroupMember.Read.AsGuest                         | Read unified group memberships as guest                                  |
| User.ManageIdentities.All                               | Manage user identities                                                   |
| User.Read                                               | Sign in and read user profile                                            |
| User.ReadWrite.All                                      | Read and write all users' full profiles                                  |
| UserAuthenticationMethod.Read.All                       | Read all users' authentication methods                                   |
| UserAuthenticationMethod.ReadWrite                      | Read and write user authentication methods                               |
| UserAuthenticationMethod.ReadWrite.All                  | Read and write all users' authentication methods                         |
|  Vulnerability.Read (WindowsDefenderATP)                | Read Threat and Vulnerability Management vulnerability information       |

**LIST OF APPLICATION PERMISSIONS USED BY CIPP:**

| API / Permissions name                                  | Description                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| Channel.Create                                          | Create channels                                                       |
| Channel.ReadBasic.All                                   | Read the names and descriptions of channels                           |
| ChannelMember.Read.All                                  | Read the members of channels                                          |
| ChannelMember.ReadWrite.All                             | Add and remove members from channels                                  |
| Device.ReadWrite.All                                    | Read and write devices                                                |
| DeviceManagementApps.ReadWrite.All                      | Read and write Microsoft Intune apps                                  |
| DeviceManagementConfiguration.ReadWrite.All             | Read and write Microsoft Intune Device Configuration and Policies     |
| DeviceManagementManagedDevices.PrivilegedOperations.All | Perform user-impacting remote actions on Microsoft Intune devices     |
| DeviceManagementManagedDevices.Read.All                 | Read Microsoft Intune devices                                         |
| DeviceManagementManagedDevices.ReadWrite.All            | Read and write Microsoft Intune devices                               |
| DeviceManagementRBAC.Read.All                           | Read Microsoft Intune RBAC settings                                   |
| DeviceManagementRBAC.ReadWrite.All                      | Read and write Microsoft Intune RBAC settings                         |
| DeviceManagementServiceConfig.Read.All                  | Read Microsoft Intune configuration                                   |
| DeviceManagementServiceConfig.ReadWrite.All             | Read and write Microsoft Intune configuration                         |
| Directory.Read.All                                      | Read directory data                                                   |
| Domain.Read.All                                         | Read Domains                                                          |
| Exchange.Manage (Office 365 Exchange Online)            | Manage Exchange configuration                                         |
| Files.ReadWrite.All                                     | Read and write files in all site collections                          |
| Group.Create                                            | Create groups                                                         |
| Group.Read.All                                          | Read all groups                                                       |
| Group.ReadWrite.All                                     | Read and write all groups                                             |
| GroupMember.ReadWrite.All                               | Read and write group memberships                                      |
| Mail.Send                                               | Send mail as a user                                                   |
| Organization.ReadWrite.All                              | Read and write organization information                               |
| Policy.Read.All                                         | Read your organization's policies                                     |
| Policy.ReadWrite.ApplicationConfiguration               | Read and write your organization's application configuration policies |
| Policy.ReadWrite.AuthenticationFlows                    | Read and write authentication flow policies                           |
| Policy.ReadWrite.AuthenticationMethod                   | Read and write authentication method policies                         |
| Policy.ReadWrite.ConditionalAccess                      | Read and write conditional access policy                              |
| Policy.ReadWrite.ConsentRequest                         | Read and write consent request policy                                 |
| PrivilegedAccess.ReadWrite.AzureADGroup                 | Read and write privileged access to Azure AD groups                   |
| Reports.Read.All                                        | Read all usage reports                                                |
| RoleManagement.ReadWrite.Directory                      | Read and write directory RBAC settings                                |
| SecurityEvents.Read.All                                 | Read your organization's security events                              |
| SecurityIncident.Read.All                               | Read all security incidents                                           |
| SecurityIncident.ReadWrite.All                          | Read and write to all security incidents                              |
| SharePointTenantSettings.ReadWrite.All                  | Read and change SharePoint and OneDrive tenant settings               |
| Sites.FullControl.All                                   | Have full control of all site collections                             |
| Team.ReadBasic.All                                      | Read the names and descriptions of teams                              |
| TeamMember.ReadWrite.All                                | Add and remove members from teams                                     |
| TeamMember.ReadWriteNonOwnerRole.All                    | Add and remove members with non-owner role for all teams              |
| User.ReadWrite.All                                      | Read and write all users' full profiles                               |
| UserAuthenticationMethod.ReadWrite.All                  | Read and write all users' authentication methods                      |
| Vulnerability.Read.All (WindowsDefenderATP)             | Read Threat and Vulnerability Management vulnerability information    |
