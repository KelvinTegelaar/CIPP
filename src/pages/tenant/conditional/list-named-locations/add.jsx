import React from "react";
import { Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import countryList from "/src/data/countryList.json";

const DeployNamedLocationForm = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      Type: "Countries",
      Trusted: false,
      includeUnknownCountriesAndRegions: false,
    },
  });

  return (
    <CippFormPage
      title="Add Conditional Access Named Location"
      formControl={formControl}
      queryKey="AddNamedLocation"
      backButtonTitle="Named Locations"
      postUrl="/api/AddNamedLocation"
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add Conditional Access Named Location
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CippFormTenantSelector
            label="Select Tenants"
            formControl={formControl}
            name="selectedTenants"
            type="multiple"
            preselectedEnabled={true}
            validators={{ required: "At least one tenant must be selected" }}
            allTenants={true}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Named Location Name"
            name="policyname"
            formControl={formControl}
            validators={{ required: "Policy name is required" }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="radio"
            label="Type of Location"
            name="Type"
            row
            options={[
              { label: "Countries Location", value: "Countries" },
              { label: "IP Location", value: "IPLocation" },
            ]}
            formControl={formControl}
            validators={{ required: "Type is required" }}
          />
        </Grid>

        {/* Conditional Fields for Type: IPLocation */}
        <CippFormCondition
          formControl={formControl}
          field="Type"
          compareType="is"
          compareValue="IPLocation"
        >
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="IPs"
              name="IPs"
              formControl={formControl}
              multiline
              rows={4}
              placeholder="Enter the IPs to add to this named location, one per line, in CIDR format e.g.: 111.111.111.111/24"
              validators={{ required: "IPs are required" }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Mark as trusted location"
              name="Trusted"
              formControl={formControl}
            />
          </Grid>
        </CippFormCondition>

        {/* Conditional Fields for Type: Countries */}
        <CippFormCondition
          formControl={formControl}
          field="Type"
          compareType="is"
          compareValue="Countries"
        >
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Countries"
              name="Countries"
              multiple={true}
              options={countryList.map(({ Code, Name }) => ({
                value: Code,
                label: Name,
              }))}
              formControl={formControl}
              validators={{ required: "At least one country must be selected" }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Include unknown countries and regions"
              name="includeUnknownCountriesAndRegions"
              formControl={formControl}
            />
          </Grid>
        </CippFormCondition>
      </Grid>
    </CippFormPage>
  );
};

DeployNamedLocationForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default DeployNamedLocationForm;
