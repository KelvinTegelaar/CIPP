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
  Link,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";

const SSO_DOCS_URL = "https://docs.cipp.app/user-documentation/cipp/advanced/authentication/sso";

// The three delegated scopes New-CIPPSSOApp requests. Kept here verbatim so an admin can hand
// this straight to their own security team without having to ask what the app can reach.
const ssoAppPermissions = [
  {
    name: "openid",
    reason: "Signs the user in and issues an ID token. The base OpenID Connect scope.",
  },
  {
    name: "profile",
    reason:
      "Reads the signed-in user's display name, object ID and tenant ID, so CIPP knows which account signed in.",
  },
  {
    name: "email",
    reason:
      "Reads the signed-in user's UPN, which CIPP matches against the CIPP Users list to decide their roles.",
  },
];

// Application permissions already consented on CIPP-SAM that the setup runs as. Nothing new is
// requested at setup time — if one of these steps fails, the SAM consent predates the permission.
const samPermissionsUsed = [
  {
    name: "Application.ReadWrite.All",
    reason: "Creates the CIPP-SSO app registration, its service principal and its client secret.",
  },
  {
    name: "Directory.ReadWrite.All",
    reason:
      "Grants tenant-wide consent for the three scopes above so your users are not prompted to consent at sign-in.",
  },
  {
    name: "Policy.ReadWrite.ApplicationConfiguration",
    reason:
      "Exempts CIPP from a tenant app management policy that blocks adding client secrets — only used when such a policy is in force.",
  },
];

