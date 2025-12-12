import React, { useEffect, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { ApiGetCall } from "/src/api/ApiCall";
import { getCippTranslation } from "/src/utils/get-cipp-translation";

const CippTemplateEditor = ({
  templateId,
  templateType,
  apiConfig,
  schemaConfig,
  blacklistConfig,
  priorityFields = [],
  title,
  backButtonTitle,
  customDataFormatter,
}) => {
  const [templateData, setTemplateData] = useState(null);

  // Default blacklist patterns that apply to all template types
  const defaultBlacklistPatterns = [
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

  // Combine default and custom blacklist patterns
  const blacklistedFields = [
    ...defaultBlacklistPatterns,
    ...(blacklistConfig?.patterns || []),
  ];

  const formControl = useForm({ mode: "onChange" });

  // Fetch the template data
  const templateQuery = ApiGetCall({
    url: `${apiConfig.fetchUrl}?${apiConfig.idParam}=${templateId}`,
    queryKey: `${templateType}-${templateId}`,
    enabled: !!templateId,
  });

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

  useEffect(() => {
    if (templateQuery.isSuccess && templateQuery.data) {
      // Find the template with matching ID
      const template = Array.isArray(templateQuery.data)
        ? templateQuery.data.find((t) => t[apiConfig.idParam] === templateId)
        : templateQuery.data;

      if (template) {
        setTemplateData(template);
        // Set form values excluding blacklisted fields
        const formValues = {};
        Object.keys(template).forEach((key) => {
          if (!isFieldBlacklisted(key)) {
            formValues[key] = template[key];
          }
        });
        formControl.reset(formValues);
      }
    }
  }, [templateQuery.isSuccess, templateQuery.data, templateId]);

  const renderFormField = (key, value, path = "") => {
    const fieldPath = path ? `${path}.${key}` : key;

    if (isFieldBlacklisted(key)) {
      return null;
    }

    // Check for custom schema handling
    const schemaField = schemaConfig?.fields?.[key.toLowerCase()];
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

    // Special handling for complex array fields (like LocationInfo and GroupInfo)
    if (schemaConfig?.complexArrayFields?.some(pattern => 
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

  const defaultDataFormatter = (values) => {
    return {
      [apiConfig.idParam]: templateId,
      ...values,
    };
  };

  if (templateQuery.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <CippFormSkeleton layout={[2, 1, 2, 2]} />
      </Box>
    );
  }

  if (templateQuery.isError || !templateData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading template or template not found.
        </Typography>
      </Box>
    );
  }

  return (
    <CippFormPage
      title={title || `Edit Template: ${templateData.displayName || "Unnamed Template"}`}
      formControl={formControl}
      queryKey={`${templateType}-${templateId}`}
      backButtonTitle={backButtonTitle || "Templates"}
      postUrl={apiConfig.updateUrl}
      customDataformatter={customDataFormatter || defaultDataFormatter}
      formPageType="Edit"
    >
      <Box sx={{ my: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Edit the properties of this template. Only editable properties are shown below.
        </Typography>

        <Grid container spacing={2}>
          {templateData && (
            <>
              {/* Render priority fields first */}
              {priorityFields.map(fieldName => 
                templateData[fieldName] !== undefined && 
                renderFormField(fieldName, templateData[fieldName])
              )}

              {/* Render all other fields except priority fields */}
              {Object.entries(templateData)
                .filter(([key]) => !priorityFields.includes(key))
                .map(([key, value]) => renderFormField(key, value))}
            </>
          )}
        </Grid>
      </Box>
    </CippFormPage>
  );
};

export default CippTemplateEditor;