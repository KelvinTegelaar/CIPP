import { Box, Button, Tooltip } from '@mui/material'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import { useSettings } from '../../hooks/use-settings'
import { ApiGetCall } from '../../api/ApiCall.jsx'
import { useQueryClient } from '@tanstack/react-query'
import { Refresh as RefreshIcon, Delete as DeleteIcon } from '@mui/icons-material'
import CippFormComponent from './CippFormComponent'
import { CippAddTestReportDrawer } from './CippAddTestReportDrawer'
import { CippApiDialog } from './CippApiDialog'

export const CippReportToolbar = () => {
  const settings = useSettings()
  const router = useRouter()
  const { currentTenant } = settings
  const queryClient = useQueryClient()
  const [deleteDialog, setDeleteDialog] = useState({ open: false })
  const [refreshDialog, setRefreshDialog] = useState({ open: false })

  const selectedReport =
    router.isReady && !router.query.reportId ? 'ztna' : router.query.reportId || 'ztna'

  const formControl = useForm({ mode: 'onChange' })
  const reportIdValue = useWatch({ control: formControl.control })

  const reportsApi = ApiGetCall({
    url: '/api/ListTestReports',
    queryKey: 'ListTestReports',
  })

  const reports = reportsApi.data || []

  useEffect(() => {
    if (selectedReport && router.isReady && reports.length > 0) {
      const matchingReport = reports.find((r) => r.id === selectedReport)
      if (matchingReport) {
        formControl.setValue('reportId', {
          value: matchingReport.id,
          label: matchingReport.name,
        })
      }
    }
  }, [selectedReport, router.isReady, reports])

  useEffect(() => {
    if (reportIdValue?.reportId?.value && reportIdValue.reportId.value !== selectedReport) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, reportId: reportIdValue.reportId.value },
        },
        undefined,
        { shallow: true }
      )
    }
  }, [reportIdValue])

  const handleRefresh = () => {
    reportsApi.refetch()
    queryClient.invalidateQueries({
      queryKey: [`${currentTenant}-ListTests-${selectedReport}`],
    })
  }

  const isBuiltIn = reports.find((r) => r.id === selectedReport)?.source === 'file'

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <CippFormComponent
            name="reportId"
            label="Select a test suite"
            type="autoComplete"
            multiple={false}
            formControl={formControl}
            disableClearable={true}
            options={reports.map((r) => ({
              label: r.name,
              value: r.id,
              description: r.description,
            }))}
            placeholder="Choose a test suite"
            customAction={{
              position: 'outside',
              icon: <RefreshIcon fontSize="small" />,
              tooltip: 'Refresh test suites',
              onClick: handleRefresh,
            }}
            isFetching={reportsApi.isFetching}
          />
        </Box>
        <CippAddTestReportDrawer />
        <Button
          variant="contained"
          color="primary"
          sx={{
            minWidth: 'auto',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease-in-out',
            px: 2,
          }}
          onClick={() => {
            setRefreshDialog({
              open: true,
              title: 'Refresh Test Data',
              message: `Are you sure you want to refresh the test data for ${currentTenant}? This might take up to 2 hours to update.`,
              api: {
                url: '/api/ExecTestRun',
                data: { tenantFilter: currentTenant },
                method: 'POST',
              },
              handleClose: () => setRefreshDialog({ open: false }),
            })
          }}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
        <Tooltip
          title={
            isBuiltIn ? 'Built-in test suites cannot be deleted' : 'Delete this custom test suite'
          }
          arrow
        >
          <Box component="span">
            <Button
              variant="contained"
              color="error"
              disabled={isBuiltIn}
              startIcon={<DeleteIcon />}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={() => {
                const report = reports.find((r) => r.id === selectedReport)
                if (report) {
                  setDeleteDialog({
                    open: true,
                    handleClose: () => setDeleteDialog({ open: false }),
                    row: { ReportId: selectedReport, name: report.name },
                  })
                }
              }}
            >
              Delete
            </Button>
          </Box>
        </Tooltip>
      </Box>

      <CippApiDialog
        createDialog={deleteDialog}
        title="Delete Custom Report"
        fields={[]}
        api={{
          url: '/api/DeleteTestReport',
          type: 'POST',
          data: { ReportId: selectedReport },
          confirmText: 'Are you sure you want to delete this report? This action cannot be undone.',
          relatedQueryKeys: ['ListTestReports'],
        }}
      />

      <CippApiDialog
        createDialog={refreshDialog}
        title={refreshDialog.title}
        fields={[]}
        api={{
          url: refreshDialog.api?.url,
          type: 'POST',
          data: refreshDialog.api?.data,
          confirmText: refreshDialog.message,
          relatedQueryKeys: [`${currentTenant}-ListTests-${selectedReport}`],
        }}
      />
    </>
  )
}
