import { useEffect } from "react";
import "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";

const CippAddAssignmentFilterTemplateForm = (props) => {
  const { formControl } = props;

  useEffect(() => {
    const subscription = formControl.watch((value, { name, type }) => {});
    return () => subscription.unsubscribe();
  }, [formControl]);

  return (
    <Grid container spacing={2}>
      {/* Hidden field to store the template GUID when editing */}
      <CippFormComponent type="hidden" name="GUID" formControl={formControl} />

      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Display Name"
          name="displayName"
          required
          formControl={formControl}
          fullWidth
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Description"
          name="description"
          formControl={formControl}
          fullWidth
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          name="platform"
          label="Platform"
          formControl={formControl}
          required
          options={[
            { label: "Windows 10 and Later", value: "windows10AndLater" },
            { label: "iOS", value: "iOS" },
            { label: "Android", value: "android" },
            { label: "macOS", value: "macOS" },
            { label: "Android Work Profile", value: "androidWorkProfile" },
            { label: "Android AOSP", value: "androidAOSP" },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          name="assignmentFilterManagementType"
          label="Filter Type"
          formControl={formControl}
          options={[
            { label: "Devices", value: "devices" },
            { label: "Apps", value: "apps" },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Filter Rule"
          name="rule"
          formControl={formControl}
          placeholder='Enter filter rule syntax (e.g., (device.deviceName -eq "Test Device"))'
          helperText={
            <>
              Enter the filter rule using Intune filter syntax. See{" "}
              <a
                href="https://learn.microsoft.com/en-us/mem/intune/fundamentals/filters-device-properties"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft documentation
              </a>{" "}
              for supported properties and operators.
            </>
          }
          required
          multiline
          rows={6}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default CippAddAssignmentFilterTemplateForm;