const PermissionTable = ({ rows, typeLabel }) => (
  <Table size="small" sx={{ "& td, & th": { px: 1, verticalAlign: "top" } }}>
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: "40%" }}>Permission</TableCell>
        <TableCell>Why it is needed</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.name}>
          <TableCell>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {typeLabel}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{row.reason}</Typography>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

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
  // Three states on purpose: warmup may not have attempted the grant yet, which is not the
  // same as the tenant refusing it. Failure is a soft one — sign-in still works, users just
  // see the consent prompt they see today.
  // A container can have several custom domains bound, and EasyAuth derives its redirect_uri
  // from the incoming Host header — so each one needs its own callback on the app registration.
  // Show the hostname rather than the full /.auth/login/aad/callback URL; that's what an admin
  // actually recognises.
  const hostFromUri = (uri) => {
    try {
      return new URL(uri).host;
    } catch {
      return uri;
    }
  };
  const signInHosts = (data?.redirectUris ?? []).map(hostFromUri);
  const missingSignInHosts = (data?.missingRedirectUris ?? []).map(hostFromUri);
  // When the backend couldn't read the domains bound to this container, an empty
  // missingRedirectUris means "we don't know", not "everything is fine" — say so rather than
  // showing a clean list a customer would read as confirmation.
  const domainsUnverified = hasAppId && data?.domainsVerified === false;

  const preconsentInfo =
    data?.preconsented === true
      ? { label: "Granted", color: "success" }
      : data?.preconsented === false
        ? { label: "Not Granted", color: "warning" }
        : { label: "Not Checked", color: "default" };

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

  const handleRefreshSignInUrls = () => {
    ssoAction.mutate({
      url: "/api/ExecSSOSetup",
      data: { Action: "RefreshRedirectUris" },
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
            {/* Expanded by default until SSO works, because that's when someone is looking for
                "what is this and what do I have to get approved". */}
            <Accordion
              disableGutters
              elevation={0}
              defaultExpanded={false}
              sx={{ "&:before": { display: "none" } }}
            >
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  About the CIPP-SSO app registration
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Stack spacing={2}>
                  <Typography variant="body2">
                    CIPP signs users in through an app registration called <strong>CIPP-SSO</strong>{" "}
                    in your own partner tenant, which puts CIPP sign-in under your Conditional
                    Access policies, MFA requirements and session controls. The app only proves who
                    you are — it has no access to any data in your tenant. Everything CIPP does
                    against Microsoft 365 still runs through the CIPP-SAM app and your GDAP
                    relationships.
                  </Typography>

                  <Alert severity="info">
                    You do <strong>not</strong> need Entra ID Global Administrator to run this
                    setup, and there is no separate enterprise app for anyone to approve. CIPP
                    creates the app itself using permissions your tenant consented to when CIPP was
                    installed. A CIPP superadmin or admin role is all that is required.
                  </Alert>

                  <div>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Permissions the CIPP-SSO app requests
                    </Typography>
                    <PermissionTable rows={ssoAppPermissions} typeLabel="Delegated · Microsoft Graph" />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      No application (app-only) permissions are requested, so the app can never act
                      without a signed-in user. None of these scopes grant access to mail, files,
                      Teams or directory data — they are the standard OpenID Connect sign-in scopes,
                      classed by Microsoft as low impact. Who can actually reach CIPP is still
                      controlled by the CIPP Users list.
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Permissions CIPP uses to create it
                    </Typography>
                    <PermissionTable rows={samPermissionsUsed} typeLabel="Application · on CIPP-SAM" />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      These are part of the standard CIPP-SAM permission set and were consented when
                      CIPP was installed — nothing new is requested during setup. If setup fails on
                      one of these steps, your CIPP-SAM consent predates that permission and needs
                      re-consenting from the SAM App Permissions page.
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      If your tenant blocks setup
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      The most common blocker is a tenant app management policy that forbids adding
                      client secrets. <strong>Repair</strong> retries it, and CIPP will try to exempt
                      itself from the policy. If it still fails, an Entra administrator can create
                      the CIPP-SSO app registration by hand and you can store its credentials under{" "}
                      <strong>Manual configuration</strong> below — the documentation has the exact
                      settings to use.
                    </Typography>
                    <Typography variant="body2">
                      If sign-in is broken badly enough that you cannot reach this page at all, use{" "}
                      <strong>Reset SSO</strong> in the{" "}
                      <Link href="https://management.cipp.app/" target="_blank" rel="noopener noreferrer">
                        management portal
                      </Link>
                      . That returns the instance to its setup wizard, which is reachable without
                      signing in.
                    </Typography>
                  </div>

                  <Link href={SSO_DOCS_URL} target="_blank" rel="noopener noreferrer" variant="body2">
                    Full SSO documentation, including permission justifications for your security
                    team
                  </Link>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
              </Grid>
              <Grid size={{ xs: 8 }}>
                <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
              </Grid>

              {hasAppId && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Admin Consent
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Chip
                      label={preconsentInfo.label}
                      color={preconsentInfo.color}
                      size="small"
                    />
                    {data?.preconsented === false && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {data?.preconsentError
                          ? `Users will be prompted to consent at sign-in. ${data.preconsentError}`
                          : "Users will be prompted to consent at sign-in."}
                      </Typography>
                    )}
                  </Grid>
                </>
              )}

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

              {signInHosts.length > 0 && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Sign-in URLs
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {signInHosts.map((host) => (
                        <Chip
                          key={host}
                          label={host}
                          size="small"
                          color={missingSignInHosts.includes(host) ? "warning" : "default"}
                        />
                      ))}
                    </Stack>
                    {missingSignInHosts.length > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {missingSignInHosts.join(", ")}{" "}
                        {missingSignInHosts.length === 1 ? "is" : "are"} bound to this
                        instance but not registered on the app. Click{" "}
                        <strong>Refresh Sign-in URLs</strong> to add{" "}
                        {missingSignInHosts.length === 1 ? "it" : "them"}.
                      </Typography>
                    )}
                    {domainsUnverified && (
                      <Typography
                        variant="caption"
                        color="warning.main"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        This list may be incomplete — the custom domains bound to this
                        instance could not be read, so a domain that cannot sign in would not
                        show up here.
                        {data?.domainsError ? ` (${data.domainsError})` : ""}
                      </Typography>
                    )}
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
                    in Key Vault — for example to rotate the secret by hand, or to point SSO at an app
                    registration an Entra administrator created for you because a tenant policy blocks
                    CIPP from creating one. The instance must be restarted for the change to take
                    effect.{" "}
                    <Link href={`${SSO_DOCS_URL}#creating-the-app-registration-manually`} target="_blank" rel="noopener noreferrer">
                      Settings to use when creating the app manually
                    </Link>
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
                  color={missingSignInHosts.length > 0 ? "warning" : "inherit"}
                  onClick={handleRefreshSignInUrls}
                  disabled={ssoAction.isPending}
                >
                  Refresh Sign-in URLs
                </Button>
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
