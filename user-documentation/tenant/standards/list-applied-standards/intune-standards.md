# Intune Standards

## Low Impact

| Standard Name                              | Description                                                                                                                                           | PowerShell Equivalent | APIName                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------- |
| Set Intune Company Portal branding profile | Sets the branding profile for the Intune Company Portal app. This is a tenant wide setting and overrules any settings set on the app level.           | Graph API             | intuneBrandingProfile      |
| Set inactive device retirement days        | A value between 0 and 270 is supported. A value of 0 disables retirement, retired devices are removed from Intune after the specified number of days. | Graph API             | intuneDeviceRetirementDays |

## Medium Impact

| Standard Name                                                                       | Description                                                                                                             | PowerShell Equivalent                       | APIName          |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------- |
| Set Maximum Number of Devices per user                                              | sets the maximum number of devices that can be registered by a user. A value of 0 disables device registration by users | Update-MgBetaPolicyDeviceRegistrationPolicy | intuneDeviceReg  |
| Require Multifactor Authentication to register or join devices with Microsoft Entra | Requires MFA for all users to register devices with Intune. This is useful when not using Conditional Access.           | Update-MgBetaPolicyDeviceRegistrationPolicy | intuneRequireMFA |
