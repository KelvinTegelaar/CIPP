import React, { useEffect, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import { ApiGetCall } from "../../../../api/ApiCall";
import CippTemplateFieldRenderer from "../../../../components/CippComponents/CippTemplateFieldRenderer";

const EditCATemplate = () => {
  const router = useRouter();
  const { GUID } = router.query;
  const [templateData, setTemplateData] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const formControl = useForm({ mode: "onChange" });

  // Fetch the template data
  const templateQuery = ApiGetCall({
    url: `/api/ListCATemplates?GUID=${GUID}`,
    queryKey: `CATemplate-${GUID}`,
    enabled: !!GUID,
  });

  useEffect(() => {
    if (templateQuery.isSuccess && templateQuery.data) {
      // Find the template with matching GUID
      const template = Array.isArray(templateQuery.data)
        ? templateQuery.data.find((t) => t.GUID === GUID)
        : templateQuery.data;

      if (template) {
        setTemplateData(template);
        setOriginalData(template);
      }
    }
  }, [templateQuery.isSuccess, templateQuery.data, GUID]);

  // Custom data formatter to convert autoComplete objects to values
  const customDataFormatter = (values) => {
    // Recursively extract values from autoComplete objects and fix @odata issues
    const extractValues = (obj) => {
      if (!obj) return obj;

      // If this is an autoComplete object with label/value, return just the value
      if (
        obj &&
        typeof obj === "object" &&
        obj.hasOwnProperty("value") &&
        obj.hasOwnProperty("label")
      ) {
        return obj.value;
      }

      // If it's an array, process each item
      if (Array.isArray(obj)) {
        return obj.map((item) => extractValues(item));
      }

      // If it's an object, process each property
      if (typeof obj === "object") {
        const result = {};
        Object.keys(obj).forEach((key) => {
          const value = extractValues(obj[key]);

          // Handle @odata objects created by React Hook Form's dot notation interpretation
          if (key.endsWith("@odata") && value && typeof value === "object") {
            // Convert @odata objects back to dot notation properties
            Object.keys(value).forEach((odataKey) => {
              // Always try to restore the original @odata property, regardless of form value
              const baseKey = key.replace("@odata", "");
              const originalKey = `${baseKey}@odata.${odataKey}`;
              const originalValue = getOriginalValueByPath(originalData, originalKey);
              if (originalValue !== undefined) {
                result[originalKey] = originalValue;
              }
            });
          } else {
            result[key] = value;
          }
        });
        return result;
      }

      // For primitive values, return as-is
      return obj;
    };

    // Helper function to get original value by dot-notation path
    const getOriginalValueByPath = (obj, path) => {
      const keys = path.split(".");
      let current = obj;
      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          return undefined;
        }
      }
      return current;
    };

    // Extract values from the entire form data and include GUID
    const processedValues = extractValues(values);

    return {
      GUID,
      ...processedValues,
    };
  };

  return (
    <CippFormPage
      title={` ${templateData?.displayName || "Unnamed Template"}`}
      formControl={formControl}
      queryKey={[`CATemplate-${GUID}`, "CATemplates"]}
      backButtonTitle="Conditional Access Templates"
      postUrl="/api/ExecEditTemplate?type=CATemplate"
      customDataformatter={customDataFormatter}
      formPageType="Edit"
    >
      <Box sx={{ my: 2 }}>
        {templateQuery.isLoading ? (
          <CippFormSkeleton layout={[2, 1, 2, 2]} />
        ) : templateQuery.isError || !templateData ? (
          <Alert severity="error">Error loading template or template not found.</Alert>
        ) : (
          <CippTemplateFieldRenderer
            templateData={templateData}
            formControl={formControl}
            templateType="conditionalAccess"
          />
        )}
      </Box>
    </CippFormPage>
  );
};

EditCATemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditCATemplate;
