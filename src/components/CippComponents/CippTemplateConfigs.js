// Configuration for different template types
export const templateConfigs = {
  conditionalAccess: {
    apiConfig: {
      fetchUrl: "/api/ListCATemplates",
      updateUrl: "/api/EditCATemplate",
      idParam: "GUID",
    },
    blacklistConfig: {
      patterns: [
        "membershipKind",
        "countryLookupMethod",
        "applicationFilter",
        "includeAuthenticationContextClassReferences",
      ],
    },
    schemaConfig: {
      complexArrayFields: ["locationinfo", "groupinfo"],
      fields: {
        operator: {
          multiple: false,
          options: [
            { label: "OR", value: "OR" },
            { label: "AND", value: "AND" },
          ],
        },
        builtincontrols: {
          multiple: true,
          options: [
            { label: "Block", value: "block" },
            { label: "Multi-factor Authentication", value: "mfa" },
            { label: "Compliant Device", value: "compliantDevice" },
            { label: "Domain Joined Device", value: "domainJoinedDevice" },
            { label: "Approved Application", value: "approvedApplication" },
            { label: "Compliant Application", value: "compliantApplication" },
            { label: "Password Change", value: "passwordChange" },
            { label: "Unknown Future Value", value: "unknownFutureValue" },
          ],
        },
        authenticationtype: {
          multiple: false,
          options: [
            { label: "Primary and Secondary Authentication", value: "primaryAndSecondaryAuthentication" },
            { label: "Secondary Authentication", value: "secondaryAuthentication" },
            { label: "Unknown Future Value", value: "unknownFutureValue" },
          ],
        },
        frequencyinterval: {
          multiple: false,
          options: [
            { label: "Time Based", value: "timeBased" },
            { label: "Every Time", value: "everyTime" },
            { label: "Unknown Future Value", value: "unknownFutureValue" },
          ],
        },
        state: {
          multiple: false,
          options: [
            { label: "Enabled", value: "enabled" },
            { label: "Disabled", value: "disabled" },
            { label: "Enabled for Reporting", value: "enabledForReportingButNotEnforced" },
          ],
        },
      },
    },
    priorityFields: ["displayName", "state"],
    title: (templateData) => `Edit Template: ${templateData?.displayName || "Unnamed Template"}`,
    backButtonTitle: "Conditional Access Templates",
  },

  intune: {
    apiConfig: {
      fetchUrl: "/api/ListIntuneTemplates",
      updateUrl: "/api/EditIntuneTemplate",
      idParam: "id",
    },
    blacklistConfig: {
      patterns: [
        "deviceManagementApplicabilityRuleOsEdition",
        "deviceManagementApplicabilityRuleOsVersion",
        "deviceManagementApplicabilityRuleDeviceMode",
        "roleScopeTagIds",
        "supportsScopeTags",
        "deviceSettingStateSummaries",
      ],
    },
    schemaConfig: {
      complexArrayFields: ["assignments", "devicestatusoverview"],
      fields: {
        // Intune-specific field schemas can be added here
        devicecompliancepolicystate: {
          multiple: false,
          options: [
            { label: "Unknown", value: "unknown" },
            { label: "Compliant", value: "compliant" },
            { label: "Noncompliant", value: "noncompliant" },
            { label: "Conflict", value: "conflict" },
            { label: "Error", value: "error" },
            { label: "In Grace Period", value: "inGracePeriod" },
            { label: "Config Manager", value: "configManager" },
          ],
        },
        // Add more Intune-specific fields as needed
      },
    },
    priorityFields: ["displayName", "description"],
    title: (templateData) => `Edit Intune Template: ${templateData?.displayName || "Unnamed Template"}`,
    backButtonTitle: "Intune Templates",
  },

  // Future template types can be added here
  exchange: {
    apiConfig: {
      fetchUrl: "/api/ListExchangeTemplates",
      updateUrl: "/api/EditExchangeTemplate",
      idParam: "Identity",
    },
    blacklistConfig: {
      patterns: [
        "ExchangeVersion",
        "DistinguishedName",
        "ObjectCategory",
        "WhenChanged",
        "WhenCreated",
      ],
    },
    schemaConfig: {
      complexArrayFields: ["accepteddomains", "remotedomain"],
      fields: {
        // Exchange-specific field schemas
      },
    },
    priorityFields: ["Name", "Identity"],
    title: (templateData) => `Edit Exchange Template: ${templateData?.Name || "Unnamed Template"}`,
    backButtonTitle: "Exchange Templates",
  },
};

// Helper function to get configuration for a template type
export const getTemplateConfig = (templateType) => {
  return templateConfigs[templateType] || templateConfigs.conditionalAccess;
};