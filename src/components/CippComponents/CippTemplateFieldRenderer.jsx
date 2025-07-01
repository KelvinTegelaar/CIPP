import React from "react";
import { Typography, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { getCippTranslation } from "/src/utils/get-cipp-translation";

const CippTemplateFieldRenderer = ({
  templateData,
  formControl,
  templateType = "conditionalAccess"
}) => {
  
  // Default blacklisted fields with wildcard support
  const defaultBlacklistedFields = [
    "id",
    "createdDateTime",
    "modifiedDateTime",
    "@odata.*",
    "GUID",
    "Type",
    "times",
    "tenantFilter",
    "*Id",
    "*DateTime",
  ];

  // Template-specific configurations
  const templateConfigs = {
    conditionalAccess: {
      blacklistedFields: [
        ...defaultBlacklistedFields,
        "membershipKind",
        "countryLookupMethod",
        "applicationFilter",
        "includeAuthenticationContextClassReferences",
      ],
      priorityFields: ["displayName", "state"],
      complexArrayFields: ["locationinfo", "groupinfo"],
      schemaFields: {
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
    intune: {
      blacklistedFields: [
        ...defaultBlacklistedFields,
        "deviceManagementApplicabilityRuleOsEdition",
        "deviceManagementApplicabilityRuleOsVersion",
        "deviceManagementApplicabilityRuleDeviceMode",
        "roleScopeTagIds",
        "supportsScopeTags",
        "deviceSettingStateSummaries",
      ],
      priorityFields: ["displayName", "description"],
      complexArrayFields: ["assignments", "devicestatusoverview"],
      schemaFields: {
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
      },
    },
    exchange: {
      blacklistedFields: [
        ...defaultBlacklistedFields,
        "ExchangeVersion",
        "DistinguishedName",
        "ObjectCategory",
        "WhenChanged",
        "WhenCreated",
      ],
      priorityFields: ["Name", "Identity"],
      complexArrayFields: ["accepteddomains", "remotedomain"],
      schemaFields: {},
    },
  };

  // Get configuration for the current template type
  const config = templateConfigs[templateType] || templateConfigs.conditionalAccess;
  const { blacklistedFields, priorityFields, complexArrayFields, schemaFields } = config;

  // Function to check if a field matches any blacklisted pattern (including wildcards)
  const isFieldBlacklisted = (fieldName) => {
    return blacklistedFields.some(pattern => {
      if (pattern.includes('*')) {
        // Convert wildcard pattern to regex
        const regexPattern = pattern
          .replace(/\*/g, '.*')
          .replace(/\./g, '\\.');
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(fieldName);
      }
      return pattern === fieldName;
    });
  };

  // Reset form with filtered values when templateData changes
  React.useEffect(() => {
    if (templateData && formControl) {
      const formValues = {};
      Object.keys(templateData).forEach((key) => {
        if (!isFieldBlacklisted(key)) {
          formValues[key] = templateData[key];
        }
      });
      formControl.reset(formValues);
    }
  }, [templateData]);

  const renderFormField = (key, value, path = "") => {
    const fieldPath = path ? `${path}.${key}` : key;

    if (isFieldBlacklisted(key)) {
      return null;
    }

    // Check for custom schema handling
    const schemaField = schemaFields[key.toLowerCase()];
    if (schemaField) {
      return (
        <Grid size={{ xs: 12, md: 6 }} key={fieldPath}>
          <CippFormComponent
            type="autoComplete"
            label={getCippTranslation(key)}
            name={fieldPath}
            formControl={formControl}
            multiple={schemaField.multiple || false}
            options={schemaField.options}
          />
        </Grid>
      );
    }

    // Special handling for complex array fields
    if (complexArrayFields.some(pattern => 
      key.toLowerCase().includes(pattern.toLowerCase())
    )) {
      // Don't render if value is null, undefined, empty array, or contains only null/empty items
      if (
        !value ||
        (Array.isArray(value) && value.length === 0) ||
        (Array.isArray(value) &&
          value.every(
            (item) =>
              item === null ||
              item === undefined ||
              (typeof item === "string" && item.trim() === "") ||
              (typeof item === "object" && item !== null && Object.keys(item).length === 0)
          ))
      ) {
        return null;
      }

      return (
        <Grid size={{ xs: 12 }} key={fieldPath}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            {getCippTranslation(key)}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {Array.isArray(value) ? (
              value
                .filter(
                  (item) =>
                    item !== null &&
                    item !== undefined &&
                    !(typeof item === "string" && item.trim() === "") &&
                    !(typeof item === "object" && item !== null && Object.keys(item).length === 0)
                )
                .map((item, index) => (
                  <Grid size={{ xs: 12 }} key={`${fieldPath}.${index}`}>
                    <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
                      {getCippTranslation(key)} {index + 1}
                    </Typography>
                    <Grid container spacing={2}>
                      {typeof item === "object" && item !== null ? (
                        Object.entries(item).map(([subKey, subValue]) =>
                          renderFormField(subKey, subValue, `${fieldPath}.${index}`)
                        )
                      ) : (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <CippFormComponent
                            type="textField"
                            label={`${getCippTranslation(key)} ${index + 1}`}
                            name={`${fieldPath}.${index}`}
                            formControl={formControl}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  No {getCippTranslation(key)} data available
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      );
    }

    // Generic field type handling
    if (typeof value === "boolean") {
      return (
        <Grid size={{ xs: 12, md: 6 }} key={fieldPath}>
          <CippFormComponent 
            type="switch" 
            label={getCippTranslation(key)} 
            name={fieldPath} 
            formControl={formControl} 
          />
        </Grid>
      );
    }

    if (typeof value === "string") {
      return (
        <Grid size={{ xs: 12, md: 6 }} key={fieldPath}>
          <CippFormComponent
            type="textField"
            label={getCippTranslation(key)}
            name={fieldPath}
            formControl={formControl}
          />
        </Grid>
      );
    }

    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      return (
        <Grid size={{ xs: 12, md: 6 }} key={fieldPath}>
          <CippFormComponent
            type="autoComplete"
            label={getCippTranslation(key)}
            name={fieldPath}
            formControl={formControl}
            multiple={true}
            creatable={true}
            options={value.map((item) => ({ label: item, value: item }))}
          />
        </Grid>
      );
    }

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return (
        <Grid size={{ xs: 12 }} key={fieldPath}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            {getCippTranslation(key)}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {Object.entries(value).map(([subKey, subValue]) =>
              renderFormField(subKey, subValue, fieldPath)
            )}
          </Grid>
        </Grid>
      );
    }

    // For other types (numbers, complex arrays, etc.), render as text field
    return (
      <Grid size={{ xs: 12, md: 6 }} key={fieldPath}>
        <CippFormComponent
          type="textField"
          label={getCippTranslation(key)}
          name={fieldPath}
          formControl={formControl}
        />
      </Grid>
    );
  };

  if (!templateData) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {/* Render priority fields first */}
      {priorityFields.map(fieldName => 
        templateData[fieldName] !== undefined && 
        renderFormField(fieldName, templateData[fieldName])
      )}

      {/* Render all other fields except priority fields */}
      {Object.entries(templateData)
        .filter(([key]) => !priorityFields.includes(key))
        .map(([key, value]) => renderFormField(key, value))}
    </Grid>
  );
};

export default CippTemplateFieldRenderer;