import React from "react";
import { Typography, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { getCippTranslation } from "/src/utils/get-cipp-translation";
import intuneCollection from "/src/data/intuneCollection.json";

const CippTemplateFieldRenderer = ({
  templateData,
  formControl,
  templateType = "conditionalAccess",
}) => {
  // Default blacklisted fields with wildcard support
  const defaultBlacklistedFields = [
    "id",
    "isAssigned",
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
      priorityFields: ["displayName", "state", "DisplayName", "Name", "displayname"],
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
            {
              label: "Primary and Secondary Authentication",
              value: "primaryAndSecondaryAuthentication",
            },
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
        "RAWJson", // Handle RAWJson specially
      ],
      priorityFields: ["displayName", "description", "DisplayName", "Name", "displayname"],
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
        // Common device policy enum values
        applicationguardenabledoptions: {
          multiple: false,
          options: [
            { label: "Not Configured", value: "notConfigured" },
            { label: "Enabled for Edge", value: "enabledForEdge" },
            { label: "Enabled for Office", value: "enabledForOffice" },
            { label: "Enabled for Edge and Office", value: "enabledForEdgeAndOffice" },
          ],
        },
        firewallcertificaterevocationlistcheckmethod: {
          multiple: false,
          options: [
            { label: "Device Default", value: "deviceDefault" },
            { label: "None", value: "none" },
            { label: "Attempt", value: "attempt" },
            { label: "Require", value: "require" },
          ],
        },
        firewallpacketqueueingmethod: {
          multiple: false,
          options: [
            { label: "Device Default", value: "deviceDefault" },
            { label: "Disabled", value: "disabled" },
            { label: "Queue Inbound", value: "queueInbound" },
            { label: "Queue Outbound", value: "queueOutbound" },
            { label: "Queue Both", value: "queueBoth" },
          ],
        },
        startupmode: {
          multiple: false,
          options: [
            { label: "Manual", value: "manual" },
            { label: "Automatic", value: "automatic" },
            { label: "Disabled", value: "disabled" },
          ],
        },
        applicationguardblockclipboardsharing: {
          multiple: false,
          options: [
            { label: "Not Configured", value: "notConfigured" },
            { label: "Block Both", value: "blockBoth" },
            { label: "Block Host to Container", value: "blockHostToContainer" },
            { label: "Block Container to Host", value: "blockContainerToHost" },
            { label: "Block None", value: "blockNone" },
          ],
        },
        bitlockerrecoverypasswordrotation: {
          multiple: false,
          options: [
            { label: "Not Configured", value: "notConfigured" },
            { label: "Disabled", value: "disabled" },
            { label: "Enabled for Azure AD Joined", value: "enabledForAzureAd" },
            {
              label: "Enabled for Azure AD and Hybrid Joined",
              value: "enabledForAzureAdAndHybrid",
            },
          ],
        },
        bitlockerprebootrecoverymsgurloption: {
          multiple: false,
          options: [
            { label: "Default", value: "default" },
            { label: "Use Custom", value: "useCustom" },
            { label: "No URL", value: "noUrl" },
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
    return blacklistedFields.some((pattern) => {
      if (pattern.includes("*")) {
        // Convert wildcard pattern to regex
        const regexPattern = pattern.replace(/\*/g, ".*").replace(/\./g, "\\.");
        const regex = new RegExp(`^${regexPattern}$`, "i");
        return regex.test(fieldName);
      }
      return pattern === fieldName;
    });
  };

  // Parse RAWJson for Intune templates
  const parseIntuneRawJson = (templateData) => {
    if (templateType === "intune" && templateData.RAWJson) {
      try {
        const parsedJson = JSON.parse(templateData.RAWJson);
        return {
          ...templateData,
          parsedRAWJson: parsedJson,
        };
      } catch (error) {
        console.warn("Failed to parse RAWJson:", error);
        return templateData;
      }
    }
    return templateData;
  };

  // Reset form with filtered values when templateData changes
  React.useEffect(() => {
    if (templateData && formControl) {
      const processedData = parseIntuneRawJson(templateData);
      const formValues = {};

      Object.keys(processedData).forEach((key) => {
        if (!isFieldBlacklisted(key)) {
          formValues[key] = processedData[key];
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

    // Special handling for Intune RAWJson structure
    if (templateType === "intune" && key === "parsedRAWJson" && value) {
      // Check if this is a classic policy (has 'added' array) - these are not editable
      if (value.added) {
        return (
          <Grid size={{ xs: 12 }} key={fieldPath}>
            <Typography variant="body1" sx={{ fontStyle: "italic" }}>
              This is a legacy policy and the settings cannot be edited through the form interface.
            </Typography>
          </Grid>
        );
      }

      // Handle modern policies with settings array
      if (value.settings && Array.isArray(value.settings)) {
        return (
          <Grid size={{ xs: 12 }} key={fieldPath}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Policy Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {value.settings.map((setting, index) => {
                const settingInstance = setting.settingInstance;
                if (!settingInstance) return null;

                // Handle different setting types
                if (settingInstance.choiceSettingValue) {
                  // Find the setting definition in the intune collection
                  const intuneObj = intuneCollection.find(
                    (item) => item.id === settingInstance.settingDefinitionId
                  );

                  const label = intuneObj?.displayName || `Setting ${index + 1}`;
                  const options =
                    intuneObj?.options?.map((option) => ({
                      label: option.displayName || option.id,
                      value: option.id,
                    })) || [];

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={`setting-${index}`}>
                      <CippFormComponent
                        type="autoComplete"
                        label={label}
                        name={`${fieldPath}.settings.${index}.settingInstance.choiceSettingValue.value`}
                        formControl={formControl}
                        options={options}
                        multiple={false}
                        helperText={`Definition ID: ${settingInstance.settingDefinitionId}`}
                      />
                    </Grid>
                  );
                }

                if (settingInstance.simpleSettingValue) {
                  // Find the setting definition in the intune collection
                  const intuneObj = intuneCollection.find(
                    (item) => item.id === settingInstance.settingDefinitionId
                  );

                  const label = intuneObj?.displayName || `Setting ${index + 1}`;

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={`setting-${index}`}>
                      <CippFormComponent
                        type="textField"
                        label={label}
                        name={`${fieldPath}.settings.${index}.settingInstance.simpleSettingValue.value`}
                        formControl={formControl}
                        helperText={`Definition ID: ${settingInstance.settingDefinitionId}`}
                        includeSystemVariables={true}
                      />
                    </Grid>
                  );
                }

                // Handle group setting collections
                if (settingInstance.groupSettingCollectionValue) {
                  // Find the setting definition in the intune collection
                  const intuneObj = intuneCollection.find(
                    (item) => item.id === settingInstance.settingDefinitionId
                  );

                  const label = intuneObj?.displayName || `Group Setting Collection ${index + 1}`;

                  return (
                    <Grid size={{ xs: 12 }} key={`setting-${index}`}>
                      <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                        {label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        Definition ID: {settingInstance.settingDefinitionId}
                      </Typography>
                      {/* Group collections are complex - show as read-only for now */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Complex group setting collection - view in JSON mode for details
                      </Typography>
                    </Grid>
                  );
                }

                return null;
              })}
            </Grid>
          </Grid>
        );
      }

      // Handle OMA settings
      if (value.omaSettings && Array.isArray(value.omaSettings)) {
        return (
          <Grid size={{ xs: 12 }} key={fieldPath}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              OMA Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {value.omaSettings.map((omaSetting, index) => (
                <Grid size={{ xs: 12 }} key={`oma-${index}`}>
                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                    {omaSetting.displayName || `OMA Setting ${index + 1}`}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CippFormComponent
                        type="textField"
                        label="OMA URI"
                        name={`${fieldPath}.omaSettings.${index}.omaUri`}
                        formControl={formControl}
                        disabled={true}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CippFormComponent
                        type="textField"
                        label="Value"
                        name={`${fieldPath}.omaSettings.${index}.value`}
                        formControl={formControl}
                        includeSystemVariables={true}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        );
      }

      // Handle device policies (direct configuration properties)
      if (!value.settings && !value.omaSettings && !value.added) {
        return (
          <Grid size={{ xs: 12 }} key={fieldPath}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Device Policy Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Object.entries(value)
                .filter(([deviceKey]) => !isFieldBlacklisted(deviceKey))
                .map(([deviceKey, deviceValue]) =>
                  renderFormField(deviceKey, deviceValue, fieldPath)
                )}
            </Grid>
          </Grid>
        );
      }

      // Fallback for other RAWJson structures
      return (
        <Grid size={{ xs: 12 }} key={fieldPath}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Policy Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            This policy structure is not supported for editing.
          </Typography>
        </Grid>
      );
    }

    // Special handling for complex array fields
    if (complexArrayFields.some((pattern) => key.toLowerCase().includes(pattern.toLowerCase()))) {
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
                            includeSystemVariables={true}
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
            type="autoComplete"
            label={getCippTranslation(key)}
            name={fieldPath}
            formControl={formControl}
            options={[
              { label: "True", value: true },
              { label: "False", value: false },
            ]}
            multiple={false}
          />
        </Grid>
      );
    }

    if (typeof value === "string") {
      const alwaysTextFields = [
        "displayname",
        "displayName",
        "name",
        "description",
        "identity",
        "title",
      ];

      const isAlwaysTextField = alwaysTextFields.some(
        (field) => key.toLowerCase() === field.toLowerCase()
      );

      // Check if this looks like an enum value (common patterns in device policies)
      const enumPatterns = [
        "notConfigured",
        "deviceDefault",
        "manual",
        "automatic",
        "disabled",
        "enabled",
        "blocked",
        "allowed",
        "required",
        "none",
        "lockWorkstation",
      ];

      const looksLikeEnum = enumPatterns.some((pattern) =>
        value.toLowerCase().includes(pattern.toLowerCase())
      );

      if (!isAlwaysTextField && looksLikeEnum) {
        // Create basic options based on common patterns
        const commonOptions = [
          { label: "Not Configured", value: "notConfigured" },
          { label: "Device Default", value: "deviceDefault" },
          { label: "Manual", value: "manual" },
          { label: "Automatic", value: "automatic" },
          { label: "Disabled", value: "disabled" },
          { label: "Enabled", value: "enabled" },
          { label: "Blocked", value: "blocked" },
          { label: "Allowed", value: "allowed" },
          { label: "Required", value: "required" },
          { label: "None", value: "none" },
        ].filter(
          (option) =>
            // Only include options that make sense for this field
            option.value === value ||
            key.toLowerCase().includes(option.value.toLowerCase()) ||
            option.value === "notConfigured" // Always include notConfigured
        );

        return (
          <Grid size={{ xs: 12, md: 6 }} key={fieldPath}>
            <CippFormComponent
              type="autoComplete"
              label={getCippTranslation(key)}
              name={fieldPath}
              formControl={formControl}
              options={commonOptions}
              multiple={false}
              creatable={true}
            />
          </Grid>
        );
      }

      return (
        <Grid size={{ xs: 12, md: 6 }} key={fieldPath}>
          <CippFormComponent
            type="textField"
            label={getCippTranslation(key)}
            name={fieldPath}
            formControl={formControl}
            includeSystemVariables={true}
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
          includeSystemVariables={true}
        />
      </Grid>
    );
  };

  if (!templateData) {
    return null;
  }

  // Process template data (parse RAWJson for Intune templates)
  const processedData = parseIntuneRawJson(templateData);

  return (
    <Grid container spacing={2}>
      {/* Render priority fields first */}
      {priorityFields.map(
        (fieldName) =>
          processedData[fieldName] !== undefined &&
          renderFormField(fieldName, processedData[fieldName])
      )}

      {/* Render all other fields except priority fields */}
      {Object.entries(processedData)
        .filter(([key]) => !priorityFields.includes(key))
        .map(([key, value]) => renderFormField(key, value))}
    </Grid>
  );
};

export default CippTemplateFieldRenderer;
