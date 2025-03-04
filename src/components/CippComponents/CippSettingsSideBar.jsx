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
    url: "/.auth/me",
    queryKey: "authmecipp",
    staleTime: 120000,
    refetchOnWindowFocus: true,
  });

  const saveSettingsPost = ApiPostCall({
    url: "/api/ExecUserSettings",
  });
  const handleSaveChanges = () => {
    const shippedValues = {
      user: formcontrol.getValues("user").value,
      currentSettings: formcontrol.getValues(),
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
