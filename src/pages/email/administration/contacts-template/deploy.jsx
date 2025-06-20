import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";

const Page = () => {
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
      queryKey="DeplyContactTemplates"
      title="Deploy Contact Templates"
      backButtonTitle="Contact Templates"
      postUrl="/api/DeployContactTemplates"
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12 }}>
          <CippFormTenantSelector
            label="Select Tenants"
            formControl={formControl}
            name="selectedTenants"
            type="multiple"
            allTenants={true}
            validators={{ required: "At least one tenant must be selected" }}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* TemplateList */}
        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Select a template"
            name="TemplateList"
            formControl={formControl}
            multiple={true}
            api={{
              queryKey: `TemplateListConnectors`,
              labelField: "name",
              valueField: (option) => option,
              url: "/api/ListContactTemplates",
            }}
            placeholder="Select a template or enter PowerShell JSON manually"
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
