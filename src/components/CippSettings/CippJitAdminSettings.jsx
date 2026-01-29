import { Button, Typography, Alert, Box } from "@mui/material";
import { ClockIcon } from "@heroicons/react/24/outline";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const CippJitAdminSettings = () => {
  const jitSettings = ApiGetCall({
    url: "/api/ExecJITAdminSettings?Action=Get",
    queryKey: "jitAdminSettings",
  });

  const jitChange = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: ["jitAdminSettings"],
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      MaxDuration: "",
    },
  });

  useEffect(() => {
    if (jitSettings.isSuccess && jitSettings.data) {
      formControl.reset({
        MaxDuration: jitSettings.data?.MaxDuration || "",
      });
    }
  }, [jitSettings.isSuccess, jitSettings.data]);

  const handleSave = () => {
    const formData = formControl.getValues();
    jitChange.mutate({
      url: "/api/ExecJITAdminSettings",
      data: {
        Action: "Set",
        MaxDuration: formData.MaxDuration || null,
      },
      queryKey: "jitAdminSettingsPost",
    });
  };

  return (
    <CippButtonCard
      title="JIT Admin Settings"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={jitChange.isPending || jitSettings.isLoading || !formControl.formState.isValid}
          startIcon={<ClockIcon style={{ width: 16, height: 16 }} />}
        >
          Save Settings
        </Button>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Configure maximum allowed duration for Just-In-Time (JIT) admin accounts. This setting
          helps enforce security policies by preventing technicians from creating JIT admin accounts
          with excessively long lifespans.
        </Typography>

        {/* Maximum Duration Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Maximum Duration
          </Typography>
          <CippFormComponent
            type="autoComplete"
            name="MaxDuration"
            label="Maximum Duration (ISO 8601)"
            placeholder="Leave empty for no limit"
            options={[
              { label: "1 Hour", value: "PT1H" },
              { label: "4 Hours", value: "PT4H" },
              { label: "8 Hours", value: "PT8H" },
              { label: "1 Day", value: "P1D" },
              { label: "3 Days", value: "P3D" },
              { label: "7 Days", value: "P7D" },
              { label: "14 Days", value: "P14D" },
              { label: "30 Days", value: "P30D" },
            ]}
            creatable={true}
            multiple={false}
            validators={{
              validate: {
                iso8601duration: (value) => {
                  // Allow empty value (no limit)
                  if (!value || typeof value !== "string" || value.trim() === "") {
                    return true;
                  }
                  const iso8601Regex =
                    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
                  if (!iso8601Regex.test(value)) {
                    return "Invalid format. Use PT1H, P1D, P7D, P28D, etc.";
                  }
                  return true;
                },
              },
            }}
            formControl={formControl}
          />
        </Box>

        <Alert severity="info">
          <Typography variant="body2">
            Leave empty for no limit on JIT admin account duration. When set, technicians cannot
            create JIT admin accounts with durations exceeding this limit. This setting applies
            globally to all tenants.
          </Typography>
        </Alert>

        {/* API Results */}
        <CippApiResults apiObject={jitChange} />
      </Box>
    </CippButtonCard>
  );
};

export default CippJitAdminSettings;
