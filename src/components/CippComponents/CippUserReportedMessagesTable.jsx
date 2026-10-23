import { useEffect, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
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

const columnFilters = (column, entries) =>
  entries.map(({ filterName, value }) => ({
    filterName,
    value: [{ id: column, value }],
    type: 'column',
    filterType: 'equal',
  }))

// Audit log: Microsoft's rescan verdict, the reported category there is an undocumented number
const auditLogFilters = columnFilters('ResultCategory', [
  { filterName: 'Verdict: Phish', value: 'Phish' },
  { filterName: 'Verdict: Spam', value: 'Spam' },
  { filterName: 'Verdict: Not Spam', value: 'NotSpam' },
])

// Defender Submissions (Graph): the submission category
const submissionFilters = columnFilters('Category', [
  { filterName: 'Reported as Phishing', value: 'phishing' },
  { filterName: 'Reported as Junk', value: 'spam' },
  { filterName: 'Reported as Malware', value: 'malware' },
  { filterName: 'Reported as Not Junk', value: 'notJunk' },
])

const sourceTips = {
  AuditLog:
    'Loaded from the unified audit log, two weeks at a time, up to 180 days back. New reports can take up to 90 minutes to show up.',
  Submissions:
    'Loaded from the Defender Submissions list. Microsoft only exposes submissions that reached Microsoft analysis, so Outlook reports often only show up here after an admin submits them to Microsoft.',
}

export const CippUserReportedMessagesTable = () => {
  const tenantFilter = useSettings().currentTenant
  // AuditLog: every Outlook report from the unified audit log. Submissions: the Defender Submissions list via Graph
  const [source, setSource] = useState('AuditLog')
  const queryKey = `UserReportedMessages-${tenantFilter}-${source}`

  // Defender's tid wants the tenant GUID. Same request as the tenant selector, so it shares that cache entry
  const tenantList = ApiGetCall({
    url: '/api/listTenants',
    data: { AllTenantSelector: true },
    queryKey: 'TenantSelector',
  })
  const tenantId = Array.isArray(tenantList.data)
    ? tenantList.data.find((t) => t.defaultDomainName === tenantFilter)?.customerId
    : undefined

  const sourceToggle = (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1, mt: '4px' }}>
      <ToggleButtonGroup
        value={source}
        exclusive
        size="small"
        onChange={(event, newSource) => {
          if (newSource !== null) setSource(newSource)
        }}
        sx={{ '& .MuiToggleButton-root': { py: 0.25, px: 1, fontSize: '0.75rem' } }}
      >
        <ToggleButton value="AuditLog" aria-label="audit log source">
          <Tooltip title="Every Outlook report, from the unified audit log" placement="top">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <CippIcons.DocumentMagnifyingGlassIcon
                style={{ width: 16, height: 16, marginRight: 6 }}
              />
              Audit Log
            </Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="Submissions" aria-label="defender submissions source">
          <Tooltip title="Submissions that reached Microsoft, from Defender" placement="top">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <CippIcons.ShieldCheckIcon style={{ width: 16, height: 16, marginRight: 6 }} />
              Submissions
            </Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )

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
    return {
      startDate: receivedSeconds - 86400,
      endDate: receivedSeconds + 86400,
    }
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
    'Source',
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
        // Remount per source: the table keeps applied column filters across query key changes, and the two sources
        // filter on different columns and values
        key={source}
        title="Quarantine - User Reported Messages"
        apiUrl="/api/ListUserReportedMessages"
        apiData={{ Source: source }}
        apiDataKey="Results"
        queryKey={queryKey}
        cardButton={sourceToggle}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={source === 'AuditLog' ? auditLogFilters : submissionFilters}
        tableFilter={
          <Alert severity="info">
            {sourceTips[source]}
            {tenantId && (
              <>
                {' '}
                <Link
                  href={`https://security.microsoft.com/reportsubmission?viewid=user&tid=${tenantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the user reported submissions in Defender
                </Link>
              </>
            )}
          </Alert>
        }
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
            <CippMessageViewer
              emailSource={data?.Message}
              emlBase64={data?.EmlBase64}
            />
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
