import { CippPropertyListCard } from '../../components/CippCards/CippPropertyListCard'
import CippFormComponent from '../../components/CippComponents/CippFormComponent'
import { Box, Chip, Typography } from '@mui/material'
import { Grid } from '@mui/system'

export const CippOffboardingDefaultSettings = (props) => {
  const { formControl, defaultsSource = null, title = 'Offboarding Default Settings' } = props

  const getSourceChip = () => {
    // Only show the chip if defaultsSource is explicitly provided (for wizard/preferences, not tenant config)
    if (!defaultsSource) return null

    const sourceConfig = {
      tenant: { label: 'Using Tenant Defaults', color: 'primary' },
      user: { label: 'Using User Defaults', color: 'info' },
      allUsers: { label: 'Using All Users Defaults', color: 'default' },
      none: { label: 'Using Default Settings', color: 'default' },
    }

    const { label, color } = sourceConfig[defaultsSource] ?? sourceConfig.none

    return <Chip size="small" variant="outlined" color={color} label={label} />
  }

  const sourceChip = getSourceChip()
  const cardTitle = sourceChip ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {title}
      {sourceChip}
    </Box>
  ) : (
    title
  )

  return (
    <>
      <CippPropertyListCard
        layout="two"
        showDivider={false}
        title={cardTitle}
        propertyItems={[
          {
            label: 'Convert to Shared Mailbox',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.ConvertToShared"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove from all groups',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.RemoveGroups"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Hide from Global Address List',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.HideFromGAL"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove Licenses',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.RemoveLicenses"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Cancel all calendar invites',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.removeCalendarInvites"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Revoke all sessions',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.RevokeSessions"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove users mailbox permissions',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.removePermissions"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove users calendar permissions',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.removeCalendarPermissions"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove all Rules',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.RemoveRules"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Reset Password',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.ResetPass"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Keep copy of forwarded mail in source mailbox',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.KeepCopy"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Delete user',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.DeleteUser"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove all Mobile Devices',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.RemoveMobile"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Disable Sign in',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.DisableSignIn"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove all MFA Devices',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.RemoveMFADevices"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Remove Teams Phone DID',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.RemoveTeamsPhoneDID"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Clear Immutable ID',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.ClearImmutableId"
                formControl={formControl}
              />
            ),
          },
          {
            label: 'Disable OneDrive Sharing Links',
            value: (
              <CippFormComponent
                type="switch"
                name="offboardingDefaults.DisableOneDriveSharing"
                formControl={formControl}
              />
            ),
          },
        ]}
        cardButton={
          <Box sx={{ width: '100%', px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Send results to
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CippFormComponent
                  type="switch"
                  label="Webhook"
                  name="offboardingDefaults.postExecution.webhook"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CippFormComponent
                  type="switch"
                  label="E-mail"
                  name="offboardingDefaults.postExecution.email"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CippFormComponent
                  type="switch"
                  label="PSA"
                  name="offboardingDefaults.postExecution.psa"
                  formControl={formControl}
                />
              </Grid>
            </Grid>
          </Box>
        }
      />
    </>
  )
}
