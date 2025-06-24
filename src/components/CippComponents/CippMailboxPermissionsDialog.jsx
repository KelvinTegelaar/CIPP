import { Box, Stack } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";

const CippMailboxPermissionsDialog = ({ formHook, combinedOptions, isUserGroupLoading }) => {
  const fullAccess = useWatch({
    control: formHook.control,
    name: "permissions.AddFullAccess",
  });

  // Ensure AutoMap is set to true when FullAccess is selected
  useEffect(() => {
    if (fullAccess) {
      // Always set to true when FullAccess user is selected for the first time
      // This ensures the form value matches the UI default state
      formHook.setValue("permissions.AutoMap", true);
    }
  }, [fullAccess, formHook]);

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Full Access"
          name="permissions.AddFullAccess"
          formControl={formHook}
          isFetching={isUserGroupLoading}
          creatable={false}
          options={combinedOptions}
        />
      </Box>
      <Box>
        <CippFormComponent
          type="switch"
          label="Enable Automapping"
          name="permissions.AutoMap"
          formControl={formHook}
          disabled={!fullAccess?.length}
          sx={{ ml: 1.5, mt: 0, mb: 0 }}
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Send-as Permissions"
          name="permissions.AddSendAs"
          formControl={formHook}
          isFetching={isUserGroupLoading}
          creatable={false}
          options={combinedOptions}
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Send On Behalf Permissions"
          name="permissions.AddSendOnBehalf"
          formControl={formHook}
          isFetching={isUserGroupLoading}
          creatable={false}
          options={combinedOptions}
        />
      </Box>
    </Stack>
  );
};

export default CippMailboxPermissionsDialog;
