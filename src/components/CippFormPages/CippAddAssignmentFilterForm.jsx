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

const CippAddAssignmentFilterForm = (props) => {
  const { formControl, isEdit = false } = props;

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
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Display Name"
          name="displayName"
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
          disabled={isEdit}
          helperText={isEdit ? "Filter type cannot be changed after creation" : undefined}
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
          validators={{ required: "Platform is required" }}
          disabled={isEdit}
          helperText={isEdit ? "Platform cannot be changed after creation" : undefined}
          options={platformOptions}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Filter Rule"
          name="rule"
          formControl={formControl}
          validators={{ required: "Filter Rule is required" }}
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
          multiline
          rows={6}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default CippAddAssignmentFilterForm;
