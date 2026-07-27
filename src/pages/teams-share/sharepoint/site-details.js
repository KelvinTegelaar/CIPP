import { Layout as DashboardLayout } from "../../../layouts/index.js";
import {
  Paper,
  Avatar,
  Typography,
  Chip,
  Divider,
  useTheme,
  Tooltip,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Box, Stack, Container, Grid } from "@mui/system";
import {
  Language,
  Campaign,
  Group,
  FolderShared,
  Person,
  Storage,
  Folder,
  FolderOpen,
  CalendarToday,
  Description,
  OpenInNew,
  ArrowBack,
  Warning,
  TrendingDown,
  CheckCircle,
  PersonAdd,
  PersonRemove,
  AdminPanelSettings,
  NoAccounts,
  Lock,
  Share,
  DataUsage,
  QueryStats,
  Delete,
  Hub,
  Groups,
  Send,
  Refresh,
  CleaningServices,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { useSettings } from "../../../hooks/use-settings";
import { ApiGetCall } from "../../../api/ApiCall";
import { CippHead } from "../../../components/CippComponents/CippHead";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import CippGuestInviteDialog from "../../../components/CippComponents/CippGuestInviteDialog";
import CippMemberAuditDialog from "../../../components/CippComponents/CippMemberAuditDialog";
import { useDialog } from "../../../hooks/use-dialog";
import { getCippFormatting } from "../../../utils/get-cipp-formatting";
import CippAccessTypeGuide from "../../../components/CippComponents/CippAccessTypeGuide";
import { ActionsMenu } from "../../../components/actions-menu";
import { useCippSiteActions } from "../../../components/CippComponents/CippSiteActions";

// Helpers
const getSiteTypeInfo = (template) => {
  const templateMap = {
    "Communication Site": { icon: <Campaign />, color: "primary", label: "Communication Site" },
    Group: { icon: <Group />, color: "info", label: "Group-Connected Site" },
    "Team Site": { icon: <FolderShared />, color: "secondary", label: "Classic Site" },
    STS: { icon: <FolderShared />, color: "secondary", label: "Classic Site" },
  };
  for (const [key, value] of Object.entries(templateMap)) {
    if (template?.includes(key)) return value;
  }
  return { icon: <Language />, color: "default", label: template || "Site" };
};

const getStoragePercentage = (used, allocated) => {
  if (!allocated || allocated === 0) return 0;
  return Math.min(100, Math.round((used / allocated) * 100));
};

const getStorageStatusColor = (pct) => {
  if (pct >= 90) return "error";
  if (pct >= 75) return "warning";
  return "success";
};

const isInactiveSite = (lastActivityDate) => {
  if (!lastActivityDate) return true;
  const d = new Date(lastActivityDate);
  const ago = new Date();
  ago.setDate(ago.getDate() - 90);
  return d < ago;
};

const StatBox = ({ value, label, color = "primary", sub }) => (
  <Box sx={{ textAlign: "center", px: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, color: `${color}.main`, lineHeight: 1.2 }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    {sub && (
      <Typography variant="caption" display="block" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
        {sub}
      </Typography>
    )}
  </Box>
);

const InfoRow = ({ label, value, children }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.25 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    {children || (
      <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: "60%", textAlign: "right" }} noWrap>
        {value ?? "—"}
      </Typography>
    )}
  </Stack>
);

const Page = () => {
  const router = useRouter();
  const tenantFilter = useSettings().currentTenant;
  const theme = useTheme();

  // Strip unresolved [placeholder] values that leak through from link templates
  const cleanParam = (val) => (typeof val === "string" && /^\[.+\]$/.test(val) ? "" : val);

  const {
    siteId,
    displayName: rawName,
    webUrl: rawUrl,
    rootWebTemplate: rawTemplate,
    ownerPrincipalName: rawOwner,
    ownerDisplayName: rawOwnerDisplay,
    storageUsedInGigabytes: rawUsed,
    storageAllocatedInGigabytes: rawAllocated,
    fileCount: rawFiles,
    lastActivityDate: rawLastActivity,
    createdDateTime: rawCreated,
    reportRefreshDate: rawRefresh,
  } = router.query;

  const qName = cleanParam(rawName);
  const qUrl = cleanParam(rawUrl);
  const qTemplate = cleanParam(rawTemplate);
  const qOwner = cleanParam(rawOwner);
  const qOwnerDisplay = cleanParam(rawOwnerDisplay);
  const qUsed = cleanParam(rawUsed);
  const qAllocated = cleanParam(rawAllocated);
  const qFiles = cleanParam(rawFiles);
  const qLastActivity = cleanParam(rawLastActivity);
  const qCreated = cleanParam(rawCreated);
  const qRefresh = cleanParam(rawRefresh);

  // Fetch site usage data to populate fields not available from query params
  // This will use React Query's cache if the list page was recently viewed
  const siteUsageData = ApiGetCall({
    url: "/api/ListSites",
    data: { type: "SharePointSiteUsage", tenantFilter },
    queryKey: `SharePointSiteUsage-${tenantFilter}`,
    waiting: !!(siteId && tenantFilter),
  });
  const siteFromApi = siteUsageData?.data?.find?.((s) => s.siteId === siteId);

  // Merge: query params take priority, API data fills gaps
  const displayName = qName || siteFromApi?.displayName || "Site Details";
  const webUrl = qUrl || siteFromApi?.webUrl || "";
  const rootWebTemplate = qTemplate || siteFromApi?.rootWebTemplate || "";
  const ownerPrincipalName = qOwner || siteFromApi?.ownerPrincipalName || "";
  const ownerDisplayName = qOwnerDisplay || qOwner || siteFromApi?.ownerDisplayName || siteFromApi?.ownerPrincipalName || "";
  const storageUsed = parseFloat(qUsed) || siteFromApi?.storageUsedInGigabytes || 0;
  const storageAllocated = parseFloat(qAllocated) || siteFromApi?.storageAllocatedInGigabytes || 0;
  const fileCount = parseInt(qFiles) || siteFromApi?.fileCount || 0;
  const lastActivityDate = qLastActivity || siteFromApi?.lastActivityDate || "";
  const createdDateTime = qCreated || siteFromApi?.createdDateTime || "";
  const reportRefreshDate = qRefresh || siteFromApi?.reportRefreshDate || "";

  const typeInfo = getSiteTypeInfo(rootWebTemplate);
  const storagePct = getStoragePercentage(storageUsed, storageAllocated);
  const inactive = isInactiveSite(lastActivityDate);

  // Resolve associated M365 Group — always attempt the lookup so we have the
  // group GUID ready even when rootWebTemplate is unknown (e.g. placeholder or
  // usage data hasn't loaded). The query is cheap and returns empty for non-group sites.
  const sitePathName = webUrl ? decodeURIComponent(webUrl.split("/sites/")[1]?.split("/")[0] || "") : "";
  const groupLookup = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "groups",
      $filter: `mailNickname eq '${sitePathName}'`,
      $select: "id,displayName,resourceProvisioningOptions",
      $count: true,
      tenantFilter: tenantFilter,
    },
    queryKey: `site-group-lookup-${siteId}`,
    waiting: !!(sitePathName && tenantFilter && siteId),
  });
  const associatedGroup = groupLookup?.data?.Results?.[0];
  const isGroupConnected = !!associatedGroup || rootWebTemplate?.includes("Group");
  const isTeamEnabled =
    associatedGroup?.resourceProvisioningOptions?.includes("Team") ?? false;
  const associatedTeamId = isTeamEnabled ? associatedGroup.id : null;
  const associatedTeamName = isTeamEnabled ? associatedGroup.displayName : null;

  const groupIdForApi = associatedGroup?.id || ownerPrincipalName;

  const siteActions = useCippSiteActions();
  const siteRow = useMemo(
    () => ({
      siteId,
      displayName,
      webUrl,
      rootWebTemplate,
      ownerPrincipalName,
      ownerDisplayName,
      storageUsedInGigabytes: storageUsed,
      storageAllocatedInGigabytes: storageAllocated,
      fileCount,
      lastActivityDate,
      createdDateTime,
      reportRefreshDate,
      Tenant: tenantFilter,
    }),
    [
      siteId,
      displayName,
      webUrl,
      rootWebTemplate,
      ownerPrincipalName,
      ownerDisplayName,
      storageUsed,
      storageAllocated,
      fileCount,
      lastActivityDate,
      createdDateTime,
      reportRefreshDate,
      tenantFilter,
    ]
  );
  const detailPageActions = useMemo(
    () =>
      siteActions.filter(
        (a) =>
          ![
            "View Details",
            "Open Site",
            "Add Member",
            "Add Site Admin",
            "Create Team from Site",
            "Set Storage Quota",
            "Start Version Cleanup Job",
          ].includes(a.label)
      ),
    [siteActions]
  );

  // Live storage fetch ("Refresh Live")
  const liveStorage = ApiGetCall({
    url: "/api/ListSiteLiveStorage",
    data: { SiteId: siteId, TenantFilter: tenantFilter },
    queryKey: `site-live-storage-${siteId}`,
    waiting: false,
    toast: true,
  });
  const live = liveStorage.data;
  const shownUsed = live?.storageUsedInGigabytes ?? storageUsed;
  const shownAllocated = live?.storageAllocatedInGigabytes ?? storageAllocated;
  const shownPct = live ? Math.round(live.storagePercentage) : storagePct;
  const shownColor = getStorageStatusColor(shownPct);

  const quotaDialog = useDialog();
  const quotaAction = siteActions.find((a) => a.label === "Set Storage Quota");
  const cleanupDialog = useDialog();
  const cleanupAction = siteActions.find((a) => a.label === "Start Version Cleanup Job");

  // Add Member dialog
  const addMemberDialog = useDialog();
  const addMemberApi = {
    url: "/api/ExecSetSharePointMember",
    type: "POST",
    data: {
      groupId: groupIdForApi,
      add: true,
      URL: webUrl,
      SharePointType: rootWebTemplate,
    },
    confirmText: "Select a user to add as a member to this site.",
    relatedQueryKeys: [`site-members-${siteId}`],
  };

  // Add Admin dialog
  const addAdminDialog = useDialog();
  const addAdminApi = {
    url: "/api/ExecSharePointPerms",
    type: "POST",
    data: {
      UPN: ownerPrincipalName,
      RemovePermission: false,
      URL: webUrl,
    },
    confirmText: "Select a user to add as a Site Admin.",
    relatedQueryKeys: [`site-members-${siteId}`],
  };

  // Create Team from Group dialog
  const createTeamDialog = useDialog();
  const createTeamApi = {
    url: "/api/ExecTeamFromGroup",
    type: "POST",
    data: {
      SiteId: siteId,
      DisplayName: displayName,
    },
    confirmText:
      "Create a Microsoft Team for this site? This will team-enable the existing Microsoft 365 Group, preserving the current site, membership, and content. Full Team provisioning may take a few minutes.",
  };

  // Invite Guest dialog
  const [inviteGuestOpen, setInviteGuestOpen] = useState(false);

  // Member Audit dialog
  const [auditOpen, setAuditOpen] = useState(false);

  const userPickerField = [
    {
      type: "autoComplete",
      name: "user",
      label: "Select User",
      multiple: false,
      creatable: false,
      api: {
        url: "/api/ListGraphRequest",
        data: {
          Endpoint: "users",
          $select: "id,displayName,userPrincipalName",
          $top: 999,
          $count: true,
        },
        queryKey: "ListUsersAutoComplete",
        dataKey: "Results",
        labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
        valueField: "userPrincipalName",
        addedField: { id: "id" },
        showRefresh: true,
      },
      validators: { validate: (v) => (!v ? "Please select a user" : true) },
    },
  ];

  // Member table actions
  const memberActions = [
    {
      label: "Remove Member",
      type: "POST",
      icon: <PersonRemove />,
      url: "/api/ExecSetSharePointMember",
      data: {
        groupId: `!${groupIdForApi}`,
        add: "!false",
        URL: `!${webUrl}`,
        SharePointType: `!${rootWebTemplate}`,
        user: "UserPrincipalName",
        loginName: "LoginName",
        Role: "Group",
        MemberType: "Type",
      },
      confirmText: "Remove this user from the site?",
      condition: (row) => ["Owners", "Members", "Visitors"].includes(row.Group),
      category: "danger",
    },
  ];

  // Wait for router to be ready before checking params
  if (!router.isReady) {
    return (
      <>
        <CippHead title="Site Details" />
        <Container maxWidth={false}>
          <Stack spacing={2} sx={{ py: 4 }}>
            <Button component={Link} href="/teams-share/sharepoint" startIcon={<ArrowBack />} sx={{ alignSelf: "flex-start" }}>
              Back to Sites
            </Button>
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          </Stack>
        </Container>
      </>
    );
  }

  if (!siteId) {
    return (
      <>
        <CippHead title="Site Details" />
        <Container maxWidth={false}>
          <Stack spacing={2} sx={{ py: 4 }}>
            <Button component={Link} href="/teams-share/sharepoint" startIcon={<ArrowBack />} sx={{ alignSelf: "flex-start" }}>
              Back to Sites
            </Button>
            <Alert severity="error">No site ID provided. Please navigate here from the SharePoint Sites list.</Alert>
          </Stack>
        </Container>
      </>
    );
  }

  return (
    <>
      <CippHead title={`${displayName} - Site Details`} />
      <Container maxWidth={false}>
        <Stack spacing={2} sx={{ py: 3 }}>
          {/* Back + Actions */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button component={Link} href="/teams-share/sharepoint" startIcon={<ArrowBack />}>
              Back to Sites
            </Button>
            <ActionsMenu
              actions={detailPageActions}
              data={siteRow}
              queryKeys={[
                `SharePointSiteUsage-${tenantFilter}`,
                `site-live-storage-${siteId}`,
                `site-members-${siteId}`,
              ]}
            />
          </Stack>

          {/* Hero + Stats row */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette[typeInfo.color]?.main || theme.palette.primary.main,
                    0.12
                  )} 0%, ${alpha(
                    theme.palette[typeInfo.color]?.main || theme.palette.primary.main,
                    0.04
                  )} 100%)`,
                  borderLeft: `4px solid ${theme.palette[typeInfo.color]?.main || theme.palette.primary.main}`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette[typeInfo.color]?.main || theme.palette.primary.main, 0.15),
                      color: theme.palette[typeInfo.color]?.main || theme.palette.primary.main,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {typeInfo.icon}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                      {displayName}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Chip label={typeInfo.label} size="small" color={typeInfo.color} variant="outlined" />
                      {inactive && (
                        <Chip icon={<TrendingDown fontSize="small" />} label="Inactive (90+ days)" size="small" color="warning" variant="outlined" />
                      )}
                      {storagePct >= 90 && (
                        <Chip icon={<Warning fontSize="small" />} label="Storage Critical" size="small" color="error" variant="outlined" />
                      )}
                      {webUrl && (
                        <Chip
                          icon={<OpenInNew sx={{ fontSize: 14 }} />}
                          label="Open in SharePoint"
                          size="small"
                          color="primary"
                          variant="outlined"
                          component="a"
                          href={webUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          clickable
                        />
                      )}
                      {siteId && (
                        <Chip
                          icon={<FolderOpen sx={{ fontSize: 14 }} />}
                          label="Browse Files"
                          size="small"
                          color="info"
                          variant="outlined"
                          clickable
                          onClick={() =>
                            router.push(
                              `/teams-share/onedrive/file-browser?siteId=${encodeURIComponent(siteId)}&name=${encodeURIComponent(displayName)}`
                            )
                          }
                        />
                      )}
                      {isGroupConnected && isTeamEnabled && associatedTeamId && (
                        <Chip
                          icon={<Groups sx={{ fontSize: 14 }} />}
                          label="View Team"
                          size="small"
                          color="info"
                          variant="outlined"
                          clickable
                          onClick={() =>
                            router.push(
                              `/teams-share/teams/list-team/team-details?teamId=${encodeURIComponent(associatedTeamId)}&name=${encodeURIComponent(associatedTeamName || displayName)}`
                            )
                          }
                        />
                      )}
                      {isGroupConnected && !isTeamEnabled && !groupLookup.isLoading && (
                        <Chip
                          icon={<Groups sx={{ fontSize: 14 }} />}
                          label="Create Team"
                          size="small"
                          color="info"
                          variant="outlined"
                          clickable
                          onClick={() => createTeamDialog.handleOpen()}
                        />
                      )}
                    </Stack>
                    {ownerDisplayName && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        Owned by {ownerDisplayName}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stack direction="row" spacing={0} divider={<Divider orientation="vertical" flexItem />} justifyContent="space-around" sx={{ width: "100%" }}>
                  <StatBox value={fileCount.toLocaleString()} label="Files" color="primary" />
                  <StatBox value={`${shownUsed}`} label="GB Used" color={shownColor} sub={`of ${shownAllocated} GB`} />
                  <StatBox value={`${shownPct}%`} label="Storage" color={shownColor} />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Site Info + Storage side by side */}
          <Grid container spacing={2}>
            {/* Site Information */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Language sx={{ fontSize: 16 }} color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Site Information
                  </Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <InfoRow label="Site Name" value={displayName} />
                  <InfoRow label="Template" value={rootWebTemplate} />
                  <InfoRow label="Owner" value={ownerDisplayName || ownerPrincipalName} />
                  {createdDateTime && <InfoRow label="Created" value={getCippFormatting(createdDateTime, "createdDateTime")} />}
                  <InfoRow label="Last Activity" value={lastActivityDate ? getCippFormatting(lastActivityDate, "lastActivityDate") : "—"}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {lastActivityDate && inactive && (
                        <Tooltip title="No activity in 90+ days">
                          <Warning sx={{ fontSize: 14 }} color="warning" />
                        </Tooltip>
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {lastActivityDate ? getCippFormatting(lastActivityDate, "lastActivityDate") : "—"}
                      </Typography>
                    </Stack>
                  </InfoRow>
                  {reportRefreshDate && <InfoRow label="Report Date" value={reportRefreshDate} />}
                  {webUrl && (
                    <InfoRow label="URL">
                      <Typography
                        component="a"
                        href={webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                          maxWidth: "60%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                          textAlign: "right",
                        }}
                      >
                        {webUrl}
                      </Typography>
                    </InfoRow>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Storage */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Storage sx={{ fontSize: 16 }} color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Storage
                    </Typography>
                    {live && (
                      <Tooltip
                        title={`Live data from SharePoint Admin API, retrieved ${new Date(
                          live.retrievedAt
                        ).toLocaleString()}`}
                      >
                        <Chip label="Live" size="small" color="success" variant="outlined" />
                      </Tooltip>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<Refresh />}
                      onClick={() => liveStorage.refetch()}
                      disabled={liveStorage.isFetching}
                    >
                      {liveStorage.isFetching ? "Loading..." : "Refresh Live"}
                    </Button>
                    <Button size="small" startIcon={<DataUsage />} onClick={() => quotaDialog.handleOpen()}>
                      Set Quota
                    </Button>
                    <Button size="small" startIcon={<CleaningServices />} onClick={() => cleanupDialog.handleOpen()}>
                      Cleanup
                    </Button>
                  </Stack>
                </Stack>
                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {shownUsed} GB used
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {shownPct}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={shownPct}
                    color={shownColor}
                    sx={{ height: 8, borderRadius: 4, bgcolor: (t) => alpha(t.palette.grey[500], 0.15) }}
                  />
                </Box>
                <Stack spacing={0.5}>
                  <InfoRow label="Allocated" value={`${shownAllocated} GB`} />
                  <InfoRow label="Used" value={`${shownUsed} GB`} />
                  <InfoRow label="Available" value={`${(shownAllocated - shownUsed).toFixed(2)} GB`} />
                  <InfoRow label="File Count" value={fileCount.toLocaleString()} />
                  {live && <InfoRow label="Warning Level" value={`${live.storageWarningInGigabytes} GB`} />}
                  {live && <InfoRow label="Lock State" value={live.lockState} />}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Members - full width */}
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Person sx={{ fontSize: 16 }} color="info" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Site Members
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<Send />} onClick={() => setInviteGuestOpen(true)}>
                  Invite Guest
                </Button>
                <Button size="small" startIcon={<PersonAdd />} onClick={() => addMemberDialog.handleOpen()}>
                  Member
                </Button>
                <Button size="small" startIcon={<AdminPanelSettings />} onClick={() => addAdminDialog.handleOpen()}>
                  Admin
                </Button>
                <Button size="small" startIcon={<QueryStats />} onClick={() => setAuditOpen(true)}>
                  Audit
                </Button>
              </Stack>
            </Stack>
            <Box sx={{ px: 0 }}>
              <CippDataTable
                title="Site Members"
                queryKey={`site-members-${siteId}`}
                api={{
                  url: "/api/ListSiteMembers",
                  data: {
                    SiteId: siteId,
                    SiteUrl: webUrl,
                    tenantFilter: tenantFilter,
                  },
                  dataKey: "Results",
                }}
                columns={[
                  {
                    id: "Title",
                    header: "Name",
                    accessorFn: (row) => row.Title || "",
                    size: 200,
                    Cell: ({ row }) => {
                      const isAdmin = row.original.IsSiteAdmin;
                      const isGuest = row.original.IsGuest;
                      return (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" sx={{ fontWeight: isAdmin ? 600 : 400 }}>
                            {row.original.Title || "—"}
                          </Typography>
                          {isAdmin && (
                            <Chip
                              icon={<AdminPanelSettings sx={{ fontSize: 14 }} />}
                              label="Admin"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ height: 22, fontSize: "0.7rem", "& .MuiChip-label": { px: 0.5 } }}
                            />
                          )}
                          {isGuest && (
                            <CippAccessTypeGuide type="guest" variant="chip" />
                          )}
                        </Stack>
                      );
                    },
                  },
                  {
                    id: "Email",
                    header: "Email",
                    accessorFn: (row) => row.Email || "",
                    size: 220,
                  },
                  {
                    id: "Group",
                    header: "Site Role",
                    accessorFn: (row) => row.Group || "",
                    size: 130,
                  },
                  {
                    id: "Type",
                    header: "Type",
                    accessorFn: (row) => row.Type || "",
                    size: 160,
                  },
                ]}
                actions={memberActions}
                noCard
                hideTitle
                maxHeightOffset="500px"
              />
            </Box>
          </Paper>
        </Stack>
      </Container>

      {/* Dialogs */}
      <CippApiDialog createDialog={addMemberDialog} title="Add Site Member" fields={userPickerField} api={addMemberApi} row={{}} relatedQueryKeys={[`site-members-${siteId}`]} allowAddAnother addAnotherLabel="Add Another Member" />
      <CippApiDialog createDialog={addAdminDialog} title="Add Site Admin" fields={userPickerField} api={addAdminApi} row={{}} relatedQueryKeys={[`site-members-${siteId}`]} />
      <CippGuestInviteDialog
        open={inviteGuestOpen}
        onClose={() => setInviteGuestOpen(false)}
        tenantFilter={tenantFilter}
        groupId={groupIdForApi}
        webUrl={webUrl}
        sharePointType={rootWebTemplate}
        relatedQueryKeys={[`site-members-${siteId}`]}
      />
      <CippMemberAuditDialog
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        tenantFilter={tenantFilter}
        siteId={siteId}
        siteUrl={webUrl}
        groupId={isGroupConnected ? groupIdForApi : ""}
        sharePointType={rootWebTemplate}
        relatedQueryKeys={[`site-members-${siteId}`]}
      />
      {isGroupConnected && (
        <CippApiDialog createDialog={createTeamDialog} title="Create Team from Site" fields={[]} api={createTeamApi} row={{}} />
      )}
      {quotaAction && (
        <CippApiDialog
          createDialog={quotaDialog}
          title="Set Storage Quota"
          fields={quotaAction.fields}
          api={quotaAction}
          row={siteRow}
          relatedQueryKeys={[`site-live-storage-${siteId}`, `SharePointSiteUsage-${tenantFilter}`]}
          onActionSuccess={() => liveStorage.refetch()}
        />
      )}
      {cleanupAction && (
        <CippApiDialog
          createDialog={cleanupDialog}
          title="Start Version Cleanup Job"
          api={cleanupAction}
          row={siteRow}
          defaultvalues={cleanupAction.defaultvalues}
          children={cleanupAction.children}
        />
      )}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
