import { useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import { CippApiDialog } from './CippApiDialog'
import { useDialog } from '../../hooks/use-dialog'
import { usePermissions } from '../../hooks/use-permissions'

// Re-run actions for offboarding jobs. Both go through the offboarding endpoint, so they need the
// wizard's own permission rather than the scheduler's. Rows carry TaskId and TenantFilter.
export const OFFBOARDING_PROGRESS_ACTIONS = {
  permissions: ['Identity.User.ReadWrite'],
  rerun: {
    url: '/api/ExecOffboardUser?Action=Rerun',
    data: { TaskId: 'TaskId', tenantFilter: 'TenantFilter' },
    confirmText:
      'Queue every action for [Name] again? Actions that are not repeatable without effect, such as a password reset or a device wipe, will happen again.',
  },
  rerunStep: {
    url: '/api/ExecOffboardUser?Action=RerunStep',
    data: {
      TaskId: 'TaskId',
      StepIndex: 'StepIndex',
      StepTitle: 'StepTitle',
      tenantFilter: 'TenantFilter',
    },
    confirmText: 'Run "[StepTitle]" again for [Name]?',
  },
}

const capitalize = (text) =>
  typeof text === 'string' && text.length > 0
    ? text.charAt(0).toUpperCase() + text.slice(1)
    : text

const STATUS_CHIP_COLORS = {
  queued: 'default',
  running: 'info',
  succeeded: 'success',
  failed: 'error',
}
const isDone = (status) => status === 'succeeded' || status === 'failed'

// Plain-text rendering of the rows, for the copy buttons.
export const formatJobProgressText = (rows) =>
  rows
    .map((row) =>
      [
        `${row.Tenant ?? row.Name}: ${capitalize(row.Status)}`,
        ...(row.Steps || []).map(
          (step) =>
            `  [${step.Status}] ${step.Title}` +
            (step.Message
              ? `\n    ${String(step.Message).replace(/\n/g, '\n    ')}`
              : '')
        ),
      ].join('\n')
    )
    .join('\n\n')

const StepIcon = ({ status }) => {
  if (status === 'succeeded')
    return <CippIcons.CheckCircle fontSize="small" color="success" />
  if (status === 'failed') return <CippIcons.Error fontSize="small" color="error" />
  if (status === 'running') return <CircularProgress size={16} />
  return <CippIcons.RadioButtonUnchecked fontSize="small" color="disabled" />
}

// Live job progress: one collapsible block per row (a tenant, or a user for offboarding) with its
// steps. `actions` (see OFFBOARDING_PROGRESS_ACTIONS) adds Re-run for a whole row and for a single
// step on rows backed by a task (TaskId); onRerun lets the host resume polling afterwards.
export const CippJobProgress = ({ rows, onRerun, actions }) => {
  const { checkPermissions } = usePermissions()
  const canRerun =
    !!actions &&
    !!onRerun &&
    (actions.permissions ? checkPermissions(actions.permissions) : true)
  const dialog = useDialog()
  const [pending, setPending] = useState(null)
  const openRerun = (row, action) => {
    setPending({ row, action })
    dialog.handleOpen()
  }

  return (
    <Stack spacing={1}>
      {rows.map((row, rowIndex) => {
        const steps = row.Steps || []
        const failed = steps.filter((step) => step.Status === 'failed').length
        const done = isDone(row.Status)
        const rerunnable = canRerun && !!row.TaskId
        return (
          <Accordion
            key={row.Tenant ?? row.Name ?? rowIndex}
            variant="outlined"
            defaultExpanded
          >
            <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', width: '100%', minWidth: 0, pr: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                >
                  {row.Tenant ?? row.Name}
                </Typography>
                {failed > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'error.main', whiteSpace: 'nowrap' }}
                  >
                    {failed} of {steps.length} failed
                  </Typography>
                )}
                <Box
                  sx={{
                    ml: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {rerunnable && actions.rerun && (
                    <Button
                      size="small"
                      startIcon={<CippIcons.Replay />}
                      disabled={!done}
                      onClick={() => openRerun(row, actions.rerun)}
                    >
                      Re-run
                    </Button>
                  )}
                  <CippCopyToClipBoard
                    text={formatJobProgressText([row])}
                    type="button"
                  />
                  <Chip
                    size="small"
                    label={capitalize(row.Status)}
                    color={STATUS_CHIP_COLORS[row.Status] || 'default'}
                    variant={row.Status === 'queued' ? 'outlined' : 'filled'}
                  />
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {steps.map((step, index) => (
                  <Stack
                    direction="row"
                    spacing={1}
                    key={index}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <Box sx={{ pt: 0.25 }}>
                      <StepIcon status={step.Status} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2">{step.Title}</Typography>
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          color: 'text.secondary',
                          whiteSpace: 'pre-line',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {step.Message}
                      </Typography>
                    </Box>
                    {rerunnable &&
                      actions.rerunStep &&
                      step.Kind !== 'notify' && (
                        <Tooltip title="Re-run this step">
                          <span>
                            <IconButton
                              size="small"
                              disabled={!done}
                              onClick={() =>
                                openRerun(
                                  {
                                    ...row,
                                    StepIndex: index,
                                    StepTitle: step.Title,
                                  },
                                  actions.rerunStep
                                )
                              }
                            >
                              <CippIcons.Replay fontSize="inherit" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                  </Stack>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )
      })}
      {pending && (
        <CippApiDialog
          createDialog={dialog}
          title={`Re-run ${pending.row.Tenant ?? pending.row.Name}`}
          row={pending.row}
          relatedQueryKeys={[
            'OffboardingJobs*',
            'ListScheduledItems*',
            'ListScheduledItemDetails*',
          ]}
          api={{
            type: 'POST',
            url: pending.action.url,
            data: pending.action.data,
            confirmText: pending.action.confirmText,
            onSuccess: () => onRerun?.(),
          }}
        />
      )}
    </Stack>
  )
}

export default CippJobProgress
