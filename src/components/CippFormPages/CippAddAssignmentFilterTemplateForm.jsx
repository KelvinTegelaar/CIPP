import "@mui/material";
import { Grid } from "@mui/system";
import { useWatch } from "react-hook-form";
import CippFormComponent from "../CippComponents/CippFormComponent";

const DEVICE_PLATFORM_OPTIONS = [
  { label: "Windows 10 and later", value: "windows10AndLater" },
  { label: "iOS", value: "iOS" },
  { label: "macOS", value: "macOS" },
  { label: "Android Enterprise", value: "androidForWork" },
  { label: "Android device administrator", value: "android" },
  { label: "Android Work Profile", value: "androidWorkProfile" },
  { label: "Android (AOSP)", value: "androidAOSP" },
];

const APP_PLATFORM_OPTIONS = [
  { label: "Windows", value: "windowsMobileApplicationManagement" },
  { label: "Android", value: "androidMobileApplicationManagement" },
  { label: "iOS/iPadOS", value: "iOSMobileApplicationManagement" },
];

const CippAddAssignmentFilterTemplateForm = (props) => {
  const { formControl } = props;

  const assignmentFilterManagementType =
    useWatch({
      control: formControl?.control ?? formControl,
      name: "assignmentFilterManagementType",
      defaultValue: "devices",
    }) ?? "devices";
  const platformOptions =
    assignmentFilterManagementType === "apps" ? APP_PLATFORM_OPTIONS : DEVICE_PLATFORM_OPTIONS;

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
          validators={{ required: "Display Name is required" }}
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
          name="assignmentFilterManagementType"
          label="Filter Type"
          formControl={formControl}
          validators={{ required: "Filter Type is required" }}
          options={[
            { label: "Devices", value: "devices" },
            { label: "Apps", value: "apps" },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="radio"
          name="platform"
          label="Platform"
          formControl={formControl}
          required
          validators={{ required: "Platform is required" }}
          options={platformOptions}
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
          validators={{ required: "Filter Rule is required" }}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default CippAddAssignmentFilterTemplateForm;
