import React from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippCAPolicyBuilder, { extractCAPolicyJSON } from "../../../../components/CippComponents/CippCAPolicyBuilder";

const CreateCATemplate = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      state: { label: "Report-only", value: "enabledForReportingButNotEnforced" },
    },
  });

  const customDataFormatter = (values) => {
    return extractCAPolicyJSON(values);
  };

  return (
    <CippFormPage
      title="Create CA Template"
      formControl={formControl}
      queryKey={["CATemplates"]}
      backButtonTitle="Conditional Access Templates"
      postUrl="/api/ExecCreateCATemplate"
      customDataformatter={customDataFormatter}
      formPageType="Add"
    >
      <Box sx={{ my: 2 }}>
        <CippCAPolicyBuilder formControl={formControl} />
      </Box>
    </CippFormPage>
  );
};

CreateCATemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CreateCATemplate;
