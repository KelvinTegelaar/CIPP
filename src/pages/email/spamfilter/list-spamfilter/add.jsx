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
      title="Add Spamfilter Rule"
      backButtonTitle="Spamfilter Overview"
      postUrl="/api/AddSpamFilter"
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

        {/* TemplateList */}
        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Select a template (optional)"
            name="TemplateList"
            formControl={formControl}
            multiple={false}
            api={{
              queryKey: `TemplateListSpamFilterTransport`,
              labelField: "name",
              valueField: (option) => option,
              url: "/api/ListSpamFilterTemplates",
            }}
            placeholder="Select a template or enter PowerShell JSON manually"
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Parameters (JSON)"
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
