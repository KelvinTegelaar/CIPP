import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Divider,
  Skeleton,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Collapse,
  TextField,
} from "@mui/material";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Sync,
  Mail,
  Storage,
  Forward,
  Archive,
  Security,
  SettingsEthernet,
  Warning,
  CheckCircle,
  Block,
  VisibilityOff,
  Info as InfoIcon,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { Stack, Grid, Box } from "@mui/system";
import { alpha, useTheme } from "@mui/material/styles";
import { ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { CippApiResults } from "../CippComponents/CippApiResults";
import NextLink from "next/link";

// Section component for consistent styling
const InfoSection = ({ icon: Icon, title, children }) => (
  <Box sx={{ mb: 2.5 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
      <Icon fontSize="small" color="primary" />
      <Typography variant="subtitle2" fontWeight={600}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Box>
);

// Stat card component for key metrics
const StatCard = ({ icon: Icon, label, value, color = "primary", subtitle }) => {
  const theme = useTheme();
  // Handle "default" color by using grey
  const paletteColor = color === "default" ? theme.palette.grey[500] : theme.palette[color]?.main || theme.palette.grey[500];
  
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        textAlign: "center",
        borderColor: alpha(paletteColor, 0.3),
        bgcolor: alpha(paletteColor, 0.04),
        overflow: "hidden",
      }}
    >
      <Icon sx={{ color: paletteColor, fontSize: 24, mb: 0.5 }} />
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography 
        variant="body2" 
        fontWeight={600}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={value}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

// Format camelCase or PascalCase strings to have spaces (e.g., "UserMailbox" -> "User Mailbox")
const formatMailboxType = (type) => {
  if (!type) return "N/A";
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
};

const LITIGATION_HOLD_ELIGIBLE_LICENSES = [
  "Microsoft 365 Business Premium",
  "Microsoft 365 E3 or E5",
  "Office 365 E3 or E5",
  "Exchange Online Plan 2",
  "Exchange Online Plan 1 plus Exchange Online Archiving add-on",
];

export const CippExchangeInfoCard = (props) => {
  const {
    exchangeData,
    isLoading = false,
    isFetching = false,
    handleRefresh,
    userPrincipalName,
    userId,
    ...other
  } = props;
  const theme = useTheme();
  const settings = useSettings();
  
  // State for protocol toggle dialog (supports single protocol or array for "disable both")
  const [protocolDialog, setProtocolDialog] = useState({
    open: false,
    protocol: null, // Can be string or array of strings
    currentlyEnabled: false,
  });
  const [isToggling, setIsToggling] = useState(false);
  
  // State for GAL visibility dialog
  const [galDialog, setGalDialog] = useState(false);
  const [isTogglingGal, setIsTogglingGal] = useState(false);
  
  // State for spam status dialog
  const [spamDialog, setSpamDialog] = useState(false);
  const [isClearingSpam, setIsClearingSpam] = useState(false);

  // State for hold toggle dialog
  const [holdDialog, setHoldDialog] = useState({
    open: false,
    holdType: null,
    currentlyEnabled: false,
  });
  const [isTogglingHold, setIsTogglingHold] = useState(false);
  const [litigationDays, setLitigationDays] = useState("");

  const [restrictionDialog, setRestrictionDialog] = useState({
    open: false,
    direction: null,
    currentlyBlocked: false,
  });
  const [isTogglingRestriction, setIsTogglingRestriction] = useState(false);
  
  // API call for toggling protocols
  const toggleProtocol = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Mailbox-${exchangeData?.UserId}`],
  });
  
  // API call for toggling GAL visibility
  const toggleGalVisibility = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Mailbox-${exchangeData?.UserId}`],
  });
  
  // API call for clearing spam status
  const clearSpamStatus = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Mailbox-${exchangeData?.UserId}`],
  });

  // API call for toggling holds
  const toggleHold = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Mailbox-${exchangeData?.UserId}`],
  });

  const toggleRestriction = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Mailbox-${exchangeData?.UserId}`],
  });

  const handleRestrictionClick = (direction, isBlocked) => {
    toggleRestriction.reset();
    setRestrictionDialog({ open: true, direction, currentlyBlocked: isBlocked });
  };

  const handleRestrictionDialogClose = () => {
    setRestrictionDialog({ open: false, direction: null, currentlyBlocked: false });
    toggleRestriction.reset();
  };

  const handleRestrictionToggle = async () => {
    const { direction, currentlyBlocked } = restrictionDialog;
    setIsTogglingRestriction(true);

    try {
      await toggleRestriction.mutateAsync({
        url: "/api/ExecSetMailboxRestriction",
        data: {
          tenantFilter: settings.currentTenant,
          UserId: userPrincipalName,
          Direction: direction,
          Enable: !currentlyBlocked,
        },
      });
      if (handleRefresh) handleRefresh();
      handleRestrictionDialogClose();
    } catch (error) {
      console.error("Failed to toggle mailbox restriction:", error);
    } finally {
      setIsTogglingRestriction(false);
    }
  };

  const licensedForLitigationHold = exchangeData?.MailboxActionsData?.LicensedForLitigationHold;

  const handleHoldClick = (holdType, isEnabled) => {
    toggleHold.reset();
    setLitigationDays("");
    setHoldDialog({ open: true, holdType, currentlyEnabled: isEnabled });
  };

  const handleHoldDialogClose = () => {
    setHoldDialog({ open: false, holdType: null, currentlyEnabled: false });
    setLitigationDays("");
    toggleHold.reset();
  };

  const handleHoldToggle = async () => {
    const { holdType, currentlyEnabled } = holdDialog;
    setIsTogglingHold(true);

    const isLitigation = holdType === "Litigation";
    const url = isLitigation ? "/api/ExecSetLitigationHold" : "/api/ExecSetRetentionHold";
    const data = {
      tenantFilter: settings.currentTenant,
      Identity: userPrincipalName,
      UPN: userPrincipalName,
      disable: currentlyEnabled,
    };
    if (isLitigation && !currentlyEnabled && litigationDays) {
      data.days = parseInt(litigationDays, 10);
    }

    try {
      await toggleHold.mutateAsync({ url, data });
      if (handleRefresh) handleRefresh();
      handleHoldDialogClose();
    } catch (error) {
      console.error("Failed to toggle hold:", error);
    } finally {
      setIsTogglingHold(false);
    }
  };

  // Handle protocol chip click (supports single protocol or array for "disable both")
  const handleProtocolClick = (protocol, isEnabled) => {
    setProtocolDialog({
      open: true,
      protocol, // Can be string or array
      currentlyEnabled: isEnabled,
    });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setProtocolDialog({
      open: false,
      protocol: null,
      currentlyEnabled: false,
    });
  };

  // Handle protocol toggle confirmation
  const handleProtocolToggle = async () => {
    const { protocol, currentlyEnabled } = protocolDialog;
    setIsToggling(true);
    
    try {
      // Support both single protocol and multiple protocols
      const isMultiple = Array.isArray(protocol);
      await toggleProtocol.mutateAsync({
        url: "/api/ExecSetCASMailbox",
        data: {
          user: userPrincipalName,
          tenantFilter: settings.currentTenant,
          ...(isMultiple ? { protocols: protocol.join(",") } : { protocol: protocol }),
          enable: !currentlyEnabled,
        },
      });
      
      // Refresh the data after successful toggle
      if (handleRefresh) {
        handleRefresh();
      }
    } catch (error) {
      console.error("Failed to toggle protocol:", error);
    } finally {
      setIsToggling(false);
      handleDialogClose();
    }
  };

  // Handle GAL visibility toggle
  const handleGalToggle = async () => {
    setIsTogglingGal(true);
    
    try {
      await toggleGalVisibility.mutateAsync({
        url: "/api/ExecHideFromGAL",
        data: {
          ID: userPrincipalName,
          tenantFilter: settings.currentTenant,
          HideFromGAL: !exchangeData?.HiddenFromAddressLists,
        },
      });
      
      // Refresh the data after successful toggle
      if (handleRefresh) {
        handleRefresh();
      }
    } catch (error) {
      console.error("Failed to toggle GAL visibility:", error);
    } finally {
      setIsTogglingGal(false);
      setGalDialog(false);
    }
  };

  // Handle clearing spam status
  const handleClearSpam = async () => {
    setIsClearingSpam(true);
    
    try {
      await clearSpamStatus.mutateAsync({
        url: "/api/ExecRemoveRestrictedUser",
        data: {
          SenderAddress: userPrincipalName,
          tenantFilter: settings.currentTenant,
        },
      });
      
      // Refresh the data after successful clear
      if (handleRefresh) {
        handleRefresh();
      }
    } catch (error) {
      console.error("Failed to clear spam status:", error);
    } finally {
      setIsClearingSpam(false);
      setSpamDialog(false);
    }
  };

  // Define the protocols array with detailed information
  const protocolInfo = {
    EWS: {
      fullName: "Exchange Web Services",
      affectedApps: "Outlook for Windows (older versions), Outlook for Mac (older versions), third-party apps using EWS API, calendar sync tools, and some backup solutions",
      securityRisk: "medium",
      recommendation: "Consider disabling if not needed. Modern Outlook uses REST/Graph API instead.",
    },
    MAPI: {
      fullName: "MAPI over HTTP",
      affectedApps: "Outlook for Windows (desktop client), some third-party email clients, and legacy applications",
      securityRisk: "low",
      recommendation: "Generally safe to keep enabled for Outlook desktop users.",
    },
    OWA: {
      fullName: "Outlook on the Web",
      affectedApps: "Outlook Web App (browser access), Outlook PWA (Progressive Web App)",
      securityRisk: "low",
      recommendation: "Keep enabled for web-based email access. Protected by modern authentication.",
    },
    IMAP: {
      fullName: "Internet Message Access Protocol",
      affectedApps: "Apple Mail (macOS/iOS), Thunderbird, Android Gmail app, third-party email clients, and legacy applications",
      securityRisk: "high",
      recommendation: "Disable if not needed. Legacy protocol that may use basic authentication.",
    },
    POP: {
      fullName: "Post Office Protocol",
      affectedApps: "Legacy email clients, some older mobile apps, and applications that download email locally",
      securityRisk: "high",
      recommendation: "Disable if not needed. Outdated protocol with security concerns.",
    },
    ActiveSync: {
      fullName: "Exchange ActiveSync",
      affectedApps: "Native iOS Mail app, native Android Mail app, Windows Mail app, and mobile device management (MDM) solutions",
      securityRisk: "medium",
      recommendation: "Keep enabled for mobile device access unless using Outlook mobile app exclusively.",
    },
    SMTP: {
      fullName: "SMTP Client Authentication (Basic Auth)",
      affectedApps: "Multifunction printers/scanners, line-of-business apps, and scripts that send mail with a username and password",
      securityRisk: "high",
      recommendation: "Disable unless a device or app must send mail with basic authentication.",
    },
  };

  // Modern protocols (recommended)
  const modernProtocols = [
    { name: "EWS", enabled: exchangeData?.EWSEnabled, ...protocolInfo.EWS },
    { name: "MAPI", enabled: exchangeData?.MailboxMAPIEnabled, ...protocolInfo.MAPI },
    { name: "OWA", enabled: exchangeData?.MailboxOWAEnabled, ...protocolInfo.OWA },
    { name: "ActiveSync", enabled: exchangeData?.MailboxActiveSyncEnabled, ...protocolInfo.ActiveSync },
  ];
  
  // Legacy protocols (security risk)
  // SMTP client auth is inverted in EXO: SmtpClientAuthenticationDisabled true = secure,
  // false = basic auth enabled (risk), null = follows the org-wide default (unknown here).
  const legacyProtocols = [
    { name: "IMAP", enabled: exchangeData?.MailboxImapEnabled, ...protocolInfo.IMAP },
    { name: "POP", enabled: exchangeData?.MailboxPopEnabled, ...protocolInfo.POP },
    {
      name: "SMTP",
      enabled: exchangeData?.SmtpClientAuthenticationDisabled === false,
      unknown: exchangeData?.SmtpClientAuthenticationDisabled == null,
      ...protocolInfo.SMTP,
    },
  ];
  
  // Combined for dialog lookups
  const protocols = [...modernProtocols, ...legacyProtocols];
  
  // Track if any legacy protocol is enabled
  const anyLegacyEnabled = legacyProtocols.some(p => p.enabled);
  
  // Track if both IMAP and POP are enabled (for "disable both" button)
  const bothLegacyEnabled = legacyProtocols
    .filter((p) => p.name === "IMAP" || p.name === "POP")
    .every((p) => p.enabled);
  
  // State for legacy protocols section expansion
  const [legacyProtocolsExpanded, setLegacyProtocolsExpanded] = useState(anyLegacyEnabled);
  
  // Auto-expand/collapse legacy section based on protocol status
  useEffect(() => {
    if (anyLegacyEnabled) {
      setLegacyProtocolsExpanded(true);
    } else {
      setLegacyProtocolsExpanded(false);
    }
  }, [anyLegacyEnabled]);

  // Define mailbox hold types array
  const holds = [
    { name: "Litigation", enabled: exchangeData?.LitigationHold, toggleable: true },
    { name: "Retention", enabled: exchangeData?.RetentionHold, toggleable: true },
    { name: "Compliance Tag", enabled: exchangeData?.ComplianceTagHold, toggleable: false },
    { name: "In-Place", enabled: exchangeData?.InPlaceHold, toggleable: false },
    { name: "eDiscovery", enabled: exchangeData?.EDiscoveryHold, toggleable: false },
    { name: "Purview Retention", enabled: exchangeData?.PurviewRetentionHold, toggleable: false },
  ];

  const activeHolds = holds.filter(h => h.enabled);
  const enabledProtocols = protocols.filter(p => p.enabled);

  // Calculate usage percentage
  const usagePercent = exchangeData?.TotalItemSize && exchangeData?.ProhibitSendReceiveQuota
    ? Math.round((exchangeData.TotalItemSize / exchangeData.ProhibitSendReceiveQuota) * 100)
    : 0;

  // Determine forwarding status
  const forwardingAddress = exchangeData?.ForwardingAddress;
  let forwardingType = "None";
  let cleanAddress = "";
  if (forwardingAddress) {
    if (forwardingAddress.startsWith("smtp:")) {
      forwardingType = "External";
      cleanAddress = forwardingAddress.replace("smtp:", "");
    } else {
      forwardingType = "Internal";
      cleanAddress = forwardingAddress;
    }
  }

  if (isLoading) {
    return (
      <Card {...other}>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={100} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Mail color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Exchange Mailbox
              </Typography>
            </Stack>
            {isFetching ? (
              <CircularProgress size={20} />
            ) : (
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} size="small">
                  <Sync />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Spam Alert */}
          {exchangeData?.BlockedForSpam && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This mailbox is currently blocked for spam.
            </Alert>
          )}

          {/* Quick Stats */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                icon={Mail}
                label="Type"
                value={formatMailboxType(exchangeData?.RecipientTypeDetails)}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                icon={anyLegacyEnabled ? Warning : SettingsEthernet}
                label="Protocols"
                value={`${enabledProtocols.length}/${protocols.length}`}
                color={anyLegacyEnabled ? "warning" : "info"}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                icon={Security}
                label="Holds"
                value={activeHolds.length > 0 ? activeHolds.length : "None"}
                color={activeHolds.length > 0 ? "warning" : "success"}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                icon={Archive}
                label="Archive"
                value={exchangeData?.ArchiveMailBox ? "Enabled" : "Disabled"}
                color={exchangeData?.ArchiveMailBox ? "success" : "default"}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Content */}
        <Box sx={{ p: 2.5 }}>
          {/* Storage Usage */}
          <InfoSection icon={Storage} title="Storage Usage">
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Mailbox Size
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {exchangeData?.TotalItemSize != null 
                    ? `${Math.round(exchangeData.TotalItemSize * 100) / 100} GB` 
                    : "N/A"} 
                  {exchangeData?.ProhibitSendReceiveQuota && (
                    <Typography component="span" variant="body2" color="text.secondary">
                      {" "}/ {Math.round(exchangeData.ProhibitSendReceiveQuota)} GB
                    </Typography>
                  )}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(usagePercent, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor: usagePercent > 90 
                      ? theme.palette.error.main 
                      : usagePercent > 75 
                        ? theme.palette.warning.main 
                        : theme.palette.primary.main,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {usagePercent}% used
              </Typography>
            </Paper>
          </InfoSection>

          <Divider sx={{ my: 2 }} />

          {/* Mailbox Settings */}
          <InfoSection icon={Mail} title="Mailbox Settings">
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <Tooltip title={userPrincipalName ? `Click to ${exchangeData?.HiddenFromAddressLists ? 'show in' : 'hide from'} Global Address List` : 'User info not available'}>
                  <Paper 
                    variant="outlined" 
                    onClick={userPrincipalName ? () => setGalDialog(true) : undefined}
                    sx={{ 
                      p: 1.5,
                      cursor: userPrincipalName ? "pointer" : "default",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": userPrincipalName ? {
                        borderColor: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      } : {},
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {isTogglingGal ? (
                        <CircularProgress size={20} />
                      ) : exchangeData?.HiddenFromAddressLists ? (
                        <VisibilityOff fontSize="small" color="warning" />
                      ) : (
                        <CheckCircle fontSize="small" color="success" />
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Address List
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {exchangeData?.HiddenFromAddressLists ? "Hidden" : "Visible"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip title={exchangeData?.BlockedForSpam && userPrincipalName ? "Click to clear spam block" : ""}>
                  <Paper 
                    variant="outlined" 
                    onClick={exchangeData?.BlockedForSpam && userPrincipalName ? () => setSpamDialog(true) : undefined}
                    sx={{ 
                      p: 1.5,
                      cursor: exchangeData?.BlockedForSpam && userPrincipalName ? "pointer" : "default",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": exchangeData?.BlockedForSpam && userPrincipalName ? {
                        borderColor: "error.main",
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
                      } : {},
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {isClearingSpam ? (
                        <CircularProgress size={20} />
                      ) : exchangeData?.BlockedForSpam ? (
                        <Block fontSize="small" color="error" />
                      ) : (
                        <CheckCircle fontSize="small" color="success" />
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Spam Status
                        </Typography>
                        <Typography variant="body2" fontWeight={500} color={exchangeData?.BlockedForSpam ? "error.main" : "inherit"}>
                          {exchangeData?.BlockedForSpam ? "Blocked" : "Clear"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip title={userPrincipalName ? `Click to ${exchangeData?.BlockExternalInbound === true ? 'allow' : 'block'} external inbound mail` : 'User info not available'}>
                  <Paper
                    variant="outlined"
                    onClick={userPrincipalName ? () => handleRestrictionClick("Inbound", exchangeData?.BlockExternalInbound === true) : undefined}
                    sx={{
                      p: 1.5,
                      cursor: userPrincipalName ? "pointer" : "default",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": userPrincipalName ? {
                        borderColor: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      } : {},
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {isTogglingRestriction && restrictionDialog.direction === "Inbound" ? (
                        <CircularProgress size={20} />
                      ) : exchangeData?.BlockExternalInbound === true ? (
                        <Block fontSize="small" color="warning" />
                      ) : (
                        <CheckCircle fontSize="small" color="success" />
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ext. Inbound
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {exchangeData?.BlockExternalInbound === true ? "Blocked" : "Allowed"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Tooltip title={userPrincipalName ? `Click to ${exchangeData?.BlockExternalOutbound === true ? 'allow' : 'block'} external outbound mail` : 'User info not available'}>
                  <Paper
                    variant="outlined"
                    onClick={userPrincipalName ? () => handleRestrictionClick("Outbound", exchangeData?.BlockExternalOutbound === true) : undefined}
                    sx={{
                      p: 1.5,
                      cursor: userPrincipalName ? "pointer" : "default",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": userPrincipalName ? {
                        borderColor: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      } : {},
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {isTogglingRestriction && restrictionDialog.direction === "Outbound" ? (
                        <CircularProgress size={20} />
                      ) : exchangeData?.BlockExternalOutbound === true ? (
                        <Block fontSize="small" color="warning" />
                      ) : (
                        <CheckCircle fontSize="small" color="success" />
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ext. Outbound
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {exchangeData?.BlockExternalOutbound === true ? "Blocked" : "Allowed"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Tooltip>
              </Grid>
            </Grid>
            {exchangeData?.RetentionPolicy && (
              <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Retention Policy
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {exchangeData.RetentionPolicy}
                </Typography>
              </Paper>
            )}
          </InfoSection>

          <Divider sx={{ my: 2 }} />

          {/* Forwarding */}
          <InfoSection icon={Forward} title="Forwarding">
            {forwardingType === "None" ? (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  borderColor: alpha(theme.palette.success.main, 0.3),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircle fontSize="small" color="success" />
                  <Typography variant="body2">No forwarding configured</Typography>
                </Stack>
              </Paper>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  borderColor: alpha(theme.palette.warning.main, 0.3),
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Warning fontSize="small" color="warning" />
                    <Chip 
                      label={`${forwardingType} Forwarding Active`} 
                      color="warning" 
                      size="small" 
                    />
                  </Stack>
                  <Typography variant="body2">
                    <strong>To:</strong> {cleanAddress}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {exchangeData?.ForwardAndDeliver 
                      ? "Copy kept in mailbox" 
                      : "No copy kept in mailbox"}
                  </Typography>
                </Stack>
              </Paper>
            )}
          </InfoSection>

          <Divider sx={{ my: 2 }} />

          {/* Archive */}
          {exchangeData?.ArchiveMailBox && (
            <>
              <InfoSection icon={Archive} title="Archive Mailbox">
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Archive Size
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {exchangeData?.TotalArchiveItemSize != null
                          ? `${exchangeData.TotalArchiveItemSize} GB`
                          : "N/A"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Archive Items
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {exchangeData?.TotalArchiveItemCount?.toLocaleString() || "N/A"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        icon={exchangeData?.AutoExpandingArchive ? <CheckIcon /> : <CloseIcon />}
                        label="Auto-Expanding Archive"
                        color={exchangeData?.AutoExpandingArchive ? "success" : "default"}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </InfoSection>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Protocols */}
          <InfoSection icon={SettingsEthernet} title="Protocols">
            {/* Modern Protocols */}
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
              {modernProtocols.map((protocol) => (
                <Tooltip 
                  key={protocol.name} 
                  title={userPrincipalName 
                    ? `${protocol.fullName} - Click to ${protocol.enabled ? 'disable' : 'enable'}` 
                    : `${protocol.fullName} - User info not available`}
                >
                  <Chip
                    label={protocol.name}
                    icon={protocol.enabled ? <CheckIcon /> : <CloseIcon />}
                    color={protocol.enabled ? "success" : "default"}
                    variant={protocol.enabled ? "filled" : "outlined"}
                    size="small"
                    onClick={userPrincipalName ? () => handleProtocolClick(protocol.name, protocol.enabled) : undefined}
                    sx={{ 
                      fontWeight: 500,
                      cursor: userPrincipalName ? "pointer" : "default",
                      "&:hover": userPrincipalName ? {
                        opacity: 0.8,
                        transform: "scale(1.02)",
                      } : {},
                      transition: "all 0.15s ease-in-out",
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
            
            {/* Legacy Protocols Section - Collapsible */}
            <Paper 
              variant="outlined" 
              sx={{ 
                bgcolor: anyLegacyEnabled 
                  ? alpha(theme.palette.error.main, 0.04)
                  : alpha(theme.palette.grey[500], 0.04),
                borderColor: anyLegacyEnabled 
                  ? alpha(theme.palette.error.main, 0.3)
                  : alpha(theme.palette.grey[500], 0.2),
                overflow: "hidden",
              }}
            >
              <Box
                onClick={() => setLegacyProtocolsExpanded(!legacyProtocolsExpanded)}
                sx={{ 
                  p: 1.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  "&:hover": {
                    bgcolor: anyLegacyEnabled 
                      ? alpha(theme.palette.error.main, 0.08)
                      : alpha(theme.palette.grey[500], 0.08),
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Warning 
                    fontSize="small" 
                    sx={{ 
                      flexShrink: 0,
                      color: anyLegacyEnabled ? "error.main" : "text.disabled",
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    fontWeight={600} 
                    sx={{ color: anyLegacyEnabled ? "error.main" : "text.secondary" }}
                  >
                    Legacy Protocols {anyLegacyEnabled ? "(Security Risk)" : "(Secure)"}
                  </Typography>
                </Stack>
                {legacyProtocolsExpanded ? (
                  <ExpandLess fontSize="small" sx={{ color: anyLegacyEnabled ? "error.main" : "text.disabled" }} />
                ) : (
                  <ExpandMore fontSize="small" sx={{ color: anyLegacyEnabled ? "error.main" : "text.disabled" }} />
                )}
              </Box>
              <Collapse in={legacyProtocolsExpanded}>
                <Box sx={{ px: 1.5, pb: 1.5 }}>
                  {anyLegacyEnabled && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, lineHeight: 1.4 }}>
                      These protocols can bypass MFA. Disable unless needed for legacy email clients.
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
                    {legacyProtocols.map((protocol) => {
                      // SMTP uses inverted EXO semantics (SmtpClientAuthenticationDisabled) but
                      // can still be toggled per mailbox — enable = Disabled $false.
                      // null/unknown means inherit org TransportConfig; click sets an explicit override.
                      const isSmtp = protocol.name === "SMTP";
                      const clickable = Boolean(userPrincipalName);
                      const tooltipTitle = !userPrincipalName
                        ? `${protocol.fullName} - User info not available`
                        : protocol.unknown
                          ? `${protocol.fullName} - Follows the organization default (click to set an explicit override)`
                          : `${protocol.fullName} - Click to ${protocol.enabled ? "disable" : "enable"}`;
                      return (
                        <Tooltip key={protocol.name} title={tooltipTitle}>
                          <Chip
                            label={isSmtp ? "SMTP Auth" : protocol.name}
                            icon={protocol.unknown ? undefined : protocol.enabled ? <Warning /> : <CloseIcon />}
                            color={protocol.unknown ? "default" : protocol.enabled ? "error" : "default"}
                            variant={protocol.enabled ? "filled" : "outlined"}
                            size="small"
                            onClick={clickable ? () => handleProtocolClick(protocol.name, protocol.enabled) : undefined}
                            sx={{ 
                              fontWeight: 500,
                              cursor: clickable ? "pointer" : "default",
                              "&:hover": clickable ? {
                                opacity: 0.8,
                                transform: "scale(1.02)",
                              } : {},
                              transition: "all 0.15s ease-in-out",
                              ...(protocol.enabled && {
                                bgcolor: alpha(theme.palette.error.main, 0.9),
                                "&:hover": clickable ? {
                                  bgcolor: alpha(theme.palette.error.main, 0.75),
                                  transform: "scale(1.02)",
                                } : {},
                              }),
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                    {/* Disable Both button - only show when both are enabled */}
                    {bothLegacyEnabled && userPrincipalName && (
                      <Tooltip title="Disable both IMAP and POP protocols">
                        <Chip
                          label="Disable Both"
                          icon={<Block />}
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={() => handleProtocolClick(["IMAP", "POP"], true)}
                          sx={{ 
                            fontWeight: 600,
                            cursor: "pointer",
                            ml: 0.5,
                            borderStyle: "dashed",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              borderStyle: "solid",
                            },
                            transition: "all 0.15s ease-in-out",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          </InfoSection>

          <Divider sx={{ my: 2 }} />

          {/* Holds */}
          <InfoSection icon={Security} title="Mailbox Holds">
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {holds.filter(h => h.toggleable).map((hold) => (
                <Tooltip
                  key={hold.name}
                  title={
                    hold.name === "Litigation" && licensedForLitigationHold === false
                      ? "Litigation Hold requires an eligible Exchange license — click for details"
                      : userPrincipalName
                        ? `${hold.name} Hold - Click to ${hold.enabled ? "disable" : "enable"}`
                        : `${hold.name} Hold`
                  }
                >
                  <Chip
                    label={hold.name}
                    icon={hold.enabled ? <Security /> : <CloseIcon />}
                    color={hold.enabled ? "warning" : "default"}
                    variant={hold.enabled ? "filled" : "outlined"}
                    size="small"
                    onClick={userPrincipalName ? () => handleHoldClick(hold.name, hold.enabled) : undefined}
                    sx={{
                      fontWeight: 500,
                      cursor: userPrincipalName ? "pointer" : "default",
                      "&:hover": userPrincipalName ? {
                        opacity: 0.8,
                        transform: "scale(1.02)",
                      } : {},
                      transition: "all 0.15s ease-in-out",
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
            {holds.filter(h => !h.toggleable && h.enabled).length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {holds.filter(h => !h.toggleable && h.enabled).map((hold) => (
                  <Tooltip key={hold.name} title={`${hold.name} Hold - Managed via Microsoft Purview compliance portal`}>
                    <Chip
                      label={hold.name}
                      icon={<Security />}
                      color="warning"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            )}
            {activeHolds.length === 0 && holds.filter(h => h.toggleable).every(h => !h.enabled) && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  borderColor: alpha(theme.palette.success.main, 0.3),
                  mt: 1,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircle fontSize="small" color="success" />
                  <Typography variant="body2">No holds applied</Typography>
                </Stack>
              </Paper>
            )}
            {exchangeData?.ExcludedFromOrgWideHold && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                This mailbox is excluded from organization-wide holds.
              </Alert>
            )}
          </InfoSection>
        </Box>
      </CardContent>
      
      {/* Protocol Toggle Confirmation Dialog */}
      <Dialog
        open={protocolDialog.open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        {(() => {
          const isMultiple = Array.isArray(protocolDialog.protocol);
          const protocolDisplay = isMultiple 
            ? protocolDialog.protocol.join(" & ") 
            : protocolDialog.protocol;
          const singleProtocol = isMultiple ? null : protocolDialog.protocol;
          const protocolData = singleProtocol ? protocolInfo[singleProtocol] : null;
          
          return (
            <>
              <DialogTitle sx={{ 
                color: (!protocolDialog.currentlyEnabled && protocolData?.securityRisk === "high") 
                  ? "error.main" 
                  : "inherit" 
              }}>
                {protocolDialog.currentlyEnabled 
                  ? `Disable ${protocolDisplay}?` 
                  : (protocolData?.securityRisk === "high" 
                      ? `⚠️ Enable ${protocolDisplay}? (Not Recommended)` 
                      : `Enable ${protocolDisplay}?`)
                }
              </DialogTitle>
              <DialogContent>
                <DialogContentText component="div">
                  {!isMultiple && protocolData && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>{protocolData.fullName}</strong>
                    </Typography>
                  )}
                  
                  Are you sure you want to {protocolDialog.currentlyEnabled ? "disable" : "enable"}{" "}
                  <strong>{protocolDisplay}</strong> for this mailbox?
                  
                  {/* Disable warning - single protocol */}
                  {protocolDialog.currentlyEnabled && !isMultiple && protocolData && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        The following applications will no longer be able to access this mailbox:
                      </Typography>
                      <Typography variant="body2">
                        {protocolData.affectedApps}
                      </Typography>
                    </Alert>
                  )}
                  
                  {/* Disable warning - multiple protocols (disable both) */}
                  {protocolDialog.currentlyEnabled && isMultiple && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Recommended Security Action
                      </Typography>
                      <Typography variant="body2">
                        Disabling both IMAP and POP will improve mailbox security by preventing 
                        legacy authentication methods that can bypass MFA.
                      </Typography>
                    </Alert>
                  )}
                  
                  {/* Enable warning - single protocol */}
                  {!protocolDialog.currentlyEnabled && !isMultiple && protocolData && (
                    <>
                      {protocolData.securityRisk === "high" && (
                        <Alert 
                          severity="error" 
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                            Security Warning - Not Recommended
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>{protocolDisplay}</strong> is a legacy protocol that may use basic authentication, 
                            which transmits credentials in a less secure manner. Enabling this protocol:
                          </Typography>
                          <Typography variant="body2" component="div">
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              <li>Decreases the overall security of the mailbox</li>
                              <li>May bypass modern authentication and MFA protections</li>
                              <li>Increases vulnerability to credential theft attacks</li>
                              <li>Is not recommended by Microsoft security best practices</li>
                            </ul>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                            Only enable if the user requires a third-party email client (like Apple Mail or Thunderbird) 
                            that does not support modern authentication.
                          </Typography>
                        </Alert>
                      )}
                      
                      <Alert 
                        severity={protocolData.securityRisk === "high" ? "warning" : "info"} 
                        sx={{ mt: 2 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Enabling this protocol will allow access from:
                        </Typography>
                        <Typography variant="body2">
                          {protocolData.affectedApps}
                        </Typography>
                      </Alert>
                    </>
                  )}
                </DialogContentText>
                {toggleProtocol.isError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {toggleProtocol.error?.message || "Failed to update protocol setting"}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} disabled={isToggling}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProtocolToggle}
                  color={
                    protocolDialog.currentlyEnabled 
                      ? (isMultiple ? "success" : "error")
                      : (protocolData?.securityRisk === "high" ? "error" : "primary")
                  }
                  variant="contained"
                  disabled={isToggling}
                  startIcon={isToggling ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {isToggling 
                    ? "Updating..." 
                    : protocolDialog.currentlyEnabled 
                      ? (isMultiple ? "Disable Both" : "Disable")
                      : (protocolData?.securityRisk === "high" ? "Enable Anyway" : "Enable")
                  }
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
      
      {/* GAL Visibility Toggle Confirmation Dialog */}
      <Dialog
        open={galDialog}
        onClose={() => setGalDialog(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {exchangeData?.HiddenFromAddressLists ? "Show in" : "Hide from"} Global Address List?
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            Are you sure you want to {exchangeData?.HiddenFromAddressLists ? "show" : "hide"} this mailbox 
            {exchangeData?.HiddenFromAddressLists ? " in" : " from"} the Global Address List?
            
            {!exchangeData?.HiddenFromAddressLists ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  When hidden from the Global Address List:
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Users will not be able to find this mailbox when searching the address book</li>
                    <li>The mailbox will not appear in Outlook's autocomplete suggestions</li>
                    <li>Users can still send email if they know the exact address</li>
                  </ul>
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  The mailbox will become visible in the Global Address List and users will be able to 
                  find it when searching the address book.
                </Typography>
              </Alert>
            )}
            
            {exchangeData?.onPremisesSyncEnabled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This mailbox is synced from Active Directory. Changes made here 
                  may be overwritten on the next sync cycle.
                </Typography>
              </Alert>
            )}
          </DialogContentText>
          {toggleGalVisibility.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {toggleGalVisibility.error?.message || "Failed to update GAL visibility"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGalDialog(false)} disabled={isTogglingGal}>
            Cancel
          </Button>
          <Button
            onClick={handleGalToggle}
            color={exchangeData?.HiddenFromAddressLists ? "primary" : "warning"}
            variant="contained"
            disabled={isTogglingGal}
            startIcon={isTogglingGal ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isTogglingGal ? "Updating..." : exchangeData?.HiddenFromAddressLists ? "Show in GAL" : "Hide from GAL"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Spam Status Clear Confirmation Dialog */}
      <Dialog
        open={spamDialog}
        onClose={() => setSpamDialog(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          Clear Spam Block?
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            This mailbox is currently blocked from sending email due to suspected spam activity.
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Before clearing this block, please ensure:
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>The user's account has not been compromised</li>
                  <li>The user's password has been reset if there's any suspicion of compromise</li>
                  <li>Any malicious mail rules or forwarding have been removed</li>
                  <li>MFA is enabled on the account</li>
                </ul>
              </Typography>
            </Alert>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Clearing this block will allow the user to send email again. If the spam behavior continues, 
                the mailbox may be automatically blocked again by Microsoft.
              </Typography>
            </Alert>
          </DialogContentText>
          {clearSpamStatus.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {clearSpamStatus.error?.message || "Failed to clear spam status"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpamDialog(false)} disabled={isClearingSpam}>
            Cancel
          </Button>
          <Button
            onClick={handleClearSpam}
            color="success"
            variant="contained"
            disabled={isClearingSpam}
            startIcon={isClearingSpam ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
          >
            {isClearingSpam ? "Clearing..." : "Clear Spam Block"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hold Toggle Confirmation Dialog */}
      <Dialog
        open={holdDialog.open}
        onClose={handleHoldDialogClose}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {holdDialog.currentlyEnabled ? "Disable" : "Enable"} {holdDialog.holdType} Hold?
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            Are you sure you want to {holdDialog.currentlyEnabled ? "disable" : "enable"}{" "}
            <strong>{holdDialog.holdType} Hold</strong> for this mailbox?

            {!holdDialog.currentlyEnabled && holdDialog.holdType === "Litigation" && (
              <>
                {licensedForLitigationHold === false && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      This mailbox is not licensed for Litigation Hold
                    </Typography>
                    <Typography variant="body2" component="div">
                      Assign one of these licenses before enabling Litigation Hold:
                      <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                        {LITIGATION_HOLD_ELIGIBLE_LICENSES.map((license) => (
                          <li key={license}>{license}</li>
                        ))}
                      </ul>
                    </Typography>
                    {userId && (
                      <Button
                        component={NextLink}
                        href={`/identity/administration/users/user/edit?userId=${userId}`}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1.5, textTransform: "none" }}
                      >
                        Assign License on Edit User
                      </Button>
                    )}
                  </Alert>
                )}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Litigation Hold preserves all mailbox content
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Deleted items and modified versions of items are retained</li>
                      <li>Items in the Recoverable Items folder are preserved</li>
                      <li>Users can still delete items, but they remain discoverable</li>
                      <li>Hold persists until explicitly removed</li>
                    </ul>
                  </Typography>
                </Alert>
                <TextField
                  label="Hold Duration (days, optional)"
                  type="number"
                  fullWidth
                  size="small"
                  value={litigationDays}
                  onChange={(e) => setLitigationDays(e.target.value)}
                  helperText="Leave blank for indefinite hold. Specify number of days to auto-expire."
                  sx={{ mt: 2 }}
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </>
            )}

            {!holdDialog.currentlyEnabled && holdDialog.holdType === "Retention" && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Retention Hold suspends retention policy processing
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>MRM retention policies will stop processing this mailbox</li>
                    <li>Items that would normally be deleted by retention are preserved</li>
                    <li>Useful when a user is temporarily unavailable (e.g., on leave)</li>
                  </ul>
                </Typography>
              </Alert>
            )}

            {holdDialog.currentlyEnabled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Disabling this hold may result in data loss
                </Typography>
                <Typography variant="body2">
                  {holdDialog.holdType === "Litigation"
                    ? "Previously preserved items in the Recoverable Items folder may be permanently deleted by the Managed Folder Assistant."
                    : "Retention policies will resume processing, and items past their retention period may be deleted."}
                </Typography>
              </Alert>
            )}
          </DialogContentText>
          <CippApiResults apiObject={toggleHold} errorsOnly={true} alertSx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHoldDialogClose} disabled={isTogglingHold}>
            Cancel
          </Button>
          <Button
            onClick={handleHoldToggle}
            color={holdDialog.currentlyEnabled ? "error" : "warning"}
            variant="contained"
            disabled={isTogglingHold}
            startIcon={isTogglingHold ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isTogglingHold
              ? "Updating..."
              : holdDialog.currentlyEnabled
                ? "Disable Hold"
                : "Enable Hold"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* External Mail Restriction Dialog */}
      <Dialog
        open={restrictionDialog.open}
        onClose={handleRestrictionDialogClose}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {restrictionDialog.currentlyBlocked ? "Allow" : "Block"} External{" "}
          {restrictionDialog.direction} Mail?
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            Are you sure you want to{" "}
            {restrictionDialog.currentlyBlocked ? "allow" : "block"} external{" "}
            {restrictionDialog.direction?.toLowerCase()} mail for this mailbox?

            {!restrictionDialog.currentlyBlocked &&
              restrictionDialog.direction === "Inbound" && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Blocking external inbound mail means:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>
                        Only internal (authenticated) senders can email this
                        mailbox
                      </li>
                      <li>
                        External senders will receive a non-delivery report
                        (NDR)
                      </li>
                      <li>
                        This includes customers, vendors, and any sender outside
                        the organization
                      </li>
                    </ul>
                  </Typography>
                </Alert>
              )}

            {!restrictionDialog.currentlyBlocked &&
              restrictionDialog.direction === "Outbound" && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Blocking external outbound mail means:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>
                        This mailbox will not be able to send email to external
                        recipients
                      </li>
                      <li>
                        The sender will receive a non-delivery report (NDR) when
                        attempting to send externally
                      </li>
                      <li>
                        A transport rule will be auto-created in the tenant to
                        enforce this restriction
                      </li>
                    </ul>
                  </Typography>
                </Alert>
              )}

            {restrictionDialog.currentlyBlocked && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {restrictionDialog.direction === "Inbound"
                    ? "This will allow external senders to email this mailbox again."
                    : "This will allow this mailbox to send email to external recipients again."}
                </Typography>
              </Alert>
            )}
          </DialogContentText>
          <CippApiResults apiObject={toggleRestriction} errorsOnly={true} alertSx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRestrictionDialogClose}
            disabled={isTogglingRestriction}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestrictionToggle}
            color={restrictionDialog.currentlyBlocked ? "primary" : "warning"}
            variant="contained"
            disabled={isTogglingRestriction}
            startIcon={
              isTogglingRestriction ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {isTogglingRestriction
              ? "Updating..."
              : restrictionDialog.currentlyBlocked
                ? `Allow External ${restrictionDialog.direction}`
                : `Block External ${restrictionDialog.direction}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

CippExchangeInfoCard.propTypes = {
  exchangeData: PropTypes.object,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  handleRefresh: PropTypes.func,
  userPrincipalName: PropTypes.string,
  userId: PropTypes.string,
};
