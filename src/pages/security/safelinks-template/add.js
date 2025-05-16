import React, { useEffect } from "react";
import { Grid, Divider } from "@mui/material";
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
      TemplateList: null,
      PolicyConfig: "",
    },
  });
  
  const templateListVal = useWatch({ control: formControl.control, name: "TemplateList" });
  
  useEffect(() => {
    if (templateListVal?.value) {
      formControl.setValue("PolicyConfig", JSON.stringify(templateListVal?.value));
    }
  }, [templateListVal, formControl]);
  
  return (
    <CippFormPage
      formControl={formControl}
      queryKey="DeploySafeLinksPolicyTemplate"
      title="Deploy Safe Links Policy Template"
      backButtonTitle="Safe Links Policies Overview"
      postUrl="/api/AddSafeLinksPolicyFromTemplate"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
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
        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="autoComplete"
            label="Select a template"
            name="TemplateList"
            formControl={formControl}
            multiple={false}
            creatable={false} 
            api={{
              queryKey: `TemplateListSafeLinks`,
              labelField: "name",
              valueField: (option) => option,
              url: "/api/ListSafeLinksPolicyTemplates",
            }}
            placeholder="Select a template"
            validators={{ required: "A template must be selected" }}
          />
        </Grid>
        <Divider sx={{ my: 2, width: "100%" }} />
        <Grid item xs={12}>
          <CippFormComponent
            type="textField"
            label="Policy Configuration (JSON)"
            name="PolicyConfig"
            formControl={formControl}
            multiline
            rows={6}
            validators={{ required: "Please enter the policy configuration as JSON." }}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

DeploySafeLinksPolicyTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default DeploySafeLinksPolicyTemplate;