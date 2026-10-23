import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { Button } from '@mui/material'
import { Grid } from '@mui/system'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippFormComponent } from '../../../../components/CippComponents/CippFormComponent.jsx'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import { CippIcons } from '../../../../utils/icon-registry'
import { useSettings } from '../../../../hooks/use-settings'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'

// Run history is kept for 30 days; ListAlertRunHistory caps Days there too.
const MAX_DAYS = 30
const OUTCOME_OPTIONS = ['Completed', 'Skipped', 'Failed', 'Not reported'].map(
  (value) => ({ label: value, value })
)

const Page = () => {
  const router = useRouter()
  const tenant = useSettings().currentTenant
  const taskId = router.query.taskId
  // One alert: its whole retained history. Every alert: the last day, which is already one row per run per tenant.
  const defaultDays = taskId ? MAX_DAYS : 1
  const formControl = useForm({
    defaultValues: { Days: defaultDays, Outcome: [] },
  })
  const [applied, setApplied] = useState(null)
  const [filterExpanded, setFilterExpanded] = useState(false)
  const days = applied?.days ?? defaultDays
  const outcomes = applied?.outcomes ?? []

  // taskId arrives once the router is ready, after the form was created with the all-alerts default.
  useEffect(() => {
    formControl.reset({ Days: defaultDays, Outcome: [] })
  }, [defaultDays])

  const handleFilterSubmit = formControl.handleSubmit((data) => {
    setApplied({
      days: Math.min(Math.max(Number(data.Days) || 1, 1), MAX_DAYS),
      outcomes: (data.Outcome ?? []).map((option) => option.value),
    })
    setFilterExpanded(false)
  })

  if (!router.isReady) return null

  const tableFilter = (
    <CippButtonCard
      title="Filter Options"
      component="accordion"
      accordionExpanded={filterExpanded}
      onAccordionChange={setFilterExpanded}
    >
      <Grid container spacing={2}>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="number"
            label="Days"
            name="Days"
            formControl={formControl}
            fullWidth
            helperText={`Days of run history to show, up to ${MAX_DAYS}`}
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Outcome"
            name="Outcome"
            formControl={formControl}
            options={OUTCOME_OPTIONS}
            multiple={true}
            creatable={false}
            helperText="Only runs with these outcomes. Leave empty to include all."
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFilterSubmit}
            startIcon={<CippIcons.FilterList />}
          >
            Apply Filter
          </Button>
        </Grid>
      </Grid>
    </CippButtonCard>
  )

  return (
    <CippTablePage
      title={`Run History${taskId ? ' for this alert' : ''} (last ${days === 1 ? '24 hours' : `${days} days`})`}
      tableFilter={tableFilter}
      apiUrl="/api/ListAlertRunHistory"
      apiData={{
        Days: days,
        TaskId: taskId,
        Outcome: outcomes.length ? outcomes.join(',') : undefined,
      }}
      simpleColumns={[
        'ExecutedTime',
        'ScheduledTime',
        'TaskName',
        'Tenant',
        'Outcome',
        'Summary',
        'New',
        'Reopened',
        'Resolved',
        'DurationMs',
      ]}
      queryKey={`ListAlertRunHistory-${tenant}-${taskId ?? 'all'}-${days}-${outcomes.join(',')}`}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
