import { Box, Stack } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { useMemo } from "react";

const CippMailboxPermissionsDialog = ({ formHook, groupsList, usersList }) => {
  const fullAccess = useWatch({
    control: formHook.control,
    name: "permissions.AddFullAccess",
  });

  // Combine users and groups into a single options array
  const combinedOptions = useMemo(() => {
    const options = [];
    
    // Add users (from parent)
    if (usersList?.data?.Results) {
      usersList.data.Results.forEach((user) => {
        options.push({
          value: user.userPrincipalName,
          label: `${user.displayName} (${user.userPrincipalName})`,
          type: 'user'
        });
      });
    }
    
    // Add mail-enabled security groups (from parent)
    if (groupsList?.data?.Results) {
      groupsList.data.Results.forEach((group) => {
        options.push({
          value: group.mail,
          label: `${group.displayName} (${group.mail})`,
          type: 'group'
        });
      });
    }
    
    // Sort alphabetically by label
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [usersList?.data?.Results, groupsList?.data?.Results]);

  const isLoading = usersList.isFetching || groupsList.isFetching;

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Full Access"
          name="permissions.AddFullAccess"
          formControl={formHook}
          isFetching={isLoading}
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
          isFetching={isLoading}
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
          isFetching={isLoading}
          creatable={false}
          options={combinedOptions}
        />
      </Box>
    </Stack>
  );
};

export default CippMailboxPermissionsDialog;
