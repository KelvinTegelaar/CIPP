import React from "react";
import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import { useSettings } from "../../../../hooks/use-settings";

const TeamsAddTeamForm = () => {
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      description: "",
      owner: null,
      visibility: "public",
    },
  });

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="Teams-AddTeam"
      title="Add Team"
      backButtonTitle="Teams Overview"
      postUrl="/api/AddTeam"
      resetForm={true}
      customDataformatter={(values) => {
        const shippedValues = {
          tenantID: tenantDomain,
          displayName: values.displayName,
          description: values.description,
          owner: values.owner?.value, // owner from user selector
          visibility: values.visibility,
        };
        return shippedValues;
      }}
    >
      <Grid container spacing={2}>
        {/* Display Name */}
        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        {/* Description */}
        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Description"
            name="description"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />
        <Grid item size={{ xs: 12 }}>
          <CippFormUserSelector
            formControl={formControl}
            name="owner"
            label="Select owner (must have a Teams license)"
            multiple={false}
            validators={{ required: "Please select an owner" }}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Visibility */}
        <Grid item size={{ xs: 12 }}>
          <CippFormComponent
            type="radio"
            name="visibility"
            label="Team Visibility"
            formControl={formControl}
            options={[
              { label: "Public Team", value: "public" },
              { label: "Private Team", value: "private" },
            ]}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

TeamsAddTeamForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default TeamsAddTeamForm;
