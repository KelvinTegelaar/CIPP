import { useEffect, useMemo } from "react";
import { Box, Stack, Tooltip } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { useWatch } from "react-hook-form";

const CippCalendarPermissionsDialog = ({ formHook, groupsList, usersList }) => {
  const permissionLevel = useWatch({
    control: formHook.control,
    name: "Permissions",
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
          isFetching={isLoading}
          options={combinedOptions}
          creatable={false}
          required={true}
          validators={{
            validate: (value) => (value ? true : "Select a user or group to assign permissions to"),
          }}
          placeholder="Select a user or group to assign permissions to"
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Permission Level"
          name="Permissions"
          required={true}
          creatable={false}
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
              sx={{ ml: 1.5, mt: 0, mb: 0 }}
            />
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
};

export default CippCalendarPermissionsDialog;
