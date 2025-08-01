import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import languageList from "/src/data/languageList.json";

const AutopilotProfileForm = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      DisplayName: "",
      Description: "",
      DeviceNameTemplate: "",
      languages: null,
      CollectHash: true,
      Assignto: true,
      DeploymentMode: true,
      HideTerms: true,
      HidePrivacy: true,
      HideChangeAccount: true,
      NotLocalAdmin: true,
      allowWhiteglove: true,
      Autokeyboard: true,
    },
  });

  return (
    <CippFormPage
      resetForm={false}
      queryKey="Autopilot Profiles"
      title="Autopilot Profile Wizard"
      formControl={formControl}
      postUrl="/api/AddAutopilotConfig"
      backButtonTitle="Autopilot Profiles"
    >
      <Grid container spacing={2}>
        {/* Tenant Selector */}
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

        <Divider sx={{ my: 2 }} />

        {/* Form Fields */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="DisplayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Language"
            name="languages"
            options={languageList.map(({ language, tag, "Geographic area": geographicArea }) => ({
              value: tag,
              label: `${language} - ${geographicArea}`, // Format as "language - geographic area" for display
            }))}
            formControl={formControl}
            multiple={false}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Description"
            name="Description"
            formControl={formControl}
            placeholder="Leave blank for none"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Unique Name Template"
            name="DeviceNameTemplate"
            formControl={formControl}
            placeholder="Leave blank for none"
          />
        </Grid>

        {/* Switches */}
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Convert all targeted devices to Autopilot"
            name="CollectHash"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Assign to all devices"
            name="Assignto"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Self-deploying mode"
            name="DeploymentMode"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Hide Terms and conditions"
            name="HideTerms"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Hide Privacy Settings"
            name="HidePrivacy"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Hide Change Account Options"
            name="HideChangeAccount"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Setup user as standard user (Leave unchecked to setup user as local admin)"
            name="NotLocalAdmin"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Allow White Glove OOBE"
            name="allowWhiteglove"
            formControl={formControl}
          />
          <CippFormComponent
            type="switch"
            label="Automatically configure keyboard"
            name="Autokeyboard"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AutopilotProfileForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AutopilotProfileForm;
