# Intune Standards

### Low Impact

<table data-full-width="true"><thead><tr><th>Standard Name</th><th>Description</th><th>Recommended By</th><th>PowerShell Equivalent</th><th>APIName</th></tr></thead><tbody><tr><td>Device enrollment restrictions</td><td>Sets the default platform restrictions for enrolling devices into Intune. Note: Do not block personally owned if platform is blocked.</td><td></td><td>Graph API</td><td>DefaultPlatformRestrictions</td></tr><tr><td>Set Intune Company Portal branding profile</td><td>Sets the branding profile for the Intune Company Portal app. This is a tenant wide setting and overrules any settings set on the app level.</td><td></td><td>Graph API</td><td>intuneBrandingProfile</td></tr><tr><td>Intune Compliance settings</td><td>Sets the mark devices with no compliance policy assigned as compliance/non compliant and Compliance status validity period.</td><td></td><td></td><td>IntuneComplianceSettings</td></tr><tr><td>Set inactive device retirement days</td><td>A value between 0 and 270 is supported. A value of 0 disables retirement, retired devices are removed from Intune after the specified number of days.</td><td></td><td>Graph API</td><td>intuneDeviceRetirementDays</td></tr></tbody></table>

### Medium Impact

<table data-full-width="true"><thead><tr><th>Standard Name</th><th>Description</th><th>Recommended By</th><th>PowerShell Equivalent</th><th>APIName</th></tr></thead><tbody><tr><td>Set Maximum Number of Devices per user</td><td>sets the maximum number of devices that can be registered by a user. A value of 0 disables device registration by users</td><td></td><td>Update-MgBetaPolicyDeviceRegistrationPolicy</td><td>intuneDeviceReg</td></tr><tr><td>Require Multifactor Authentication to register or join devices with Microsoft Entra</td><td>Requires MFA for all users to register devices with Intune. This is useful when not using Conditional Access.</td><td></td><td>Update-MgBetaPolicyDeviceRegistrationPolicy</td><td>intuneRequireMFA</td></tr></tbody></table>

### High Impact

<table data-full-width="true"><thead><tr><th>Standard Name</th><th>Description</th><th>Recommended By</th><th>PowerShell Equivalent</th><th>APIName</th></tr></thead><tbody><tr><td>Guest Invite settings</td><td>This setting controls who can invite guests to your directory to collaborate on resources secured by your company, such as SharePoint sites or Azure resources.</td><td></td><td></td><td>GuestInvite</td></tr></tbody></table>
