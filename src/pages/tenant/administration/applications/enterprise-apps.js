// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import {
  Paper,
  Avatar,
  Typography,
  Chip,
  Divider,
  useTheme,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Box, Stack } from "@mui/system";
import {
  CheckCircle,
  RocketLaunch,
  Apps,
  VpnKey,
  Cancel,
  Language,
} from "@mui/icons-material";
import { usePermissions } from '../../../../hooks/use-permissions.js'
import tabOptions from './tabOptions'
import Link from 'next/link'
import { getEnterpriseAppListActions } from '../../../../components/CippComponents/EnterpriseAppActions.jsx'
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { getInitials, stringToColor } from "../../../../utils/get-initials";

const Page = () => {
  const pageTitle = 'Enterprise Applications'
  const apiUrl = '/api/ListGraphRequest'
  const theme = useTheme();

  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])

  const actions = getEnterpriseAppListActions(canWriteApplication)

  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'createdDateTime',
      'accountEnabled',
      'publisherName',
      'replyUrls',
      'appOwnerOrganizationId',
      'tags',
      'passwordCredentials',
      'keyCredentials',
    ],
    actions: actions,
    children: (row) => {
      const isEnabled = row.accountEnabled !== false;
      const statusColor = isEnabled ? theme.palette.success.main : theme.palette.error.main;
      const hasPasswords = row.passwordCredentials?.length > 0;
      const hasCerts = row.keyCredentials?.length > 0;
      
      return (
        <Stack spacing={3}>
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
              {row.info?.logoUrl ? (
                <Avatar
                  src={row.info.logoUrl}
                  sx={{ width: 56, height: 56 }}
                />
              ) : (
                <Avatar
                  sx={{
                    bgcolor: stringToColor(row.displayName || "A"),
                    width: 56,
                    height: 56,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  {getInitials(row.displayName || "App")}
                </Avatar>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {row.displayName || "Unknown Application"}
                </Typography>
                {row.publisherName && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    by {row.publisherName}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>

          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={isEnabled ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                label={isEnabled ? "Enabled" : "Disabled"}
                color={isEnabled ? "success" : "error"}
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
              {row.signInAudience && (
                <Chip
                  icon={<Language fontSize="small" />}
                  label={row.signInAudience === "AzureADMultipleOrgs" ? "Multi-Tenant" : "Single-Tenant"}
                  color={row.signInAudience === "AzureADMultipleOrgs" ? "info" : "default"}
                  variant="outlined"
                  size="small"
                />
              )}
              {row.verifiedPublisher?.displayName && (
                <Chip
                  icon={<CheckCircle fontSize="small" />}
                  label="Verified Publisher"
                  color="success"
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Apps fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Application Details
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">App ID</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: "monospace",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.5,
                  }}
                >
                  {row.appId}
                </Typography>
              </Stack>
              {row.homepage && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Homepage</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {row.homepage}
                  </Typography>
                </Stack>
              )}
              {row.createdDateTime && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getCippFormatting(row.createdDateTime, "createdDateTime")}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {(hasPasswords || hasCerts) && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <VpnKey fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Credentials
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Password Credentials</Typography>
                    <Chip 
                      label={row.passwordCredentials?.length || 0} 
                      size="small" 
                      color={hasPasswords ? "warning" : "default"}
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Certificate Credentials</Typography>
                    <Chip 
                      label={row.keyCredentials?.length || 0} 
                      size="small" 
                      color={hasCerts ? "warning" : "default"}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Box>
            </>
          )}

          {row.replyUrls?.length > 0 && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Language fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Reply URLs ({row.replyUrls.length})
                  </Typography>
                </Stack>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 1.5,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    maxHeight: 120,
                    overflow: "auto",
                  }}
                >
                  <Stack spacing={0.5}>
                    {row.replyUrls.map((url, index) => (
                      <Typography key={index} variant="caption" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                        {url}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </>
          )}

          {row.tags?.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Tags
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {row.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      );
    },
  }

  const simpleColumns = [
    'info.logoUrl',
    'displayName',
    'appId',
    'accountEnabled',
    'createdDateTime',
    'publisherName',
    'homepage',
    'passwordCredentials',
    'keyCredentials',
  ]

  const apiParams = {
    Endpoint: 'servicePrincipals',
    $select:
      'id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,applicationTemplateId,appOwnerOrganizationId,tags,passwordCredentials,keyCredentials',
    $count: true,
    $top: 999,
  }

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={apiParams}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button component={Link} href="/tenant/tools/appapproval" startIcon={<RocketLaunch />}>
            Deploy Template
          </Button>
        </>
      }
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
