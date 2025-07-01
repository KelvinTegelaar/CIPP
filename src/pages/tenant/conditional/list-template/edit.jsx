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
      }
    }
  }, [templateQuery.isSuccess, templateQuery.data, GUID]);

  return (
    <CippFormPage
      title={`Edit Template: ${templateData?.displayName || "Unnamed Template"}`}
      formControl={formControl}
      queryKey={`CATemplate-${GUID}`}
      backButtonTitle="Conditional Access Templates"
      postUrl="/api/EditCATemplate"
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
