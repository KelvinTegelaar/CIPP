import { Alert, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { ApiGetCall } from "/src/api/ApiCall";
import CippTemplateFieldRenderer from "/src/components/CippComponents/CippTemplateFieldRenderer";

const EditIntuneTemplate = () => {
  const router = useRouter();
  const { id } = router.query;
  const formControl = useForm({ mode: "onChange" });

  const templateQuery = ApiGetCall({
    url: `/api/ListIntuneTemplates?id=${id}`,
    queryKey: `IntuneTemplate-${id}`,
    enabled: !!id,
  });

  const templateData = Array.isArray(templateQuery.data)
    ? templateQuery.data.find((t) => t.id === id || t.GUID === id)
    : templateQuery.data;

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
              const originalValue = getOriginalValueByPath(templateData, originalKey);
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

    // Extract values from the entire form data and include id
    const processedValues = extractValues(values);

    return {
      id,
      ...processedValues,
    };
  };

  return (
    <CippFormPage
      title={`${templateData?.displayName || templateData?.name || templateData?.Displayname}`}
      formControl={formControl}
      queryKey={[`IntuneTemplate-${id}`, "IntuneTemplates", "Available Endpoint Manager"]}
      backButtonTitle="Intune Templates"
      postUrl="/api/ExecEditTemplate?type=IntuneTemplate"
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
            templateType="intune"
          />
        )}
      </Box>
    </CippFormPage>
  );
};

EditIntuneTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditIntuneTemplate;
