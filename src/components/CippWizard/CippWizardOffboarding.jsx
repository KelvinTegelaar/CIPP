import {
  Alert,
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material'
import CippWizardStepButtons from './CippWizardStepButtons'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { useWatch } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import { Grid } from '@mui/system'
import { useSettings } from '../../hooks/use-settings'
import { ApiGetCall } from '../../api/ApiCall'

// Shared mailboxes are capped at 50 GiB without a license; warn at 49 GiB.
const SHARED_MAILBOX_WARN_BYTES = 49 * 1024 ** 3

export const CippWizardOffboarding = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props
  const currentTenant = formControl.watch('tenantFilter')
  const selectedUsers = useWatch({ control: formControl.control, name: 'user' })
  const [showAlert, setShowAlert] = useState(false)
  const settings = useSettings()
  const userOffboardingDefaults = settings?.offboardingDefaults
  const disableForwarding = useWatch({ control: formControl.control, name: 'disableForwarding' })
  const deleteUser = useWatch({ control: formControl.control, name: 'DeleteUser' })
  const convertToShared = useWatch({ control: formControl.control, name: 'ConvertToShared' })

  // The HaloPSA ticket box is only meaningful when that integration is configured.
  const integrationSettings = ApiGetCall({
    url: '/api/ListExtensionsConfig',
    queryKey: 'ListExtensionsConfig',
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Warn unless "Send to integration" is confirmed on (no answer without AppSettings.Read).
  const notificationSettings = ApiGetCall({
    url: '/api/ListNotificationConfig',
    queryKey: 'ListNotificationConfig',
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
  const psaSelected = useWatch({ control: formControl.control, name: 'postExecution.psa' })
  const showPsaIntegrationHint =
    !!psaSelected &&
    !notificationSettings.isLoading &&
    notificationSettings.data?.sendtoIntegration !== true

  // Pull cached mailbox sizes (storageUsedInBytes, keyed by UPN) only when relevant
  const mailboxUsage = ApiGetCall({
    url: '/api/ListMailboxes',
    data: { tenantFilter: currentTenant?.value, UseReportDB: true },
    queryKey: `OffboardingMailboxUsage-${currentTenant?.value}`,
    waiting: !!convertToShared && !!currentTenant?.value && selectedUsers?.length > 0,
  })

  // Selected mailboxes whose cached size would exceed the shared-mailbox limit
  const oversizedMailboxes = useMemo(() => {
    if (!convertToShared || !mailboxUsage.isSuccess || !Array.isArray(mailboxUsage.data)) {
      return []
    }
    const selectedUpns = (selectedUsers || []).map((u) =>
      (u?.value ?? u)?.toString().toLowerCase(),
    )
    return mailboxUsage.data
      .filter((mb) => {
        const upn = mb?.UPN?.toString().toLowerCase()
        const bytes = Number(mb?.storageUsedInBytes)
        return (
          upn &&
          selectedUpns.includes(upn) &&
          Number.isFinite(bytes) &&
          bytes >= SHARED_MAILBOX_WARN_BYTES
        )
      })
      .map((mb) => ({
        upn: mb.UPN,
        sizeGB: (Number(mb.storageUsedInBytes) / 1024 ** 3).toFixed(1),
      }))
  }, [convertToShared, mailboxUsage.isSuccess, mailboxUsage.data, selectedUsers])

  useEffect(() => {
    if (selectedUsers.length >= 3) {
      setShowAlert(true)
      formControl.setValue('Scheduled.enabled', true)
    }
  }, [selectedUsers])

  // Set initial defaults source on component mount if not already set
  useEffect(() => {
    const currentDefaultsSource = formControl.getValues('HIDDEN_defaultsSource')
    if (!currentDefaultsSource) {
      // Default to user defaults since form starts with user defaults from initialState within the wizard component
      formControl.setValue('HIDDEN_defaultsSource', 'user')
    }
  }, [formControl])

  // Apply defaults only once per tenant or when tenant changes
  useEffect(() => {
    const currentTenantId = currentTenant?.value
    const appliedDefaultsForTenant = formControl.getValues('HIDDEN_appliedDefaultsForTenant')

    // Only apply defaults if we haven't applied them for this tenant yet
    if (currentTenantId && appliedDefaultsForTenant !== currentTenantId) {
      const tenantDefaults = currentTenant?.addedFields?.offboardingDefaults

      if (tenantDefaults) {
        // Apply tenant defaults; always clear OOO when the blob omits it so user defaults do not leak
        Object.entries(tenantDefaults).forEach(([key, value]) => {
          formControl.setValue(key, value)
        })
        formControl.setValue('OOO', tenantDefaults.OOO ?? '')
        formControl.setValue('HIDDEN_defaultsSource', 'tenant')
      } else if (userOffboardingDefaults) {
        Object.entries(userOffboardingDefaults).forEach(([key, value]) => {
          formControl.setValue(key, value)
        })
        formControl.setValue('OOO', userOffboardingDefaults.OOO ?? '')
        formControl.setValue('HIDDEN_defaultsSource', 'user')
      }

      // Mark that we've applied defaults for this tenant
      formControl.setValue('HIDDEN_appliedDefaultsForTenant', currentTenantId)
    }
  }, [currentTenant?.value, userOffboardingDefaults, formControl])

  useEffect(() => {
    if (disableForwarding) {
      formControl.setValue('forward', null)
      formControl.setValue('KeepCopy', false)
    }
  }, [disableForwarding, formControl])

  // Clear every field the UI disables when deleting the user, so submitted values match what is shown
  useEffect(() => {
    if (deleteUser) {
      formControl.setValue('ConvertToShared', false)
      formControl.setValue('HideFromGAL', false)
      formControl.setValue('removeCalendarInvites', false)
      formControl.setValue('removePermissions', false)
      formControl.setValue('removeCalendarPermissions', false)
      formControl.setValue('RemoveRules', false)
      formControl.setValue('WipeMobile', false)
      formControl.setValue('RemoveMobile', false)
      formControl.setValue('RemoveGroups', false)
      formControl.setValue('RemoveLicenses', false)
      formControl.setValue('RevokeSessions', false)
      formControl.setValue('DisableSignIn', false)
      formControl.setValue('ClearImmutableId', false)
      formControl.setValue('ResetPass', false)
      formControl.setValue('RemoveMFADevices', false)
      formControl.setValue('RemoveTeamsPhoneDID', false)
      formControl.setValue('DisableOneDriveSharing', false)
      formControl.setValue('disableForwarding', false)
      formControl.setValue('KeepCopy', false)
      formControl.setValue('AccessNoAutomap', null)
      formControl.setValue('AccessAutomap', null)
      formControl.setValue('AccessSendAs', null)
      formControl.setValue('AccessSendOnBehalf', null)
      formControl.setValue('forward', null)
      formControl.setValue('OOO', '')
    }
  }, [deleteUser, formControl])

  const getDefaultsSource = () => {
    return formControl.getValues('HIDDEN_defaultsSource') || 'user'
  }

  return (
    <Stack spacing={4}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader title="Offboarding Settings" />
            <Divider />
            <CardContent>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: getDefaultsSource() === 'tenant' ? 'primary.main' : 'warning.main',
                  fontStyle: 'italic',
                }}
              >
                {getDefaultsSource() === 'tenant' ? 'Using Tenant Defaults' : 'Using User Defaults'}
              </Typography>
              <CippFormComponent
                name="ConvertToShared"
                label="Convert to Shared Mailbox"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="HideFromGAL"
                label="Hide from Global Address List"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="removeCalendarInvites"
                label="Cancel all calendar invites"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="removePermissions"
                label="Remove user's mailbox permissions"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="removeCalendarPermissions"
                label="Remove user's calendar permissions"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="RemoveRules"
                label="Remove all Rules"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="WipeMobile"
                label="Wipe Mobile Devices (account data only)"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="RemoveMobile"
                label="Remove all Mobile Devices"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="RemoveGroups"
                label="Remove from all groups"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="RemoveLicenses"
                label="Remove Licenses"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="RevokeSessions"
                label="Revoke all sessions"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="DisableSignIn"
                label="Disable Sign in"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="ClearImmutableId"
                label="Clear Immutable ID"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="ResetPass"
                label="Reset Password"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="RemoveMFADevices"
                label="Remove all MFA Devices"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="RemoveTeamsPhoneDID"
                label="Remove Teams Phone DID"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="DisableOneDriveSharing"
                label="Disable OneDrive Sharing Links"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />
              <CippFormComponent
                name="DeleteUser"
                label="Delete user"
                type="switch"
                formControl={formControl}
              />
              {deleteUser && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Deleting the user will remove the associated mailbox, this will prevent actions
                  such as converting to a shared mailbox.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader title="Permissions and forwarding" />
            <Divider />
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Mailbox Access
              </Typography>
              <CippFormComponent
                sx={{ m: 1 }}
                name="AccessNoAutomap"
                label="Grant Full Access (no automap)"
                disabled={!!deleteUser}
                type="autoComplete"
                placeholder="Leave blank if not needed"
                formControl={formControl}
                multi
                api={{
                  tenantFilter: currentTenant ? currentTenant.value : undefined,
                  url: '/api/ListGraphRequest',
                  dataKey: 'Results',
                  labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                  valueField: 'id',
                  queryKey: `Offboarding-Users-${currentTenant ? currentTenant.value : 'default'}`,
                  data: {
                    Endpoint: 'users',
                    manualPagination: true,
                    $select: 'id,userPrincipalName,displayName',
                    $count: true,
                    $orderby: 'displayName',
                    $top: 999,
                  },
                }}
              />
              <CippFormComponent
                sx={{ m: 1 }}
                name="AccessAutomap"
                label="Grant Full Access (automap)"
                disabled={!!deleteUser}
                type="autoComplete"
                placeholder="Leave blank if not needed"
                formControl={formControl}
                multi
                api={{
                  labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                  valueField: 'id',
                  url: '/api/ListGraphRequest',
                  dataKey: 'Results',
                  tenantFilter: currentTenant ? currentTenant.value : undefined,
                  queryKey: `Offboarding-Users-${currentTenant ? currentTenant.value : 'default'}`,
                  data: {
                    Endpoint: 'users',
                    manualPagination: true,
                    $select: 'id,userPrincipalName,displayName',
                    $count: true,
                    $orderby: 'displayName',
                    $top: 999,
                  },
                }}
              />
              <CippFormComponent
                sx={{ m: 1 }}
                name="AccessSendAs"
                label="Grant Send As Access"
                disabled={!!deleteUser}
                type="autoComplete"
                placeholder="Leave blank if not needed"
                formControl={formControl}
                multi
                api={{
                  labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                  valueField: 'id',
                  url: '/api/ListGraphRequest',
                  dataKey: 'Results',
                  tenantFilter: currentTenant ? currentTenant.value : undefined,
                  queryKey: `Offboarding-Users-${currentTenant ? currentTenant.value : 'default'}`,
                  data: {
                    Endpoint: 'users',
                    manualPagination: true,
                    $select: 'id,userPrincipalName,displayName',
                    $count: true,
                    $orderby: 'displayName',
                    $top: 999,
                  },
                }}
              />
              <CippFormComponent
                sx={{ m: 1 }}
                name="AccessSendOnBehalf"
                label="Grant Send on Behalf Access"
                disabled={!!deleteUser}
                type="autoComplete"
                placeholder="Leave blank if not needed"
                formControl={formControl}
                multi
                api={{
                  labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                  valueField: 'id',
                  url: '/api/ListGraphRequest',
                  dataKey: 'Results',
                  tenantFilter: currentTenant ? currentTenant.value : undefined,
                  queryKey: `Offboarding-Users-${currentTenant ? currentTenant.value : 'default'}`,
                  data: {
                    Endpoint: 'users',
                    manualPagination: true,
                    $select: 'id,userPrincipalName,displayName',
                    $count: true,
                    $orderby: 'displayName',
                    $top: 999,
                  },
                }}
              />
              <Typography variant="subtitle2" sx={{ mt: 3 }} gutterBottom>
                OneDrive Access
              </Typography>
              {deleteUser && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  When a user is deleted, their OneDrive is retained for 30 days by default unless
                  otherwise configured.
                </Alert>
              )}
              <CippFormComponent
                sx={{ m: 1 }}
                name="OnedriveAccess"
                label="Grant OneDrive Full Access"
                type="autoComplete"
                placeholder="Leave blank if not needed"
                formControl={formControl}
                multi
                api={{
                  tenantFilter: currentTenant ? currentTenant.value : undefined,
                  labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                  valueField: 'id',
                  url: '/api/ListGraphRequest',
                  dataKey: 'Results',
                  queryKey: `Offboarding-Users-${currentTenant ? currentTenant.value : 'default'}`,
                  data: {
                    Endpoint: 'users',
                    manualPagination: true,
                    $select: 'id,userPrincipalName,displayName',
                    $count: true,
                    $orderby: 'displayName',
                    $top: 999,
                  },
                }}
              />
              <Typography variant="subtitle2" sx={{ mt: 3 }} gutterBottom>
                Email Forwarding
              </Typography>
              <CippFormComponent
                name="disableForwarding"
                label="Disable Email Forwarding"
                type="switch"
                formControl={formControl}
                disabled={!!deleteUser}
              />

              <CippFormCondition
                formControl={formControl}
                field={'disableForwarding'}
                compareType="isNot"
                compareValue={true}
              >
                <CippFormComponent
                  sx={{ m: 1 }}
                  name="forward"
                  label="Forward Email To"
                  type="autoComplete"
                  placeholder="Leave blank if not needed"
                  formControl={formControl}
                  multiple={false}
                  disabled={!!deleteUser}
                  api={{
                    tenantFilter: currentTenant ? currentTenant.value : undefined,
                    labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                    valueField: 'id',
                    url: '/api/ListGraphRequest',
                    dataKey: 'Results',
                    queryKey: `Offboarding-Users-${currentTenant ? currentTenant.value : 'default'}`,
                    data: {
                      Endpoint: 'users',
                      manualPagination: true,
                      $select: 'id,userPrincipalName,displayName',
                      $count: true,
                      $orderby: 'displayName',
                      $top: 999,
                    },
                  }}
                />

                <CippFormComponent
                  name="KeepCopy"
                  label="Keep a copy of forwarded mail"
                  type="switch"
                  formControl={formControl}
                  disabled={!!deleteUser}
                />
              </CippFormCondition>
              <Typography variant="subtitle2" sx={{ mt: 3 }} gutterBottom>
                Out of Office
              </Typography>
              <Box
                sx={deleteUser ? { pointerEvents: 'none', opacity: 0.5, userSelect: 'none' } : {}}
              >
                <CippFormComponent
                  name="OOO"
                  label="Out of Office Message"
                  type="richText"
                  placeholder="Leave blank to not set"
                  fullWidth
                  formControl={formControl}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: 'block',
                    mt: 1
                  }}>
                  CIPP %variable% tokens (for example %tenantname%) stay literal here and are
                  resolved when the offboarding job runs. %username% is not the offboarded user.
                </Typography>
              </Box>
              {convertToShared && oversizedMailboxes.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  The following mailbox{oversizedMailboxes.length > 1 ? 'es' : ''} exceed or are near
                  the 50 GB shared mailbox limit. Converting to shared may fail, or the mailbox may
                  stop receiving mail once unlicensed, unless an Exchange Online Plan 2 license is
                  retained:
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
                    {oversizedMailboxes.map((mb) => (
                      <li key={mb.upn}>
                        {mb.upn} ({mb.sizeGB} GB)
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardHeader title="Scheduling & Notifications" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                name="Scheduled.enabled"
                label="Schedule this offboarding"
                type="switch"
                formControl={formControl}
              />
            </Grid>

            <CippFormCondition
              formControl={formControl}
              field={'Scheduled.enabled'}
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ sm: 12, xs: 12 }}>
                <Typography variant="subtitle2">Scheduled Offboarding Date</Typography>
                <CippFormComponent
                  name="Scheduled.date"
                  type="datePicker"
                  formControl={formControl}
                  fullWidth
                />
              </Grid>
            </CippFormCondition>

            <Grid size={{ sm: 12, xs: 12 }}>
              <Typography variant="subtitle2">Send results to:</Typography>
              <CippFormComponent
                name="postExecution.webhook"
                label="Webhook"
                type="switch"
                formControl={formControl}
              />
              <CippFormComponent
                name="postExecution.email"
                label="E-mail"
                type="switch"
                formControl={formControl}
              />
              <CippFormComponent
                name="postExecution.psa"
                label="PSA"
                type="switch"
                formControl={formControl}
              />
              {showPsaIntegrationHint && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  PSA tickets are only sent when 'Send to integration' is enabled under Settings
                  &gt; Notifications.
                </Alert>
              )}
            </Grid>

            <Grid size={{ sm: 12, xs: 12 }}>
              <CippFormComponent
                type="textField"
                fullWidth
                label="Reference"
                name="reference"
                placeholder="Enter a reference that will be added to the notification title and scheduled task"
                formControl={formControl}
              />
            </Grid>

            {integrationSettings?.data?.HaloPSA?.Enabled === true && (
              <CippFormCondition
                formControl={formControl}
                field="postExecution.psa"
                compareType="is"
                compareValue={true}
              >
                <Grid size={{ sm: 12, xs: 12 }}>
                  <CippFormComponent
                    type="number"
                    fullWidth
                    label="HaloPSA Ticket"
                    name="PsaTicketId"
                    placeholder="Enter the related HaloPSA Ticket ID"
                    helperText="The results are added to the associated ticket in HaloPSA as a note instead of raising a new ticket."
                    formControl={formControl}
                  />
                </Grid>
              </CippFormCondition>
            )}
          </Grid>
        </CardContent>
      </Card>

      <CippWizardStepButtons
        postUrl={postUrl}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        replacementBehaviour="removeNulls"
      />
    </Stack>
  );
}
