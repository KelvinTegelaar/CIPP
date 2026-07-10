import { useState } from 'react'
import { Container, Box, Button, SvgIcon } from '@mui/material'
import { PlayArrow } from '@mui/icons-material'
import { useForm, useWatch } from 'react-hook-form'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { ApiGetCall } from '../../../../api/ApiCall.jsx'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { CippTestDetailOffCanvas } from '../../../../components/CippTestDetail/CippTestDetailOffCanvas'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { CippHead } from '../../../../components/CippComponents/CippHead.jsx'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const { currentTenant } = useSettings()
  const formControl = useForm({ mode: 'onChange' })
  const selectedTests = useWatch({ control: formControl.control, name: 'testIds' })
  const [runDialog, setRunDialog] = useState({ open: false })

  // Comma-joined test IDs; empty string means "all custom tests". Custom test IDs
  // (CustomScript-<guid>) never contain commas, so a comma join round-trips safely.
  const testIdParam = (Array.isArray(selectedTests) ? selectedTests : [])
    .map((test) => test?.value)
    .filter(Boolean)
    .join(',')

  const isAllTenants = !currentTenant || currentTenant === 'AllTenants'
  const scopeLabel = isAllTenants ? 'all tenants' : currentTenant

  // Custom test definitions drive the picker (one option per script, latest version).
  const scriptsApi = ApiGetCall({
    url: '/api/ListCustomScripts',
    queryKey: 'ListCustomScripts-Report',
  })

  // Cross-tenant results for the selected custom test(s), scoped to the current tenant
  // selection. Passing the global currentTenant lets the header selector drive scope:
  // a specific tenant narrows to that partition, 'AllTenants' queries every tenant.
  const resultsQueryKey = `TestResultsTenants-${currentTenant}-${testIdParam || 'all'}`
  const resultsApi = ApiGetCall({
    url: '/api/ListTestResultsTenants',
    data: { testId: testIdParam, tenantFilter: currentTenant, testType: 'Custom' },
    queryKey: resultsQueryKey,
    waiting: !!currentTenant,
  })

  const scriptOptions = (scriptsApi.data || [])
    .filter((script) => script.ScriptGuid)
    .map((script) => ({
      label: script.ScriptName || script.ScriptGuid,
      value: `CustomScript-${script.ScriptGuid}`,
    }))

  const data = resultsApi.data?.Results || []

  const filters = [
    { filterName: 'Passed', value: [{ id: 'Status', value: 'Passed' }], type: 'column' },
    { filterName: 'Failed', value: [{ id: 'Status', value: 'Failed' }], type: 'column' },
    { filterName: 'Investigate', value: [{ id: 'Status', value: 'Investigate' }], type: 'column' },
    { filterName: 'Skipped', value: [{ id: 'Status', value: 'Skipped' }], type: 'column' },
    { filterName: 'High Risk', value: [{ id: 'Risk', value: 'High' }], type: 'column' },
    { filterName: 'Medium Risk', value: [{ id: 'Risk', value: 'Medium' }], type: 'column' },
    { filterName: 'Low Risk', value: [{ id: 'Risk', value: 'Low' }], type: 'column' },
  ]

  const offCanvas = {
    size: 'lg',
    children: (row) => <CippTestDetailOffCanvas row={row} />,
  }

  return (
    <Container maxWidth={false}>
      <CippHead title="Custom Test Report" />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1, maxWidth: 640 }}>
          <CippFormComponent
            name="testIds"
            label="Custom tests (leave empty for all)"
            type="autoComplete"
            multiple={true}
            formControl={formControl}
            options={scriptOptions}
            isFetching={scriptsApi.isFetching}
            placeholder="Select one or more custom tests, or leave empty to show every test"
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            <SvgIcon fontSize="small">
              <PlayArrow />
            </SvgIcon>
          }
          onClick={() =>
            setRunDialog({ open: true, handleClose: () => setRunDialog({ open: false }) })
          }
        >
          Run Custom Tests
        </Button>
      </Box>

      <CippDataTable
        title={
          testIdParam
            ? `Custom Tests — ${scopeLabel}`
            : `All Custom Tests — ${scopeLabel}`
        }
        data={data}
        simpleColumns={['Tenant', 'Name', 'Enabled', 'Risk', 'Status', 'LastRun']}
        isFetching={resultsApi.isFetching}
        offCanvas={offCanvas}
        offCanvasOnRowClick={true}
        filters={filters}
        actions={[]}
        maxHeightOffset="400px"
        refreshFunction={resultsApi}
      />

      <CippApiDialog
        createDialog={runDialog}
        title="Run Custom Tests"
        fields={[]}
        api={{
          url: '/api/ExecCustomTestRun',
          type: 'POST',
          data: { tenantFilter: currentTenant },
          confirmText: `This re-runs your enabled Custom Tests against ${scopeLabel} using the most recent cached data.${
            isAllTenants ? ' A run across all tenants can take a while;' : ''
          } results appear here as each tenant finishes.`,
          relatedQueryKeys: [resultsQueryKey],
        }}
      />
    </Container>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
