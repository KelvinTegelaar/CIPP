import { useEffect, useMemo, useState } from 'react'
import { Layout as DashboardLayout } from '../../../../../layouts/index.js'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon'
import { Download, Mail, Fingerprint, Launch } from '@mui/icons-material'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import tabOptions from './tabOptions'
import ReactTimeAgo from 'react-time-ago'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { Box, Stack } from '@mui/system'
import { Grid } from '@mui/system'
import CippRemediationCard from '../../../../../components/CippCards/CippRemediationCard'
import CippButtonCard from '../../../../../components/CippCards/CippButtonCard'
import { Chip, SvgIcon, Typography, CircularProgress, Button } from '@mui/material'
import { PropertyList } from '../../../../../components/property-list'
import { PropertyListItem } from '../../../../../components/property-list-item'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { BECRemediationReportButton } from '../../../../../components/BECRemediationReportButton'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'

const checkItemSx = { px: 2, py: 0.75 }

const BecCheckCard = ({ title, count, children }) => (
  <CippButtonCard
    variant="outlined"
    component="accordion"
    title={
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        <Box>{title}</Box>
        {typeof count === 'number' && (
          <Chip size="small" label={count} color={count > 0 ? 'warning' : 'default'} />
        )}
      </Stack>
    }
  >
    {children}
  </CippButtonCard>
)

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { userId } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [restart, setRestart] = useState(false)
  const [initialReady, setInitialReady] = useState(false)
  const [becCheckReady, setBecCheckReady] = useState(false)
  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
    waiting: initialReady,
  })

  useEffect(() => {
    if (userId) {
      setInitialReady(true)
    }
  }, [userId])

  useEffect(() => {
    if (userRequest.isSuccess && userRequest.data?.[0]?.userPrincipalName) {
      setBecCheckReady(true)
    }
  }, [userRequest])

  const becInitialCall = ApiGetCall({
    url: `/api/execBECCheck`,
    data: {
      userId: userId,
      tenantFilter: userSettingsDefaults.currentTenant,
      username: userRequest.data?.[0]?.userPrincipalName,
      ...(restart && { Overwrite: true }),
    },
    queryKey: `execBECCheck-initial-${userId}-${userSettingsDefaults.currentTenant}-${userRequest.data?.[0]?.userPrincipalName}`,
    waiting: becCheckReady,
  })

  // Fetch BEC Check result using GUID
  const becPollingCall = ApiGetCall({
    url: `/api/execBECCheck`,
    data: {
      GUID: becInitialCall.data?.GUID,
      tenantFilter: userSettingsDefaults.currentTenant,
    },
    queryKey: `execBECCheck-polling-${becInitialCall.data?.GUID}`,
    waiting: false,
  })

  // Effect to monitor becGuid and start polling
  useEffect(() => {
    if (becInitialCall.data?.GUID) {
      setIsLoading(true)
      if (!becPollingCall.data || becPollingCall.data?.Waiting) {
        setTimeout(() => {
          becPollingCall.refetch()
        }, 10000)
      }
    }

    if (becPollingCall.isSuccess && becPollingCall.data && !becPollingCall.data?.Waiting) {
      setIsLoading(false)
    }
  }, [becPollingCall.dataUpdatedAt, becInitialCall])

  const restartProcess = () => {
    setRestart(true)
    becPollingCall.refetch()
    setTimeout(() => {
      becInitialCall.refetch()
      becPollingCall.refetch()
    }, 500)
  }

  // Combine loading states
  const isFetching =
    userRequest.isLoading || becInitialCall.isLoading || becPollingCall.isLoading || isLoading

  // Helper functions to determine messages
  const getRuleMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.NewRules && becPollingCall.data.NewRules.length > 0) {
      // Example condition to check for potential breach
      const hasPotentialBreach = becPollingCall.data.NewRules.some((rule) =>
        rule.MoveToFolder?.includes('RSS')
      )
      if (hasPotentialBreach) {
        return 'Potential Breach found. The rules for this user contain classic signs of a breach.'
      }
      const recentCount = becPollingCall.data.NewRules.filter((rule) => rule.RecentlyChanged).length
      if (recentCount > 0) {
        return `Rules have been found, ${recentCount} of which were created or changed in the last 7 days. Please review the list below and take action as needed.`
      }
      return 'Rules have been found. Please review the list below and take action as needed.'
    }
    if (becPollingCall.data.InboxRuleChanges && becPollingCall.data.InboxRuleChanges.length > 0) {
      return 'No rules currently exist on the mailbox, but rules were created, changed or removed in the last 7 days. Please review the changes below.'
    }
    return 'No new rules found.'
  }

  const getUserMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.NewUsers && becPollingCall.data.NewUsers.length > 0) {
      return 'New users have been found in the last 14 days. Please review the list below and take action as needed.'
    }
    return 'No new users found.'
  }

  const getAppMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.AddedApps && becPollingCall.data.AddedApps.length > 0) {
      // Example condition to check for potential breach
      const hasPotentialBreach = becPollingCall.data.AddedApps.some(
        (app) => /* your condition here */ false
      )
      if (hasPotentialBreach) {
        return 'Potential Breach found.'
      }
      return 'New applications have been found. Please review the list below and take action as needed.'
    }
    return 'No new applications found.'
  }

  const getMailboxPermissionMessage = () => {
    if (!becPollingCall.data) return null
    if (
      becPollingCall.data.MailboxPermissionChanges &&
      becPollingCall.data.MailboxPermissionChanges.length > 0
    ) {
      return 'Mailbox permission changes have been found.'
    }
    return 'No mailbox permission changes found.'
  }

  const getSentMessagesMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.SentMessages && becPollingCall.data.SentMessages.length > 0) {
      return 'Sent messages have been found. Please review the list below for any suspicious activity.'
    }
    return 'No sent messages found in the specified time range.'
  }

  const getSafelistMessage = () => {
    if (!becPollingCall.data) return null
    const trustedCount = becPollingCall.data.TrustedSenders?.length || 0
    const blockedCount = becPollingCall.data.BlockedSenders?.length || 0
    const changeCount = becPollingCall.data.SafelistChanges?.length || 0
    if (changeCount > 0) {
      return `Trusted/Blocked senders list was changed ${changeCount} time(s) in the last 7 days. Please review the changes below.`
    }
    if (trustedCount > 0 || blockedCount > 0) {
      return `${trustedCount} trusted and ${blockedCount} blocked sender/domain entries found. Please review the list below.`
    }
    return 'No trusted or blocked senders/domains found.'
  }

  const formatSafelistValue = (value) => {
    if (!value) return 'unchanged'
    return Array.isArray(value) ? value.join(', ') || 'unchanged' : String(value)
  }

  // ponytail: stable identity matters — a new array each render would loop CippDataTable's data-sync effect
  const senderRows = useMemo(
    () => [
      ...(becPollingCall.data?.TrustedSenders || []).map((s) => ({ Sender: s, Type: 'Trusted' })),
      ...(becPollingCall.data?.BlockedSenders || []).map((s) => ({ Sender: s, Type: 'Blocked' })),
    ],
    [becPollingCall.data]
  )

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.userPrincipalName} />,
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <ReactTimeAgo date={new Date(userRequest.data?.[0]?.createdDateTime)} />
            </>
          ),
        },
        {
          icon: <Launch style={{ color: '#667085' }} />,
          text: (
            <Button
              color="muted"
              style={{ paddingLeft: 0 }}
              size="small"
              href={`https://entra.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Entra
            </Button>
          ),
        },
      ]
    : []

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={userRequest.isSuccess ? userRequest.data?.[0]?.displayName : ''}
      subtitle={subtitle}
      isFetching={userRequest.isFetching}
    >
      <CippHead title="Compromise Remediation" />
      {/* Loading State: Show only Remediation Card and Check 1 with Loading Skeleton */}
      {isFetching && userRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 1,
          }}
        >
          <Grid container spacing={2}>
            {/* Remediation Card */}
            <Grid size={5}>
              <CippRemediationCard
                userPrincipalName={userRequest.data[0].userPrincipalName}
                userId={userRequest.data[0].id}
                tenantFilter={userSettingsDefaults.currentTenant}
                restartProcess={restartProcess}
                isFetching={false}
              />
            </Grid>
            {/* Check 1 Card with Loading */}
            <Grid size={7}>
              <CippButtonCard
                variant="outlined"
                isFetching={false}
                title={
                  <Stack direction="row" justifyContent={'space-between'}>
                    <Box>Loading data</Box>
                    <CircularProgress size={20} />
                  </Stack>
                }
              >
                <Typography variant="body2" gutterBottom>
                  This Analysis can take up to 10 minutes to complete depending on the amount of
                  logs. Please wait for the process to finish.
                </Typography>
              </CippButtonCard>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Loaded State: Show all steps */}
      {!isFetching && userRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            {/* Remediation Card */}
            <Grid size={5}>
              <CippRemediationCard
                userPrincipalName={userRequest.data[0].userPrincipalName}
                userId={userRequest.data[0].id}
                tenantFilter={userSettingsDefaults.currentTenant}
                isFetching={false}
                restartProcess={restartProcess}
              />
            </Grid>
            {/* All Steps */}
            <Grid size={7}>
              <Stack spacing={3}>
                <BecCheckCard title="Log information">
                  <Typography variant="body2" gutterBottom>
                    {becPollingCall.data?.ExtractResult}. The data of this log was extracted at{' '}
                    {new Date(becPollingCall.data?.ExtractedAt).toLocaleString()}. This data might
                    be cached. To get the latest version of the data, click the Refresh Data button.
                  </Typography>
                </BecCheckCard>
                {/* Check 1: Recently added rules */}
                <BecCheckCard
                  title="Check 1: Mailbox Rules"
                  count={
                    (becPollingCall.data?.NewRules?.length || 0) +
                    (becPollingCall.data?.InboxRuleChanges?.length || 0)
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {getRuleMessage()}
                  </Typography>
                  {becPollingCall.data?.NewRules?.length > 0 && (
                    <Box mt={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <PropertyList>
                        {[...becPollingCall.data.NewRules]
                          .sort(
                            (a, b) => (b?.RecentlyChanged === true) - (a?.RecentlyChanged === true)
                          )
                          .map((rule, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={
                                rule?.RecentlyChanged
                                  ? `${rule?.Name} - changed in last 7 days`
                                  : rule?.Name
                              }
                              value={rule?.Description}
                            />
                          ))}
                      </PropertyList>
                    </Box>
                  )}
                  {becPollingCall.data?.InboxRuleChanges?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Rule changes in the last 7 days
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <PropertyList>
                          {becPollingCall.data.InboxRuleChanges.map((change, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={`${change?.Operation} - ${change?.RuleName}`}
                              value={`${change?.Date} by ${change?.UserKey}${
                                change?.Parameters ? ` | ${change.Parameters}` : ''
                              }`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 2: Recently added users */}
                <BecCheckCard
                  title="Check 2: Recently added users"
                  count={becPollingCall.data?.NewUsers?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    {getUserMessage()}
                  </Typography>
                  {becPollingCall.data?.NewUsers?.length > 0 && (
                    <Box mt={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <PropertyList>
                        {becPollingCall.data.NewUsers.map((user, index) => (
                          <PropertyListItem
                            key={index}
                            sx={checkItemSx}
                            align="horizontal"
                            label={user?.userPrincipalName}
                            value={user?.createdDateTime}
                          />
                        ))}
                      </PropertyList>
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 3: New Applications */}
                <BecCheckCard
                  title="Check 3: New Applications"
                  count={becPollingCall.data?.AddedApps?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    {getAppMessage()}
                  </Typography>
                  {becPollingCall.data?.AddedApps?.length > 0 && (
                    <Box mt={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <PropertyList>
                        {becPollingCall.data.AddedApps.map((app, index) => (
                          <PropertyListItem
                            key={index}
                            sx={checkItemSx}
                            label={`${app?.displayName} - ${app?.appId}`}
                            value={app?.createdDateTime}
                          />
                        ))}
                      </PropertyList>
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 4: Mailbox permission changes */}
                <BecCheckCard
                  title="Check 4: Mailbox permission changes"
                  count={becPollingCall.data?.MailboxPermissionChanges?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    {getMailboxPermissionMessage()}
                  </Typography>
                  {becPollingCall.data?.MailboxPermissionChanges?.length > 0 && (
                    <Box mt={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <PropertyList>
                        {becPollingCall.data.MailboxPermissionChanges.map((permission, index) => (
                          <PropertyListItem
                            key={index}
                            sx={checkItemSx}
                            label={permission.UserKey}
                            value={`${permission.Operation} - ${permission.Permissions}`}
                          />
                        ))}
                      </PropertyList>
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 5: Sent Messages */}
                <BecCheckCard
                  title="Check 5: Sent Messages"
                  count={becPollingCall.data?.SentMessages?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    {getSentMessagesMessage()}
                  </Typography>
                  {becPollingCall.data?.SentMessages?.length > 0 && (
                    <Box mt={2}>
                      <CippDataTable
                        noCard={true}
                        hideTitle={true}
                        title="Sent Messages"
                        data={becPollingCall.data.SentMessages}
                        simpleColumns={['Subject', 'RecipientAddress', 'Status', 'Received', 'FromIP']}
                      />
                    </Box>
                  )}
                </BecCheckCard>

                <BecCheckCard
                  title="Check 6: MFA Devices"
                  count={becPollingCall.data?.MFADevices?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    MFA Devices have been found. Please review the list below and take action as
                    required
                  </Typography>
                  {becPollingCall.data?.MFADevices?.length > 0 && (
                    <Box mt={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <PropertyList>
                        {becPollingCall.data.MFADevices.map((permission, index) => (
                          <PropertyListItem
                            key={index}
                            sx={checkItemSx}
                            align="horizontal"
                            label={permission['@odata.type']}
                            value={`${permission?.displayName} - Registered at ${permission?.createdDateTime}`}
                          />
                        ))}
                      </PropertyList>
                    </Box>
                  )}
                </BecCheckCard>

                <BecCheckCard
                  title="Check 7: Password Changes"
                  count={becPollingCall.data?.ChangedPasswords?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    Latest password changes for the tenant can be seen below
                  </Typography>
                  {becPollingCall.data?.ChangedPasswords?.length > 0 && (
                    <Box mt={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <PropertyList>
                        {becPollingCall.data.ChangedPasswords.map((permission, index) => (
                          <PropertyListItem
                            key={index}
                            sx={checkItemSx}
                            align="horizontal"
                            label={permission?.displayName}
                            value={`${permission?.lastPasswordChangeDateTime}`}
                          />
                        ))}
                      </PropertyList>
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 8: Trusted & Blocked Senders */}
                <BecCheckCard
                  title="Check 8: Trusted & Blocked Senders"
                  count={
                    (becPollingCall.data?.TrustedSenders?.length || 0) +
                    (becPollingCall.data?.BlockedSenders?.length || 0) +
                    (becPollingCall.data?.SafelistChanges?.length || 0)
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {getSafelistMessage()}
                  </Typography>
                  {senderRows.length > 0 && (
                    <Box mt={2}>
                      <CippDataTable
                        noCard={true}
                        hideTitle={true}
                        title="Trusted & Blocked Senders"
                        data={senderRows}
                        simpleColumns={['Sender', 'Type']}
                      />
                    </Box>
                  )}
                  {becPollingCall.data?.SafelistChanges?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Changes in the last 7 days
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <PropertyList>
                          {becPollingCall.data.SafelistChanges.map((change, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={`${change?.Operation} by ${change?.UserKey}`}
                              value={`${change?.Date} | Trusted: ${formatSafelistValue(
                                change?.Trusted
                              )} | Blocked: ${formatSafelistValue(change?.Blocked)}`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 9: Report Data */}
                <BecCheckCard title="Report">
                  <Typography variant="body2" gutterBottom>
                    Generate a comprehensive PDF report for documentation, compliance, or end-user
                    review. The report includes detailed explanations suitable for non-technical
                    users, managers, and compliance requirements (ISO/CMMC/SOC).
                  </Typography>
                  {/* Implement download functionality */}
                  {becPollingCall.data && (
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <BECRemediationReportButton
                          userData={userRequest.data[0]}
                          becData={becPollingCall.data}
                          tenantName={userSettingsDefaults.currentTenant}
                        />
                        <Button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(becPollingCall.data, null, 2)], {
                              type: 'application/json',
                            })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `BEC_Report_${userRequest.data[0].userPrincipalName}.json`
                            link.click()
                            URL.revokeObjectURL(url)
                          }}
                          variant="outlined"
                          startIcon={
                            <SvgIcon fontSize="small">
                              <Download />
                            </SvgIcon>
                          }
                        >
                          Download JSON
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </BecCheckCard>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
