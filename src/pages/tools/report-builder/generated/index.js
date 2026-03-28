import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { Delete, Close, Download, OpenInNew } from '@mui/icons-material'
import { useSettings } from '../../../../hooks/use-settings'
import { ReportBuilderPDF } from '../../../../components/ReportBuilder/ReportBuilderPDF'
import tabOptions from '../tabOptions.json'

const Page = () => {
  const settings = useSettings()
  const { currentTenant } = settings
  const brandingSettings = settings.customBranding

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewBlocks, setPreviewBlocks] = useState([])
  const [previewName, setPreviewName] = useState('')
  const [previewTenant, setPreviewTenant] = useState('')

  const handleViewReport = (row) => {
    let blocks = []
    try {
      const raw = typeof row.Blocks === 'string' ? JSON.parse(row.Blocks) : row.Blocks
      blocks = raw || []
    } catch {
      blocks = []
    }
    setPreviewBlocks(blocks)
    setPreviewName(row.TemplateName || 'Generated Report')
    setPreviewTenant(row.TenantFilter || currentTenant || 'Organization')
    setPreviewOpen(true)
  }

  const handleDownload = () => {
    import('@react-pdf/renderer').then(({ pdf }) => {
      const {
        ReportBuilderDocument,
      } = require('../../../../components/ReportBuilder/ReportBuilderPDF')
      const doc = (
        <ReportBuilderDocument
          blocks={previewBlocks}
          tenantName={previewTenant}
          templateName={previewName}
          brandingSettings={brandingSettings}
        />
      )
      pdf(doc)
        .toBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `Report_${(previewTenant || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        })
    })
  }

  const actions = [
    {
      label: 'View Report',
      icon: <OpenInNew />,
      noConfirm: true,
      customFunction: handleViewReport,
    },
    {
      label: 'Delete',
      type: 'POST',
      url: '/api/ExecGenerateReportBuilderReport',
      data: { Action: 'delete', ReportGUID: 'RowKey' },
      confirmText: 'Are you sure you want to delete this generated report?',
      icon: <Delete />,
      multiPost: false,
    },
  ]

  const offCanvas = {
    extendedInfoFields: ['TemplateName', 'TenantFilter', 'GeneratedAt', 'Status'],
    actions,
  }

  return (
    <>
      <CippTablePage
        title="Generated Reports"
        tenantInTitle={false}
        apiUrl="/api/ListGeneratedReports"
        queryKey={`${currentTenant}-ListGeneratedReports`}
        simpleColumns={['TemplateName', 'TenantFilter', 'GeneratedAt', 'Status', 'Sections']}
        actions={actions}
        offCanvas={offCanvas}
      />

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '95vh', maxHeight: '95vh' } }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">{previewName}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {previewOpen && (
            <ReportBuilderPDF
              blocks={previewBlocks}
              tenantName={previewTenant}
              templateName={previewName}
              brandingSettings={brandingSettings}
              mode="preview"
            />
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" startIcon={<Download />} onClick={handleDownload}>
            Download PDF
          </Button>
          <Button onClick={() => setPreviewOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
