import { useEffect } from "react";
import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";

const DeploySafeLinksPolicyTemplate = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      selectedTenants: [],
      TemplateList: [],
    },
  });

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="DeploySafeLinksPolicyTemplate"
      title="Deploy Safe Links Policy Template"
      backButtonTitle="Safe Links Policies Overview"
      postUrl="/api/AddSafeLinksPolicyFromTemplate"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CippFormTenantSelector
            label="Select Tenants"
            formControl={formControl}
            name="selectedTenants"
            type="multiple"
            allTenants={true}
            preselectedEnabled={true}
            validators={{ required: "At least one tenant must be selected" }}
          />
        </Grid>
        <Divider sx={{ my: 2, width: "100%" }} />
        <Grid size={{ xs: 12, md: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Select a template"
            name="TemplateList"
            formControl={formControl}
            multiple={true}
            creatable={false}
            api={{
              queryKey: `TemplateListSafeLinks`,
              labelField: "TemplateName",
              valueField: (option) => option,
              url: "/api/ListSafeLinksPolicyTemplates",
            }}
            placeholder="Select a template"
            validators={{ required: "A template must be selected" }}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

DeploySafeLinksPolicyTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default DeploySafeLinksPolicyTemplate;
