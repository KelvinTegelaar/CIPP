import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { CippFormComponent } from '../../../../components/CippComponents/CippFormComponent.jsx'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog.jsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Stack } from '@mui/material'
import { FilterList as FilterListIcon, Save as SaveIcon } from '@mui/icons-material'
import { Grid } from '@mui/system'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import { useSettings } from '../../../../hooks/use-settings.js'
import { useDialog } from '../../../../hooks/use-dialog.js'
import signinErrorCodes from '../../../../data/signinErrorCodes.json'

const ERROR_CODE_OPTIONS = Object.entries(signinErrorCodes).map(([code, description]) => ({
  label: code === '0' ? `${code} - ${description}` : `${code} - ${description}`,
  value: code,
}))

const SIGN_IN_EVENT_TYPES = [
  { label: 'Interactive', value: 'interactiveUser' },
  { label: 'Non-Interactive', value: 'nonInteractiveUser' },
  { label: 'Service Principal', value: 'servicePrincipal' },
  { label: 'Managed Identity', value: 'managedIdentity' },
]

const CA_STATUS_OPTIONS = [
  { label: 'Success', value: 'success' },
  { label: 'Failure', value: 'failure' },
  { label: 'Not Applied', value: 'notApplied' },
]

const buildGraphFilter = ({
  Days,
  errorCodes,
  userFilter,
  appFilter,
  signInEventType,
  caStatus,
  hideDirSync,
}) => {
  const date = new Date()
  date.setDate(date.getDate() - Number(Days))
  const dateStr = date.toISOString().split('T')[0]

  const clauses = [`createdDateTime ge ${dateStr}`]

  if (hideDirSync) {
    clauses.push(`userDisplayName ne 'On-Premises Directory Synchronization Service Account'`)
  }

  const errorCodeValues = Array.isArray(errorCodes)
    ? errorCodes.map((o) => o.value).filter(Boolean)
    : []
  if (errorCodeValues.length === 1) {
    clauses.push(`status/errorCode eq ${errorCodeValues[0]}`)
  } else if (errorCodeValues.length > 1) {
    clauses.push(`(${errorCodeValues.map((c) => `status/errorCode eq ${c}`).join(' or ')})`)
  }
  if (userFilter) clauses.push(`startsWith(userPrincipalName,'${userFilter.replace(/'/g, "''")}')`)
  if (appFilter) clauses.push(`startsWith(appDisplayName,'${appFilter.replace(/'/g, "''")}')`)

  const caValues = Array.isArray(caStatus) ? caStatus.map((o) => o.value).filter(Boolean) : []
  if (caValues.length === 1) {
    clauses.push(`conditionalAccessStatus eq '${caValues[0]}'`)
  } else if (caValues.length > 1) {
    clauses.push(`(${caValues.map((v) => `conditionalAccessStatus eq '${v}'`).join(' or ')})`)
  }

  const eventTypes = Array.isArray(signInEventType)
    ? signInEventType.map((o) => o.value).filter(Boolean)
    : []
  const isInteractiveOnly =
    eventTypes.length === 0 || (eventTypes.length === 1 && eventTypes[0] === 'interactiveUser')
  if (!isInteractiveOnly) {
    clauses.push(`signInEventTypes/any(t: ${eventTypes.map((t) => `t eq '${t}'`).join(' OR ')})`)
  }

  return clauses.join(' and ')
}

// Template version for saved presets — uses {DaysAgo:N} placeholder instead of
// a baked-in date so the filter stays fresh when loaded later.
const buildGraphFilterTemplate = (values) => {
  // Build with Days=0 to get a valid date, then replace the date clause with the placeholder.
  const compiled = buildGraphFilter({ ...values, Days: 0 })
  return compiled.replace(
    /createdDateTime ge [^\s]+/,
    `createdDateTime ge {DaysAgo:${Number(values.Days)}}`,
  )
}

const USER_COLUMNS = [
  'createdDateTime',
  'userPrincipalName',
  'clientAppUsed',
  'authenticationRequirement',
  'status.errorCode',
  'status.additionalDetails',
  'ipAddress',
  'location.city',
  'location.countryOrRegion',
]

const SP_COLUMNS = [
  'createdDateTime',
  'servicePrincipalName',
  'appDisplayName',
  'resourceDisplayName',
  'status.errorCode',
  'status.additionalDetails',
  'ipAddress',
  'location.city',
  'location.countryOrRegion',
]

