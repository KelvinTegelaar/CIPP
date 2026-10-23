import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'
import CippButtonCard from '../CippCards/CippButtonCard'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippApiResults } from './CippApiResults'

// The containment actions run for this case and their per-target results, newest first. Reads the
// history persisted on the run (becData.Run.Containment); renders nothing until something has run.
// An accordion like the objective groups, open by default. With a tenant and UPN it also offers
// Release user, which lifts the lockouts still in force (those after the last release).
export const CippBecRemediationHistory = ({
  becData,
  tenantFilter,
  userPrincipalName,
  relatedQueryKeys = [],
}) => {
  const containment = becData?.Run?.Containment
  const history = useMemo(
    () => [...(containment || [])].reverse(),
    [containment]
  )
  const caseId = becData?.CaseId
  const canRelease = Boolean(tenantFilter && userPrincipalName && caseId)

  const [visible, setVisible] = useState(false)
  const catalogCall = ApiGetCall({
    url: '/api/ListBECRemediationActions',
    queryKey: 'ListBECRemediationActions',
    waiting: canRelease,
  })
  const catalog = Array.isArray(catalogCall.data) ? catalogCall.data : []

  // Successful actions of the containment runs since the most recent release
  const inForce = useMemo(() => {
    const since = []
    for (const entry of history) {
      if (entry.Kind === 'Release') break
      since.push(entry)
    }
    const ran = new Set()
    since.forEach((entry) =>
      (entry.Results || []).forEach((row) => {
        if (['success', 'warning'].includes(row.state)) ran.add(row.Action)
      })
    )
    return ran
  }, [history])
  const ranActions = catalog.filter((action) => inForce.has(action.Id))
  const reversible = ranActions.filter((action) => action.Release === 'Reverse')
  const keep = ranActions.filter((action) => action.Release === 'Keep')
  const manual = ranActions.filter((action) => action.Release === 'Manual')

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { actions: {}, Confirmation: '' },
  })
  const watched = useWatch({ control: formControl.control })
  // Every reversible action is released unless switched off
  const selectedIds = reversible
    .filter((action) => watched?.actions?.[action.Id] !== false)
    .map((action) => action.Id)
  const confirmationOk =
    (watched?.Confirmation || '').trim().toLowerCase() ===
    (userPrincipalName || '').trim().toLowerCase()

  const releaseCall = ApiPostCall({
    relatedQueryKeys: [`execBECCheck-polling-${caseId}`, ...relatedQueryKeys],
  })

  if (history.length === 0) return null

  return (
    <CippButtonCard
      variant="outlined"
      component="accordion"
      accordionExpanded={true}
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <Box>Remediation taken</Box>
          <Chip
            size="small"
            variant="outlined"
            label={`${history.length} run${history.length === 1 ? '' : 's'}`}
          />
        </Stack>
      }
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          Containment actions run for this case and their results, newest first.
        </Typography>
        {canRelease && reversible.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setVisible(true)}
            startIcon={<CippIcons.LockOpen />}
          >
            Release user
          </Button>
        )}
      </Stack>
      <Stack spacing={2.5}>
        {history.map((entry, index) => {
          const results = Array.isArray(entry.Results) ? entry.Results : []
          const actionCount = (entry.Actions || []).length
          return (
            <Box key={index}>
              <Typography variant="subtitle2" gutterBottom>
                {entry.Kind === 'Release' ? 'Release · ' : ''}
                {entry.At
                  ? new Date(entry.At).toLocaleString()
                  : 'Unknown time'}{' '}
                · {entry.By || 'CIPP'} · {actionCount} action
                {actionCount === 1 ? '' : 's'}
              </Typography>
              {results.length > 0 ? (
                <CippDataTable
                  noCard
                  hideTitle
                  data={results}
                  simpleColumns={['Action', 'Target', 'resultText', 'state']}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No per-action results were recorded.
                </Typography>
              )}
            </Box>
          )
        })}
      </Stack>
      {canRelease && (
        <CippOffCanvas
          title={`Release ${userPrincipalName}`}
          visible={visible}
          onClose={() => setVisible(false)}
          size="lg"
          footer={
            <Stack spacing={2}>
              <CippApiResults apiObject={releaseCall} />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<CippIcons.LockOpen />}
                  onClick={() =>
                    releaseCall.mutate({
                      url: '/api/ExecBECRelease',
                      data: {
                        tenantFilter,
                        CaseId: caseId,
                        Actions: selectedIds,
                        Confirmation: watched?.Confirmation || '',
                      },
                    })
                  }
                  disabled={
                    selectedIds.length === 0 ||
                    !confirmationOk ||
                    releaseCall.isPending
                  }
                >
                  Release user
                </Button>
              </Stack>
            </Stack>
          }
        >
          <Stack spacing={2}>
            <Alert severity="info">
              Lifts the lockouts this case&apos;s containment placed on the
              user. Protocol settings and blocked devices go back to how they
              were before containment, so anything that was already off stays
              off.
            </Alert>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Reverse
              </Typography>
              {reversible.map((action) => (
                <CippFormComponent
                  key={action.Id}
                  type="switch"
                  name={`actions.${action.Id}`}
                  label={action.Label}
                  defaultValue={true}
                  formControl={formControl}
                />
              ))}
            </Box>
            {keep.length > 0 && (
              <Box>
                <Typography variant="subtitle1">Left in place</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  These removed attacker changes; turning them back on would
                  restore the attacker&apos;s setup.
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap' }}
                >
                  {keep.map((action) => (
                    <Chip key={action.Id} size="small" label={action.Label} />
                  ))}
                </Stack>
              </Box>
            )}
            {manual.length > 0 && (
              <Box>
                <Typography variant="subtitle1">Not reversed</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  These cannot be undone automatically. Check them with the
                  user, for example re-registering MFA or re-pairing a phone.
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap' }}
                >
                  {manual.map((action) => (
                    <Chip
                      key={action.Id}
                      size="small"
                      variant="outlined"
                      label={action.Label}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            <CippFormComponent
              type="textField"
              name="Confirmation"
              label={`Type ${userPrincipalName} to confirm`}
              formControl={formControl}
              validators={{
                validate: (value) =>
                  (value || '').trim().toLowerCase() ===
                    (userPrincipalName || '').trim().toLowerCase() ||
                  `Must match ${userPrincipalName}`,
              }}
            />
          </Stack>
        </CippOffCanvas>
      )}
    </CippButtonCard>
  )
}

export default CippBecRemediationHistory
