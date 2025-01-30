---
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Teams Standards

### Low Impact

<table data-full-width="true"><thead><tr><th>Standard Name</th><th>Description</th><th>Recommended By</th><th>PowerShell Equivalent</th><th>APIName</th></tr></thead><tbody><tr><td>Disallow emails to be sent to channel email addresses</td><td>Teams channel email addresses are an optional feature that allows users to email the Teams channel directly.</td><td>"CIS 3.0"</td><td>Set-CsTeamsClientConfiguration -AllowEmailIntoChannel $false</td><td>TeamsEmailIntegration</td></tr><tr><td>Default voice and face enrollment</td><td>Controls whether users with this policy can set the voice profile capture and enrollment through the Recognition tab in their Teams client settings.</td><td></td><td>Set-CsTeamsMeetingPolicy -Identity Global -EnrollUserOverride $false</td><td>TeamsEnrollUser</td></tr><tr><td>Define approved cloud storage services for external file sharing in Teams</td><td>Ensure external file sharing in Teams is enabled for only approved cloud storage services.</td><td>"CIS 3.0"</td><td>Set-CsTeamsClientConfiguration -AllowGoogleDrive $false -AllowShareFile $false -AllowBox $false -AllowDropBox $false -AllowEgnyte $false</td><td>TeamsExternalFileSharing</td></tr><tr><td>Define Global Meeting Policy for Teams</td><td>Defines the CIS recommended global meeting policy for Teams. This includes AllowAnonymousUsersToJoinMeeting, AllowAnonymousUsersToStartMeeting, AutoAdmittedUsers, AllowPSTNUsersToBypassLobby, MeetingChatEnabledType, DesignatedPresenterRoleMode, AllowExternalParticipantGiveRequestControl</td><td>"CIS 3.0"</td><td>Set-CsTeamsMeetingPolicy -AllowAnonymousUsersToJoinMeeting $false -AllowAnonymousUsersToStartMeeting $false -AutoAdmittedUsers EveryoneInCompanyExcludingGuests -AllowPSTNUsersToBypassLobby $false -MeetingChatEnabledType EnabledExceptAnonymous -DesignatedPresenterRoleMode $DesignatedPresenterRoleMode -AllowExternalParticipantGiveRequestControl $false</td><td>TeamsGlobalMeetingPolicy</td></tr></tbody></table>

### Medium Impact

<table data-full-width="true"><thead><tr><th>Standard Name</th><th>Description</th><th>Recommended By</th><th>PowerShell Equivalent</th><th>APIName</th></tr></thead><tbody><tr><td>External Access Settings for Microsoft Teams</td><td>Sets the properties of the Global external access policy. External access policies determine whether or not your users can: 1) communicate with users who have Session Initiation Protocol (SIP) accounts with a federated organization; 2) communicate with users who are using custom applications built with Azure Communication Services; 3) access Skype for Business Server over the Internet, without having to log on to your internal network; 4) communicate with users who have SIP accounts with a public instant messaging (IM) provider such as Skype; and, 5) communicate with people who are using Teams with an account that's not managed by an organization.</td><td></td><td>Set-CsExternalAccessPolicy</td><td>TeamsExternalAccessPolicy</td></tr><tr><td>Federation Configuration for Microsoft Teams</td><td>Sets the properties of the Global federation configuration. Federation configuration settings determine whether or not your users can communicate with users who have SIP accounts with a federated organization.</td><td></td><td>Set-CsTenantFederationConfiguration</td><td>TeamsFederationConfiguration</td></tr><tr><td>Global Messaging Policy for Microsoft Teams</td><td>Sets the properties of the Global messaging policy. Messaging policies control which chat and channel messaging features are available to users in Teams.</td><td></td><td>Set-CsTeamsMessagingPolicy</td><td>TeamsMessagingPolicy</td></tr></tbody></table>
