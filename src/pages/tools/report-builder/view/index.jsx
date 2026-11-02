import { useState, useEffect, useMemo } from 'react'
import { CippIcons } from '../../../../utils/icon-registry'
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
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../api/ApiCall.jsx'
import {
  ServerPdfPane,
  useServerPdf,
} from '../../../../components/CippPdf/useServerPdf'
import { useRouter } from 'next/router'

// The PDF is rendered server-side now (CIPPSharp/OfficeIMO) and fetched as a finished file, so this
// page no longer builds it in the browser — it lists the report for its name/status, then streams the
// stored PDF from ExecGetReportBuilderPdf into an iframe for preview and an anchor for download.
const Page = () => {
  const router = useRouter()
  const [reportId, setReportId] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const settings = useSettings()

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

  const reportName = report?.TemplateName || 'Generated Report'
  const tenantName = report?.TenantFilter || 'Organization'

  // The stored PDF, fetched as soon as the id is known; one object URL serves the iframe and the download.
  const pdf = useServerPdf({
    url: `/api/ExecGetReportBuilderPdf?id=${encodeURIComponent(reportId)}`,
    enabled: !!reportId,
  })
  const handleDownload = () =>
    pdf.download(
      `Report_${(tenantName || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    )

  const handleBackClick = () => {
    router.push('/tools/report-builder/generated')
  }

  if (!isReady || reportApi.isFetching) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="text" width={250} height={40} />
              </Stack>
              <Skeleton variant="rounded" width={140} height={36} />
            </Stack>
            <Divider />
            <Box sx={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="rounded" width="100%" height={200} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="rounded" width="100%" height={150} />
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
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton size="small" onClick={handleBackClick}>
                <CippIcons.ArrowBack />
              </IconButton>
              <Typography variant="h4">{reportName}</Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<CippIcons.Download />}
              onClick={handleDownload}
              disabled={!pdf.pdfUrl}
            >
              Download PDF
            </Button>
          </Stack>
          <Divider />
          <Box sx={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
            {!report ? (
              <Typography sx={{ color: 'text.secondary' }}>
                Report not found. It may have been deleted.
              </Typography>
            ) : pdf.error === 404 ? (
              <Typography sx={{ color: 'text.secondary' }}>
                This report has no rendered PDF. Regenerate it to produce one.
              </Typography>
            ) : (
              <ServerPdfPane
                {...pdf}
                title="Report preview"
                errorText="The report PDF could not be loaded."
              />
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
