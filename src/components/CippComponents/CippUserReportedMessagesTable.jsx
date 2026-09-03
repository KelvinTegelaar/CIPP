import { useEffect, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { CippTablePage } from './CippTablePage.jsx'
import { CippMessageViewer } from './CippMessageViewer.jsx'
import { CippDataTable } from '../CippTable/CippDataTable'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { getCippError } from '../../utils/get-cipp-error'
import { useSettings } from '../../hooks/use-settings'

const traceDetailColumns = [
  'Received',
  'Status',
  'SenderAddress',
  'RecipientAddress',
]

const categoryFilters = [
  { filterName: 'Reported as Phishing', value: 'phishing' },
  { filterName: 'Reported as Junk', value: 'spam' },
  { filterName: 'Reported as Malware', value: 'malware' },
  { filterName: 'Reported as Not Junk', value: 'notJunk' },
].map(({ filterName, value }) => ({
  filterName,
  value: [{ id: 'Category', value }],
  type: 'column',
  filterType: 'equal',
}))

export const CippUserReportedMessagesTable = () => {
  const tenantFilter = useSettings().currentTenant
  const queryKey = `UserReportedMessages-${tenantFilter}`

  // In the AllTenants view each row belongs to a different tenant (row.Tenant); per-message
  // actions must target that tenant rather than the page-level "AllTenants" selection. Falls back
  // to the page tenant for the normal single-tenant view.
  const resolveTenant = (row) =>
    tenantFilter === 'AllTenants' ? (row?.Tenant ?? tenantFilter) : tenantFilter

  // Preview message dialog
  const [messageRow, setMessageRow] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Message headers dialog
  const [headerRow, setHeaderRow] = useState(null)
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false)

  // Download message state
  const [downloadRow, setDownloadRow] = useState(null)

  // Message trace dialog
  const [traceDialogOpen, setTraceDialogOpen] = useState(false)
  const [traceDetails, setTraceDetails] = useState([])
  const [traceMessageId, setTraceMessageId] = useState(null)
  const [traceTenant, setTraceTenant] = useState(null)
  const [traceWindow, setTraceWindow] = useState(null)
  const [messageSubject, setMessageSubject] = useState(null)

  // Graph's message trace window caps at 10 days and defaults to ~48h with none supplied,
  // so pin an explicit +/-1 day window around the message's received time when we have one.
  const getTraceWindow = (receivedTime) => {
    if (!receivedTime) return null
    const receivedMs = new Date(receivedTime).getTime()
    if (Number.isNaN(receivedMs)) return null
    const receivedSeconds = Math.floor(receivedMs / 1000)
    return { startDate: receivedSeconds - 86400, endDate: receivedSeconds + 86400 }
  }

  const contentParams = (row) => ({
    tenantFilter: resolveTenant(row),
    InternetMessageId: row?.InternetMessageId,
    RecipientEmail: row?.RecipientEmail,
    ReporterEmail: row?.ReporterEmail,
  })

  const messageTenant = resolveTenant(messageRow)
  const getMessageContents = ApiGetCall({
    url: '/api/ListUserReportedMessage',
    data: contentParams(messageRow),
    waiting: Boolean(messageRow),
    queryKey: `ListUserReportedMessage-${messageTenant}-${messageRow?.InternetMessageId}`,
  })

  const headerTenant = resolveTenant(headerRow)
  const getMessageHeaders = ApiGetCall({
    url: '/api/ListUserReportedMessage',
    data: contentParams(headerRow),
    waiting: Boolean(headerRow),
    queryKey: `ListUserReportedMessage-${headerTenant}-${headerRow?.InternetMessageId}`,
  })

  const downloadTenant = resolveTenant(downloadRow)
  const getMessageDownload = ApiGetCall({
    url: '/api/ListUserReportedMessage',
    data: contentParams(downloadRow),
    waiting: Boolean(downloadRow),
    queryKey: `ListUserReportedMessage-${downloadTenant}-${downloadRow?.InternetMessageId}`,
  })

  const getMessageTraceDetails = ApiPostCall({
    urlFromData: true,
    queryKey: `MessageTraceDetail-${traceTenant}-${traceMessageId}`,
    onResult: (result) => {
      setTraceDetails(result?.Results ?? result)
    },
  })

  // CippPropertyListCard calls customFunction(actionItem, rowData, {}); table rows call
  // customFunction(rowData). Accept both signatures by detecting which arg carries the message id.
  const resolveRow = (...args) =>
    args[0]?.InternetMessageId ? args[0] : args[1]

  const viewMessage = (...args) => {
    const row = resolveRow(...args)
    setMessageRow(row)
    setDialogOpen(true)
  }

  const viewHeaders = (...args) => {
    const row = resolveRow(...args)
    setHeaderRow(row)
    setHeaderDialogOpen(true)
  }

  const downloadMessage = (...args) => {
    const row = resolveRow(...args)
    setDownloadRow(row)
  }

  const viewMessageTrace = (...args) => {
    const row = resolveRow(...args)
    const rowTenant = resolveTenant(row)
    const window = getTraceWindow(row.ReceivedDateTime)
    setTraceTenant(rowTenant)
    setTraceMessageId(row.InternetMessageId)
    setTraceWindow(window)
    getMessageTraceDetails.mutate({
      url: '/api/ListMessageTrace',
      data: {
        tenantFilter: rowTenant,
        messageId: row.InternetMessageId,
        ...(window ?? {}),
      },
    })
    setMessageSubject(row.Subject)
    setTraceDialogOpen(true)
  }

  useEffect(() => {
    if (
      downloadRow &&
      getMessageDownload.isSuccess &&
      getMessageDownload.data?.Message
    ) {
      const fileName = `${(
        downloadRow.Subject ||
        downloadRow.InternetMessageId ||
        'user-reported-message'
      )
        .replace(/[\\/:*?"<>|]/g, '_')
        .slice(0, 100)}.eml`
      // Use the raw base64 export when available to preserve non-UTF-8 MIME content
      const emlBase64 = getMessageDownload.data.EmlBase64
      let blob
      if (emlBase64) {
        const bytes = Uint8Array.from(atob(emlBase64), (c) => c.charCodeAt(0))
        blob = new Blob([bytes], { type: 'message/rfc822' })
      } else {
        blob = new Blob([getMessageDownload.data.Message], {
          type: 'message/rfc822',
        })
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
      setDownloadRow(null)
    }
  }, [getMessageDownload.isSuccess, getMessageDownload.data, downloadRow])

  const actions = [
    {
      label: 'Preview Message',
      noConfirm: true,
      customFunction: viewMessage,
      icon: <CippIcons.EyeIcon />,
      hideBulk: true,
      condition: (row) => Boolean(row.InternetMessageId),
    },
    {
      label: 'View Message Headers',
      noConfirm: true,
      customFunction: viewHeaders,
      icon: <CippIcons.CodeBracketIcon />,
      hideBulk: true,
      condition: (row) => Boolean(row.InternetMessageId),
    },
    {
      label: 'Download Message (.eml)',
      noConfirm: true,
      customFunction: downloadMessage,
      icon: <CippIcons.ArrowDownTrayIcon />,
      hideBulk: true,
      condition: (row) => Boolean(row.InternetMessageId),
    },
    {
      label: 'View Message Trace',
      noConfirm: true,
      customFunction: viewMessageTrace,
      icon: <CippIcons.DocumentTextIcon />,
      hideBulk: true,
      condition: (row) => Boolean(row.InternetMessageId),
    },
    {
      label: 'Block Sender',
      type: 'POST',
      url: '/api/AddTenantAllowBlockList',
      data: {
        tenantID: 'Tenant',
        entries: 'Sender',
        listType: '!Sender',
        listMethod: '!Block',
      },
      fields: [
        {
          type: 'switch',
          name: 'NoExpiration',
          label: 'Never expire (default: expires after 30 days)',
        },
        {
          type: 'textField',
          name: 'notes',
          label: 'Notes (optional)',
        },
      ],
      confirmText:
        'Block sender [Sender] by adding an entry to the Tenant Allow/Block List?',
      icon: <CippIcons.NoSymbolIcon />,
      condition: (row) => Boolean(row.Sender),
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'ReportedDateTime',
      'ReceivedDateTime',
      'Subject',
      'Sender',
      'SenderIP',
      'RecipientEmail',
      'ReportedBy',
      'ReporterEmail',
      'Category',
      'OriginalCategory',
      'Status',
      'ResultCategory',
      'ResultDetail',
      'AdminReviewResult',
      'InternetMessageId',
    ],
    actions: actions,
  }

  const simpleColumns = [
    'ReportedDateTime',
    'Subject',
    'Sender',
    'RecipientEmail',
    'ReportedBy',
    'Category',
    'Status',
    'ResultCategory',
    'Tenant',
  ]

  const messageDialogContent = (request, render) => {
    if (request.isSuccess) return render(request.data)
    if (request.isError) {
      return (
        <Typography variant="body2" color="error">
          {getCippError(request.error)}
        </Typography>
      )
    }
    return <Skeleton variant="rectangular" height={400} />
  }

  return (
    <>
      <CippTablePage
        title="Quarantine - User Reported Messages"
        apiUrl="/api/ListUserReportedMessages"
        apiDataKey="Results"
        queryKey={queryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={categoryFilters}
      />
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ py: 2 }}>
          User Reported Message
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CippIcons.Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {messageDialogContent(getMessageContents, (data) => (
            <CippMessageViewer emailSource={data?.Message} />
          ))}
        </DialogContent>
      </Dialog>
      <Dialog
        open={headerDialogOpen}
        onClose={() => setHeaderDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ py: 2 }}>
          Message Headers - {headerRow?.Subject}
          <IconButton
            aria-label="close"
            onClick={() => setHeaderDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CippIcons.Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {messageDialogContent(getMessageHeaders, (data) => (
            <Typography
              component="pre"
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {data?.Header}
            </Typography>
          ))}
        </DialogContent>
      </Dialog>
      <Dialog
        open={traceDialogOpen}
        onClose={() => setTraceDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ py: 2 }}>
          Message Trace - {messageSubject}
          <IconButton
            aria-label="close"
            onClick={() => setTraceDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CippIcons.Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {getMessageTraceDetails.isPending && (
            <Typography variant="body1" sx={{ py: 4 }}>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />{' '}
              Loading message trace details...
            </Typography>
          )}
          {getMessageTraceDetails.isSuccess && (
            <CippDataTable
              noCard={true}
              title="Message Trace Details"
              simpleColumns={traceDetailColumns}
              data={traceDetails ?? []}
              refreshFunction={() =>
                getMessageTraceDetails.mutate({
                  url: '/api/ListMessageTrace',
                  data: {
                    tenantFilter: traceTenant,
                    messageId: traceMessageId,
                    ...(traceWindow ?? {}),
                  },
                })
              }
              isFetching={getMessageTraceDetails.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CippUserReportedMessagesTable
