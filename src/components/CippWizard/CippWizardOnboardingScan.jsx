import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useEffect, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import { ApiGetCall } from '../../api/ApiCall'
import { useDialog } from '../../hooks/use-dialog'
import { usePermissions } from '../../hooks/use-permissions'
import { CippIcons } from '../../utils/icon-registry'
import { getScanSelection } from '../../utils/get-onboarding-fixes'
import { CippApiDialog } from '../CippComponents/CippApiDialog'
import { CippApiResults } from '../CippComponents/CippApiResults'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippWizardStepButtons } from './CippWizardStepButtons'

const CATEGORIES = ['Account', 'Mailbox', 'Delegated access', 'Entitlements']

export const formatOnboardingDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export const CippWizardOnboardingScan = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props
  const tenant = useWatch({
    control: formControl.control,
    name: 'tenantFilter',
  })?.value
  const user = useWatch({ control: formControl.control, name: 'user' })
  const showDeleted = useWatch({
    control: formControl.control,
    name: 'HIDDEN_showDeleted',
  })
  const selection = useWatch({
    control: formControl.control,
    name: 'HIDDEN_scanSelection',
  })
  const restoreDialog = useDialog()
  // ExecRestoreDeleted needs this permission; without it the restore would only return 403.
  const canRestore = usePermissions().checkPermissions([
    'Tenant.Directory.ReadWrite',
  ])

  const userId = user?.addedFields?.id ?? user?.value
  const scan = ApiGetCall({
    url: '/api/ListUserOnboardingScan',
    // A scan is always a live read; a cached one would hide what a fix or restore just changed.
    data: { tenantFilter: tenant, UserId: userId, InvalidateCIPPCache: true },
    queryKey: `OnboardingScan-${tenant}-${userId}`,
    waiting: Boolean(tenant && userId),
  })
  const results = scan.data?.Results
  const findings = results?.Findings ?? []
  const ticked = (selection?.user === userId && selection?.ticked) || {}
  const tickedCount = Object.values(ticked).filter(Boolean).length
  const softDeleted = findings.length === 1 && findings[0].Id === 'SoftDeleted'

  useEffect(() => {
    if (!results) return
    formControl.setValue('HIDDEN_scanSelection', {
      user: userId,
      ticked: getScanSelection(results.Findings, ticked),
    })
    // A restored user gets their real UPN back; the job is addressed by UPN.
    const upn = results.User?.userPrincipalName
    if (user?.addedFields?.id && upn && upn !== user.value) {
      formControl.setValue('user', {
        ...user,
        label: `${results.User.displayName} (${upn})`,
        value: upn,
      })
    }
  }, [results])

  // Switching between active and deleted users starts the pick again.
  const lastShowDeleted = useRef(showDeleted)
  useEffect(() => {
    if (lastShowDeleted.current === showDeleted) return
    lastShowDeleted.current = showDeleted
    formControl.setValue('user', null)
  }, [showDeleted])

  const picker = showDeleted
    ? {
        url: '/api/ListDeletedItems',
        queryKey: `OnboardingDeletedUsers-${tenant}`,
        addedField: {
          id: 'id',
          displayName: 'displayName',
          TargetType: 'TargetType',
        },
        dataFilter: (options) =>
          options.filter((option) => option.addedFields?.TargetType === 'User'),
      }
    : {
        url: '/api/ListGraphRequest',
        dataKey: 'Results',
        queryKey: `OnboardingUsers-${tenant}`,
        addedField: { id: 'id', displayName: 'displayName' },
        data: {
          Endpoint: 'users',
          manualPagination: true,
          $select: 'id,userPrincipalName,displayName',
          $count: true,
          $orderby: 'displayName',
          $top: 999,
        },
      }

  return (
    <Stack spacing={3}>
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CippFormComponent
            key={`${tenant}-${showDeleted ? 'deleted' : 'active'}`}
            type="autoComplete"
            name="user"
            label={
              showDeleted
                ? 'Select a deleted user'
                : 'Select the user to onboard'
            }
            formControl={formControl}
            multiple={false}
            creatable={false}
            api={{
              ...picker,
              tenantFilter: tenant,
              // A deleted user's UPN is prefixed with its object id; show the address people know.
              labelField: (option) =>
                `${option.displayName} (${String(option.userPrincipalName).replace(/^[0-9a-f]{32}(?=.+@)/i, '')})`,
              valueField: 'userPrincipalName',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CippFormComponent
            type="switch"
            name="HIDDEN_showDeleted"
            label="Show deleted users"
            formControl={formControl}
          />
        </Grid>
      </Grid>

      <CippApiResults apiObject={scan} errorsOnly />
      {userId && scan.isFetching && <Skeleton variant="rounded" height={160} />}

      {results && !scan.isFetching && (
        <>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Box sx={{ minWidth: 0, mr: 'auto' }}>
              <Typography variant="h6">{results.User?.displayName}</Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}
              >
                {results.User?.userPrincipalName} · {findings.length}{' '}
                {findings.length === 1 ? 'finding' : 'findings'}, {tickedCount}{' '}
                {tickedCount === 1 ? 'fix' : 'fixes'} selected
                {results.Snapshot?.OffboardedAt &&
                  ` · Offboarded ${formatOnboardingDate(results.Snapshot.OffboardedAt)}`}
              </Typography>
            </Box>
            <Button
              startIcon={<CippIcons.Refresh />}
              onClick={() => scan.refetch()}
            >
              Rescan
            </Button>
          </Stack>

          {results.Errors?.length > 0 && (
            <Alert severity="warning">
              Some checks could not be completed, so their findings are missing
              from this scan.
              {results.Errors.map((error) => (
                <div key={error.Check}>
                  {error.Check}: {error.Message}
                </div>
              ))}
            </Alert>
          )}

          {softDeleted ? (
            <Alert
              severity="info"
              action={
                canRestore && (
                  <Button
                    color="inherit"
                    startIcon={<CippIcons.RestoreFromTrash />}
                    onClick={restoreDialog.handleOpen}
                  >
                    Restore and rescan
                  </Button>
                )
              }
            >
              {findings[0].Title}. {findings[0].Detail}
              {!canRestore &&
                ' Restoring it needs the Tenant.Directory.ReadWrite permission. Ask someone who has it to restore the account, then scan again.'}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {CATEGORIES.map((category) => {
                const rows = findings.filter(
                  (finding) => finding.Category === category
                )
                return (
                  <Grid key={category} size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardHeader title={category} />
                      <Divider />
                      <CardContent>
                        <Stack spacing={1.5}>
                          {rows.length === 0 && (
                            <Typography
                              variant="body2"
                              sx={{ color: 'text.secondary' }}
                            >
                              Nothing found.
                            </Typography>
                          )}
                          {rows.map((finding) => (
                            <Stack
                              key={finding.Id}
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: 'flex-start' }}
                            >
                              {finding.Fix && (
                                <Switch
                                  checked={ticked[finding.Id] === true}
                                  onChange={(event) =>
                                    formControl.setValue(
                                      'HIDDEN_scanSelection',
                                      {
                                        user: userId,
                                        ticked: {
                                          ...ticked,
                                          [finding.Id]: event.target.checked,
                                        },
                                      }
                                    )
                                  }
                                  slotProps={{
                                    input: { 'aria-label': finding.Fix.Label },
                                  }}
                                />
                              )}
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body2">
                                  {finding.Title}
                                </Typography>
                                {finding.Detail && (
                                  <Typography
                                    variant="caption"
                                    component="div"
                                    sx={{
                                      color: 'text.secondary',
                                      overflowWrap: 'anywhere',
                                    }}
                                  >
                                    {finding.Detail}
                                  </Typography>
                                )}
                                {finding.Fix && (
                                  <Typography variant="caption" component="div">
                                    Fix: {finding.Fix.Label}
                                  </Typography>
                                )}
                              </Box>
                              {!finding.Fix && finding.Note && (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={finding.Note}
                                />
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </>
      )}

      {softDeleted && (
        <CippApiDialog
          createDialog={restoreDialog}
          title="Restore user"
          row={{ ...results.User, tenantFilter: tenant }}
          relatedQueryKeys={['OnboardingDeletedUsers*', 'OnboardingUsers*']}
          api={{
            type: 'POST',
            url: '/api/ExecRestoreDeleted',
            data: {
              tenantFilter: 'tenantFilter',
              ID: 'id',
              userPrincipalName: 'userPrincipalName',
              displayName: 'displayName',
            },
            confirmText: 'Restore [displayName] from deleted items?',
            onSuccess: () => scan.refetch(),
          }}
        />
      )}

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        nextButtonDisabled={!results || scan.isFetching || softDeleted}
      />
    </Stack>
  )
}

export default CippWizardOnboardingScan
