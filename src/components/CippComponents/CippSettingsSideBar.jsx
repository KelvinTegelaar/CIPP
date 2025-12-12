import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { getCippError } from "../../utils/get-cipp-error";
import { useFormState } from "react-hook-form";
import { useEffect } from "react";

export const CippSettingsSideBar = (props) => {
  const { formcontrol, initialUserType, ...others } = props;
  const { isDirty, isValid } = useFormState({ control: formcontrol.control });

  const currentUser = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const saveSettingsPost = ApiPostCall({
    url: "/api/ExecUserSettings",
    relatedQueryKeys: "userSettings",
  });

  // Set the correct default value once we have the initial user type and current user data
  useEffect(() => {
    if (initialUserType && currentUser.data?.clientPrincipal?.userDetails) {
      const defaultUserOption =
        initialUserType === "currentUser"
          ? {
              label: "Current User",
              value: currentUser.data.clientPrincipal.userDetails,
            }
          : {
              label: "All Users",
              value: "allUsers",
            };

      // Only set if not already set to avoid infinite loops
      const currentUserValue = formcontrol.getValues("user");
      if (!currentUserValue || currentUserValue.value !== defaultUserOption.value) {
        formcontrol.setValue("user", defaultUserOption);
      }
    }
  }, [initialUserType, currentUser.data?.clientPrincipal?.userDetails, formcontrol]);

  const handleSaveChanges = () => {
    const formValues = formcontrol.getValues();

    // Only include the specific form fields from preferences.js to avoid unmapped data
    const currentSettings = {
      // General Settings
      usageLocation: formValues.usageLocation,
      tablePageSize: formValues.tablePageSize,
      userAttributes: formValues.userAttributes,

      // Table Filter Preferences
      persistFilters: formValues.persistFilters,

      // Portal Links Configuration
      portalLinks: {
        M365_Portal: formValues.portalLinks?.M365_Portal,
        Exchange_Portal: formValues.portalLinks?.Exchange_Portal,
        Entra_Portal: formValues.portalLinks?.Entra_Portal,
        Teams_Portal: formValues.portalLinks?.Teams_Portal,
        Azure_Portal: formValues.portalLinks?.Azure_Portal,
        Intune_Portal: formValues.portalLinks?.Intune_Portal,
        SharePoint_Admin: formValues.portalLinks?.SharePoint_Admin,
        Security_Portal: formValues.portalLinks?.Security_Portal,
        Compliance_Portal: formValues.portalLinks?.Compliance_Portal,
        Power_Platform_Portal: formValues.portalLinks?.Power_Platform_Portal,
        Power_BI_Portal: formValues.portalLinks?.Power_BI_Portal,
      },

      // Offboarding Defaults
      offboardingDefaults: {
        ConvertToShared: formValues.offboardingDefaults?.ConvertToShared,
        RemoveGroups: formValues.offboardingDefaults?.RemoveGroups,
        HideFromGAL: formValues.offboardingDefaults?.HideFromGAL,
        RemoveLicenses: formValues.offboardingDefaults?.RemoveLicenses,
        removeCalendarInvites: formValues.offboardingDefaults?.removeCalendarInvites,
        RevokeSessions: formValues.offboardingDefaults?.RevokeSessions,
        removePermissions: formValues.offboardingDefaults?.removePermissions,
        RemoveRules: formValues.offboardingDefaults?.RemoveRules,
        ResetPass: formValues.offboardingDefaults?.ResetPass,
        KeepCopy: formValues.offboardingDefaults?.KeepCopy,
        DeleteUser: formValues.offboardingDefaults?.DeleteUser,
        RemoveMobile: formValues.offboardingDefaults?.RemoveMobile,
        DisableSignIn: formValues.offboardingDefaults?.DisableSignIn,
        RemoveMFADevices: formValues.offboardingDefaults?.RemoveMFADevices,
        RemoveTeamsPhoneDID: formValues.offboardingDefaults?.RemoveTeamsPhoneDID,
        ClearImmutableId: formValues.offboardingDefaults?.ClearImmutableId,
      },
    };

    const shippedValues = {
      user: formcontrol.getValues("user").value,
      currentSettings: currentSettings,
    };
    saveSettingsPost.mutate({ url: "/api/ExecUserSettings", data: shippedValues });
  };

  // Create user options based on current user data
  const getUserOptions = () => {
    if (!currentUser.data?.clientPrincipal?.userDetails) {
      return [];
    }

    return [
      {
        label: "Current User",
        value: currentUser.data.clientPrincipal.userDetails,
      },
      {
        label: "All Users",
        value: "allUsers",
      },
    ];
  };

  return (
    <>
      <Card>
        <CardHeader title="Actions" />
        <Divider />
        <CardContent sx={{ mb: 0, pb: 0 }}>
          <Stack spacing={2}>
            <Typography variant="body2">
              Settings on this page can be saved for the current user, or all users. Select the
              desired option below.
            </Typography>
            <CippFormComponent
              type="autoComplete"
              disableClearable={true}
              name="user"
              formControl={formcontrol}
              multiple={false}
              options={getUserOptions()}
            />

            {saveSettingsPost.isError && (
              <Alert severity="error">{getCippError(saveSettingsPost.error)}</Alert>
            )}
            {saveSettingsPost.isSuccess && (
              <Alert severity="success">Settings saved successfully</Alert>
            )}
          </Stack>
        </CardContent>
        <CardActions>
          <Button variant="contained" disabled={!isValid} onClick={() => handleSaveChanges()}>
            Save Changes
            {saveSettingsPost.isPending && <CircularProgress color="info" size={20} />}
          </Button>
        </CardActions>
        <Divider />
      </Card>
    </>
  );
};
