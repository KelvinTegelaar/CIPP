import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall } from '../../../../../api/ApiCall'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import tabOptions from './tabOptions'
import { CippUserSwitcher } from '../../../../../components/CippComponents/CippUserSwitcher'
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
import { getBecIntuneDeviceActions } from '../../../../../components/CippComponents/CippIntuneDeviceActions.jsx'

const checkItemSx = { px: 2, py: 0.75 }

const BecCheckCard = ({ title, count, children }) => (
  <CippButtonCard
    variant="outlined"
    component="accordion"
    title={
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          width: '100%'
        }}>
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

    // The !restart guard keeps a refresh from being cancelled: between clicking Refresh Data
    // and the overwrite call resolving, the polling cache still holds the previous run, which
    // would otherwise read as "done" and stop the loading state.
    if (!restart && becPollingCall.isSuccess && becPollingCall.data && !becPollingCall.data?.Waiting) {
      setIsLoading(false)
    }
  }, [becPollingCall.dataUpdatedAt, becInitialCall])

  const restartProcess = () => {
    setRestart(true)
    setIsLoading(true)
    // The 500ms lets the re-render register Overwrite on the initial call's params. Poll only
    // after the initial call resolves: the backend resets the cache row to Waiting before it
    // responds, so a poll issued after that cannot race the reset and resurface the old run.
    setTimeout(() => {
      becInitialCall.refetch().finally(() => {
        // one-shot: without this every later refetch would force a fresh run
        setRestart(false)
        becPollingCall.refetch()
      })
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
      return 'New users have been found in the last 7 days. Please review the list below and take action as needed.'
    }
    return 'No new users found.'
  }

  const getAppMessage = () => {
    if (!becPollingCall.data) return null
    const maliciousAddedCount = (becPollingCall.data.AddedApps || []).filter(
      (app) => app?.MaliciousMatch
    ).length
    const maliciousPresentCount = becPollingCall.data.MaliciousSPs?.length || 0
    if (maliciousAddedCount > 0 || maliciousPresentCount > 0) {
      return `Potential Breach found: ${
        maliciousAddedCount + maliciousPresentCount
      } application(s) in this tenant match the CIPP known-malicious application catalog. Consent-based access survives a password reset, so remove these applications unless their presence is explained.`
    }
    if (becPollingCall.data.AddedApps && becPollingCall.data.AddedApps.length > 0) {
      return 'New applications have been found. Please review the list below and take action as needed.'
    }
    return 'No new applications found.'
  }

  const getMailboxPermissionMessage = () => {
    if (!becPollingCall.data) return null
    const changes = becPollingCall.data.MailboxPermissionChanges || []
    if (changes.length > 0) {
      const targeting = changes.filter((c) => c?.TargetsSuspect === true).length
      if (targeting > 0) {
        return `${changes.length} mailbox permission change(s) found across the tenant in the last 7 days, ${targeting} of which target this mailbox. Review those first.`
      }
      return `${changes.length} mailbox permission change(s) found across the tenant in the last 7 days. None appear to target this mailbox, but verify the list below.`
    }
    return 'No mailbox permission changes found.'
  }

  const getSentMessagesMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.SentMessages && becPollingCall.data.SentMessages.length > 0) {
      const analysis = becPollingCall.data.SentMessageAnalysis
      const parts = [
        `${analysis?.TotalMessages ?? becPollingCall.data.SentMessages.length} message(s) to ${
          analysis?.TotalRecipients ?? becPollingCall.data.SentMessages.length
        } recipient(s) were sent in the last 7 days`,
      ]
      if (analysis?.FlaggedSubjectCount > 0) {
        parts.push(
          `${analysis.FlaggedSubjectCount} subject(s) were sent as many separate messages or to many recipients — identical-subject mass mail is a classic sign of a compromised mailbox running a campaign`
        )
      }
      if (analysis?.Bursts?.length > 0) {
        parts.push(
          `${analysis.Bursts.length} short burst(s) of high-volume sending were detected`
        )
      }
      const foreignCount = becPollingCall.data.LocationAnalysis?.ForeignSentMessageCount || 0
      if (foreignCount > 0) {
        parts.push(
          `${foreignCount} message(s) were sent from an IP outside the user's assigned usage location`
        )
      }
      return `${parts.join('. ')}. Please review the list below for any suspicious activity.`
    }
    return 'No sent messages found in the specified time range.'
  }

  const getSafelistMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.SafelistError) {
      return `${becPollingCall.data.SafelistError} An empty list here is not proof the mailbox has none — refresh after fixing the underlying problem.`
    }
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

  // the analysis window: 7 days before the data was extracted. Shared by the Intune
  // enrollment and MFA registration recency checks.
  const analysisWindowStart = useMemo(() => {
    const extractedAt = becPollingCall.data?.ExtractedAt
      ? new Date(becPollingCall.data.ExtractedAt)
      : new Date()
    if (Number.isNaN(extractedAt.getTime())) {
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
    return new Date(extractedAt.getTime() - 7 * 24 * 60 * 60 * 1000)
  }, [becPollingCall.data?.ExtractedAt])

  const recentMfaDeviceCount = useMemo(
    () =>
      (becPollingCall.data?.MFADevices || []).filter((method) => {
        if (!method?.createdDateTime) return false
        const created = new Date(method.createdDateTime)
        if (Number.isNaN(created.getTime())) return false
        return created >= analysisWindowStart
      }).length,
    [becPollingCall.data?.MFADevices, analysisWindowStart]
  )

  const foreignActivityCount = useMemo(() => {
    const analysis = becPollingCall.data?.LocationAnalysis
    if (!analysis) return 0
    return (
      (analysis.ForeignSignInCount || 0) +
      (analysis.ForeignRuleChangeCount || 0) +
      (analysis.ForeignSafelistChangeCount || 0) +
      (analysis.ForeignSharingChangeCount || 0) +
      (analysis.ForeignSentMessageCount || 0)
    )
  }, [becPollingCall.data?.LocationAnalysis])

  const intuneDevices = useMemo(() => {
    const devices = [...(becPollingCall.data?.IntuneDevices || [])]
    devices.sort((a, b) => {
      const aTime = a?.enrolledDateTime ? new Date(a.enrolledDateTime).getTime() : 0
      const bTime = b?.enrolledDateTime ? new Date(b.enrolledDateTime).getTime() : 0
      return bTime - aTime
    })
    return devices
  }, [becPollingCall.data?.IntuneDevices])

  const recentIntuneDeviceCount = useMemo(
    () =>
      intuneDevices.filter((device) => {
        if (!device?.enrolledDateTime) return false
        const enrolled = new Date(device.enrolledDateTime)
        if (Number.isNaN(enrolled.getTime())) return false
        return enrolled >= analysisWindowStart
      }).length,
    [intuneDevices, analysisWindowStart]
  )

  const intuneDeviceActions = useMemo(
    () => getBecIntuneDeviceActions({ tenantFilter: userSettingsDefaults.currentTenant }),
    [userSettingsDefaults.currentTenant]
  )

  const getMfaMessage = () => {
    if (!becPollingCall.data) return null
    const count = becPollingCall.data.MFADevices?.length || 0
    if (count === 0) {
      return 'No MFA methods are registered for this user. If MFA was expected, an attacker may have removed it; either way the account currently has no second factor.'
    }
    if (recentMfaDeviceCount > 0) {
      return `${count} MFA method(s) registered, ${recentMfaDeviceCount} in the last 7 days. Verify the recent registrations were made by the user — attackers register their own method to keep access after a password reset.`
    }
    return `${count} MFA method(s) registered. Please review the list below and take action as required.`
  }

  const getSignInLocationMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.SuspectUserSignInsError) {
      return `${becPollingCall.data.SuspectUserSignInsError} This is not proof the user has no sign-ins — fix the underlying permission or licensing problem and refresh.`
    }
    const analysis = becPollingCall.data.LocationAnalysis
    const signInCount = becPollingCall.data.SuspectUserSignIns?.length || 0
    if (signInCount === 0) {
      return 'No sign-ins were found for this user in the sign-in logs.'
    }
    const countries = (analysis?.SignInCountries || [])
      .map((c) => `${c.Country} (${c.Count})`)
      .join(', ')
    if (!analysis?.UsageLocation) {
      return `${
        analysis?.Note ||
        'The user has no usage location assigned in Entra ID, so activity cannot be compared against an expected country.'
      } Sign-in countries seen: ${countries || 'none recorded'}.`
    }
    const foreignParts = []
    if (analysis.ForeignSignInCount > 0) {
      foreignParts.push(
        `${analysis.ForeignSignInCount} sign-in(s), of which ${
          analysis.ForeignSuccessfulSignInCount || 0
        } succeeded (failed foreign attempts are mostly password-spray noise)`
      )
    }
    if (analysis.ForeignRuleChangeCount > 0) {
      foreignParts.push(`${analysis.ForeignRuleChangeCount} inbox rule change(s)`)
    }
    if (analysis.ForeignSafelistChangeCount > 0) {
      foreignParts.push(`${analysis.ForeignSafelistChangeCount} safelist change(s)`)
    }
    if (analysis.ForeignSharingChangeCount > 0) {
      foreignParts.push(`${analysis.ForeignSharingChangeCount} sharing change(s)`)
    }
    if (analysis.ForeignSentMessageCount > 0) {
      foreignParts.push(`${analysis.ForeignSentMessageCount} sent message(s)`)
    }
    if (foreignParts.length > 0) {
      return `The user's assigned usage location is ${
        analysis.UsageLocation
      }, but activity originated outside it: ${foreignParts.join(
        ', '
      )}. Sign-in countries seen: ${countries}. Review the sign-ins below and the flagged rows in the checks above.`
    }
    return `All located activity matches the user's assigned usage location (${
      analysis.UsageLocation
    }). Sign-in countries seen: ${countries || 'none recorded'}.`
  }

  const getSharingMessage = () => {
    if (!becPollingCall.data) return null
    const changes = becPollingCall.data.SharingChanges || []
    if (changes.length === 0) {
      return 'No sharing links were created or changed by this account in the last 7 days.'
    }
    const anonymousCount = changes.filter((c) => c?.Operation?.startsWith('AnonymousLink')).length
    const foreignCount = becPollingCall.data.LocationAnalysis?.ForeignSharingChangeCount || 0
    const parts = [
      `${changes.length} OneDrive/SharePoint sharing change(s) found in the last 7 days`,
    ]
    if (anonymousCount > 0) {
      parts.push(`${anonymousCount} involve anonymous links, which anyone with the URL can open`)
    }
    if (foreignCount > 0) {
      parts.push(`${foreignCount} were made from outside the user's usage location`)
    }
    return `${parts.join(
      '. '
    )}. Attackers share folders to keep pulling data after a password reset — review each link and remove any that are not explained.`
  }

  const getIntuneDevicesMessage = () => {
    if (!becPollingCall.data) return null
    if (becPollingCall.data.IntuneDevicesError) {
      return `Could not retrieve Intune-managed devices: ${becPollingCall.data.IntuneDevicesError}. This is not proof that the user has no devices — refresh after fixing permissions or licensing, or check Endpoint → MEM → Devices.`
    }
    if (intuneDevices.length === 0) {
      return 'No Intune-managed devices found for this user.'
    }
    if (recentIntuneDeviceCount > 0) {
      return `${intuneDevices.length} Intune-managed device(s) found for this user, ${recentIntuneDeviceCount} enrolled in the last 7 days. Prioritize review of recent enrollments (new VM, BYOD, or Windows Hello persistence risk). Retire or factory-wipe from the row actions if needed (requires MEM write permission). Refresh Data after actions to update this list.`
    }
    return `${intuneDevices.length} Intune-managed device(s) found for this user. None were enrolled in the last 7 days. Review the list below and take action as needed. Retire or factory-wipe from the row actions if needed (requires MEM write permission). Refresh Data after actions to update this list.`
  }

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <CippIcons.Mail />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.userPrincipalName} />,
        },
        {
          icon: <CippIcons.Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.id} />,
        },
        {
          icon: <CippIcons.CalendarIcon />,
          text: (
            <>
              Created: <ReactTimeAgo date={new Date(userRequest.data?.[0]?.createdDateTime)} />
            </>
          ),
        },
        {
          icon: <CippIcons.Launch />,
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
      titleControl={
        <CippUserSwitcher
          title={userRequest.isSuccess ? userRequest.data?.[0]?.displayName : ''}
          currentUserId={userId}
          tenantFilter={userSettingsDefaults.currentTenant}
        />
      }
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
            <Grid size={{ xs: 12, lg: 5 }}>
              <CippRemediationCard
                userPrincipalName={userRequest.data[0].userPrincipalName}
                userId={userRequest.data[0].id}
                tenantFilter={userSettingsDefaults.currentTenant}
                restartProcess={restartProcess}
                isFetching={false}
              />
            </Grid>
            {/* Check 1 Card with Loading */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <CippButtonCard
                variant="outlined"
                isFetching={false}
                title={
                  <Stack direction="row" sx={{
                    justifyContent: 'space-between'
                  }}>
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
            <Grid size={{ xs: 12, lg: 5 }}>
              <CippRemediationCard
                userPrincipalName={userRequest.data[0].userPrincipalName}
                userId={userRequest.data[0].id}
                tenantFilter={userSettingsDefaults.currentTenant}
                isFetching={false}
                restartProcess={restartProcess}
              />
            </Grid>
            {/* All Steps */}
            <Grid size={{ xs: 12, lg: 7 }}>
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
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 300,
                        overflowY: 'auto'
                      }}>
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
                    <Box sx={{
                      mt: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Rule changes in the last 7 days
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <PropertyList>
                          {becPollingCall.data.InboxRuleChanges.map((change, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={`${change?.Operation} - ${change?.RuleName}${
                                change?.ForeignLocation === true ? ' - outside usage location' : ''
                              }`}
                              value={`${change?.Date} by ${change?.UserKey}${
                                change?.ClientIP
                                  ? ` from ${change.ClientIP}${
                                      change?.Country ? ` (${change.Country})` : ''
                                    }`
                                  : ''
                              }${change?.Parameters ? ` | ${change.Parameters}` : ''}`}
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
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 300,
                        overflowY: 'auto'
                      }}>
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
                  count={
                    (becPollingCall.data?.AddedApps?.length || 0) +
                    (becPollingCall.data?.MaliciousSPs?.length || 0)
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {getAppMessage()}
                  </Typography>
                  {becPollingCall.data?.AddedApps?.length > 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 300,
                        overflowY: 'auto'
                      }}>
                      <PropertyList>
                        {[...becPollingCall.data.AddedApps]
                          .sort((a, b) => !!b?.MaliciousMatch - !!a?.MaliciousMatch)
                          .map((app, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={
                                app?.MaliciousMatch
                                  ? `${app?.displayName} - ${app?.appId} - matches known-malicious catalog entry "${app.MaliciousMatch.Name}"`
                                  : `${app?.displayName} - ${app?.appId}`
                              }
                              value={
                                app?.MaliciousMatch?.Categories?.length
                                  ? `${app?.createdDateTime} | ${app.MaliciousMatch.Categories.join(', ')}`
                                  : app?.createdDateTime
                              }
                            />
                          ))}
                      </PropertyList>
                    </Box>
                  )}
                  {becPollingCall.data?.MaliciousSPs?.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Known-malicious applications present in the tenant (any age)
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <PropertyList>
                          {becPollingCall.data.MaliciousSPs.map((app, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={`${app?.displayName} - ${app?.appId}`}
                              value={`Catalog: ${app?.CatalogName}${
                                app?.Categories?.length ? ` (${app.Categories.join(', ')})` : ''
                              } | Enabled: ${app?.accountEnabled} | Added: ${app?.createdDateTime}`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
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
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 300,
                        overflowY: 'auto'
                      }}>
                      <PropertyList>
                        {[...becPollingCall.data.MailboxPermissionChanges]
                          .sort((a, b) => (b?.TargetsSuspect === true) - (a?.TargetsSuspect === true))
                          .map((permission, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={
                                permission?.TargetsSuspect === true
                                  ? `${permission.UserKey} - targets this mailbox`
                                  : permission.UserKey
                              }
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
                  {becPollingCall.data?.SentMessageAnalysis?.RepeatedSubjects?.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Repeated subjects
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <PropertyList>
                          {becPollingCall.data.SentMessageAnalysis.RepeatedSubjects.map(
                            (group, index) => (
                              <PropertyListItem
                                key={index}
                                sx={checkItemSx}
                                label={
                                  group?.Flagged
                                    ? `${group?.Subject} - possible campaign`
                                    : group?.Subject
                                }
                                value={`${group?.MessageCount} message(s) to ${group?.RecipientCount} recipient(s) between ${group?.FirstSent} and ${group?.LastSent}`}
                              />
                            )
                          )}
                        </PropertyList>
                      </Box>
                    </Box>
                  )}
                  {becPollingCall.data?.SentMessageAnalysis?.Bursts?.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Send bursts
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <PropertyList>
                          {becPollingCall.data.SentMessageAnalysis.Bursts.map((burst, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={`${burst?.MessageCount} message(s) to ${burst?.RecipientCount} recipient(s) within ${burst?.WindowMinutes} minutes`}
                              value={`Starting ${burst?.WindowStart}${
                                burst?.TopSubject ? ` | Most common subject: ${burst.TopSubject}` : ''
                              }`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    </Box>
                  )}
                  {becPollingCall.data?.SentMessages?.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
                      <CippDataTable
                        noCard={true}
                        hideTitle={true}
                        title="Sent Messages"
                        data={becPollingCall.data.SentMessages}
                        simpleColumns={[
                          'Subject',
                          'RecipientAddress',
                          'Status',
                          'Received',
                          'FromIP',
                          'Country',
                        ]}
                      />
                    </Box>
                  )}
                </BecCheckCard>

                <BecCheckCard
                  title="Check 6: MFA Devices"
                  count={becPollingCall.data?.MFADevices?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    {getMfaMessage()}
                  </Typography>
                  {becPollingCall.data?.MFADevices?.length > 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 300,
                        overflowY: 'auto'
                      }}>
                      <PropertyList>
                        {[...becPollingCall.data.MFADevices]
                          .sort(
                            (a, b) =>
                              new Date(b?.createdDateTime || 0) - new Date(a?.createdDateTime || 0)
                          )
                          .map((method, index) => {
                            const isRecent =
                              method?.createdDateTime &&
                              new Date(method.createdDateTime) >= analysisWindowStart
                            return (
                              <PropertyListItem
                                key={index}
                                sx={checkItemSx}
                                align="horizontal"
                                label={
                                  isRecent
                                    ? `${method['@odata.type']} - registered in last 7 days`
                                    : method['@odata.type']
                                }
                                value={`${method?.displayName} - Registered at ${method?.createdDateTime}`}
                              />
                            )
                          })}
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
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 300,
                        overflowY: 'auto'
                      }}>
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
                    becPollingCall.data?.SafelistError
                      ? undefined
                      : (becPollingCall.data?.TrustedSenders?.length || 0) +
                        (becPollingCall.data?.BlockedSenders?.length || 0) +
                        (becPollingCall.data?.SafelistChanges?.length || 0)
                  }
                >
                  <Typography
                    variant="body2"
                    gutterBottom
                    color={becPollingCall.data?.SafelistError ? 'error' : 'inherit'}
                  >
                    {getSafelistMessage()}
                  </Typography>
                  {senderRows.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
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
                    <Box sx={{
                      mt: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Changes in the last 7 days
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <PropertyList>
                          {becPollingCall.data.SafelistChanges.map((change, index) => (
                            <PropertyListItem
                              key={index}
                              sx={checkItemSx}
                              label={`${change?.Operation} by ${change?.UserKey}${
                                change?.ForeignLocation === true ? ' - outside usage location' : ''
                              }`}
                              value={`${change?.Date}${
                                change?.ClientIP
                                  ? ` from ${change.ClientIP}${
                                      change?.Country ? ` (${change.Country})` : ''
                                    }`
                                  : ''
                              } | Trusted: ${formatSafelistValue(
                                change?.Trusted
                              )} | Blocked: ${formatSafelistValue(change?.Blocked)}`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    </Box>
                  )}
                </BecCheckCard>

                <BecCheckCard
                  title="Check 9: Intune Devices"
                  count={
                    becPollingCall.data?.IntuneDevicesError ? undefined : recentIntuneDeviceCount
                  }
                >
                  <Typography
                    variant="body2"
                    gutterBottom
                    color={becPollingCall.data?.IntuneDevicesError ? 'error' : 'inherit'}
                  >
                    {getIntuneDevicesMessage()}
                  </Typography>
                  {intuneDevices.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
                      <CippDataTable
                        noCard={true}
                        hideTitle={true}
                        title="Intune Devices"
                        data={intuneDevices}
                        simpleColumns={[
                          'deviceName',
                          'operatingSystem',
                          'osVersion',
                          'complianceState',
                          'enrolledDateTime',
                          'lastSyncDateTime',
                          'deviceEnrollmentType',
                          'serialNumber',
                        ]}
                        actions={intuneDeviceActions}
                      />
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 10: Sign-in Locations */}
                <BecCheckCard
                  title="Check 10: Sign-in Locations"
                  count={
                    becPollingCall.data?.SuspectUserSignInsError ? undefined : foreignActivityCount
                  }
                >
                  <Typography
                    variant="body2"
                    gutterBottom
                    color={becPollingCall.data?.SuspectUserSignInsError ? 'error' : 'inherit'}
                  >
                    {getSignInLocationMessage()}
                  </Typography>
                  {becPollingCall.data?.SuspectUserSignIns?.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
                      <CippDataTable
                        noCard={true}
                        hideTitle={true}
                        title="Sign-in Locations"
                        data={becPollingCall.data.SuspectUserSignIns}
                        simpleColumns={[
                          'CreatedDateTime',
                          'AppDisplayName',
                          'Status',
                          'IPAddress',
                          'Country',
                          'City',
                          'ForeignLocation',
                        ]}
                      />
                    </Box>
                  )}
                </BecCheckCard>

                {/* Check 11: Sharing Links */}
                <BecCheckCard
                  title="Check 11: Sharing Links"
                  count={becPollingCall.data?.SharingChanges?.length || 0}
                >
                  <Typography variant="body2" gutterBottom>
                    {getSharingMessage()}
                  </Typography>
                  {becPollingCall.data?.SharingChanges?.length > 0 && (
                    <Box sx={{
                      mt: 2
                    }}>
                      <CippDataTable
                        noCard={true}
                        hideTitle={true}
                        title="Sharing Links"
                        data={becPollingCall.data.SharingChanges}
                        simpleColumns={[
                          'Date',
                          'Operation',
                          'FileName',
                          'Target',
                          'Workload',
                          'ClientIP',
                          'Country',
                          'ForeignLocation',
                        ]}
                      />
                    </Box>
                  )}
                </BecCheckCard>

                {/* Report Data */}
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
                              <CippIcons.Download />
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
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
