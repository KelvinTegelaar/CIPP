import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

const CippAddIntuneReusableSettingTemplateForm = ({ formControl }) => {
  return (
    <Grid container spacing={2}>
      <CippFormComponent type="hidden" name="GUID" formControl={formControl} />

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Display Name"
          name="displayName"
          required
          formControl={formControl}
          validators={{ required: "Display Name is required" }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Description"
          name="description"
          formControl={formControl}
        />
      </Grid>

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Package (optional)"
          name="package"
          formControl={formControl}
          helperText="Optional metadata to group templates (e.g., internal package name)."
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="json"
          label="Raw JSON"
          name="rawJSON"
          formControl={formControl}
          required
          validators={{ required: "Raw JSON is required" }}
          helperText="Paste the reusablePolicySetting payload (Graph beta: deviceManagement/reusablePolicySettings)."
          rows={12}
        />
      </Grid>
    </Grid>
  );
};

export default CippAddIntuneReusableSettingTemplateForm;
