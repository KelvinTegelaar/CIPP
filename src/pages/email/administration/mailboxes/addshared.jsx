import React from "react";
import { Grid, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";
import { CippFormDomainSelector } from "../../../../components/CippComponents/CippFormDomainSelector";

const AddContact = () => {
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      firstName: "",
      lastName: "",
      email: "",
      hidefromGAL: false,
    },
  });

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="AddSharedMailbox"
      title="Shared Mailbox"
      backButtonTitle="Mailbox Overview"
      postUrl="/api/AddSharedMailbox"
      customDataformatter={(values) => {
        return {
          tenantID: tenantDomain,
          displayName: values.displayName,
          username: values.username,
          domain: values.domain?.value,
        };
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={10}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Email */}
        <Grid item xs={6} md={6}>
          <CippFormComponent
            type="textField"
            label="username"
            name="username"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={6} md={6}>
          <CippFormDomainSelector formControl={formControl} name="domain" label="Domain" required />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddContact.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddContact;
