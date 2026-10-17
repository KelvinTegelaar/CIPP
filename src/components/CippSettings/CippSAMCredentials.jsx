import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CippIcons } from "../../utils/icon-registry";
import {
  Accordion,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Grid } from "@mui/system";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall } from "../../api/ApiCall";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { CippTableDialog } from "../CippComponents/CippTableDialog";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import { CippQueryRefreshButton } from "../CippComponents/CippQueryRefreshButton";
import { useDialog } from "../../hooks/use-dialog";

export const overallLabels = {
  healthy: { label: "Healthy", color: "success" },
  secretExpiring: { label: "Secret expiring", color: "warning" },
  tokenFailing: { label: "Token failing", color: "error" },
  unreviewedCredentials: { label: "Unreviewed credentials", color: "info" },
  notConfigured: { label: "Not configured", color: "default" },
};

const ownerLabels = {
  thisInstance: "This instance",
  otherCipp: "Other CIPP",
  external: "External",
  unknown: "Unknown",
};

const secretStateLabels = {
  valid: { label: "Valid", color: "success" },
  propagating: { label: "Activating", color: "warning" },
  error: { label: "Error", color: "error" },
  notConfigured: { label: "Not configured", color: "default" },
};

const sourceLabels = {
  ScheduledRotation: "Scheduled rotation",
  Manual: "Manual",
  Setup: "Setup",
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const relative = (value) =>
  value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : null;

// "Scheduled rotation · 9 Oct 2026" or "Manual · user@domain" for credentials CIPP created.
export const provenanceText = (credential) => {
  const source = sourceLabels[credential.source];
  if (!source) return null;
  if (credential.source === "ScheduledRotation") return `${source} · ${formatDate(credential.createdAt)}`;
  return `${source} · ${credential.actor ?? "CIPP"}`;
};

export const ownerLabel = (credential) => {
  if (credential.known) {
    const detail = credential.label ?? provenanceText(credential);
    return detail ? `Known · ${detail}` : "Known";
  }
  return ownerLabels[credential.owner] ?? ownerLabels.unknown;
};

const toIso = (value) => (value ? new Date(value).toISOString() : null);

// Display columns for the credentials table; the raw fields stay on the row for actions.
export const credentialRows = (credentials) =>
  credentials.map((credential) => ({
    ...credential,
    displayName: credential.displayName || "Unnamed",
    ownerLabel: ownerLabel(credential),
    provenance: provenanceText(credential) ?? "",
    startDateTime: toIso(credential.startDateTime),
    expirationDateTime: toIso(credential.endDateTime),
  }));

export const credentialActions = [
  {
    label: "Revoke credential",
    type: "POST",
    icon: <CippIcons.Delete />,
    url: "/api/ExecSAMCredentials",
    data: { Action: "!RevokeCredential", keyId: "keyId", type: "type" },
    confirmText:
      "Revoke the [type] [displayName] from CIPP-SAM? Anything still signing in with it will stop working. This cannot be undone.",
    condition: (row) => row.owner !== "thisInstance",
    color: "error",
    multiPost: false,
    relatedQueryKeys: ["SAMCredentialsStatus"],
  },
  {
    label: "Mark as known",
    type: "POST",
    icon: <CippIcons.Check />,
    url: "/api/ExecSAMCredentials",
    data: { Action: "!FlagCredential", keyId: "keyId" },
    confirmText: "Label [displayName] as known, e.g. the integration that uses it.",
    fields: [
      {
        type: "textField",
        name: "label",
        label: "Label",
        required: true,
        validators: {
          validate: (value) => (value?.trim() ? true : "Enter a label for this credential"),
        },
      },
    ],
    condition: (row) => !row.known && row.owner !== "thisInstance",
    multiPost: false,
    relatedQueryKeys: ["SAMCredentialsStatus"],
  },
  {
    label: "Remove known flag",
    type: "POST",
    icon: <CippIcons.Close />,
    url: "/api/ExecSAMCredentials",
    data: { Action: "!UnflagCredential", keyId: "keyId" },
    confirmText: "Remove the known label from [displayName]?",
    condition: (row) => Boolean(row.known && row.label),
    multiPost: false,
    relatedQueryKeys: ["SAMCredentialsStatus"],
  },
];

const Row = ({ label, children }) => (
  <>
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
    </Grid>
    <Grid size={{ xs: 12, sm: 8 }}>{children}</Grid>
  </>
);

const SectionTitle = ({ children }) => (
  <Grid size={12} sx={{ mt: 1 }}>
    <Typography variant="overline" sx={{ color: "text.secondary" }}>
      {children}
    </Typography>
  </Grid>
);

// Every status row reads the same way: text on the left, the status chip on the right, and any
// long message behind an icon. Keeping the chip trailing gives every row the same left edge.
const StatusLine = ({ chip, color = "default", text, detail }) => (
  <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
    <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }}>
      {text || "—"}
    </Typography>
    {detail && (
      <Tooltip title={<span style={{ whiteSpace: "pre-line" }}>{detail}</span>}>
        <CippIcons.InfoOutlined fontSize="small" sx={{ color: "text.secondary" }} />
      </Tooltip>
    )}
    {chip && <Chip label={chip} color={color} size="small" variant="outlined" />}
  </Stack>
);

