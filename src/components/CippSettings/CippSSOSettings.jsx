import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";

const statusLabels = {
  none: { label: "Not Configured", color: "default" },
  app_created: { label: "App Created", color: "info" },
  appid_stored: { label: "App ID Stored", color: "info" },
  secrets_stored: { label: "Secrets Stored", color: "success" },
  complete: { label: "Complete", color: "success" },
  error: { label: "Error", color: "error" },
};

export const CippSSOSettings = () => {
  const [showCreate, setShowCreate] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: { multiTenant: false },
  });

  const ssoStatus = ApiGetCall({
    url: "/api/ExecSSOSetup",
    data: { Action: "Status" },
    queryKey: "SSOStatus",
  });

  const ssoAction = ApiPostCall({
    relatedQueryKeys: ["SSOStatus", "authmecipp"],
  });

  useEffect(() => {
    if (ssoStatus.isSuccess && ssoStatus.data?.Results) {
      const data = ssoStatus.data.Results;
      formControl.reset({ multiTenant: data.multiTenant ?? false });
      setShowCreate(!data.configured);
    }
  }, [ssoStatus.isSuccess, ssoStatus.data]);

  const handleUpdate = () => {
    if (
      !window.confirm(
        "Updating SSO settings will restart the CIPP instance. Changes may take up to 60 seconds to reflect. Do you want to continue?"
      )
    ) {
      return;
    }
    ssoAction.mutate({
      url: "/api/ExecSSOSetup",
      data: {
        Action: "Update",
        multiTenant: formControl.getValues("multiTenant"),
      },
    });
  };

  const handleCreate = () => {
    ssoAction.mutate({
      url: "/api/ExecSSOSetup",
      data: {
        Action: "Create",
        multiTenant: formControl.getValues("multiTenant"),
      },
    });
  };

  const handleRotateSecret = () => {
    ssoAction.mutate({
      url: "/api/ExecSSOSetup",
      data: { Action: "RotateSecret" },
    });
  };

  const data = ssoStatus.data?.Results;
  const statusInfo = statusLabels[data?.status] ?? statusLabels.none;

  return (
    <CippButtonCard title="SSO App Registration" isFetching={ssoStatus.isFetching}>
      <CardContent>
        {ssoStatus.isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
              </Grid>
              <Grid size={{ xs: 8 }}>
                <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
              </Grid>

              {data?.appId && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      App ID
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {data.appId}
                    </Typography>
                  </Grid>
                </>
              )}

              {data?.createdAt && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2">
                      {new Date(data.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </>
              )}

              {data?.lastError && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {data.lastError}
                    </Alert>
                  </Grid>
                </>
              )}
            </Grid>

            <Divider />

            <CippFormComponent
              type="switch"
              name="multiTenant"
              label="Multi-tenant mode (allow users from multiple Entra ID tenants)"
              formControl={formControl}
            />

            <CippApiResults apiObject={ssoAction} />
          </Stack>
        )}
      </CardContent>
      {!ssoStatus.isLoading && (
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
          <Stack direction="row" spacing={1}>
            {showCreate ? (
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={ssoAction.isPending}
              >
                Create SSO App
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleRotateSecret}
                  disabled={ssoAction.isPending}
                >
                  Rotate Secret
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  disabled={ssoAction.isPending}
                >
                  Save Changes
                </Button>
              </>
            )}
          </Stack>
        </CardActions>
      )}
    </CippButtonCard>
  );
};
