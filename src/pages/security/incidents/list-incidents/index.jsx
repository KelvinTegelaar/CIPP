import { useState } from 'react'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  SvgIcon,
  Stack,
  Box,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useForm } from 'react-hook-form'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { useSettings } from '../../../../hooks/use-settings'

const defaultStartDate = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
})()

const Page = () => {
  const pageTitle = 'Incidents List'
  const userSettingsDefaults = useSettings()

  const formControl = useForm({ defaultValues: { startDate: defaultStartDate, endDate: null } })
  const [expanded, setExpanded] = useState(false)
  const [filterEnabled, setFilterEnabled] = useState(true)
  const [startDate, setStartDate] = useState(
    new Date(defaultStartDate * 1000).toISOString().split('T')[0].replace(/-/g, '')
  )
  const [endDate, setEndDate] = useState(null)

  const onSubmit = (data) => {
    setStartDate(
      data.startDate
        ? new Date(data.startDate * 1000).toISOString().split('T')[0].replace(/-/g, '')
        : null
    )
    setEndDate(
      data.endDate
        ? new Date(data.endDate * 1000).toISOString().split('T')[0].replace(/-/g, '')
        : null
    )
    setFilterEnabled(data.startDate !== null || data.endDate !== null)
    setExpanded(false)
  }

  const clearFilters = () => {
    formControl.reset({ startDate: null, endDate: null })
    setFilterEnabled(false)
    setStartDate(null)
    setEndDate(null)
    setExpanded(false)
  }

  const fmt = (yyyymmdd) =>
    yyyymmdd
      ? new Date(
          yyyymmdd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') + 'T00:00:00'
        ).toLocaleDateString()
      : null

  const tableFilter = (
    <Accordion expanded={expanded} onChange={(_, v) => setExpanded(v)}>
      <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SvgIcon fontSize="small">
            <CippIcons.FunnelIcon />
          </SvgIcon>
          <Typography variant="body2">
            {filterEnabled && (startDate || endDate)
              ? startDate && endDate
                ? `Date Filter: ${fmt(startDate)} — ${fmt(endDate)}`
                : startDate
                  ? `Date Filter: From ${fmt(startDate)}`
                  : `Date Filter: Up to ${fmt(endDate)}`
              : 'Date Filter'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} sx={{
          alignItems: "flex-end"
        }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="datePicker"
              name="startDate"
              label="Start Date"
              dateTimeType="date"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="datePicker"
              name="endDate"
              label="End Date"
              dateTimeType="date"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{
              flexWrap: "wrap"
            }}>
              <Button variant="contained" onClick={formControl.handleSubmit(onSubmit)}>
                Apply
              </Button>
              <Button
                variant="outlined"
                startIcon={
                  <SvgIcon fontSize="small">
                    <CippIcons.XMarkIcon />
                  </SvgIcon>
                }
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )

  // Define actions for incidents
  const actions = [
    {
      label: 'Assign to self',
      type: 'POST',
      icon: <CippIcons.PersonAdd />,
      url: '/api/ExecSetSecurityIncident',
      data: {
        GUID: 'Id',
        AssignToSelf: true,
      },
      confirmText: 'Are you sure you want to assign this incident to yourself?',
    },
    {
      label: 'Set status to active',
      type: 'POST',
      icon: <CippIcons.PlayArrow />,
      url: '/api/ExecSetSecurityIncident',
      data: {
        GUID: 'Id',
        Status: '!active',
      },
      confirmText: 'Are you sure you want to set the status to active?',
    },
    {
      label: 'Set status to in progress',
      type: 'POST',
      icon: <CippIcons.Assignment />,
      url: '/api/ExecSetSecurityIncident',
      data: {
        GUID: 'Id',
        Status: '!inProgress',
      },
      confirmText: 'Are you sure you want to set the status to in progress?',
    },
    {
      label: 'Set status to resolved',
      type: 'POST',
      icon: <CippIcons.Done />,
      url: '/api/ExecSetSecurityIncident',
      data: {
        GUID: 'Id',
        Status: '!resolved',
      },
      fields: [
        {
          type: 'textField',
          name: 'Comment',
          label: 'Resolving comment (optional)',
          multiline: true,
          rows: 3,
        },
      ],
      confirmText: 'Are you sure you want to set the status to resolved?',
    },
    {
      label: 'Set severity',
      type: 'POST',
      icon: <CippIcons.Warning />,
      url: '/api/ExecSetSecurityIncident',
      data: {
        GUID: 'Id',
      },
      fields: [
        {
          type: 'autoComplete',
          name: 'Severity',
          label: 'Severity',
          multiple: false,
          creatable: false,
          options: [
            { value: 'informational', label: 'Informational' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
          validators: { required: 'Severity is required' },
        },
      ],
      confirmText: 'Select the severity to set for this incident.',
    },
  ]

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: [
      'Created',
      'Updated',
      'Tenant',
      'Id',
      'RedirectId',
      'DisplayName',
      'Status',
      'Severity',
      'AssignedTo',
      'Classification',
      'Determination',
      'IncidentUrl',
      'Tags',
    ],
    actions: actions,
  }

  // Simplified columns for the table
  const simpleColumns = [
    'Created',
    'Tenant',
    'Id',
    'DisplayName',
    'Status',
    'Severity',
    'AssignedTo',
    'Tags',
    'IncidentUrl',
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ExecIncidentsList"
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      tableFilter={tableFilter}
      queryKey={`ExecIncidentsList-${userSettingsDefaults.currentTenant}-${startDate}-${endDate}`}
      apiData={{ StartDate: startDate, EndDate: endDate }}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>

export default Page
