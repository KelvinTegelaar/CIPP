import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { 
  Button,
  Paper,
  Avatar,
  Typography,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Box, Stack } from "@mui/system";
import { 
  Book, 
  Block, 
  Check,
  RocketLaunch,
  Security,
  CheckCircle,
  Cancel,
  Star,
  CalendarToday,
} from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { stringToColor } from "../../../../utils/get-initials";

const Page = () => {
  const pageTitle = "Spam Filters";
  const apiUrl = "/api/ListSpamfilter";
  const theme = useTheme();

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      icon: <Book />,
      url: "/api/AddSpamfilterTemplate",
      dataFunction: (data) => {
        return { ...data };
      },
      confirmText: "Are you sure you want to create a template based on this rule?",
      category: "edit",
    },
    {
      label: "Enable Rule",
      type: "POST",
      icon: <Check />,
      url: "/api/EditSpamfilter",
      data: {
        State: "!enable",
        name: "Name",
      },
      confirmText: "Are you sure you want to enable this rule?",
      condition: (row) => row.ruleState === "Disabled",
      category: "manage",
    },
    {
      label: "Disable Rule",
      type: "POST",
      icon: <Block />,
      url: "/api/EditSpamfilter",
      data: {
        State: "!disable",
        name: "Name",
      },
      confirmText: "Are you sure you want to disable this rule?",
      condition: (row) => row.ruleState === "Enabled",
      category: "manage",
    },
    {
      label: "Delete Rule",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveSpamFilter",
      data: {
        name: "Name",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "error",
      category: "danger",
    },
  ];

  const offCanvas = {
    actions: actions,
    children: (row) => {
      const isEnabled = row.ruleState === "Enabled";
      const isDefault = row.IsDefault;
      const statusColor = isEnabled ? theme.palette.success.main : theme.palette.error.main;
      
      // Mark as spam settings
      const markAsSpamSettings = [
        { key: "MarkAsSpamEmptyMessages", label: "Empty Messages" },
        { key: "MarkAsSpamJavaScriptInHtml", label: "JavaScript in HTML" },
        { key: "MarkAsSpamFramesInHtml", label: "Frames in HTML" },
        { key: "MarkAsSpamObjectTagsInHtml", label: "Object Tags in HTML" },
        { key: "MarkAsSpamEmbedTagsInHtml", label: "Embed Tags in HTML" },
        { key: "MarkAsSpamFormTagsInHtml", label: "Form Tags in HTML" },
        { key: "MarkAsSpamWebBugsInHtml", label: "Web Bugs in HTML" },
        { key: "MarkAsSpamSensitiveWordList", label: "Sensitive Word List" },
        { key: "MarkAsSpamSpfRecordHardFail", label: "SPF Hard Fail" },
        { key: "MarkAsSpamFromAddressAuthFail", label: "From Auth Fail" },
        { key: "MarkAsSpamBulkMail", label: "Bulk Mail" },
        { key: "MarkAsSpamNdrBackscatter", label: "NDR Backscatter" },
      ];
      
      // Increase score settings
      const increaseScoreSettings = [
        { key: "IncreaseScoreWithImageLinks", label: "Image Links" },
        { key: "IncreaseScoreWithNumericIps", label: "Numeric IPs" },
        { key: "IncreaseScoreWithRedirectToOtherPort", label: "Redirect to Other Port" },
        { key: "IncreaseScoreWithBizOrInfoUrls", label: ".biz or .info URLs" },
      ];

      const enabledMarkAsSpam = markAsSpamSettings.filter(s => row[s.key] === "On");
      const enabledIncreaseScore = increaseScoreSettings.filter(s => row[s.key] === "On");
      
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
              <Avatar
                sx={{
                  bgcolor: stringToColor(row.Name || "S"),
                  width: 56,
                  height: 56,
                }}
              >
                <Security />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {row.Name || "Unknown Filter"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Priority: {row.rulePrio}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Status */}
          <Box>
            <Typography 
              variant="overline" 
              color="text.secondary" 
              sx={{ fontWeight: 600, letterSpacing: 1, mb: 1.5, display: "block" }}
            >
              Filter Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={isEnabled ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                label={row.ruleState || "Unknown"}
                color={isEnabled ? "success" : "error"}
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
              {isDefault && (
                <Chip
                  icon={<Star fontSize="small" />}
                  label="Default"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Actions */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Security fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Spam Actions
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {row.HighConfidenceSpamAction && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">High Confidence Spam</Typography>
                  <Chip label={row.HighConfidenceSpamAction} size="small" variant="outlined" />
                </Stack>
              )}
              {row.BulkSpamAction && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Bulk Spam</Typography>
                  <Chip label={row.BulkSpamAction} size="small" variant="outlined" />
                </Stack>
              )}
              {row.PhishSpamAction && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Phish</Typography>
                  <Chip label={row.PhishSpamAction} size="small" variant="outlined" />
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Mark as Spam Settings */}
          {enabledMarkAsSpam.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Mark as Spam ({enabledMarkAsSpam.length} enabled)
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {enabledMarkAsSpam.map((setting) => (
                    <Chip key={setting.key} label={setting.label} size="small" color="error" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {/* Increase Score Settings */}
          {enabledIncreaseScore.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Increase Score ({enabledIncreaseScore.length} enabled)
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {enabledIncreaseScore.map((setting) => (
                    <Chip key={setting.key} label={setting.label} size="small" color="warning" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {/* Timeline */}
          <Divider />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Timeline
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {row.WhenCreated && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getCippFormatting(row.WhenCreated, "WhenCreated")}
                  </Typography>
                </Stack>
              )}
              {row.WhenChanged && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Last Changed</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getCippFormatting(row.WhenChanged, "WhenChanged")}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      );
    },
  };

  const simpleColumns = [
    "Name",
    "IsDefault",
    "ruleState",
    "rulePrio",
    "HighConfidenceSpamAction",
    "BulkSpamAction",
    "PhishSpamAction",
    "WhenCreated",
    "WhenChanged",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button
            component={Link}
            href="/email/spamfilter/list-spamfilter/add"
            startIcon={<RocketLaunch />}
          >
            Deploy Spamfilter
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