const getSimpleColumns = (signInEventType) => {
  const types = Array.isArray(signInEventType) ? signInEventType.map((o) => o.value) : []
  const hasUserTypes = types.some((t) => t === 'interactiveUser' || t === 'nonInteractiveUser')
  const hasSpTypes = types.some((t) => t === 'servicePrincipal' || t === 'managedIdentity')
  if (hasSpTypes && !hasUserTypes) return SP_COLUMNS
  if (hasUserTypes && !hasSpTypes) return USER_COLUMNS
  if (hasSpTypes && hasUserTypes) return [...new Set([...USER_COLUMNS, ...SP_COLUMNS])]
  return USER_COLUMNS
}

const Page = () => {
  const pageTitle = 'Sign Ins Report'

  const currentTenant = useSettings().currentTenant

  const defaultFilterValues = {
    Days: 7,
    pageSize: 500,
    errorCodes: [],
    hideDirSync: true,
    userFilter: '',
    appFilter: '',
    signInEventType: [{ label: 'Interactive', value: 'interactiveUser' }],
    caStatus: [],
  }

  const formControl = useForm({ defaultValues: defaultFilterValues })
  const [appliedFilters, setAppliedFilters] = useState(defaultFilterValues)
  const [filterExpanded, setFilterExpanded] = useState(false)
  const savePresetDialog = useDialog()

  const handleFilterSubmit = formControl.handleSubmit((data) => {
    setAppliedFilters(data)
    setFilterExpanded(false)
  })

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
            helperText="Number of days back to include in the report"
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="number"
            label="Results per page ($top)"
            name="pageSize"
            formControl={formControl}
            fullWidth
            helperText="Number of results to display per page (set this lower if report is loading slowly)"
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Sign-In Event Type"
            name="signInEventType"
            formControl={formControl}
            options={SIGN_IN_EVENT_TYPES}
            multiple={true}
            helperText="Type of sign-in events to include in the report"
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="User (startsWith UPN)"
            name="userFilter"
            formControl={formControl}
            disableVariables
            helperText="Filter users by user principal name (UPN)"
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="App (startsWith display name)"
            name="appFilter"
            formControl={formControl}
            disableVariables
            helperText="Filter applications by display name"
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Conditional Access Result"
            name="caStatus"
            formControl={formControl}
            options={CA_STATUS_OPTIONS}
            multiple={true}
            helperText="Filter by conditional access result"
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Error Codes"
            name="errorCodes"
            formControl={formControl}
            options={ERROR_CODE_OPTIONS}
            multiple={true}
            helperText="Filter by specific sign-in error codes. Leave empty to include all."
          />
        </Grid>
        <Grid size={{ sm: 6, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Hide Directory Sync Account"
            name="hideDirSync"
            formControl={formControl}
            helperText="Exclude the On-Premises Directory Synchronization Service Account from results"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Button
              variant="contained"
              color="primary"
              onClick={handleFilterSubmit}
              startIcon={<FilterListIcon />}
            >
              Apply Filter
            </Button>
            <Button
              variant="outlined"
              onClick={savePresetDialog.handleOpen}
              startIcon={<SaveIcon />}
            >
              Save as Preset
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </CippButtonCard>
  )

  const apiData = {
    Endpoint: 'auditLogs/signIns',
    $filter: buildGraphFilter(appliedFilters),
    $orderby: 'createdDateTime desc',
    $top: appliedFilters.pageSize || 500,
    manualPagination: true,
    Version: 'beta',
  }

  const offCanvas = {
    children: (row) => <CippJsonView object={row} defaultOpen={true} title="Sign-In Details" />,
    size: 'xl',
  }

  return (
    <>
      <CippApiDialog
        createDialog={savePresetDialog}
        title="Save as Preset"
        fields={[
          {
            type: 'textField',
            label: 'Preset Name',
            name: 'presetName',
            required: true,
            disableVariables: true,
          },
        ]}
        api={{
          type: 'POST',
          url: '/api/ExecGraphExplorerPreset',
          confirmText:
            'Enter a name for this preset. The current filter will be saved and available in the Graph Explorer.',
          relatedQueryKeys: ['ListGraphExplorerPresets*'],
          customDataformatter: (_row, _action, formData) => ({
            action: 'Copy',
            preset: {
              name: formData.presetName,
              endpoint: 'auditLogs/signIns',
              $filter: buildGraphFilterTemplate(formControl.getValues()),
              version: 'beta',
              $top: appliedFilters.pageSize || 500,
            },
          }),
        }}
      />
      <CippTablePage
        tableFilter={tableFilter}
        title={pageTitle}
        apiUrl="/api/ListGraphRequest"
        apiData={apiData}
        apiDataKey="Results"
        simpleColumns={getSimpleColumns(appliedFilters.signInEventType)}
        offCanvas={offCanvas}
        actions={[]}
        queryKey={`ListSignIns-${currentTenant}-${JSON.stringify(appliedFilters)}`}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>

export default Page
