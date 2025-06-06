import { Box, Stack } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";

const CippMailboxPermissionsDialog = ({ formHook }) => {
  const fullAccess = useWatch({
    control: formHook.control,
    name: "permissions.AddFullAccess",
  });

  const userSettingsDefaults = useSettings();

  const usersList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `users`,
      tenantFilter: userSettingsDefaults.currentTenant,
      $select: "id,displayName,userPrincipalName,mail",
      noPagination: true,
      $top: 999,
    },
    queryKey: `UserNames-${userSettingsDefaults.currentTenant}`,
  });

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Full Access"
          name="permissions.AddFullAccess"
          formControl={formHook}
          isFetching={usersList.isFetching}
          options={
            usersList?.data?.Results?.map((user) => ({
              value: user.userPrincipalName,
              label: `${user.displayName} (${user.userPrincipalName})`,
            })) || []
          }
        />
      </Box>
      {fullAccess?.length > 0 && (
        <Box sx={{ pl: 0.5 }}>
          <CippFormComponent
            type="switch"
            label="Enable Automapping"
            name="permissions.AutoMap"
            formControl={formHook}
          />
        </Box>
      )}
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Send-as Permissions"
          name="permissions.AddSendAs"
          formControl={formHook}
          isFetching={usersList.isFetching}
          options={
            usersList?.data?.Results?.map((user) => ({
              value: user.userPrincipalName,
              label: `${user.displayName} (${user.userPrincipalName})`,
            })) || []
          }
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Send On Behalf Permissions"
          name="permissions.AddSendOnBehalf"
          formControl={formHook}
          isFetching={usersList.isFetching}
          options={
            usersList?.data?.Results?.map((user) => ({
              value: user.userPrincipalName,
              label: `${user.displayName} (${user.userPrincipalName})`,
            })) || []
          }
        />
      </Box>
    </Stack>
  );
};

export default CippMailboxPermissionsDialog;
