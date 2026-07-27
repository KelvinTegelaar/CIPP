import { useMemo, useState } from "react";
import Link from "next/link";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Grid } from "@mui/system";
import {
  Refresh,
  Storage,
  Language,
  Folder,
  Description,
  Warning,
  TrendingDown,
  Share,
  CheckCircle,
  Block,
  Public,
  PersonAdd,
  DataUsage,
  CleaningServices,
  Launch,
} from "@mui/icons-material";
import { useSettings } from "../../../hooks/use-settings";
import { ApiGetCall } from "../../../api/ApiCall.jsx";
import { CippChartCard } from "../../../components/CippCards/CippChartCard.jsx";
import { useDialog } from "../../../hooks/use-dialog";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { getCippFormatting } from "../../../utils/get-cipp-formatting";

const formatGB = (gb) => {
  if (!gb && gb !== 0) return "0 GB";
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(gb * 1024).toFixed(0)} MB`;
};

const formatMB = (mb) => {
  if (!mb && mb !== 0) return "0 MB";
  const gb = mb / 1024;
  const tb = gb / 1024;
  if (tb >= 1) return `${tb.toFixed(2)} TB`;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${mb.toFixed(0)} MB`;
};

const getStoragePercentage = (used, allocated) => {
  if (!allocated || allocated === 0) return 0;
  return Math.min(100, Math.round((used / allocated) * 100));
};

const getStorageStatusColor = (percentage) => {
  if (percentage >= 90) return "error";
  if (percentage >= 75) return "warning";
  return "success";
};

const isInactiveSite = (lastActivityDate) => {
  if (!lastActivityDate) return true;
  const lastActivity = new Date(lastActivityDate);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  return lastActivity < ninetyDaysAgo;
};

const getSharingLabel = (capability) => {
  const map = {
    disabled: "Disabled",
    externalUserSharingOnly: "Existing Guests Only",
    externalUserAndGuestSharing: "New and Existing Guests",
    existingExternalUserSharingOnly: "Existing Guests Only",
  };
  return map[capability] || capability || "Unknown";
};

const getSharingColor = (capability) => {
  if (capability === "disabled") return "error";
  if (capability === "existingExternalUserSharingOnly" || capability === "externalUserSharingOnly")
    return "warning";
  if (capability === "externalUserAndGuestSharing") return "info";
  return "default";
};

const getLinkTypeLabel = (type) => {
  const map = {
    internalLink: "Internal (People in Organization)",
    directLink: "Direct (Specific People)",
    anonymousLink: "Anonymous (Anyone with Link)",
  };
  return map[type] || type || "Unknown";
};

