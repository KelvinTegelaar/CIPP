import React from "react";
import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormDomainSelector } from "/src/components/CippComponents/CippFormDomainSelector";
import { useSettings } from "/src/hooks/use-settings";

const AddRoomMailbox = () => {
  const tenantDomain = useSettings().currentTenant;
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      username: "",
      domain: null,
      resourceCapacity: "",
    },
  });

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="RoomMailbox-Add"
      title="Add Room Mailbox"
      backButtonTitle="Room Mailboxes Overview"
      postUrl="/api/AddRoomMailbox"
      customDataformatter={(values) => {
        const shippedValues = {
          tenantID: tenantDomain,
          domain: values.domain?.value,
          displayName: values.displayName.trim(),
          username: values.username.trim(),
          userPrincipalName: values.username.trim() + "@" + (values.domain?.value || "").trim(),
        };

        if (values.resourceCapacity && values.resourceCapacity.trim() !== "") {
          shippedValues.resourceCapacity = values.resourceCapacity.trim();
        }

        return shippedValues;
      }}
    >
      <Grid container spacing={2}>
        {/* Display Name */}
        <Grid size={{ md: 8, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Username and Domain */}
        <Grid size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Username"
            name="username"
            formControl={formControl}
            validators={{ required: "Username is required" }}
          />
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <CippFormDomainSelector
            formControl={formControl}
            name="domain"
            label="Primary Domain name"
            validators={{ required: "Please select a domain" }}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Resource Capacity (Optional) */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Resource Capacity (Optional)"
            name="resourceCapacity"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddRoomMailbox.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddRoomMailbox;
