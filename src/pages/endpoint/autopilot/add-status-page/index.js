import React from "react";
import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      TimeOutInMinutes: "",
      ErrorMessage: "",
      ShowProgress: false,
      EnableLog: false,
      OBEEOnly: false,
      blockDevice: false,
      Allowretry: false,
      AllowReset: false,
      AllowFail: false,
    },
  });

  return (
    <CippFormPage
      resetForm={false}
      queryKey="Autopilot Status Pages"
      title="Autopilot Status Page Wizard"
      formControl={formControl}
      postUrl="/api/AddEnrollment"
      backButtonTitle="Autopilot Status Pages"
    >
      <Grid container spacing={2}>
        {/* Tenant Selector */}
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

        <Divider sx={{ my: 2 }} />

        {/* Form Fields */}
        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Timeout in minutes"
            name="TimeOutInMinutes"
            formControl={formControl}
            placeholder="60"
            validators={{ required: "Timeout is required" }}
          />
        </Grid>

        <Grid item size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Custom Error Message"
            name="ErrorMessage"
            formControl={formControl}
            placeholder="Leave blank to not set."
          />
        </Grid>

        {/* Switches */}
        <Grid item size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Show progress to users"
            name="ShowProgress"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Turn on log collection"
            name="EnableLog"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Show status page only with OOBE setup"
            name="OBEEOnly"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Block device usage during setup"
            name="blockDevice"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Allow retry"
            name="Allowretry"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Allow reset"
            name="AllowReset"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Allow users to use device if setup fails"
            name="AllowFail"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
