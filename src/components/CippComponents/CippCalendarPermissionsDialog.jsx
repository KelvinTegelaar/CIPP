import { useEffect } from "react";
import { Box, Stack, Tooltip } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";

const CippCalendarPermissionsDialog = ({ formHook }) => {
  const permissionLevel = useWatch({
    control: formHook.control,
    name: "Permissions",
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

  const isEditor = permissionLevel?.value === "Editor";

  useEffect(() => {
    if (!isEditor) {
      formHook.setValue("CanViewPrivateItems", false);
    }
  }, [isEditor, formHook]);

  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Access"
          name="UserToGetPermissions"
          multiple={false}
          formControl={formHook}
          isFetching={usersList.isFetching}
          options={
            usersList?.data?.Results?.map((user) => ({
              value: user.userPrincipalName,
              label: `${user.displayName} (${user.userPrincipalName})`,
            })) || []
          }
          required={true}
          validators={{
            validate: (value) => (value ? true : "Select a user to assign permissions to"),
          }}
          placeholder="Select a user to assign permissions to"
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Permission Level"
          name="Permissions"
          required={true}
          validators={{
            validate: (value) => (value ? true : "Select the permission level for the calendar"),
          }}
          options={[
            { value: "Author", label: "Author" },
            { value: "Contributor", label: "Contributor" },
            { value: "Editor", label: "Editor" },
            { value: "Owner", label: "Owner" },
            { value: "NonEditingAuthor", label: "Non Editing Author" },
            { value: "PublishingAuthor", label: "Publishing Author" },
            { value: "PublishingEditor", label: "Publishing Editor" },
            { value: "Reviewer", label: "Reviewer" },
            { value: "LimitedDetails", label: "Limited Details" },
            { value: "AvailabilityOnly", label: "Availability Only" },
          ]}
          multiple={false}
          formControl={formHook}
        />
      </Box>
      <Box>
        <Tooltip
          title={!isEditor ? "Only usable when permission level is Editor" : ""}
          followCursor
          placement="right"
        >
          <span>
            <CippFormComponent
              type="switch"
              label="Can view Private items"
              name="CanViewPrivateItems"
              formControl={formHook}
              disabled={!isEditor}
            />
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
};

export default CippCalendarPermissionsDialog;