const StatCard = ({ title, value, subtitle, icon, color = "primary", isLoading }) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.12),
              color: theme.palette[color]?.main || theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {isLoading ? (
              <Skeleton width={80} height={36} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const SiteStorageRow = ({ site, maxStorage }) => {
  const pct = getStoragePercentage(site.storageUsedInGigabytes, site.storageAllocatedInGigabytes);
  const color = getStorageStatusColor(pct);
  const barWidth = maxStorage > 0 ? (site.storageUsedInGigabytes / maxStorage) * 100 : 0;

  return (
    <Stack spacing={0.5} sx={{ py: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1, fontWeight: 500 }}>
          {site.displayName || "Unknown"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {formatGB(site.storageUsedInGigabytes)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={barWidth}
        color={color}
        sx={{ height: 6, borderRadius: 3, bgcolor: (t) => alpha(t.palette.grey[500], 0.15) }}
      />
    </Stack>
  );
};

const Page = () => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const currentTenant = useSettings().currentTenant;
  const refreshDialog = useDialog();
  const [actionSite, setActionSite] = useState(null);
  const quotaDialog = useDialog();
  const cleanupDialog = useDialog();

  const openSiteDialog = (site, dialog) => {
    setActionSite(site);
    dialog.handleOpen();
  };

  const suggestedQuota = useMemo(() => {
    if (!actionSite) return {};
    const current = actionSite.storageAllocatedInGigabytes || actionSite.storageUsedInGigabytes || 1;
    const suggested = Math.ceil(current * 1.25);
    return {
      StorageMaximumLevelGB: String(suggested),
      StorageWarningLevelGB: String(Math.floor(suggested * 0.9)),
    };
  }, [actionSite]);

  const siteDetailsHref = (site) => {
    const params = new URLSearchParams({
      siteId: site.siteId || "",
      displayName: site.displayName || "",
      webUrl: site.webUrl || "",
      rootWebTemplate: site.rootWebTemplate || "",
      ownerPrincipalName: site.ownerPrincipalName || "",
      ownerDisplayName: site.ownerDisplayName || "",
      storageUsedInGigabytes: String(site.storageUsedInGigabytes || 0),
      storageAllocatedInGigabytes: String(site.storageAllocatedInGigabytes || 0),
      fileCount: String(site.fileCount || 0),
      lastActivityDate: site.lastActivityDate || "",
      createdDateTime: site.createdDateTime || "",
      reportRefreshDate: site.reportRefreshDate || "",
    });
    return `/teams-share/sharepoint/site-details?${params.toString()}`;
  };

  const siteUsage = ApiGetCall({
    url: "/api/ListDBCache",
    queryKey: `${currentTenant}-SPDashboard-SiteUsage`,
    data: { tenantFilter: currentTenant, type: "SharePointSiteUsage" },
    waiting: !!currentTenant,
  });

  const quota = ApiGetCall({
    url: "/api/ListDBCache",
    queryKey: `${currentTenant}-SPDashboard-Quota`,
    data: { tenantFilter: currentTenant, type: "SharePointQuota" },
    waiting: !!currentTenant,
  });

  const settings = ApiGetCall({
    url: "/api/ListDBCache",
    queryKey: `${currentTenant}-SPDashboard-Settings`,
    data: { tenantFilter: currentTenant, type: "SharePointSettings" },
    waiting: !!currentTenant,
  });

  const sites = useMemo(() => {
    const r = siteUsage.data?.Results;
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
  }, [siteUsage.data]);
  const quotaData = useMemo(() => {
    const r = quota.data?.Results;
    if (!r) return null;
    return Array.isArray(r) ? r[0] || null : r;
  }, [quota.data]);
  const settingsData = useMemo(() => {
    const r = settings.data?.Results;
    if (!r) return null;
    return Array.isArray(r) ? r[0] || null : r;
  }, [settings.data]);

  const isLoading = siteUsage.isFetching || quota.isFetching || settings.isFetching;

  const totalFiles = useMemo(
    () => sites.reduce((acc, s) => acc + (s.fileCount || 0), 0),
    [sites]
  );
  const totalStorageUsedGB = useMemo(
    () => sites.reduce((acc, s) => acc + (s.storageUsedInGigabytes || 0), 0),
    [sites]
  );
  const inactiveSites = useMemo(() => sites.filter((s) => isInactiveSite(s.lastActivityDate)), [sites]);
  const alertSites = useMemo(
    () =>
      sites
        .filter((s) => {
          const pct = getStoragePercentage(s.storageUsedInGigabytes, s.storageAllocatedInGigabytes);
          return pct >= 75;
        })
        .sort((a, b) => {
          const pctA = getStoragePercentage(a.storageUsedInGigabytes, a.storageAllocatedInGigabytes);
          const pctB = getStoragePercentage(b.storageUsedInGigabytes, b.storageAllocatedInGigabytes);
          return pctB - pctA;
        }),
    [sites]
  );

  const topSitesByStorage = useMemo(
    () =>
      [...sites]
        .sort((a, b) => (b.storageUsedInGigabytes || 0) - (a.storageUsedInGigabytes || 0))
        .slice(0, 10),
    [sites]
  );

  const storageByType = useMemo(() => {
    const typeMap = {};
    sites.forEach((s) => {
      let label = "Other";
      const tmpl = s.rootWebTemplate || "";
      if (tmpl.includes("Communication")) label = "Communication";
      else if (tmpl.includes("Group")) label = "Group-Connected";
      else if (tmpl.includes("Team") || tmpl.includes("STS")) label = "Classic/Team";
      typeMap[label] = (typeMap[label] || 0) + (s.storageUsedInGigabytes || 0);
    });
    return Object.entries(typeMap)
      .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [sites]);

  const recentSites = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return sites
      .filter((s) => s.createdDateTime && new Date(s.createdDateTime) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime))
      .slice(0, 10);
  }, [sites]);

  const reportRefreshDate = useMemo(() => {
    const first = sites.find((s) => s.reportRefreshDate);
    return first?.reportRefreshDate || null;
  }, [sites]);

  const maxTopStorage = useMemo(
    () => (topSitesByStorage.length > 0 ? topSitesByStorage[0].storageUsedInGigabytes || 0 : 0),
    [topSitesByStorage]
  );

  const noData = !isLoading && sites.length === 0 && !quotaData;

  return (
    <>
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4">SharePoint Dashboard</Typography>
              {reportRefreshDate && (
                <Typography variant="body2" color="text.secondary">
                  Data as of {getCippFormatting(reportRefreshDate, "reportRefreshDate")}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={refreshDialog.handleOpen}
              disabled={isLoading}
            >
              {smDown ? "" : "Refresh Data"}
            </Button>
          </Stack>

          {noData && (
            <Paper sx={{ p: 4, textAlign: "center", mb: 3 }}>
              <Storage sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Cached Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                SharePoint data has not been cached yet for this tenant. Click &quot;Refresh
                Data&quot; to populate the dashboard, or wait for the next daily cache run.
              </Typography>
              <Button variant="outlined" startIcon={<Refresh />} onClick={refreshDialog.handleOpen}>
                Refresh Data Now
              </Button>
            </Paper>
          )}

          {!noData && (
            <Stack spacing={3}>
              {/* Row 1: Key Metrics */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Tenant Storage Used"
                    value={quotaData ? formatMB(quotaData.GeoUsedStorageMB) : formatGB(totalStorageUsedGB)}
                    subtitle={quotaData ? `of ${formatMB(quotaData.TenantStorageMB)} total` : null}
                    icon={<Storage />}
                    color="primary"
                    isLoading={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Total Sites"
                    value={sites.length.toLocaleString()}
                    icon={<Language />}
                    color="info"
                    isLoading={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Total Files"
                    value={totalFiles.toLocaleString()}
                    icon={<Description />}
                    color="success"
                    isLoading={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title="Inactive Sites"
                    value={inactiveSites.length.toLocaleString()}
                    subtitle="No activity in 90+ days"
                    icon={<TrendingDown />}
                    color={inactiveSites.length > 0 ? "warning" : "success"}
                    isLoading={isLoading}
                  />
                </Grid>
              </Grid>

              {/* Row 2: Storage Charts */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CippChartCard
                    title="Tenant Quota"
                    isFetching={quota.isFetching}
                    chartType="donut"
                    chartSeries={
                      quotaData
                        ? [
                            Number(quotaData.TenantStorageMB - quotaData.GeoUsedStorageMB) || 0,
                            Number(quotaData.GeoUsedStorageMB) || 0,
                          ]
                        : []
                    }
                    labels={["Free", "Used"]}
                    formatValue={formatMB}
                    colors={["hsl(140, 50%, 72%)", "hsl(210, 55%, 58%)"]}
                    headerIcon={<Storage sx={{ fontSize: 20 }} />}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CippChartCard
                    title="Storage by Site Type"
                    isFetching={siteUsage.isFetching}
                    chartType="donut"
                    chartSeries={storageByType.map((t) => t.value)}
                    labels={storageByType.map((t) => t.label)}
                    formatValue={(v) => formatGB(v)}
                    headerIcon={<Folder sx={{ fontSize: 20 }} />}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CippChartCard
                    title="Top Sites by Storage"
                    isFetching={siteUsage.isFetching}
                    chartType="bar"
                    chartSeries={topSitesByStorage.map((s) => s.storageUsedInGigabytes || 0)}
                    labels={topSitesByStorage.map(
                      (s) =>
                        (s.displayName || "Unknown").length > 18
                          ? (s.displayName || "Unknown").slice(0, 18) + "..."
                          : s.displayName || "Unknown"
                    )}
                    formatValue={(v) => formatGB(v)}
                    headerIcon={<Storage sx={{ fontSize: 20 }} />}
                  />
                </Grid>
              </Grid>

              {/* Row 3: Storage Details & Alerts */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: "100%" }}>
                    <CardHeader
                      title={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Warning sx={{ fontSize: 20, color: "warning.main" }} />
                          <Typography variant="h6">Storage Alerts</Typography>
                          {alertSites.length > 0 && (
                            <Chip label={alertSites.length} size="small" color="warning" />
                          )}
                        </Stack>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ maxHeight: 400, overflow: "auto" }}>
                      {siteUsage.isFetching ? (
                        <Stack spacing={1}>
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} height={50} />
                          ))}
                        </Stack>
                      ) : alertSites.length === 0 ? (
                        <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                          <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
                          <Typography variant="body2" color="text.secondary">
                            No sites are approaching storage limits
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack spacing={0} divider={<Divider />}>
                          {alertSites.map((site) => {
                            const pct = getStoragePercentage(
                              site.storageUsedInGigabytes,
                              site.storageAllocatedInGigabytes
                            );
                            const color = getStorageStatusColor(pct);
                            return (
                              <Stack
                                key={site.siteId}
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                sx={{ py: 1.5 }}
                              >
                                <Chip
                                  label={`${pct}%`}
                                  size="small"
                                  color={color}
                                  sx={{ fontWeight: 600, minWidth: 56 }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                    {site.displayName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatGB(site.storageUsedInGigabytes)} of{" "}
                                    {formatGB(site.storageAllocatedInGigabytes)}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.5}>
                                  <Tooltip title="Increase storage quota">
                                    <IconButton size="small" onClick={() => openSiteDialog(site, quotaDialog)}>
                                      <DataUsage fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Run version cleanup">
                                    <IconButton size="small" onClick={() => openSiteDialog(site, cleanupDialog)}>
                                      <CleaningServices fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="View site details">
                                    <IconButton size="small" component={Link} href={siteDetailsHref(site)}>
                                      <Launch fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                            );
                          })}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: "100%" }}>
                    <CardHeader
                      title={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Storage sx={{ fontSize: 20 }} />
                          <Typography variant="h6">Top 10 Sites by Storage</Typography>
                        </Stack>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ maxHeight: 400, overflow: "auto" }}>
                      {siteUsage.isFetching ? (
                        <Stack spacing={1}>
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} height={50} />
                          ))}
                        </Stack>
                      ) : topSitesByStorage.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                          No site data available
                        </Typography>
                      ) : (
                        <Stack spacing={0} divider={<Divider />}>
                          {topSitesByStorage.map((site) => (
                            <SiteStorageRow
                              key={site.siteId}
                              site={site}
                              maxStorage={maxTopStorage}
                            />
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Row 4: Inactive Sites & Sharing Config */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: "100%" }}>
                    <CardHeader
                      title={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TrendingDown sx={{ fontSize: 20, color: "warning.main" }} />
                          <Typography variant="h6">Inactive Sites</Typography>
                          {inactiveSites.length > 0 && (
                            <Chip label={inactiveSites.length} size="small" color="warning" />
                          )}
                        </Stack>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ maxHeight: 400, overflow: "auto" }}>
                      {siteUsage.isFetching ? (
                        <Stack spacing={1}>
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} height={50} />
                          ))}
                        </Stack>
                      ) : inactiveSites.length === 0 ? (
                        <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                          <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
                          <Typography variant="body2" color="text.secondary">
                            All sites have been active in the last 90 days
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack spacing={0} divider={<Divider />}>
                          {inactiveSites
                            .sort(
                              (a, b) =>
                                (b.storageUsedInGigabytes || 0) - (a.storageUsedInGigabytes || 0)
                            )
                            .slice(0, 20)
                            .map((site) => (
                              <Stack
                                key={site.siteId}
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                sx={{ py: 1.5 }}
                              >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                    {site.displayName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Last active:{" "}
                                    {site.lastActivityDate
                                      ? getCippFormatting(site.lastActivityDate, "lastActivityDate")
                                      : "Never"}{" "}
                                    &middot; {formatGB(site.storageUsedInGigabytes)} used
                                  </Typography>
                                </Box>
                              </Stack>
                            ))}
                          {inactiveSites.length > 20 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ pt: 1, textAlign: "center", display: "block" }}
                            >
                              + {inactiveSites.length - 20} more inactive sites
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={3}>
                    <Card>
                      <CardHeader
                        title={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Share sx={{ fontSize: 20 }} />
                            <Typography variant="h6">Sharing Configuration</Typography>
                          </Stack>
                        }
                      />
                      <Divider />
                      <CardContent>
                        {settings.isFetching ? (
                          <Stack spacing={1}>
                            {[...Array(4)].map((_, i) => (
                              <Skeleton key={i} height={32} />
                            ))}
                          </Stack>
                        ) : !settingsData ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                            No settings data cached yet
                          </Typography>
                        ) : (
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                External Sharing
                              </Typography>
                              <Chip
                                label={getSharingLabel(settingsData.sharingCapability)}
                                size="small"
                                color={getSharingColor(settingsData.sharingCapability)}
                                icon={
                                  settingsData.sharingCapability === "disabled" ? (
                                    <Block fontSize="small" />
                                  ) : (
                                    <Public fontSize="small" />
                                  )
                                }
                              />
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                Default Sharing Link Type
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {getLinkTypeLabel(settingsData.sharingDefaultLinkType)}
                              </Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                Resharing by External Users
                              </Typography>
                              <Chip
                                label={
                                  settingsData.isResharingByExternalUsersEnabled
                                    ? "Allowed"
                                    : "Blocked"
                                }
                                size="small"
                                color={
                                  settingsData.isResharingByExternalUsersEnabled ? "info" : "success"
                                }
                              />
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                Sharing Link Expiration (days)
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {settingsData.sharingDefaultLinkExpirationInDays || "No expiration"}
                              </Typography>
                            </Stack>
                          </Stack>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader
                        title={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonAdd sx={{ fontSize: 20 }} />
                            <Typography variant="h6">Recently Created Sites</Typography>
                            {recentSites.length > 0 && (
                              <Chip label={recentSites.length} size="small" color="info" />
                            )}
                          </Stack>
                        }
                      />
                      <Divider />
                      <CardContent sx={{ maxHeight: 300, overflow: "auto" }}>
                        {siteUsage.isFetching ? (
                          <Stack spacing={1}>
                            {[...Array(3)].map((_, i) => (
                              <Skeleton key={i} height={40} />
                            ))}
                          </Stack>
                        ) : recentSites.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 2, textAlign: "center" }}
                          >
                            No sites created in the last 30 days
                          </Typography>
                        ) : (
                          <Stack spacing={0} divider={<Divider />}>
                            {recentSites.map((site) => (
                              <Stack
                                key={site.siteId}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ py: 1.5 }}
                              >
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                    {site.displayName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {site.rootWebTemplate || "Site"}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", ml: 1 }}>
                                  {getCippFormatting(site.createdDateTime, "createdDateTime")}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Container>
      </Box>

      <CippApiDialog
        createDialog={refreshDialog}
        title="Refresh SharePoint Data"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText:
            "Refresh SharePoint dashboard data for this tenant? This will fetch the latest site usage, quota, and settings from Microsoft. The refresh runs in the background and may take a few minutes to complete.",
          relatedQueryKeys: [
            `${currentTenant}-SPDashboard-SiteUsage`,
            `${currentTenant}-SPDashboard-Quota`,
            `${currentTenant}-SPDashboard-Settings`,
          ],
          data: {
            Name: "SharePointSiteUsage",
            Types: "None",
          },
        }}
      />
      <CippApiDialog
        createDialog={quotaDialog}
        title={`Increase Storage Quota${actionSite ? ` — ${actionSite.displayName}` : ""}`}
        fields={[
          { type: "textField", name: "StorageMaximumLevelGB", label: "Maximum Storage (GB)", required: true },
          { type: "textField", name: "StorageWarningLevelGB", label: "Warning Level (GB, optional — defaults to 90% of max)" },
        ]}
        defaultvalues={suggestedQuota}
        api={{
          type: "POST",
          url: "/api/ExecSetSiteProperty",
          data: {
            SiteId: actionSite?.siteId,
            DisplayName: actionSite?.displayName,
            tenantFilter: currentTenant,
          },
          confirmText: `Set a new storage quota for '${actionSite?.displayName ?? "this site"}'. Values are in GB. The suggested value is 25% above the current allocation. Note: per-site limits only apply when the tenant uses manual site storage limits.`,
          relatedQueryKeys: [`${currentTenant}-SPDashboard-SiteUsage`],
        }}
        row={actionSite ?? {}}
      />
      <CippApiDialog
        createDialog={cleanupDialog}
        title={`Version Cleanup${actionSite ? ` — ${actionSite.displayName}` : ""}`}
        fields={[]}
        api={{
          type: "POST",
          url: "/api/ExecSPOVersionCleanup",
          data: {
            SiteUrl: actionSite?.webUrl,
            tenantFilter: currentTenant,
            BatchDeleteMode: 2,
            DeleteOlderThanDays: -1,
            MajorVersionLimit: -1,
            MajorWithMinorVersionsLimit: -1,
          },
          confirmText: `Start a file version cleanup job for '${actionSite?.displayName ?? "this site"}' using the site's version policy (Sync Policy mode). For other cleanup modes, use the action on the Sites page.`,
        }}
        row={actionSite ?? {}}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
