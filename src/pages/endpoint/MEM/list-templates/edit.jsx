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

  const templateData = Array.isArray(templateQuery.data)
    ? templateQuery.data.find((t) => t.id === id)
    : templateQuery.data;

  return (
    <CippFormPage
      title={`${templateData?.displayName || templateData?.name || templateData?.Displayname}`}
      formControl={formControl}
      queryKey={`IntuneTemplate-${id}`}
      backButtonTitle="Intune Templates"
      postUrl="/api/EditIntuneTemplate"
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
