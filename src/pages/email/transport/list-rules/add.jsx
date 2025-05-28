import React, { useEffect } from "react";
import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";

const AddPolicy = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      selectedTenants: [],
      TemplateList: null,
      PowerShellCommand: "",
    },
  });

  const templateListVal = useWatch({ control: formControl.control, name: "TemplateList" });

  useEffect(() => {
    if (templateListVal?.value) {
      formControl.setValue("PowerShellCommand", JSON.stringify(templateListVal?.value));
    }
  }, [templateListVal, formControl]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="AddTransportRule"
      title="Add Transport Rule"
      backButtonTitle="Transport Rules Overview"
      postUrl="/api/AddTransportRule"
    >
      <Grid container spacing={2}>
        <Grid item size={{ xs: 12 }}>
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
        <Grid item size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Select a template (optional)"
            name="TemplateList"
            formControl={formControl}
            multiple={false}
            api={{
              queryKey: `TemplateListTransport`,
              labelField: "name",
              valueField: (option) => option,
              url: "/api/ListTransportRulesTemplates",
            }}
            placeholder="Select a template or enter PowerShell JSON manually"
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        <Grid item size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="New-TransportRule parameters (JSON)"
            name="PowerShellCommand"
            formControl={formControl}
            multiline
            rows={6}
            validators={{ required: "Please enter the PowerShell parameters as JSON." }}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddPolicy.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddPolicy;
