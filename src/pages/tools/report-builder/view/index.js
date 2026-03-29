import { useState, useEffect, useMemo } from 'react'
import { Button, Typography, IconButton, Container, Divider } from '@mui/material'
import { Stack, Box } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../api/ApiCall.jsx'
import { ReportBuilderPDF } from '../../../../components/ReportBuilder/ReportBuilderPDF'
import { Download, ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/router'

const Page = () => {
  const router = useRouter()
  const [reportId, setReportId] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const settings = useSettings()
  const brandingSettings = settings.customBranding

  useEffect(() => {
    if (router.isReady) {
      setReportId(router.query.id || null)
      setIsReady(true)
    }
  }, [router.isReady, router.query.id])

  const reportApi = ApiGetCall({
    url: '/api/ListGeneratedReports',
    data: { ReportGUID: reportId },
    queryKey: `ListGeneratedReports-${reportId}`,
    waiting: !!reportId,
  })

  const report = useMemo(() => {
    if (!reportApi.data) return null
    const list = Array.isArray(reportApi.data) ? reportApi.data : []
    return list.length > 0 ? list[0] : null
  }, [reportApi.data])

  const blocks = useMemo(() => {
    if (!report?.Blocks) return []
    try {
      const raw = typeof report.Blocks === 'string' ? JSON.parse(report.Blocks) : report.Blocks
      return Array.isArray(raw) ? raw : []
    } catch {
      return []
    }
  }, [report])

  const reportName = report?.TemplateName || 'Generated Report'
  const tenantName = report?.TenantFilter || 'Organization'

  const handleDownload = () => {
    import('@react-pdf/renderer').then(({ pdf }) => {
      const {
        ReportBuilderDocument,
      } = require('../../../../components/ReportBuilder/ReportBuilderPDF')
      const doc = (
        <ReportBuilderDocument
          blocks={blocks}
          tenantName={tenantName}
          templateName={reportName}
          brandingSettings={brandingSettings}
          generatedDate={report?.GeneratedAt}
        />
      )
      pdf(doc)
        .toBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `Report_${(tenantName || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        })
    })
  }

  const handleBackClick = () => {
    router.push('/tools/report-builder/generated')
  }

  if (!isReady) {
    return <div>Loading...</div>
  }

  if (!reportId) {
    return <div>Report ID is required</div>
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth={false}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton size="small" onClick={handleBackClick}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4">
                {reportApi.isFetching ? 'Loading...' : reportName}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              disabled={blocks.length === 0 || reportApi.isFetching}
            >
              Download PDF
            </Button>
          </Stack>
          <Divider />
          <Box sx={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
            {reportApi.isFetching ? (
              <Typography color="text.secondary">Loading report...</Typography>
            ) : report && blocks.length > 0 ? (
              <ReportBuilderPDF
                blocks={blocks}
                tenantName={tenantName}
                templateName={reportName}
                brandingSettings={brandingSettings}
                generatedDate={report?.GeneratedAt}
                mode="preview"
              />
            ) : (
              <Typography color="text.secondary">
                Report not found. It may have been deleted.
              </Typography>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
