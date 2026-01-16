import { useState, useEffect } from "react";
import { Button, Box, Typography, Alert, AlertTitle } from "@mui/material";
import { useForm, useFormState } from "react-hook-form";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { CippOffCanvas } from "./CippOffCanvas";
import CippSchedulerForm from "../CippFormPages/CippSchedulerForm";
import { useSettings } from "../../hooks/use-settings";

export const CippSchedulerDrawer = ({
  buttonText = "Add Task",
  requiredPermissions = [],
  PermissionButton = Button,
  onSuccess,
  onClose,
  taskId = null,
  cloneMode = false,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      Recurrence: { value: "0", label: "Once" },
      taskType: { value: "scheduled", label: "Scheduled Task" },
    },
  });

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    // Increment form key to force complete remount when reopening
    setFormKey((prev) => prev + 1);
    // Call onClose callback if provided (to clear parent state)
    if (onClose) {
      onClose();
    }
    // Add a small delay before resetting to ensure drawer is closed
    setTimeout(() => {
      // Reset form to default values
      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
        Recurrence: { value: "0", label: "Once" },
        taskType: { value: "scheduled", label: "Scheduled Task" },
      });
    }, 100);
  };

  const handleOpenDrawer = () => {
    setDrawerVisible(true);
  };

  // Auto-open drawer if taskId is provided (for edit mode)
  useEffect(() => {
    if (taskId) {
      setDrawerVisible(true);
    }
  }, [taskId]);

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={handleOpenDrawer}
        startIcon={<CalendarDaysIcon />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title={taskId && cloneMode ? "Clone Task" : taskId ? "Edit Task" : "Add Task"}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
      >
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Task Configuration</AlertTitle>
            {taskId && cloneMode
              ? "Clone this task with the same configuration. Modify the settings as needed and save to create a new task."
              : taskId
              ? "Edit the task configuration. Changes will be applied when you save."
              : "Create a scheduled task or event-triggered task. Scheduled tasks run PowerShell commands at specified times, while triggered tasks respond to events like Azure AD changes."}
          </Alert>

          <CippSchedulerForm
            key={formKey}
            formControl={formControl}
            fullWidth={true}
            taskId={taskId}
            cloneMode={cloneMode}
          />
        </Box>
      </CippOffCanvas>
    </>
  );
};
