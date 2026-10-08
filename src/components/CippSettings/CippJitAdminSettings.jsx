import { Button, Typography, Alert, Box } from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm, useWatch } from "react-hook-form";
import jitAdminRoles from "../../data/JitAdminRoles.json";
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
      RequireApproval: false,
      ApprovalTriggerRoles: [],
      ApproverRoles: [],
      RequiredApprovals: 1,
    },
  });
  const requireApproval = useWatch({ control: formControl.control, name: "RequireApproval" });

  useEffect(() => {
    if (jitSettings.isSuccess && jitSettings.data) {
      formControl.reset({
        MaxDuration: jitSettings.data?.MaxDuration || "",
        RequireApproval: jitSettings.data?.RequireApproval ?? false,
        ApprovalTriggerRoles: jitSettings.data?.ApprovalTriggerRoles ?? [],
        ApproverRoles: jitSettings.data?.ApproverRoles ?? [],
        RequiredApprovals: jitSettings.data?.RequiredApprovals ?? 1,
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
        RequireApproval: formData.RequireApproval,
        ApprovalTriggerRoles: formData.ApprovalTriggerRoles,
        ApproverRoles: formData.ApproverRoles,
        RequiredApprovals: formData.RequiredApprovals,
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
          startIcon={<CippIcons.ClockIcon style={{ width: 16, height: 16 }} />}
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

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Approval
          </Typography>
          <CippFormComponent
            type="switch"
            name="RequireApproval"
            label="Require approval for JIT Admin requests"
            formControl={formControl}
          />
          {requireApproval && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <CippFormComponent
                type="autoComplete"
                name="ApprovalTriggerRoles"
                label="Roles that need approval"
                placeholder="Leave empty to require approval for every request"
                options={jitAdminRoles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
                multiple={true}
                creatable={false}
                formControl={formControl}
              />
              <CippFormComponent
                type="autoComplete"
                name="ApproverRoles"
                label="Approver roles"
                placeholder="CIPP roles whose users can approve requests"
                api={{
                  url: "/api/ListCustomRole",
                  queryKey: "CustomRoleList",
                  labelField: "RoleName",
                  valueField: "RoleName",
                }}
                multiple={true}
                creatable={false}
                formControl={formControl}
                validators={{
                  validate: (value) =>
                    !requireApproval || value?.length > 0 || "Select at least one approver role",
                }}
              />
              <CippFormComponent
                type="number"
                name="RequiredApprovals"
                label="Approvals required"
                formControl={formControl}
                validators={{ min: { value: 1, message: "At least one approval is required" } }}
              />
              <Typography variant="body2" color="text.secondary">
                Approvers are notified through the configured notification methods, and on the new CIPP infrastructure by push if
                they have it enabled. The requester cannot approve their own request, and any
                rejection ends the request.
              </Typography>
            </Box>
          )}
        </Box>

        {/* API Results */}
        <CippApiResults apiObject={jitChange} />
      </Box>
    </CippButtonCard>
  );
};

export default CippJitAdminSettings;
