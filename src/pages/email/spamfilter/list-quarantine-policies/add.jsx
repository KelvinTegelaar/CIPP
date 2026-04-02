import { useEffect } from "react";
import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "../../../../components/CippComponents/CippFormTenantSelector";

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

  // Watch the value of QuarantineNotification
  const quarantineNotification = useWatch({
    control: formControl.control,
    name: "QuarantineNotification",
  });

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="AddQuarantinePolicy"
      title="Quarantine Policy"
      backButtonTitle="Overview"
      postUrl="/api/AddQuarantinePolicy"
    >
      <Grid container spacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid xs={12}>
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

        {/* <Divider sx={{ my: 2, width: "100%" }} /> */}

        {/* TemplateList, can be added later. But did not seem necessary with so few settings */}
        {/* <Grid xs={12} md={12}>
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
        </Grid> */}

        <Divider sx={{ my: 2, width: "100%" }} />
        <Grid xs={6}>
          <CippFormComponent
            type="textField"
            label="Policy Name"
            name="Name"
            placeholder="Enter policy name"
            formControl={formControl}
            required={true}
          />
          <Divider sx={{ my: 2, width: "100%" }} />
          <CippFormComponent
            type="autoComplete"
            label="Release Action Preference"
            name="ReleaseActionPreference"
            placeholder="Select release action preference"
            formControl={formControl}
            required={true}
            multiple={false}
            options={[
              { label: "Release", value: "Release" },
              { label: "Request Release", value: "RequestRelease" },
            ]}
          />
        </Grid>

        <Grid xs={2}>
          <CippFormComponent type="switch" label="Delete" name="Delete" formControl={formControl} />
          <CippFormComponent
            type="switch"
            label="Preview"
            name="Preview"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Block Sender"
            name="BlockSender"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Allow Sender"
            name="AllowSender"
            formControl={formControl}
          />
        </Grid>
        <Grid xs={4}>
          <CippFormComponent
            type="switch"
            label="Quarantine Notification"
            name="QuarantineNotification"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Include Messages From Blocked Sender Address"
            name="IncludeMessagesFromBlockedSenderAddress"
            formControl={formControl}
            disabled={!quarantineNotification}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddPolicy.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddPolicy;
