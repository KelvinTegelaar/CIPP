import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { Box, Container, Stack } from '@mui/system'
import {
  AccountTree,
  Apple,
  ContentCopy,
  Delete,
  EventAvailable,
  QrCode2,
  Sync,
} from '@mui/icons-material'
import { CippHead } from '../../../../components/CippComponents/CippHead.jsx'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable.js'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar.jsx'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog.jsx'
import { CippAutopilotProfileDrawer } from '../../../../components/CippComponents/CippAutopilotProfileDrawer.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView.jsx'
import { ApiGetCall } from '../../../../api/ApiCall.jsx'
import { useDialog } from '../../../../hooks/use-dialog.js'
import { useSettings } from '../../../../hooks/use-settings.js'

const pageTitle = 'Enrollment Profiles'
const appleADEPageTitle = 'Apple Enrollment Profiles'
const androidEnterprisePageTitle = 'Android Enrollment Profiles'
const windowsAutopilotPageTitle = 'Windows Autopilot Profiles'

const EnrollmentProfilesPage = ({ children, title = pageTitle }) => {
  return (
    <>
      <CippHead title={title} />
      <Box>
        <Container maxWidth={false} sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {children}
          </Stack>
        </Container>
      </Box>
    </>
  )
}

const AndroidQrDialog = ({ row, drawerVisible, setDrawerVisible }) => {
  const [copied, setCopied] = useState(false)

  const tokenValue = useMemo(() => {
    if (row?.tokenValue) {
      return row.tokenValue
    }

    if (!row?.qrCodeContent) {
      return ''
    }

    try {
      const parsed = JSON.parse(row.qrCodeContent)
      const adminExtras = parsed?.['android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE']
      return adminExtras?.['com.google.android.apps.work.clouddpc.EXTRA_ENROLLMENT_TOKEN'] || ''
    } catch {
      return ''
    }
  }, [row?.qrCodeContent, row?.tokenValue])

  const handleClose = () => {
    setDrawerVisible(false)
  }

  const handleCopy = async () => {
    if (!tokenValue) {
      return
    }

    try {
      await navigator.clipboard.writeText(tokenValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const qrCodeImageValue = row?.qrCodeImage?.value
  const qrCodeImageType = row?.qrCodeImage?.type || 'image/png'

  return (
    <Dialog open={drawerVisible} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enrollment QR - {row?.displayName}</DialogTitle>
      <DialogContent>
        {qrCodeImageValue && (
          <Box sx={{ mb: 3 }}>
            <img
              src={`data:${qrCodeImageType};base64,${qrCodeImageValue}`}
              alt="Enrollment QR code"
              style={{
                width: '100%',
                maxWidth: 320,
                display: 'block',
                margin: '0 auto',
              }}
            />
          </Box>
        )}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Token value</Typography>
          <Button
            size="small"
            startIcon={<ContentCopy />}
            onClick={handleCopy}
            disabled={!tokenValue}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </Stack>
        <Box
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            fontSize: 12,
            p: 2,
            m: 0,
            bgcolor: 'background.default',
            borderRadius: 1,
          }}
        >
          {tokenValue || 'No token value available.'}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export const AppleADEEnrollmentProfiles = () => {
  const currentTenant = useSettings().currentTenant
  const depSyncDialog = useDialog()

  const appleProfiles = ApiGetCall({
    url: '/api/ListAppleEnrollmentProfiles',
    data: { tenantFilter: currentTenant },
    queryKey: `AppleEnrollmentProfiles-${currentTenant}`,
    waiting: Boolean(currentTenant),
  })

  const appleData = appleProfiles.data?.Results || {}
  const tokens = appleData.Tokens || []
  const profiles = appleData.Profiles || []
  const syncErrorCodes = {
    1: {
      label: 'Expired',
      message: 'The ADE token sync has expired.',
      severity: 'error',
    },
    2: {
      label: 'Unknown',
      message: 'The ADE token sync state is unknown.',
      severity: 'error',
    },
    3: {
      label: 'Terms & Conditions',
      message: 'New Apple Business Manager terms are ready to accept.',
      severity: 'warning',
    },
    4: {
      label: 'Warning',
      message: 'The ADE token sync completed with a warning.',
      severity: 'warning',
    },
  }
  const syncErrorTokens = tokens.filter(
    (token) => token.lastSyncErrorCode != null && Number(token.lastSyncErrorCode) !== 0
  )
  const expiringTokens = tokens.filter(
    (token) => token.daysUntilExpiration !== null && token.daysUntilExpiration <= 30
  )
  const totalSyncedDevices = tokens.reduce(
    (sum, token) => sum + Number(token.syncedDeviceCount || 0),
    0
  )
  const lastSuccessfulSync = tokens
    .map((token) => token.lastSuccessfulSyncDateTime)
    .filter(Boolean)
    .sort()
    .pop()

  const infoBarData = [
    {
      icon: <Apple />,
      name: 'ADE Tokens',
      data: tokens.length,
      offcanvas: {
        title: 'Apple ADE Tokens',
        propertyItems: tokens.flatMap((token) => [
          {
            label: `${token.tokenName || token.id} - Apple ID`,
            value: token.appleIdentifier || 'N/A',
          },
          {
            label: `${token.tokenName || token.id} - Expiration`,
            value: token.tokenExpirationDateTime || 'N/A',
          },
          {
            label: `${token.tokenName || token.id} - Synced Devices`,
            value: token.syncedDeviceCount ?? 'N/A',
          },
          {
            label: `${token.tokenName || token.id} - Last Sync`,
            value: token.lastSuccessfulSyncDateTime || 'N/A',
          },
        ]),
      },
    },
    {
      icon: <EventAvailable />,
      name: 'Expiring Tokens',
      data: expiringTokens.length,
      color: expiringTokens.length ? 'error' : 'success',
      toolTip: 'Tokens expiring within 30 days',
    },
    {
      icon: <AccountTree />,
      name: 'ADE Profiles',
      data: profiles.length,
    },
    {
      icon: <Sync />,
      name: 'Last Successful Sync',
      data: lastSuccessfulSync ? new Date(lastSuccessfulSync).toLocaleString() : 'N/A',
      toolTip: `${totalSyncedDevices} synced devices across all tokens`,
    },
  ]

  const appleActions = [
    {
      label: 'Delete Profile',
      type: 'POST',
      icon: <Delete />,
      url: '/api/ExecRemoveEnrollmentProfile',
      relatedQueryKeys: [`AppleEnrollmentProfiles*-${currentTenant}`],
      data: {
        profileId: 'id',
        tokenId: 'tokenId',
        profileType: 'profileType',
        displayName: 'displayName',
      },
      confirmText: 'Are you sure you want to delete enrollment profile [displayName]?',
      color: 'danger',
    },
  ]

  const appleFilters = useMemo(
    () => [
      { filterName: 'All', value: [] },
      { filterName: 'macOS', value: [{ id: 'platform', value: 'macOS' }] },
      {
        filterName: 'iOS/iPadOS',
        value: [{ id: 'platform', value: 'iOS/iPadOS' }],
      },
    ],
    []
  )

  return (
    <>
      <EnrollmentProfilesPage title={appleADEPageTitle}>
        {!appleProfiles.isFetching &&
          syncErrorTokens.map((token, index) => {
            const errorCode = Number(token.lastSyncErrorCode)
            const syncError = syncErrorCodes[errorCode] || {
              label: 'Unknown Error',
              message: 'The ADE token sync was not successful.',
              severity: 'warning',
            }
            const tokenName = token.tokenName || token.id || 'Unknown token'
            const appleIdentifier = token.appleIdentifier ? ` (${token.appleIdentifier})` : ''
            const lastSuccessfulSyncText = token.lastSuccessfulSyncDateTime
              ? ` Last successful sync: ${new Date(
                  token.lastSuccessfulSyncDateTime
                ).toLocaleString()}.`
              : ''

            return (
              <Alert
                key={`${token.id || token.tokenName || 'token'}-${index}`}
                severity={syncError.severity}
              >
                {`Token "${tokenName}"${appleIdentifier}: ${syncError.message} (Code ${errorCode} - ${syncError.label}).${lastSuccessfulSyncText}`}
              </Alert>
            )
          })}

        <Card>
          <CippInfoBar data={infoBarData} isFetching={appleProfiles.isFetching} />
        </Card>

        <Card>
          <CippDataTable
            title={`Apple ADE Profiles - ${currentTenant}`}
            queryKey={`AppleEnrollmentProfilesTable-${currentTenant}`}
            data={profiles}
            isFetching={appleProfiles.isFetching}
            refreshFunction={appleProfiles}
            actions={appleActions}
            filters={appleFilters}
            simpleColumns={[
              'displayName',
              'platform',
              'tokenName',
              'isDefault',
              'supervisedModeEnabled',
              'deviceNameTemplate',
              'profileRemovalDisabled',
              'requiresUserAuthentication',
            ]}
            offCanvas={{
              children: (row) => <CippJsonView object={row} type="intune" defaultOpen />,
              size: 'xl',
            }}
            cardButton={
              <Stack direction="row" spacing={1}>
                <Button onClick={depSyncDialog.handleOpen} startIcon={<Sync />}>
                  Sync DEP
                </Button>
              </Stack>
            }
          />
        </Card>
      </EnrollmentProfilesPage>
      <CippApiDialog
        title="Sync DEP Tokens"
        createDialog={depSyncDialog}
        api={{
          type: 'POST',
          url: '/api/ExecSyncDEP',
          data: {},
          confirmText: `Are you sure you want to sync Apple Device Enrollment Program (DEP) tokens for ${currentTenant}?`,
        }}
      />
    </>
  )
}

export const AndroidEnterpriseEnrollmentProfiles = () => {
  const currentTenant = useSettings().currentTenant
  const androidActions = [
    {
      label: 'Show QR',
      icon: <QrCode2 />,
      hideBulk: true,
      noConfirm: true,
      condition: (row) => Boolean(row?.tokenValue || row?.qrCodeImage?.value || row?.qrCodeContent),
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <AndroidQrDialog
          row={row}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
    },
    {
      label: 'Delete Profile',
      type: 'POST',
      icon: <Delete />,
      url: '/api/ExecRemoveEnrollmentProfile',
      data: {
        profileId: 'id',
        profileType: '!android',
        displayName: 'displayName',
      },
      confirmText: 'Are you sure you want to delete Android enrollment profile [displayName]?',
      color: 'danger',
    },
  ]

  return (
    <EnrollmentProfilesPage title={androidEnterprisePageTitle}>
      <Card>
        <CippDataTable
          title={`Android Enterprise Enrollment Profiles - ${currentTenant}`}
          queryKey={`AndroidEnrollmentProfiles-${currentTenant}`}
          api={{
            url: '/api/ListAndroidEnrollmentProfiles',
            data: {
              tenantFilter: currentTenant,
            },
            dataKey: 'Results',
          }}
          actions={androidActions}
          simpleColumns={[
            'displayName',
            'description',
            'enrollmentMode',
            'enrollmentTokenType',
            'enrolledDeviceCount',
            'tokenExpirationDateTime',
            'lastModifiedDateTime',
          ]}
          offCanvas={{
            children: (row) => <CippJsonView object={row} type="intune" defaultOpen />,
            size: 'xl',
          }}
        />
      </Card>
    </EnrollmentProfilesPage>
  )
}

export const WindowsAutopilotEnrollmentProfiles = () => {
  const currentTenant = useSettings().currentTenant
  const autopilotActions = [
    {
      label: 'Delete Profile',
      icon: <Delete />,
      type: 'POST',
      url: '/api/RemoveAutopilotConfig',
      data: { ID: 'id', displayName: 'displayName', assignments: 'assignments' },
      confirmText:
        'Are you sure you want to delete this Autopilot profile? This action cannot be undone.',
      color: 'danger',
    },
  ]

  return (
    <EnrollmentProfilesPage title={windowsAutopilotPageTitle}>
      <Card>
        <CippDataTable
          title={`Windows Autopilot Profiles - ${currentTenant}`}
          queryKey={`AutopilotProfiles-${currentTenant}`}
          api={{
            url: '/api/ListGraphRequest',
            data: {
              tenantFilter: currentTenant,
              Endpoint: 'deviceManagement/windowsAutopilotDeploymentProfiles',
              $expand: 'assignments',
            },
            dataKey: 'Results',
          }}
          actions={autopilotActions}
          simpleColumns={[
            'displayName',
            'description',
            'language',
            'extractHardwareHash',
            'deviceNameTemplate',
          ]}
          offCanvas={{
            children: (row) => <CippJsonView object={row} type="intune" defaultOpen />,
            size: 'xl',
          }}
          cardButton={<CippAutopilotProfileDrawer />}
        />
      </Card>
    </EnrollmentProfilesPage>
  )
}
