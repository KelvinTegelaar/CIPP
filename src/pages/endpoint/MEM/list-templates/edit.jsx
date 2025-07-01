import React from "react";
import { Box, Typography } from "@mui/material";
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

  const customDataFormatter = (values) => {
    return {
      id: id,
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

  if (templateQuery.isError || !templateQuery.data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading template or template not found.
        </Typography>
      </Box>
    );
  }

  const templateData = Array.isArray(templateQuery.data)
    ? templateQuery.data.find((t) => t.id === id)
    : templateQuery.data;

  if (!templateData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Template not found.</Typography>
      </Box>
    );
  }

  return (
    <CippFormPage
      title={`Edit Intune Template: ${templateData.displayName || "Unnamed Template"}`}
      formControl={formControl}
      queryKey={`IntuneTemplate-${id}`}
      backButtonTitle="Intune Templates"
      postUrl="/api/EditIntuneTemplate"
      customDataformatter={customDataFormatter}
      formPageType="Edit"
    >
      <Box sx={{ my: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Edit the properties of this Intune template. Only editable properties are shown below.
        </Typography>

        <CippTemplateFieldRenderer
          templateData={templateData}
          formControl={formControl}
          templateType="intune"
        />
      </Box>
    </CippFormPage>
  );
};

EditIntuneTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditIntuneTemplate;