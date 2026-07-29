import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useSettings } from "../../../../hooks/use-settings.js";
import { ApiGetCall, ApiPostCall, STALE_TIMES } from "../../../../api/ApiCall";
import { PermissionButton } from "../../../../utils/permissions";
import { CippInviteGuestDrawer } from "../../../../components/CippComponents/CippInviteGuestDrawer.jsx";
import { CippBulkInviteGuestDrawer } from "../../../../components/CippComponents/CippBulkInviteGuestDrawer.jsx";
import { CippBulkUserDrawer } from "../../../../components/CippComponents/CippBulkUserDrawer.jsx";
import { CippAddUserDrawer } from "../../../../components/CippComponents/CippAddUserDrawer.jsx";
import { CippApiLogsDrawer } from "../../../../components/CippComponents/CippApiLogsDrawer.jsx";
import { useCippUserActions } from "../../../../components/CippComponents/CippUserActions";
import { 
  Box, 
  Tooltip, 
  useMediaQuery, 
  useTheme,
  Paper,
  Avatar,
  Typography,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Stack } from "@mui/system";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Email,
  Phone,
  Smartphone,
  Business,
  LocationOn,
  Badge,
  Work,
  WorkspacePremium,
  Group,
  PersonAddAlt1,
  RemoveCircleOutline,
  Person,
  CheckCircle,
  Cancel,
  Sync,
  CalendarToday,
  Info as InfoIcon,
  VerifiedUser,
  Warning,
  AccountTree,
  GppBad,
  Devices,
  ToggleOn,
  ToggleOff,
} from "@mui/icons-material";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import CippUserAvatar from "../../../../components/CippComponents/CippUserAvatar";

// Custom sort function moved outside component to avoid recreation on each render
// Licensed users first (alphabetically by surname), then unlicensed (alphabetically by surname)
const userSortFn = (a, b) => {
  const aLicensed = a.assignedLicenses && a.assignedLicenses.length > 0;
  const bLicensed = b.assignedLicenses && b.assignedLicenses.length > 0;
  
  // Licensed users come first
  if (aLicensed && !bLicensed) return -1;
  if (!aLicensed && bLicensed) return 1;
  
  // Within same license status, sort by surname then givenName
  const aSurname = (a.surname || a.displayName || "").toLowerCase();
  const bSurname = (b.surname || b.displayName || "").toLowerCase();
  
  if (aSurname !== bSurname) {
    return aSurname.localeCompare(bSurname);
  }
  
  // If surnames are the same, sort by given name
  const aGiven = (a.givenName || "").toLowerCase();
  const bGiven = (b.givenName || "").toLowerCase();
  return aGiven.localeCompare(bGiven);
};

const Page = () => {
  const router = useRouter();
  const pageTitle = "Users";
  const tenant = useSettings().currentTenant;
  const cardButtonPermissions = ["Identity.User.ReadWrite"];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userActions = useCippUserActions();
  const [enrichmentReady, setEnrichmentReady] = useState(false);
  const [advancedBadgesEnabled, setAdvancedBadgesEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("users-advanced-badges") === "true";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("users-advanced-badges", String(advancedBadgesEnabled));
    }
  }, [advancedBadgesEnabled]);

  // Defer enrichment calls so the main user list can render first.
  useEffect(() => {
    if (!tenant || tenant === "AllTenants") {
      setEnrichmentReady(false);
      return;
    }
    const timer = setTimeout(() => setEnrichmentReady(true), 1500);
    return () => clearTimeout(timer);
  }, [tenant]);

  const mailboxRequest = ApiGetCall({
    url: `/api/ListMailboxes?tenantFilter=${tenant}`,
    queryKey: `ListMailboxes-enrichment-${tenant}`,
    waiting: advancedBadgesEnabled && enrichmentReady && !!tenant && tenant !== "AllTenants",
    staleTime: STALE_TIMES.STABLE,
    retry: 1,
  });

  // Get CAS mailbox settings to detect legacy protocols (IMAP/POP)
  const casMailboxRequest = ApiGetCall({
    url: `/api/ListCASMailboxes?tenantFilter=${tenant}`,
    queryKey: `ListCASMailboxes-${tenant}`,
    waiting: advancedBadgesEnabled && enrichmentReady && !!tenant && tenant !== "AllTenants",
    staleTime: STALE_TIMES.STABLE,
    retry: 0,
  });

  // Fetch Intune managed devices to build per-user device presence (lightweight)
  const intuneDevicesRequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "deviceManagement/managedDevices",
      $select: "id,azureADDeviceId,userPrincipalName",
      $top: 999,
      tenantFilter: tenant,
    },
    queryKey: `IntuneDevicesForUsers-${tenant}`,
    waiting: advancedBadgesEnabled && enrichmentReady && !!tenant && tenant !== "AllTenants",
    staleTime: STALE_TIMES.STABLE,
    retry: 1,
  });

  // Fetch NinjaOne device info for enrichment
  const ninjaDevicesRequest = ApiGetCall({
    url: "/api/ListNinjaDeviceInfo",
    data: { TenantFilter: tenant },
    queryKey: `NinjaDevicesForUsers-${tenant}`,
    waiting: advancedBadgesEnabled && enrichmentReady && !!tenant && tenant !== "AllTenants",
    staleTime: STALE_TIMES.STABLE,
    retry: 1,
  });

  // Build per-user device presence map: UPN → { deviceCount, hasIntune, hasNinja }
  const userDevicePresence = useMemo(() => {
    const map = new Map();
    const intuneRaw = intuneDevicesRequest.data;
    const intuneArr = Array.isArray(intuneRaw) ? intuneRaw : intuneRaw?.Results || [];

    // Build set of azureADDeviceIds that have NinjaOne data
    const ninjaRaw = ninjaDevicesRequest.data;
    const ninjaArr = Array.isArray(ninjaRaw) ? ninjaRaw : ninjaRaw?.Results || [];
    const ninjaDeviceIdSet = new Set(
      ninjaArr.filter((d) => d.azureADDeviceId).map((d) => d.azureADDeviceId)
    );

    // Aggregate Intune devices by user UPN
    intuneArr.forEach((device) => {
      const upn = (device.userPrincipalName || "").toLowerCase();
      if (!upn) return;
      if (!map.has(upn)) {
        map.set(upn, { deviceCount: 0, hasIntune: true, hasNinja: false });
      }
      const entry = map.get(upn);
      entry.deviceCount += 1;
      if (!entry.hasNinja && device.azureADDeviceId && ninjaDeviceIdSet.has(device.azureADDeviceId)) {
        entry.hasNinja = true;
      }
    });

    return map;
  }, [intuneDevicesRequest.data, ninjaDevicesRequest.data]);

  // Mutation for disabling legacy protocols directly from the badge
  const disableLegacyProtocols = ApiPostCall({
    relatedQueryKeys: [`ListCASMailboxes-${tenant}`],
  });

  // Confirmation dialog state for disabling legacy protocols
  const [legacyDialog, setLegacyDialog] = useState({ open: false, user: null, protocols: [] });

  const handleDisableLegacyProtocols = () => {
    if (!legacyDialog.user) return;
    disableLegacyProtocols.mutate({
      url: "/api/ExecSetCASMailbox",
      data: {
        user: legacyDialog.user.userPrincipalName,
        tenantFilter: tenant,
        protocols: legacyDialog.protocols.join(","),
        enable: false,
      },
    });
  };

  const handleLegacyDialogClose = () => {
    setLegacyDialog({ open: false, user: null, protocols: [] });
    disableLegacyProtocols.reset();
  };

  const sharedMailboxSet = useMemo(() => {
    const raw =
      mailboxRequest.data?.Results ||
      mailboxRequest.data?.results ||
      mailboxRequest.data?.value ||
      mailboxRequest.data ||
      [];
    const list = Array.isArray(raw) ? raw : [];
    const shared = list.filter((item) => item?.recipientTypeDetails === "SharedMailbox");
    return new Set(
      shared
        .map((item) =>
          (
            item?.UPN ||
            item?.primarySmtpAddress ||
            item?.userPrincipalName ||
            item?.mail ||
            ""
          ).toLowerCase()
        )
        .filter(Boolean)
    );
  }, [mailboxRequest.data]);

  const isSharedMailbox = useCallback(
    (item) => {
      if (!sharedMailboxSet.size) return false;
      const key = (item?.userPrincipalName || item?.mail || "").toLowerCase();
      return !!key && sharedMailboxSet.has(key);
    },
    [sharedMailboxSet]
  );

  // Create a map of users with legacy protocols (IMAP/POP) enabled
  const legacyProtocolsMap = useMemo(() => {
    const raw =
      casMailboxRequest.data?.Results ||
      casMailboxRequest.data?.results ||
      casMailboxRequest.data?.value ||
      casMailboxRequest.data ||
      [];
    const list = Array.isArray(raw) ? raw : [];
    const map = new Map();
    list.forEach((item) => {
      if (item?.LegacyProtocolsEnabled) {
        const key = (item?.userPrincipalName || "").toLowerCase();
        if (key) {
          map.set(key, {
            imap: item?.ImapEnabled,
            pop: item?.PopEnabled,
          });
        }
      }
    });
    return map;
  }, [casMailboxRequest.data]);

  const hasLegacyProtocols = useCallback(
    (item) => {
      if (!legacyProtocolsMap.size) return null;
      const key = (item?.userPrincipalName || item?.mail || "").toLowerCase();
      return key ? legacyProtocolsMap.get(key) : null;
    },
    [legacyProtocolsMap]
  );

  // Navigate to user detail page on card click - memoized to prevent unnecessary re-renders
  const handleCardClick = useCallback((user) => {
    router.push(`/identity/administration/users/user?userId=${user.id}`);
  }, [router]);

  // Memoized custom content renderer for device presence badges + legacy protocol warnings
  const customContentRenderer = useCallback((item) => {
    if (!advancedBadgesEnabled) return null;

    const upn = (item?.userPrincipalName || "").toLowerCase();
    const deviceInfo = upn ? userDevicePresence.get(upn) : null;

    const legacyInfo = hasLegacyProtocols(item);
    const protocols = [];
    if (legacyInfo?.imap) protocols.push("IMAP");
    if (legacyInfo?.pop) protocols.push("POP");

    const hasDeviceBadges = !!deviceInfo;
    const hasLegacy = protocols.length > 0;

    if (!hasDeviceBadges && !hasLegacy) return null;

    return (
      <Stack spacing={0.5} sx={{ mt: 0.5, mb: 0.5 }}>
        {hasDeviceBadges && (
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Tooltip title={`${deviceInfo.deviceCount} device${deviceInfo.deviceCount !== 1 ? "s" : ""} in Entra or Intune`}>
              <Chip
                icon={<Devices sx={{ fontSize: "13px !important" }} />}
                label={`${deviceInfo.deviceCount}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  borderColor: (t) => alpha(t.palette.primary.main, 0.5),
                  color: "text.primary",
                  "& .MuiChip-icon": { ml: 0.5, color: "primary.main" },
                }}
              />
            </Tooltip>
            <Tooltip title="Device registered in Microsoft Entra ID">
              <Chip
                label="Entra"
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  borderColor: (t) => alpha(t.palette.info.main, 0.6),
                  color: "text.primary",
                  bgcolor: (t) => alpha(t.palette.info.main, 0.08),
                }}
              />
            </Tooltip>
            <Tooltip title="Device managed by Microsoft Intune">
              <Chip
                label="Intune"
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  borderColor: (t) => alpha(t.palette.primary.main, 0.6),
                  color: "text.primary",
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                }}
              />
            </Tooltip>
            <Tooltip title={deviceInfo.hasNinja ? "Device has NinjaOne agent" : "No NinjaOne agent on this device"}>
              <Chip
                label="NinjaOne"
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  ...(deviceInfo.hasNinja
                    ? {
                        borderColor: (t) => alpha(t.palette.success.main, 0.6),
                        color: "text.primary",
                        bgcolor: (t) => alpha(t.palette.success.main, 0.12),
                      }
                    : {
                        borderColor: (t) => alpha(t.palette.text.secondary, 0.4),
                        color: "text.secondary",
                        bgcolor: (t) => alpha(t.palette.text.secondary, 0.06),
                      }),
                }}
              />
            </Tooltip>
          </Stack>
        )}
        {hasLegacy && (
          <Tooltip title={`Insecure protocols enabled: ${protocols.join(" & ")}. These legacy protocols may bypass MFA protections. Click to disable.`}>
            <Chip
              size="small"
              color="error"
              variant="outlined"
              icon={<GppBad sx={{ fontSize: "12px !important", color: "error.main" }} />}
              label={protocols.join(" & ")}
              onClick={(e) => {
                e.stopPropagation();
                setLegacyDialog({ open: true, user: item, protocols });
              }}
              sx={{
                height: 22,
                fontSize: "0.65rem",
                fontWeight: 600,
                flexShrink: 0,
                alignSelf: "flex-start",
                backgroundColor: (t) => `${alpha(t.palette.error.main, 0.15)} !important`,
                borderColor: (t) => `${alpha(t.palette.error.main, 0.5)} !important`,
                cursor: "pointer",
                "& .MuiChip-label": {
                  color: "error.dark",
                },
                "& .MuiChip-icon": {
                  color: "error.main",
                },
                "&:hover": {
                  backgroundColor: (t) => `${alpha(t.palette.error.main, 0.25)} !important`,
                },
              }}
            />
          </Tooltip>
        )}
      </Stack>
    );
  }, [advancedBadgesEnabled, hasLegacyProtocols, userDevicePresence]);

  // Memoized shared mailbox transform function
  const sharedMailboxTransform = useCallback(
    (_value, item) => (isSharedMailbox(item) ? "SharedMailbox" : null),
    [isSharedMailbox]
  );

  // Card view configuration with comprehensive user info - memoized for performance
  const cardConfig = useMemo(() => ({
    title: "displayName",
    avatar: {
      field: "displayName",
      photoField: false,
    },
    sortFn: userSortFn,
    badges: [
      {
        field: "accountEnabled",
        iconOnly: true,
        conditions: {
          true: { icon: <ToggleOn fontSize="small" />, color: "success", label: "Account Enabled" },
          false: { icon: <ToggleOff fontSize="small" />, color: "error", label: "Account Disabled" },
          Yes: { icon: <ToggleOn fontSize="small" />, color: "success", label: "Account Enabled" },
          No: { icon: <ToggleOff fontSize="small" />, color: "error", label: "Account Disabled" },
        },
      },
      {
        field: "assignedLicenses",
        iconOnly: true,
        conditions: {
          licensed: { label: "User has licenses assigned", color: "primary", icon: <WorkspacePremium fontSize="small" /> },
          unlicensed: { label: "No licenses assigned", color: "error", icon: <WorkspacePremium fontSize="small" /> },
        },
        transform: (value) => (value && value.length > 0 ? "licensed" : "unlicensed"),
      },
      {
        field: "userType",
        tooltip: "Guest Account (B2B Collaboration) — this user was invited to the tenant as a guest. External Access (B2B Direct Connect) users do not appear in the directory.",
        iconOnly: true,
        conditions: {
          Guest: { label: "Guest", color: "secondary", icon: <PersonAddAlt1 fontSize="small" /> },
        },
      },
      {
        field: "mail",
        tooltip: "Exchange Settings",
        iconOnly: true,
        link: "/identity/administration/users/user/exchange?userId=[id]",
        conditions: {
          enabled: { label: "Mail enabled", color: "success", icon: <Email fontSize="small" /> },
          disabled: { label: "Not mail enabled", color: "error", icon: <Email fontSize="small" /> },
        },
        transform: (value, item) =>
          value || (item?.proxyAddresses && item.proxyAddresses.length > 0) ? "enabled" : "disabled",
      },
      {
        field: "userPrincipalName",
        tooltip: "Shared Mailbox",
        iconOnly: true,
        conditions: {
          SharedMailbox: { label: "Shared", color: "secondary", icon: <Group fontSize="small" /> },
        },
        transform: sharedMailboxTransform,
      },
    ],
    // Fields shown on both mobile and desktop
    // Arrays within extraFields indicate fields that share a row (50% width each)
    extraFields: [
      { field: "companyName", icon: <Business />, editable: true, editField: "companyName" },
      { field: "jobTitle", icon: <Badge />, editable: true, editField: "jobTitle" },
      [
        { field: "department", icon: <Work />, editable: true, editField: "department" },
        { 
          field: "manager.displayName", 
          icon: <AccountTree />, 
          label: "Reports To",
          align: "right",
          // Custom action to open manager picker when empty
          emptyAction: {
            label: "Set Manager",
            category: "edit",
            type: "POST",
            url: "/api/ExecSetManager",
            data: {
              userPrincipalName: "userPrincipalName",
            },
            fields: [
              {
                type: "autoComplete",
                name: "managerId",
                label: "Select Manager",
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
                  valueField: "id",
                  showRefresh: true,
                },
              },
            ],
            confirmText: "Set manager for this user?",
            relatedQueryKeys: ["ListUsers"],
          },
        },
      ],
    ],
    // Additional fields shown only on desktop cards
    desktopFields: [
      { field: "mail", label: "Email", icon: <Email />, linkType: "email" },
      { field: "mobilePhone", label: "Mobile", icon: <Smartphone />, linkType: "tel", editable: true, editField: "mobilePhone" },
      { 
        field: "businessPhones", 
        label: "Work", 
        icon: <Phone />, 
        linkType: "tel",
        editable: true,
        editField: "businessPhones",
        formatter: (value) => Array.isArray(value) && value.length > 0 ? value[0] : value,
      },
    ],
    extraFieldsMax: 3,
    desktopFieldsLayout: "column",
    desktopFieldsMax: 5,
    // Mobile quick actions: 7 buttons
    mobileQuickActions: [
      "Reset Password",
      "Create Temporary Access Pass",
      "Re-require MFA registration",
      "Set Per-User MFA",
      "Manage Licenses",
      "Add to Group",
      "Edit User",
    ],
    maxQuickActions: 8,
    cardGridProps: {
      md: 6,
      lg: 4,
    },
    // API endpoint for inline field editing
    editApiUrl: "/api/EditUser",
    // Render device badges + legacy warnings as a block below title/badges
    customContentInline: false,
    // Custom content: device source badges + legacy protocol warnings
    customContent: customContentRenderer,
  }), [customContentRenderer, sharedMailboxTransform]);

  // Memoized filters - static data that doesn't need to change
  const filters = useMemo(() => [
    {
      filterName: "Account Enabled",
      value: [{ id: "accountEnabled", value: "Yes" }],
      type: "column",
    },
    {
      filterName: "Account Disabled",
      value: [{ id: "accountEnabled", value: "No" }],
      type: "column",
    },
    {
      filterName: "Licensed Users",
      value: [{ id: "assignedLicenses", value: "licensed" }],
      type: "column",
    },
    {
      filterName: "Unlicensed Users",
      value: [{ id: "assignedLicenses", value: "unlicensed" }],
      type: "column",
    },
    {
      filterName: "Guest Accounts",
      value: [{ id: "userType", value: "Guest" }],
      type: "column",
    },
    {
      filterName: "Members Only",
      value: [{ id: "userType", value: "Member" }],
      type: "column",
    },
  ], []);

  // Show fewer columns on mobile, more on desktop (for table view)
  const simpleColumns = useMemo(() => 
    isMobile 
      ? ["displayName", "accountEnabled"]
      : ["displayName", "userPrincipalName", "mail", "accountEnabled", "userType"],
    [isMobile]
  );

  // Memoized off-canvas children renderer
  const offCanvasChildren = useCallback((row) => {
    const isEnabled = row.accountEnabled;
    const isGuest = row.userType === "Guest";
    const hasLicenses = row.assignedLicenses && row.assignedLicenses.length > 0;
    const statusColor = isEnabled ? theme.palette.success.main : theme.palette.error.main;
    
    return (
      <Stack spacing={3}>
        {/* Hero Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2.5,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(statusColor, 0.15)} 0%, ${alpha(statusColor, 0.05)} 100%)`,
            borderLeft: `4px solid ${statusColor}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CippUserAvatar
              userId={row.id}
              tenantFilter={tenant}
              displayName={row.displayName}
              size={56}
              enablePhoto={true}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                {row.displayName || "Unknown User"}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {row.userPrincipalName}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Status Badges */}
        <Box>
          <Typography 
            variant="overline" 
            color="text.secondary" 
            sx={{ fontWeight: 600, letterSpacing: 1, mb: 1.5, display: "block" }}
          >
            Account Status
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignItems: "center" }}>
            <Chip
              icon={isEnabled ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
              label={isEnabled ? "Enabled" : "Disabled"}
              color={isEnabled ? "success" : "error"}
              variant="filled"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={isGuest ? <PersonAddAlt1 fontSize="small" /> : <Person fontSize="small" />}
              label={isGuest ? "Guest" : "Member"}
              color={isGuest ? "warning" : "primary"}
              variant="outlined"
              size="small"
            />
            {hasLicenses && (
              <Chip
                icon={<VerifiedUser fontSize="small" />}
                label="Licensed"
                color="info"
                variant="outlined"
                size="small"
              />
            )}
            {row.onPremisesSyncEnabled && (
              <Chip
                icon={<Sync fontSize="small" />}
                label="Synced"
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Contact Information */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Email fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Contact Information
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {row.mail && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                  {row.mail}
                </Typography>
              </Stack>
            )}
            {row.mobilePhone && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Mobile</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {row.mobilePhone}
                </Typography>
              </Stack>
            )}
            {row.businessPhones && row.businessPhones.length > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Business Phone</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {Array.isArray(row.businessPhones) ? row.businessPhones[0] : row.businessPhones}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Organization */}
        {(row.jobTitle || row.department || row.companyName || row.officeLocation) && (
          <>
            <Divider />
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Business fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Organization
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {row.jobTitle && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Job Title</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {row.jobTitle}
                    </Typography>
                  </Stack>
                )}
                {row.department && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Department</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {row.department}
                    </Typography>
                  </Stack>
                )}
                {row.companyName && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Company</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {row.companyName}
                    </Typography>
                  </Stack>
                )}
                {row.officeLocation && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Office</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {row.officeLocation}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </>
        )}

        {/* Location */}
        {(row.city || row.state || row.country) && (
          <>
            <Divider />
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Location
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {(row.streetAddress || row.city || row.state || row.postalCode) && (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                      {[row.streetAddress, row.city, row.state, row.postalCode].filter(Boolean).join(", ")}
                    </Typography>
                  </Stack>
                )}
                {row.country && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Country</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {row.country}
                    </Typography>
                  </Stack>
                )}
                {row.usageLocation && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Usage Location</Typography>
                    <Chip label={row.usageLocation} size="small" variant="outlined" />
                  </Stack>
                )}
              </Stack>
            </Box>
          </>
        )}

        {/* Licensing */}
        {hasLicenses && (
          <>
            <Divider />
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <WorkspacePremium fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Licenses ({row.assignedLicenses.length})
                </Typography>
              </Stack>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {getCippFormatting(row.assignedLicenses, "assignedLicenses")}
                </Typography>
              </Paper>
            </Box>
          </>
        )}

        <Divider />

        {/* Metadata */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Account Details
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {row.createdDateTime && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Created</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getCippFormatting(row.createdDateTime, "createdDateTime")}
                </Typography>
              </Stack>
            )}
            {row.onPremisesLastSyncDateTime && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Last Synced</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getCippFormatting(row.onPremisesLastSyncDateTime, "onPremisesLastSyncDateTime")}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">User ID</Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "monospace",
                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.5,
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.id}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    );
  }, [theme, tenant]);

  // Off-canvas panel configuration for user details flyout - memoized for performance
  const offCanvas = useMemo(() => ({
    title: "User Details",
    size: "md",
    actions: userActions,
    children: offCanvasChildren,
  }), [userActions, offCanvasChildren]);

  const legacyDialogSuccess = disableLegacyProtocols.isSuccess;
  const legacyDialogLoading = disableLegacyProtocols.isPending;
  const legacyDialogError = disableLegacyProtocols.isError;

  return (
    <>
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      cardButton={
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={advancedBadgesEnabled}
                onChange={(e) => setAdvancedBadgesEnabled(e.target.checked)}
              />
            }
            label="Advanced Badges"
            sx={{ ml: 0.5, mr: 0.5 }}
          />
          {isMobile ? (
            <Tooltip title="Add User" enterTouchDelay={0} leaveTouchDelay={3000}>
              <span>
                <CippAddUserDrawer
                  requiredPermissions={cardButtonPermissions}
                  PermissionButton={PermissionButton}
                  buttonText=""
                  buttonProps={{ size: "small", sx: { minWidth: 40, px: 1 }, "aria-label": "Add User" }}
                />
              </span>
            </Tooltip>
          ) : (
            <CippAddUserDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
          )}
          {!isMobile && (
            <CippBulkUserDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
          )}
          {isMobile ? (
            <Tooltip title="Invite Guest" enterTouchDelay={0} leaveTouchDelay={3000}>
              <span>
                <CippInviteGuestDrawer
                  requiredPermissions={cardButtonPermissions}
                  PermissionButton={PermissionButton}
                  buttonText=""
                  buttonProps={{
                    size: "small",
                    sx: { minWidth: 40, px: 1 },
                    "aria-label": "Invite Guest",
                  }}
                />
              </span>
            </Tooltip>
          ) : (
            <CippInviteGuestDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
          )}
          {!isMobile && (
            <CippBulkInviteGuestDrawer
              requiredPermissions={cardButtonPermissions}
              PermissionButton={PermissionButton}
            />
          )}
          {isMobile ? (
            <Tooltip title="View Logs" enterTouchDelay={0} leaveTouchDelay={3000}>
              <span>
                <CippApiLogsDrawer
                  apiFilter="(?<!Scheduler_)User"
                  buttonText=""
                  title="User Logs"
                  PermissionButton={PermissionButton}
                  tenantFilter={tenant}
                  size="small"
                  sx={{ minWidth: 40, px: 1 }}
                  aria-label="View Logs"
                />
              </span>
            </Tooltip>
          ) : (
            <CippApiLogsDrawer
              apiFilter="(?<!Scheduler_)User"
              buttonText="View Logs"
              title="User Logs"
              PermissionButton={PermissionButton}
              tenantFilter={tenant}
            />
          )}
        </Box>
      }
      apiData={{
        Endpoint: "users",
        manualPagination: true,
        $select:
          "id,accountEnabled,businessPhones,city,createdDateTime,companyName,country,department,displayName,faxNumber,givenName,isResourceAccount,jobTitle,mail,mailNickname,mobilePhone,officeLocation,otherMails,postalCode,preferredDataLocation,preferredLanguage,proxyAddresses,showInAddressList,state,streetAddress,surname,usageLocation,userPrincipalName,userType,assignedLicenses,licenseAssignmentStates,onPremisesSyncEnabled,OnPremisesImmutableId,onPremisesLastSyncDateTime,onPremisesDistinguishedName",
        $expand: "manager($select=id,displayName)",
        $count: true,
        $orderby: "displayName",
        $top: 999,
      }}
      apiDataKey="Results"
      actions={userActions}
      offCanvas={offCanvas}
      offCanvasOnRowClick={false}
      onCardClick={handleCardClick}
      simpleColumns={simpleColumns}
      filters={filters}
      initialColumnFilters={[{ id: "assignedLicenses", value: "licensed" }]}
      tenantInTitle={!isMobile}
      cardConfig={cardConfig}
    />

    {/* Confirmation dialog for disabling legacy protocols */}
    <Dialog
      open={legacyDialog.open}
      onClose={!legacyDialogLoading ? handleLegacyDialogClose : undefined}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <GppBad color="error" />
        Disable Legacy Protocols
      </DialogTitle>
      <DialogContent>
        {!legacyDialogSuccess && !legacyDialogError && (
          <DialogContentText>
            Are you sure you want to disable <strong>{legacyDialog.protocols.join(" & ")}</strong> for{" "}
            <strong>{legacyDialog.user?.displayName || legacyDialog.user?.userPrincipalName}</strong>?
            <Box component="span" sx={{ display: "block", mt: 1, color: "text.secondary", fontSize: "0.85rem" }}>
              These legacy protocols can bypass MFA protections and pose a security risk. Disabling them is recommended unless legacy email clients require them.
            </Box>
          </DialogContentText>
        )}
        {legacyDialogSuccess && (
          <DialogContentText sx={{ color: "success.main", fontWeight: 500 }}>
            Successfully disabled {legacyDialog.protocols.join(" & ")} for{" "}
            {legacyDialog.user?.displayName || legacyDialog.user?.userPrincipalName}.
          </DialogContentText>
        )}
        {legacyDialogError && (
          <DialogContentText sx={{ color: "error.main", fontWeight: 500 }}>
            Failed to disable legacy protocols. Please try again or use the Exchange settings page.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        {!legacyDialogSuccess ? (
          <>
            <Button onClick={handleLegacyDialogClose} disabled={legacyDialogLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleDisableLegacyProtocols}
              variant="contained"
              color="error"
              disabled={legacyDialogLoading}
              startIcon={legacyDialogLoading ? <CircularProgress size={16} color="inherit" /> : <GppBad />}
            >
              {legacyDialogLoading ? "Disabling..." : "Disable"}
            </Button>
          </>
        ) : (
          <Button onClick={handleLegacyDialogClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