export const CippSAMCredentials = () => {
  const samStatus = ApiGetCall({
    url: "/api/ExecSAMCredentials",
    data: { Action: "Status" },
    queryKey: "SAMCredentialsStatus",
  });

  const credentialsDialog = useDialog();
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const closeActions = () => setActionsAnchor(null);

  const data = samStatus.data?.Results;
  const overall = overallLabels[data?.overall] ?? overallLabels.notConfigured;
  const storedSecret = data?.storedSecret ?? {};
  const hasSecret = Boolean(data?.applicationId) && !["none", "notConfigured"].includes(storedSecret.state);
  const certificate = data?.certificate ?? {};
  const partnerToken = data?.partnerRefreshToken;
  const directTenants = data?.directTenants ?? [];
  const failingTenants = directTenants.filter((tenant) => tenant.state === "error");
  const credentials = data?.credentials ?? [];
  const isCertificateMode = data?.authMode === "certificate";
  const unreviewedCount = credentials.filter(
    (credential) => !credential.known && credential.owner !== "thisInstance"
  ).length;
  const expiredCount = credentials.filter((credential) => credential.expired).length;
  // While a fresh secret propagates, Graph reads fail and the credential list is empty, not zero.
  const credentialsUnreadable = Boolean(data?.credentialsError);

  // Every action confirms through the shared API dialog, which also shows the result.
  const actionDialog = useDialog();
  const [pendingAction, setPendingAction] = useState(null);
  const openAction = (action) => {
    closeActions();
    setPendingAction(action);
    actionDialog.handleOpen();
  };
  const samActions = {
    rotateSecret: {
      title: "Rotate client secret",
      confirmText:
        "Create a new client secret for CIPP-SAM and switch to it straight away? Microsoft can take several minutes to activate a new secret, sometimes 10 to 15, so token requests may fail with AADSTS7000215 until it has replicated. The previous secret stays on the app until it expires.",
      url: "/api/ExecSAMCredentials",
      data: { Action: "!RotateSecret" },
    },
    renewCertificate: {
      title: "Renew SAM certificate",
      confirmText:
        "Mint a new SAM certificate and register it on CIPP-SAM? The previous certificate stays registered until it expires.",
      url: "/api/ExecSAMCertificate",
      data: { Action: "!Renew" },
    },
    clearTokenCache: {
      title: "Clear token cache",
      confirmText:
        "Drop every cached Graph and Exchange token, including cached failures? Each worker fetches a fresh token on its next call. Use this after rotating or re-authenticating if token errors persist.",
      url: "/api/ExecSAMCredentials",
      data: { Action: "!ClearTokenCache" },
    },
    runTokenUpdate: {
      title: "Run token update",
      confirmText:
        "Run the weekly token update now? It renews the refresh tokens, rotates the client secret if it is within 30 days of expiry, and renews the certificate if needed.",
      url: "/api/ExecSAMCredentials",
      data: { Action: "!RunTokenUpdate" },
    },
  };

  const cardButtons = !samStatus.isLoading && (
    <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
      <Button
        variant="outlined"
        endIcon={<CippIcons.ExpandMore />}
        onClick={(event) => setActionsAnchor(event.currentTarget)}
      >
        Actions
      </Button>
      <Button variant="contained" onClick={credentialsDialog.handleOpen}>
        Manage credentials
      </Button>
      <Menu
        anchorEl={actionsAnchor}
        open={Boolean(actionsAnchor)}
        onClose={closeActions}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {hasSecret && (
          <MenuItem onClick={() => openAction(samActions.rotateSecret)}>
            <ListItemIcon>
              <CippIcons.Refresh fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Rotate secret" />
          </MenuItem>
        )}
        <MenuItem onClick={() => openAction(samActions.renewCertificate)}>
          <ListItemIcon>
            <CippIcons.Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Renew certificate" />
        </MenuItem>
        <MenuItem onClick={() => openAction(samActions.clearTokenCache)}>
          <ListItemIcon>
            <CippIcons.Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Clear token cache" />
        </MenuItem>
        <MenuItem onClick={() => openAction(samActions.runTokenUpdate)}>
          <ListItemIcon>
            <CippIcons.PlayArrow fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Run token update" />
        </MenuItem>
        <MenuItem component={Link} href="/onboardingv2?selectedOption=UpdateTokens" onClick={closeActions}>
          <ListItemIcon>
            <CippIcons.Login fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Re-authenticate" />
        </MenuItem>
        <MenuItem component={Link} href="/onboardingv2?selectedOption=Manual" onClick={closeActions}>
          <ListItemIcon>
            <CippIcons.Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Manual override" />
        </MenuItem>
      </Menu>
    </Stack>
  );

  return (
    <CippButtonCard
      title="CIPP-SAM application"
      cardActions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {!samStatus.isLoading && <Chip label={overall.label} color={overall.color} size="small" />}
          <CippQueryRefreshButton
            queryKeys={["SAMCredentialsStatus"]}
            isFetching={samStatus.isFetching}
            tooltip="Re-check the credentials and tokens"
          />
        </Stack>
      }
      CardButton={cardButtons}
      cardSx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <>
        {samStatus.isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
              <SectionTitle>Application</SectionTitle>
              <Row label="Application ID">
                {data?.applicationId ? (
                  <CippCopyToClipBoard text={data.applicationId} type="chip" />
                ) : (
                  <Typography variant="body2">—</Typography>
                )}
              </Row>
              <Row label="Partner tenant">
                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                  {data?.tenantDomain ?? data?.tenantId ?? "—"}
                </Typography>
              </Row>
              <Row label="Auth mode">
                <StatusLine
                  text={isCertificateMode ? "Certificate" : "Client secret"}
                  chip={
                    isCertificateMode
                      ? hasSecret
                        ? "Secret kept as rollback"
                        : null
                      : certificate.configured && certificate.registeredOnApp
                        ? "Certificate ready"
                        : null
                  }
                  color="default"
                />
              </Row>

              <SectionTitle>Credentials</SectionTitle>
              {hasSecret && (
                <Row label="Client secret">
                  <StatusLine
                    chip={(secretStateLabels[storedSecret.state] ?? secretStateLabels.error).label}
                    color={(secretStateLabels[storedSecret.state] ?? secretStateLabels.error).color}
                    text={storedSecret.expires ? `Expires ${formatDate(storedSecret.expires)}` : credentialsUnreadable ? "Expiry unknown" : ""}
                    detail={storedSecret.state !== "valid" ? storedSecret.message : null}
                  />
                </Row>
              )}
              <Row label="Certificate">
                <StatusLine
                  chip={
                    !certificate.configured
                      ? "Not provisioned"
                      : certificate.registeredOnApp
                        ? "Registered"
                        : credentialsUnreadable
                          ? "Registration unknown"
                          : "Not registered on app"
                  }
                  color={
                    !certificate.configured
                      ? "default"
                      : certificate.registeredOnApp
                        ? "success"
                        : credentialsUnreadable
                          ? "default"
                          : "warning"
                  }
                  text={certificate.configured ? `Expires ${formatDate(certificate.notAfter)}` : ""}
                />
              </Row>
              {certificate.configured && (
                <Row label="Thumbprint">
                  <CippCopyToClipBoard text={certificate.thumbprint} type="chip" />
                </Row>
              )}
              <Row label="On app registration">
                <StatusLine
                  text={credentialsUnreadable ? "Could not read the app registration" : `${credentials.length} total · ${expiredCount} expired`}
                  chip={credentialsUnreadable ? "Unavailable" : unreviewedCount > 0 ? `${unreviewedCount} unreviewed` : "Reviewed"}
                  color={credentialsUnreadable ? "warning" : unreviewedCount > 0 ? "warning" : "success"}
                  detail={credentialsUnreadable ? data.credentialsError : null}
                />
              </Row>

              <SectionTitle>Tokens</SectionTitle>
              {partnerToken && (
                <Row label="Refresh token">
                  <StatusLine
                    chip={partnerToken.state === "valid" ? "Valid" : "Failing"}
                    color={partnerToken.state === "valid" ? "success" : "error"}
                    text={partnerToken.updated ? `Rotated ${relative(partnerToken.updated)}` : "Partner tenant"}
                    detail={partnerToken.message}
                  />
                </Row>
              )}
              {directTenants.length > 0 && (
                <Row label="Direct tenants">
                  <StatusLine
                    chip={failingTenants.length > 0 ? `${failingTenants.length} failing` : "Valid"}
                    color={failingTenants.length > 0 ? "error" : "success"}
                    text={`${directTenants.length - failingTenants.length} of ${directTenants.length} healthy`}
                    detail={
                      failingTenants.length > 0
                        ? failingTenants
                            .map((tenant) => `${tenant.displayName ?? tenant.defaultDomainName}: ${tenant.message}`)
                            .join("\n")
                        : null
                    }
                  />
                </Row>
              )}
            </Grid>

          </Stack>
        )}
      </>
      {pendingAction && (
        <CippApiDialog
          createDialog={actionDialog}
          title={pendingAction.title}
          api={{
            url: pendingAction.url,
            type: "POST",
            data: pendingAction.data,
            confirmText: pendingAction.confirmText,
            relatedQueryKeys: ["SAMCredentialsStatus"],
          }}
          row={{}}
        />
      )}
      <CippTableDialog
        createDialog={credentialsDialog}
        title="Credentials on CIPP-SAM"
        data={credentialRows(credentials)}
        simpleColumns={["displayName", "ownerLabel", "type", "startDateTime", "expirationDateTime", "provenance"]}
        actions={credentialActions}
      />
    </CippButtonCard>
  );
};
