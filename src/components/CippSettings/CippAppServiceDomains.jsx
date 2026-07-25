import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import {
  CheckCircle,
  Cancel,
  HelpOutline,
  Lock,
  LockOpen,
  Refresh,
} from "@mui/icons-material";
import { PlusIcon, TrashIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "../CippTable/CippDataTable";
import CippButtonCard from "../CippCards/CippButtonCard";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";

const LIST_QUERY_KEY = "AppServiceDomains";

const sslStateLabel = (state) => {
  switch (state) {
    case "SniEnabled":
      return "Secured (SNI SSL)";
    case "IpBasedEnabled":
      return "Secured (IP SSL)";
    default:
      return "Not secured";
  }
};

// Client-side mirror of the backend Get-DomainRecordPlan so the required DNS records render the
// instant a hostname is typed — the live CheckDns call then overlays the verification status.
const computeRecordPlan = (hostname, siteInfo) => {
  const host = (hostname || "").trim().toLowerCase();
  const isWildcard = host.startsWith("*.");
  const base = isWildcard ? host.slice(2) : host;
  const labels = base.split(".").filter(Boolean);
  const isApex = !isWildcard && labels.length <= 2;
  const asuidHost = isWildcard ? `asuid.${base}` : `asuid.${host}`;

  return {
    host,
    isWildcard,
    isApex,
    recommendedType: isApex ? "A" : "CNAME",
    records: [
      {
        purpose: "Ownership",
        type: "TXT",
        host: asuidHost,
        value: siteInfo?.CustomDomainVerificationId ?? "",
      },
      isApex
        ? { purpose: "Alias", type: "A", host, value: siteInfo?.InboundIpAddress ?? "" }
        : { purpose: "Alias", type: "CNAME", host, value: siteInfo?.DefaultHostName ?? "" },
    ],
  };
};

const HOSTNAME_REGEX = /^(\*\.)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

const InfoRow = ({ label, value, copy = true }) => (
  <Grid container spacing={2} alignItems="center">
    <Grid size={{ xs: 5, md: 4 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid size={{ xs: 7, md: 8 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
          {value || "—"}
        </Typography>
        {copy && value ? <CippCopyToClipBoard text={value} /> : null}
      </Stack>
    </Grid>
  </Grid>
);

const VerifyIcon = ({ state }) => {
  if (state === true) {
    return (
      <Tooltip title="Verified">
        <CheckCircle color="success" fontSize="small" />
      </Tooltip>
    );
  }
  if (state === false) {
    return (
      <Tooltip title="Not found yet">
        <Cancel color="error" fontSize="small" />
      </Tooltip>
    );
  }
  return (
    <Tooltip title="Not checked yet">
      <HelpOutline color="disabled" fontSize="small" />
    </Tooltip>
  );
};

const anyPending = (mutations) => mutations.some((m) => m?.isPending);

// ── The add / fix domain wizard ─────────────────────────────────────────────
const DomainWizard = ({ open, onClose, siteInfo, initialDomain }) => {
  const managing = Boolean(initialDomain);
  const [activeStep, setActiveStep] = useState(0);
  const [hostname, setHostname] = useState("");
  const [bindingDone, setBindingDone] = useState(false);
  const [certDone, setCertDone] = useState(false);
  const [dnsResult, setDnsResult] = useState(null);

  const dnsCheck = ApiPostCall({ onResult: (body) => setDnsResult(body?.Results ?? null) });
  const bindingAction = ApiPostCall({
    relatedQueryKeys: [LIST_QUERY_KEY],
    onResult: () => {
      setBindingDone(true);
      setActiveStep(2);
    },
  });
  const certAction = ApiPostCall({
    relatedQueryKeys: [LIST_QUERY_KEY],
    onResult: () => setCertDone(true),
  });

  // (Re)initialize whenever the dialog opens so a reopened domain resumes at the right step.
  useEffect(() => {
    if (!open) return;
    dnsCheck.reset();
    bindingAction.reset();
    certAction.reset();
    setDnsResult(null);
    if (managing) {
      setHostname(initialDomain.Hostname);
      setBindingDone(true);
      setCertDone(Boolean(initialDomain.Secured));
      setActiveStep(2);
    } else {
      setHostname("");
      setBindingDone(false);
      setCertDone(false);
      setActiveStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const plan = useMemo(() => computeRecordPlan(hostname, siteInfo), [hostname, siteInfo]);
  const isWildcard = plan.isWildcard;
  const hostnameValid = HOSTNAME_REGEX.test(hostname.trim());

  // Overlay live verification (from CheckDns) onto the computed record list by matching purpose.
  const recordStatus = useMemo(() => {
    const map = {};
    (dnsResult?.Records ?? []).forEach((r) => {
      map[r.Purpose] = r.Verified;
    });
    return map;
  }, [dnsResult]);

  const ownershipVerified = dnsResult?.OwnershipVerified ?? false;
  const aliasVerified = dnsResult?.AliasVerified ?? false;

  const runDnsCheck = () => {
    dnsCheck.mutate({
      url: "/api/ExecAppServiceDomains",
      data: { Action: "CheckDns", Hostname: hostname.trim() },
    });
  };

  const runAddBinding = () => {
    bindingAction.mutate({
      url: "/api/ExecAppServiceDomains",
      data: { Action: "AddBinding", Hostname: hostname.trim() },
    });
  };

  const runAddCertificate = () => {
    certAction.mutate({
      url: "/api/ExecAppServiceDomains",
      data: { Action: "AddCertificate", Hostname: hostname.trim() },
    });
  };

  const steps = ["Verify domain ownership", "Create hostname binding", "Enable HTTPS certificate"];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {managing ? `Manage domain — ${initialDomain?.Hostname}` : "Add custom domain"}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 1, mb: 3 }}>
          {steps.map((label, idx) => (
            <Step
              key={label}
              completed={idx === 0 ? ownershipVerified || bindingDone : idx === 1 ? bindingDone : certDone}
            >
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0 — DNS ownership + alias records */}
        {activeStep === 0 && (
          <Stack spacing={2}>
            <TextField
              label="Custom domain"
              placeholder="portal.contoso.com or contoso.com or *.contoso.com"
              fullWidth
              value={hostname}
              onChange={(e) => {
                setHostname(e.target.value);
                setDnsResult(null);
              }}
              error={hostname.length > 0 && !hostnameValid}
              helperText={
                hostname.length > 0 && !hostnameValid
                  ? "Enter a fully qualified domain name (e.g. portal.contoso.com)."
                  : "The fully qualified domain you want CIPP to answer on."
              }
            />

            {hostnameValid && (
              <>
                <Alert severity="info">
                  Create the following records at your DNS provider, then click{" "}
                  <strong>Check DNS</strong>. The <strong>{plan.recommendedType}</strong> alias record
                  is recommended for this domain type; Azure also accepts the other alias type.
                </Alert>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Host / Name</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plan.records.map((r) => (
                      <TableRow key={r.purpose}>
                        <TableCell>{r.purpose}</TableCell>
                        <TableCell>
                          <Chip label={r.type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>
                          {r.host}
                          <CippCopyToClipBoard text={r.host} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                          {r.value}
                          {r.value ? <CippCopyToClipBoard text={r.value} /> : null}
                        </TableCell>
                        <TableCell align="center">
                          <VerifyIcon state={recordStatus[r.purpose]} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {isWildcard && (
                  <Alert severity="warning">
                    Wildcard domains verify by ownership only; the alias is validated by Azure when the
                    binding is created. Note: App Service Managed Certificates do not support wildcard
                    domains — you will need to upload your own certificate for HTTPS.
                  </Alert>
                )}
                {dnsResult && !ownershipVerified && (
                  <Alert severity="warning">
                    The ownership TXT record hasn't propagated yet. DNS changes can take a few minutes.{" "}
                    {dnsResult.AliasDetail}
                  </Alert>
                )}
                {dnsResult && ownershipVerified && !aliasVerified && !isWildcard && (
                  <Alert severity="info">
                    Ownership is verified. The alias record isn't visible yet — this is expected if the
                    record is proxied (e.g. Cloudflare orange-cloud). You can continue; Azure will make
                    the final check when the binding is created.
                  </Alert>
                )}
                {dnsCheck.isError && (
                  <Alert severity="error">
                    {dnsCheck.error?.response?.data?.Results ||
                      "Failed to run the DNS check. Please try again."}
                  </Alert>
                )}
              </>
            )}
          </Stack>
        )}

        {/* Step 1 — hostname binding */}
        {activeStep === 1 && (
          <Stack spacing={2}>
            <Alert severity="info">
              Create the hostname binding on the App Service for <strong>{hostname}</strong>. Azure
              re-validates the DNS records during this step.
            </Alert>
            {bindingDone ? (
              <Alert severity="success" icon={<CheckCircle fontSize="inherit" />}>
                The hostname binding for <strong>{hostname}</strong> exists.
              </Alert>
            ) : null}
            <CippApiResults apiObject={bindingAction} />
          </Stack>
        )}

        {/* Step 2 — managed certificate + SNI binding */}
        {activeStep === 2 && (
          <Stack spacing={2}>
            {certDone ? (
              <Alert severity="success" icon={<Lock fontSize="inherit" />}>
                <strong>{hostname}</strong> is fully configured and secured with a managed certificate.
              </Alert>
            ) : isWildcard ? (
              <Alert severity="warning">
                App Service Managed Certificates don't support wildcard domains. Upload your own
                certificate and binding from the Azure Portal to secure <strong>{hostname}</strong>.
              </Alert>
            ) : (
              <>
                <Alert severity="info">
                  Provision a free App Service Managed Certificate for <strong>{hostname}</strong> and
                  enable the SNI SSL binding. This can take a minute or two.
                </Alert>
                <Alert severity="warning">
                  If the domain's alias is proxied through a CDN (e.g. Cloudflare orange-cloud),
                  temporarily set it to DNS-only while the certificate is issued, then re-enable the
                  proxy afterwards. Certificate issuance validates the domain directly.
                </Alert>
              </>
            )}
            <CippApiResults apiObject={certAction} />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box>
          {activeStep > 0 && !managing && (
            <Button onClick={() => setActiveStep((s) => s - 1)} disabled={anyPending([dnsCheck, bindingAction, certAction])}>
              Back
            </Button>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>Close</Button>

          {activeStep === 0 && (
            <>
              <Button
                variant="outlined"
                onClick={runDnsCheck}
                disabled={!hostnameValid || dnsCheck.isPending}
                startIcon={dnsCheck.isPending ? <CircularProgress size={16} /> : <Refresh />}
              >
                {dnsCheck.isPending ? "Checking..." : "Check DNS"}
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                disabled={!ownershipVerified}
              >
                Next
              </Button>
            </>
          )}

          {activeStep === 1 && (
            <Button
              variant="contained"
              onClick={bindingDone ? () => setActiveStep(2) : runAddBinding}
              disabled={bindingAction.isPending}
              startIcon={bindingAction.isPending ? <CircularProgress size={16} /> : null}
            >
              {bindingDone ? "Next" : bindingAction.isPending ? "Creating..." : "Create binding"}
            </Button>
          )}

          {activeStep === 2 && !certDone && !isWildcard && (
            <Button
              variant="contained"
              onClick={runAddCertificate}
              disabled={certAction.isPending}
              startIcon={certAction.isPending ? <CircularProgress size={16} /> : <Lock />}
            >
              {certAction.isPending ? "Provisioning..." : "Provision certificate & enable HTTPS"}
            </Button>
          )}

          {activeStep === 2 && (certDone || isWildcard) && (
            <Button variant="contained" onClick={onClose}>
              Done
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export const CippAppServiceDomains = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [managingDomain, setManagingDomain] = useState(null);

  const domainsQuery = ApiGetCall({
    url: "/api/ExecAppServiceDomains",
    data: { Action: "List" },
    queryKey: LIST_QUERY_KEY,
  });

  const siteInfo = domainsQuery.data?.Results;
  const domains = useMemo(() => {
    const list = siteInfo?.Domains ?? [];
    return list.map((d) => ({
      ...d,
      Status: d.IsDefault ? "Default (Azure-managed)" : sslStateLabel(d.SslState),
    }));
  }, [siteInfo]);

  const openAddWizard = () => {
    setManagingDomain(null);
    setWizardOpen(true);
  };

  const openManageWizard = (row) => {
    setManagingDomain(row);
    setWizardOpen(true);
  };

  const actions = [
    {
      label: "Manage / Fix",
      icon: (
        <SvgIcon>
          <WrenchScrewdriverIcon />
        </SvgIcon>
      ),
      noConfirm: true,
      customFunction: (row) => openManageWizard(row),
      condition: (row) => !row.IsDefault,
    },
    {
      label: "Remove domain",
      icon: (
        <SvgIcon>
          <TrashIcon />
        </SvgIcon>
      ),
      color: "error.main",
      confirmText:
        "Remove the custom domain '[Hostname]' from the CIPP App Service? Any managed certificate for it will also be removed. The default *.azurewebsites.net hostname is unaffected.",
      url: "/api/ExecAppServiceDomains",
      type: "POST",
      data: { Action: "Remove", Hostname: "Hostname" },
      relatedQueryKeys: [LIST_QUERY_KEY],
      condition: (row) => !row.IsDefault,
    },
  ];

  const offCanvas = {
    children: (row) => (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Hostname
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
            {row.Hostname}
          </Typography>
        </Box>
        <Divider />
        <Stack direction="row" spacing={1} alignItems="center">
          {row.Secured ? <Lock color="success" fontSize="small" /> : <LockOpen color="disabled" fontSize="small" />}
          <Typography variant="body2">{sslStateLabel(row.SslState)}</Typography>
        </Stack>
        {row.HostNameType && (
          <Typography variant="body2" color="text.secondary">
            Binding type: {row.HostNameType}
          </Typography>
        )}
        {row.CertThumbprint && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Certificate thumbprint
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {row.CertThumbprint}
              </Typography>
            </Box>
            {row.CertExpiration && (
              <Typography variant="body2" color="text.secondary">
                Expires: {new Date(row.CertExpiration).toLocaleString()}
              </Typography>
            )}
          </>
        )}
      </Stack>
    ),
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Alert severity="info">
          Map custom domains to the App Service that hosts this CIPP instance. Each domain needs a DNS
          ownership record and an alias record, a hostname binding, and (optionally) a free managed
          TLS certificate — the wizard walks through all three and can be reopened at any time to
          finish or fix a domain. The default <code>*.azurewebsites.net</code> hostname always remains
          available.
        </Alert>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <CippButtonCard title="App Service" isFetching={domainsQuery.isFetching}>
          <CardContent>
            {domainsQuery.isLoading ? (
              <Stack spacing={2}>
                <Skeleton variant="rectangular" height={30} />
                <Skeleton variant="rectangular" height={30} />
                <Skeleton variant="rectangular" height={30} />
              </Stack>
            ) : domainsQuery.isError ? (
              <Alert severity="error">
                Could not load App Service details. Ensure the managed identity has access to the
                resource group.
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                <InfoRow label="Site name" value={siteInfo?.SiteName} copy={false} />
                <InfoRow label="Default hostname" value={siteInfo?.DefaultHostName} />
                <InfoRow label="Inbound IP (A record)" value={siteInfo?.InboundIpAddress} />
                <InfoRow
                  label="Domain verification ID"
                  value={siteInfo?.CustomDomainVerificationId}
                />
                <Typography variant="caption" color="text.secondary">
                  Use the default hostname as the CNAME target for subdomains, the inbound IP as the A
                  record for apex domains, and the verification ID as the <code>asuid</code> TXT value.
                </Typography>
              </Stack>
            )}
          </CardContent>
        </CippButtonCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <CippDataTable
          title="Custom Domains"
          data={domains}
          isFetching={domainsQuery.isFetching}
          refreshFunction={domainsQuery.refetch}
          simpleColumns={["Hostname", "Status"]}
          actions={actions}
          offCanvas={offCanvas}
          cardButton={
            <Button
              variant="contained"
              size="small"
              startIcon={
                <SvgIcon>
                  <PlusIcon />
                </SvgIcon>
              }
              onClick={openAddWizard}
            >
              Add Custom Domain
            </Button>
          }
        />
      </Grid>

      <DomainWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        siteInfo={siteInfo}
        initialDomain={managingDomain}
      />
    </Grid>
  );
};

export default CippAppServiceDomains;
