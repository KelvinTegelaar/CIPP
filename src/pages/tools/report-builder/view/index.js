import { useState, useEffect, useMemo } from 'react'
import {
  Button,
  Typography,
  IconButton,
  Container,
  Divider,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material'
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
    url: '/api/ListGeneratedReports?tenantFilter=' + settings.currentTenant,
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

  // Page setup saved with the report. Reports generated before it existed have none, and the
  // renderer's defaults reproduce exactly how they used to look.
  const reportSettings = useMemo(() => {
    if (!report?.Settings) return null
    try {
      return typeof report.Settings === 'string' ? JSON.parse(report.Settings) : report.Settings
    } catch {
      return null
    }
  }, [report])

  const brandingPresetsApi = ApiGetCall({
    url: '/api/ListBrandingPresets',
    data: { includeImages: true },
    queryKey: 'ListBrandingPresets-withImages',
    waiting: !!reportSettings?.brandingPresetId,
  })

  // A report rendered against a preset keeps rendering against it. If the preset has since been
  // deleted the global settings stand in, which is a visible change but still a branded report.
  const effectiveBranding = useMemo(() => {
    const presetId = reportSettings?.brandingPresetId
    if (!presetId) return brandingSettings
    const presets = Array.isArray(brandingPresetsApi.data) ? brandingPresetsApi.data : []
    return presets.find((preset) => preset.id === presetId) || brandingSettings
  }, [reportSettings, brandingPresetsApi.data, brandingSettings])

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
          brandingSettings={effectiveBranding}
          reportSettings={reportSettings}
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

  if (!isReady || reportApi.isFetching) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            {/* Header skeleton */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="text" width={250} height={40} />
              </Stack>
              <Skeleton variant="rounded" width={140} height={36} />
            </Stack>
            <Divider />
            {/* Report content skeleton */}
            <Box sx={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="rounded" width="100%" height={200} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="rounded" width="100%" height={150} />
                    <Skeleton variant="text" width="85%" />
                    <Skeleton variant="text" width="75%" />
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Container>
      </Box>
    )
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
              <Typography variant="h4">{reportName}</Typography>
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
            {report && blocks.length > 0 ? (
              <ReportBuilderPDF
                blocks={blocks}
                tenantName={tenantName}
                templateName={reportName}
                brandingSettings={effectiveBranding}
                reportSettings={reportSettings}
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
