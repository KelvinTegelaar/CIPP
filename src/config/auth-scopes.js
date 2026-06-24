// Centralized Microsoft Entra ID / Graph OAuth scope definitions.
// Update here to propagate to all CIPP tenant authentication flows.

export const TENANT_DEPLOY_SCOPES = [
  "https://graph.microsoft.com/DelegatedPermissionGrant.ReadWrite.All",
  "https://graph.microsoft.com/Directory.ReadWrite.All",
  "https://graph.microsoft.com/AppRoleAssignment.ReadWrite.All",
  "offline_access",
  "profile",
  "openid",
].join(" ");
