import React, { useEffect, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { ApiGetCall } from "/src/api/ApiCall";
import CippTemplateFieldRenderer from "/src/components/CippComponents/CippTemplateFieldRenderer";

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

  // Custom data formatter to only send changes
  const customDataFormatter = (values) => {
    console.log("=== CUSTOM DATA FORMATTER ===");

    if (!originalData) {
      console.log("No originalData, returning GUID only");
      return { GUID };
    }

    const changes = {};

    // Extract value from autoComplete objects and clean @odata properties
    const extractValue = (val) => {
      if (val && typeof val === "object" && val.hasOwnProperty("value")) {
        return val.value;
      }
      return val;
    };

    // Remove @odata properties that get added by form components
    const cleanODataProperties = (obj) => {
      if (!obj || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        return obj.map((item) => cleanODataProperties(item));
      }

      const cleaned = {};
      Object.keys(obj).forEach((key) => {
        // Skip @odata properties that are empty or just contain empty strings
        if (
          key.includes("@odata") &&
          (obj[key] === null ||
            obj[key] === undefined ||
            (typeof obj[key] === "object" && Object.values(obj[key]).every((v) => v === "")))
        ) {
          return;
        }
        cleaned[key] = cleanODataProperties(obj[key]);
      });

      return cleaned;
    };

    // Deep comparison function
    const isEqual = (a, b) => {
      // Extract values from autoComplete objects and clean @odata properties
      const valA = cleanODataProperties(extractValue(a));
      const valB = cleanODataProperties(extractValue(b));

      if (valA === valB) return true;
      if (valA == null || valB == null) return valA === valB;
      if (typeof valA !== typeof valB) return false;

      if (typeof valA === "object") {
        if (Array.isArray(valA) !== Array.isArray(valB)) return false;

        if (Array.isArray(valA)) {
          if (valA.length !== valB.length) return false;
          return valA.every((item, index) => isEqual(item, valB[index]));
        }

        const keysA = Object.keys(valA);
        const keysB = Object.keys(valB);
        if (keysA.length !== keysB.length) return false;

        return keysA.every((key) => isEqual(valA[key], valB[key]));
      }

      return false;
    };

    // Get the original value for comparison, handling nested paths
    const getOriginalValue = (path) => {
      const keys = path.split(".");
      let value = originalData;
      for (const key of keys) {
        if (value && typeof value === "object") {
          value = value[key];
        } else {
          return undefined;
        }
      }
      return value;
    };

    // Compare each field and only include changes
    Object.keys(values).forEach((key) => {
      const originalValue = getOriginalValue(key);
      const currentValue = values[key];

      console.log(`\n--- Comparing field: ${key} ---`);
      console.log("Original:", JSON.stringify(originalValue, null, 2));
      console.log("Current:", JSON.stringify(currentValue, null, 2));

      const areEqual = isEqual(currentValue, originalValue);
      console.log(`Are equal: ${areEqual}`);

      if (!areEqual) {
        console.log(`Field ${key} has changed - including in payload`);
        // Store the extracted value, not the autoComplete object
        changes[key] = extractValue(currentValue);
      } else {
        console.log(`Field ${key} unchanged - skipping`);
      }
    });

    const result = {
      GUID,
      ...changes,
    };

    console.log(`Sending ${Object.keys(changes).length} changed fields:`, Object.keys(changes));
    console.log("Final payload:", result);
    return result;
  };

  return (
    <CippFormPage
      title={` ${templateData?.displayName || "Unnamed Template"}`}
      formControl={formControl}
      queryKey={`CATemplate-${GUID}`}
      backButtonTitle="Conditional Access Templates"
      postUrl="/api/EditCATemplate"
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
