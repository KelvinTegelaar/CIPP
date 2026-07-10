import { useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";

const statusLabels = {
  none: { label: "Not Configured", color: "default" },
  app_created: { label: "App Created — Secret Pending", color: "warning" },
  appid_stored: { label: "App ID Stored — Secret Pending", color: "warning" },
  secrets_stored: { label: "Secrets Stored", color: "success" },
  complete: { label: "Complete", color: "success" },
  error: { label: "Error", color: "error" },
};

const repairableStatuses = new Set(["error", "app_created", "appid_stored"]);

export const CippSSOSettings = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: { multiTenant: false },
  });

  // Separate form for the manual-configuration section so its fields don't
  // interfere with the automated flow's multiTenant switch.
  const manualFormControl = useForm({
    mode: "onChange",
    defaultValues: { appId: "", appSecret: "", multiTenant: false },
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
      // Seed the manual section's multi-tenant switch and App ID with the current
      // values; leave the secret blank so it's only written when the admin types one.
      manualFormControl.reset({
        appId: data.appId ?? "",
        appSecret: "",
        multiTenant: data.multiTenant ?? false,
      });
    }
  }, [ssoStatus.isSuccess, ssoStatus.data]);

  const data = ssoStatus.data?.Results;
  const statusKey = data?.status ?? "none";
  const statusInfo = statusLabels[statusKey] ?? statusLabels.none;
  const hasAppId = Boolean(data?.appId);
  // Server-provided canRepair is authoritative when present; fall back to local heuristic.
  const canRepair =
    data?.canRepair ??
    (hasAppId && repairableStatuses.has(statusKey));
  const isProvisioned =
    statusKey === "complete" || (statusKey === "secrets_stored" && hasAppId);
  // Show "Create SSO App" whenever there isn't a working app AND there's nothing to repair —
  // covers fresh installs AND legacy broken installs where the AppId was never persisted
  // (the original "Failed to create client secret after 5 attempts" bug).
  const showCreate = !isProvisioned && !canRepair;
  const isOrphanedError = statusKey === "error" && !hasAppId;

  const handleCreate = () => {
    ssoAction.mutate({
      url: "/api/ExecSSOSetup",
      data: {
        Action: "Create",
        multiTenant: formControl.getValues("multiTenant"),
      },
    });
  };

  const handleRepair = () => {
    ssoAction.mutate({
      url: "/api/ExecSSOSetup",
      data: { Action: "Repair" },
    });
  };

  const handleRecreate = () => {
    if (
      !window.confirm(
        "Recreate will clear the current SSO record and provision a brand new CIPP-SSO app. The previous app registration will be left in your Entra tenant (you can delete it manually). Continue?"
      )
    ) {
      return;
    }
    // Clear first, then create. ApiPostCall chains via the success refetch — call sequentially.
    ssoAction.mutate(
      {
        url: "/api/ExecSSOSetup",
        data: { Action: "Recreate" },
      },
      {
        onSuccess: () => {
          ssoAction.mutate({
            url: "/api/ExecSSOSetup",
            data: {
              Action: "Create",
              multiTenant: formControl.getValues("multiTenant"),
            },
          });
        },
      }
    );
  };

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

  const handleRotateSecret = () => {
    ssoAction.mutate({
      url: "/api/ExecSSOSetup",
      data: { Action: "RotateSecret" },
    });
  };

  const handleManualSave = manualFormControl.handleSubmit((values) => {
    if (
      !window.confirm(
        "This will overwrite the stored SSO Application ID and client secret in Key Vault. " +
          "An incorrect App ID or secret will break single sign-on. Make sure the values are correct before continuing. Continue?"
      )
    ) {
      return;
    }
    ssoAction.mutate(
      {
        url: "/api/ExecSSOSetup",
        data: {
          Action: "ManualConfigure",
          appId: values.appId?.trim(),
          appSecret: values.appSecret,
          multiTenant: values.multiTenant,
        },
      },
      {
        onSuccess: () => {
          // Clear the secret field so it isn't left sitting in the form. On a CIPP-NG
          // instance the returned message tells the user to restart to apply the change;
          // the restart itself is done from the container-management page.
          manualFormControl.setValue("appSecret", "");
        },
      }
    );
  });

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
                <Grid size={{ xs: 12 }}>
                  <Alert
                    severity={canRepair ? "warning" : "error"}
                    sx={{ mt: 1 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {canRepair
                        ? "Setup did not finish"
                        : isOrphanedError
                          ? "Previous setup failed"
                          : "Error"}
                    </Typography>
                    <Typography variant="body2">{data.lastError}</Typography>
                    {canRepair && (
                      <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                        The app registration ({data.appId}) was created successfully but the
                        client secret could not be generated. Click <strong>Repair</strong> to
                        retry the secret on the existing app, or <strong>Recreate</strong> to
                        start over with a fresh app registration.
                      </Typography>
                    )}
                    {isOrphanedError && (
                      <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                        A previous attempt to set up SSO did not save an App ID, so there's
                        nothing to repair. An orphaned <strong>CIPP-SSO</strong> app
                        registration may exist in your Entra tenant — you can delete it
                        manually. Click <strong>Create SSO App</strong> to provision a fresh
                        app registration.
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>

            <Divider />

            <CippFormComponent
              type="switch"
              name="multiTenant"
              label="Multi-tenant mode (allow users from multiple Entra ID tenants)"
              formControl={formControl}
              disabled={!isProvisioned && !showCreate}
            />

            <CippApiResults apiObject={ssoAction} />

            <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Manual configuration (advanced)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Stack spacing={2}>
                  <Alert severity="info">
                    Enter an existing Application (client) ID and client secret to store them directly
                    in Key Vault — for example to rotate the secret by hand or point SSO at a different
                    app registration. The instance must be restarted for the change to take effect.
                  </Alert>

                  <CippFormComponent
                    type="textField"
                    name="appId"
                    label="Application (client) ID"
                    formControl={manualFormControl}
                    disableVariables
                    validators={{
                      required: "Application (client) ID is required",
                      pattern: {
                        value: /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/,
                        message: "Must be a valid GUID",
                      },
                    }}
                  />

                  <CippFormComponent
                    type="password"
                    name="appSecret"
                    label="Client secret"
                    formControl={manualFormControl}
                    autoComplete="new-password"
                    validators={{ required: "Client secret is required" }}
                  />

                  <CippFormComponent
                    type="switch"
                    name="multiTenant"
                    label="Multi-tenant mode (allow users from multiple Entra ID tenants)"
                    formControl={manualFormControl}
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleManualSave}
                      disabled={ssoAction.isPending}
                    >
                      Save Manual Configuration
                    </Button>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        )}
      </CardContent>
      {!ssoStatus.isLoading && (
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
          <Stack direction="row" spacing={1}>
            {showCreate && (
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={ssoAction.isPending}
              >
                Create SSO App
              </Button>
            )}

            {canRepair && (
              <>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleRecreate}
                  disabled={ssoAction.isPending}
                >
                  Recreate
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleRepair}
                  disabled={ssoAction.isPending}
                >
                  Repair
                </Button>
              </>
            )}

            {isProvisioned && (
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
