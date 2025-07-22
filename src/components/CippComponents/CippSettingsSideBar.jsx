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

export const CippSettingsSideBar = (props) => {
  const { formcontrol, ...others } = props;
  const { isDirty, isValid } = useFormState({ control: formcontrol.control });

  const currentUser = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const saveSettingsPost = ApiPostCall({
    url: "/api/ExecUserSettings",
    relatedQueryKeys: "userSettings",
  });
  const handleSaveChanges = () => {
    const formValues = formcontrol.getValues();

    // Only include the specific form fields from preferences.js to avoid unmapped data
    const currentSettings = {
      // General Settings
      usageLocation: formValues.usageLocation,
      tablePageSize: formValues.tablePageSize,
      userAttributes: formValues.userAttributes,

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
        ClearImmutableId: formValues.offboardingDefaults?.ClearImmutableId,
      },
    };

    const shippedValues = {
      user: formcontrol.getValues("user").value,
      currentSettings: currentSettings,
    };
    saveSettingsPost.mutate({ url: "/api/ExecUserSettings", data: shippedValues });
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
              defaultValue={{
                label: "Current User",
                value: currentUser.data?.clientPrincipal?.userDetails,
              }}
              multiple={false}
              options={[
                { label: "Current User", value: currentUser.data?.clientPrincipal?.userDetails },
                { label: "All Users", value: "allUsers" },
              ]}
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
