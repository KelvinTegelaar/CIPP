import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
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
      resetForm={true}
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
        <Grid size={{ md: 10, xs: 12 }}>
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
        <Grid size={{ md: 6, xs: 6 }}>
          <CippFormComponent
            type="textField"
            label="username"
            name="username"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 6, xs: 6 }}>
          <CippFormDomainSelector formControl={formControl} name="domain" label="Domain" required />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddContact.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddContact;
