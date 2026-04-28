import { useState, useEffect } from "react";
import { Button, Box, Typography, Alert, AlertTitle } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { Schedule } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippCveSyncScheduleDrawer = ({
  buttonText = "Schedule CVE Sync",
  requiredPermissions = [],
  PermissionButton = Button,
  onSuccess,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      recurrence: { value: "1d", label: "Daily (every 24 hours)" },
      startHour: { value: 3, label: "3:00 AM" },
    },
  });

  const createSchedule = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["CveSyncTasks"],
  });

  const { isValid } = useFormState({ control: formControl.control });

  useEffect(() => {
    if (createSchedule.isSuccess) {
      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
        recurrence: { value: "1d", label: "Daily (every 24 hours)" },
        startHour: { value: 3, label: "3:00 AM" },
      });
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [createSchedule.isSuccess, onSuccess]);

  const handleSubmit = () => {
    formControl.trigger();
    if (!isValid) {
      return;
    }
    const values = formControl.getValues();
    const tenantFilter = values.tenantFilter || userSettingsDefaults.currentTenant;

    const startDate = new Date();
    startDate.setHours(values.startHour?.value ?? 3, 0, 0, 0);
    // If the chosen hour has already passed today, start tomorrow
    if (startDate.getTime() <= Date.now()) {
      startDate.setDate(startDate.getDate() + 1);
    }
    const unixTime = Math.floor(startDate.getTime() / 1000);

    const shippedValues = {
      TenantFilter: tenantFilter,
      Name: `CIPP CVE Sync - ${tenantFilter}`,
      Command: { value: "Invoke-CIPPScheduledCveCacheRefresh" },
      Parameters: { TenantFilter: tenantFilter },
      ScheduledTime: unixTime,
      Recurrence: { value: values.recurrence?.value ?? "1d" },
    };

    createSchedule.mutate({
      url: "/api/AddScheduledItem?hidden=true&DisallowDuplicateName=true",
      data: shippedValues,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      tenantFilter: userSettingsDefaults.currentTenant,
      recurrence: { value: "1d", label: "Daily (every 24 hours)" },
      startHour: { value: 3, label: "3:00 AM" },
    });
  };

  const recurrenceOptions = [
    { value: "1d", label: "Daily (every 24 hours)" },
    { value: "2d", label: "Every 2 days" },
    { value: "7d", label: "Weekly" },
  ];

  const startHourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const label =
      hour === 0
        ? "12:00 AM (Midnight)"
        : hour < 12
        ? `${hour}:00 AM`
        : hour === 12
        ? "12:00 PM (Noon)"
        : `${hour - 12}:00 PM`;
    return { value: hour, label };
  });

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<Schedule />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Schedule CVE Sync"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={formControl.handleSubmit(handleSubmit)}
              disabled={createSchedule.isPending || !isValid}
            >
              {createSchedule.isPending
                ? "Creating Schedule..."
                : createSchedule.isSuccess
                ? "Create Another Schedule"
                : "Create Schedule"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Box sx={{ my: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>CVE Sync Schedule</AlertTitle>
            Schedule automatic retrieval of Defender TVM vulnerability data for the selected
            tenant(s). Data is stored in CIPP and used for CVE Management and exception tracking.
          </Alert>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Tenant Selection</Typography>
              <CippFormTenantSelector
                formControl={formControl}
                allTenants={true}
                name="tenantFilter"
                required={true}
                disableClearable={true}
                componentType="select"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Schedule</Typography>
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Frequency"
                name="recurrence"
                options={recurrenceOptions}
                formControl={formControl}
                multiple={false}
                required={true}
              />
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Start Time"
                name="startHour"
                options={startHourOptions}
                formControl={formControl}
                multiple={false}
                required={true}
              />
            </Grid>
          </Grid>
        </Box>
        <CippApiResults apiObject={createSchedule} />
      </CippOffCanvas>
    </>
  );
};
