import { useEffect, useState } from 'react'
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Block, Close, Done, DoneAll } from '@mui/icons-material'
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  EyeIcon,
  FlagIcon,
  NoSymbolIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { CippTablePage } from './CippTablePage.jsx'
import { CippMessageViewer } from './CippMessageViewer.jsx'
import { CippQuarantineDetails } from './CippQuarantineDetails.jsx'
import { CippDataTable } from '../CippTable/CippDataTable'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'

const traceDetailColumns = ['Received', 'Status', 'SenderAddress', 'RecipientAddress']

const releaseStatusFilters = [
  {
    filterName: 'Not Released',
    value: [{ id: 'ReleaseStatus', value: 'NOTRELEASED' }],
    type: 'column',
    filterType: 'equal',
  },
  {
    filterName: 'Released',
    value: [{ id: 'ReleaseStatus', value: 'RELEASED' }],
    type: 'column',
    filterType: 'equal',
  },
  {
    filterName: 'Requested',
    value: [{ id: 'ReleaseStatus', value: 'REQUESTED' }],
    type: 'column',
    filterType: 'equal',
  },
]

const quarantineReasonFilters = [
  { filterName: 'High Confidence Phishing', value: 'HighConfPhish' },
  { filterName: 'Phishing', value: 'Phish' },
  { filterName: 'Spam', value: 'Spam' },
  { filterName: 'Malware', value: 'Malware' },
  { filterName: 'Bulk', value: 'Bulk' },
  { filterName: 'Transport Rule', value: 'TransportRule' },
].map(({ filterName, value }) => ({
  filterName,
  value: [{ id: 'Type', value }],
  type: 'column',
  filterType: 'equal',
}))

const pageTitles = {
  Email: 'Quarantine - Email',
  SharePointOnline: 'Quarantine - Files',
  Teams: 'Quarantine - Teams Messages',
}

export const CippQuarantineTable = ({ entityType = 'Email' }) => {
  const tenantFilter = useSettings().currentTenant
  const isEmail = entityType === 'Email'
  const queryKey = `MailQuarantine-${entityType}-${tenantFilter}`

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
  const [messageSubject, setMessageSubject] = useState(null)

  const messageTenant = resolveTenant(messageRow)
  const getMessageContents = ApiGetCall({
    url: '/api/ListMailQuarantineMessage',
    data: {
      tenantFilter: messageTenant,
      Identity: messageRow?.Identity,
    },
    waiting: Boolean(messageRow),
    queryKey: `ListMailQuarantineMessage-${messageTenant}-${messageRow?.Identity}`,
  })

  const headerTenant = resolveTenant(headerRow)
  const getMessageHeaders = ApiGetCall({
    url: '/api/ListMailQuarantineMessageHeader',
    data: {
      tenantFilter: headerTenant,
      Identity: headerRow?.Identity,
    },
    waiting: Boolean(headerRow),
    queryKey: `ListMailQuarantineMessageHeader-${headerTenant}-${headerRow?.Identity}`,
  })

  const downloadTenant = resolveTenant(downloadRow)
  const getMessageDownload = ApiGetCall({
    url: '/api/ListMailQuarantineMessage',
    data: {
      tenantFilter: downloadTenant,
      Identity: downloadRow?.Identity,
    },
    waiting: Boolean(downloadRow),
    queryKey: `ListMailQuarantineMessageDownload-${downloadTenant}-${downloadRow?.Identity}`,
  })

  const getMessageTraceDetails = ApiPostCall({
    urlFromData: true,
    queryKey: `MessageTraceDetail-${traceTenant}-${traceMessageId}`,
    onResult: (result) => {
      setTraceDetails(result)
    },
  })

  const viewMessage = (row) => {
    setMessageRow(row)
    setDialogOpen(true)
  }

  const viewHeaders = (row) => {
    setHeaderRow(row)
    setHeaderDialogOpen(true)
  }

  const downloadMessage = (row) => {
    setDownloadRow(row)
  }

  const viewMessageTrace = (row) => {
    const rowTenant = resolveTenant(row)
    setTraceTenant(rowTenant)
    setTraceMessageId(row.MessageId)
    getMessageTraceDetails.mutate({
      url: '/api/ListMessageTrace',
      data: {
        tenantFilter: rowTenant,
        messageId: row.MessageId,
      },
    })
    setMessageSubject(row.Subject)
    setTraceDialogOpen(true)
  }

  const openInDefender = (row) => {
    const networkMessageId = row.NetworkMessageId ?? row.Identity?.split('\\')[0]
    const recipient = Array.isArray(row.RecipientAddress)
      ? row.RecipientAddress[0]
      : row.RecipientAddress
    const receivedTime = row.ReceivedTime ? new Date(row.ReceivedTime).toISOString() : ''
    let url =
      `https://security.microsoft.com/emailentityV2?id=${encodeURIComponent(networkMessageId)}` +
      `&recipient=${encodeURIComponent(recipient ?? '')}` +
      `&startTime=${encodeURIComponent(receivedTime)}` +
      `&endTime=${encodeURIComponent(receivedTime)}` +
      `&contentonly=1` +
      `&subject=${encodeURIComponent(row.Subject ?? '')}` +
      `&entityId=${encodeURIComponent(`${networkMessageId}_${recipient ?? ''}`)}`
    if (row.CustomerId) {
      url += `&tid=${row.CustomerId}`
    }
    window.open(url, '_blank')
  }

  useEffect(() => {
    if (downloadRow && getMessageDownload.isSuccess && getMessageDownload.data?.Message) {
      const networkMessageId = downloadRow.NetworkMessageId ?? downloadRow.Identity?.split('\\')[0]
      const fileName = `${(downloadRow.Subject || networkMessageId || 'quarantined-message')
        .replace(/[\\/:*?"<>|]/g, '_')
        .slice(0, 100)}.eml`
      const blob = new Blob([getMessageDownload.data.Message], { type: 'message/rfc822' })
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
      label: 'Release',
      type: 'POST',
      url: '/api/ExecQuarantineManagement',
      multiPost: true,
      data: {
        Identity: 'Identity',
        Type: '!Release',
      },
      confirmText: 'Are you sure you want to release this message?',
      icon: <Done />,
      condition: (row) => row.ReleaseStatus !== 'RELEASED',
    },
    ...(isEmail
      ? [
          {
            label: 'Release & Allow Sender',
            type: 'POST',
            url: '/api/ExecQuarantineManagement',
            multiPost: true,
            data: {
              Identity: 'Identity',
              Type: '!Release',
              AllowSender: true,
              SenderAddress: 'SenderAddress',
              PolicyName: 'PolicyName',
            },
            confirmText:
              'Are you sure you want to release this email and add the sender to the whitelist?',
            icon: <DoneAll />,
            condition: (row) => row.ReleaseStatus !== 'RELEASED',
          },
          {
            label: 'Deny',
            type: 'POST',
            url: '/api/ExecQuarantineManagement',
            multiPost: true,
            data: {
              Identity: 'Identity',
              Type: '!Deny',
              RecipientAddress: 'RecipientAddress',
            },
            confirmText: 'Are you sure you want to deny this message?',
            icon: <Block />,
            condition: (row) => row.ReleaseStatus === 'REQUESTED',
          },
        ]
      : []),
    {
      label: 'Delete from Quarantine',
      type: 'POST',
      url: '/api/ExecQuarantineManagement',
      multiPost: true,
      data: {
        Identity: 'Identity',
        Type: '!Delete',
      },
      confirmText:
        'Are you sure you want to permanently delete this message from quarantine? This action cannot be undone.',
      icon: <TrashIcon />,
      color: 'danger',
      condition: (row) => row.ReleaseStatus !== 'RELEASED',
    },
    ...(isEmail
      ? [
          {
            label: 'Preview Message',
            noConfirm: true,
            customFunction: viewMessage,
            icon: <EyeIcon />,
            hideBulk: true,
          },
          {
            label: 'View Message Headers',
            noConfirm: true,
            customFunction: viewHeaders,
            icon: <CodeBracketIcon />,
            hideBulk: true,
          },
          {
            label: 'Download Message (.eml)',
            noConfirm: true,
            customFunction: downloadMessage,
            icon: <ArrowDownTrayIcon />,
            hideBulk: true,
          },
          {
            label: 'View Message Trace',
            noConfirm: true,
            customFunction: viewMessageTrace,
            icon: <DocumentTextIcon />,
            hideBulk: true,
          },
          {
            label: 'Submit to Microsoft for Review',
            type: 'POST',
            url: '/api/ExecMailQuarantineSubmit',
            data: {
              Identity: 'Identity',
              RecipientAddress: 'RecipientAddress',
            },
            fields: [
              {
                type: 'autoComplete',
                name: 'category',
                label: 'Submission category',
                multiple: false,
                creatable: false,
                options: [
                  { label: 'Clean - should not have been quarantined', value: 'notJunk' },
                  { label: 'Spam', value: 'spam' },
                  { label: 'Phishing', value: 'phishing' },
                  { label: 'Malware', value: 'malware' },
                ],
                validators: { required: 'Please select a category' },
              },
            ],
            confirmText: 'Submit "[Subject]" to Microsoft for analysis?',
            icon: <FlagIcon />,
            hideBulk: true,
          },
          {
            label: 'Block Sender',
            type: 'POST',
            url: '/api/AddTenantAllowBlockList',
            data: {
              tenantID: 'Tenant',
              entries: 'SenderAddress',
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
              'Block sender [SenderAddress] by adding an entry to the Tenant Allow/Block List?',
            icon: <NoSymbolIcon />,
          },
          {
            label: 'Open Email Entity in Defender',
            noConfirm: true,
            customFunction: openInDefender,
            icon: <ArrowTopRightOnSquareIcon />,
            hideBulk: true,
          },
        ]
      : []),
  ]

  const offCanvas = {
    size: 'lg',
    actions: actions,
    actionsPosition: 'bottom',
    children: (row) => <CippQuarantineDetails row={row} />,
  }

  const filterList = isEmail
    ? [...releaseStatusFilters, ...quarantineReasonFilters]
    : releaseStatusFilters

  const simpleColumns = [
    'ReceivedTime',
    'Subject',
    'SenderAddress',
    'Type',
    'ReleaseStatus',
    'PolicyType',
    'Expires',
    'RecipientAddress',
    'ReleasedUser',
    'Tenant',
  ]

  return (
    <>
      <CippTablePage
        title={pageTitles[entityType] ?? 'Quarantine Management'}
        apiUrl="/api/ListMailQuarantine"
        apiData={{ manualPagination: true, EntityType: entityType }}
        apiDataKey="Results"
        queryKey={queryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filterList}
      />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2 }}>
          Quarantine Message
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {getMessageContents.isSuccess ? (
            <CippMessageViewer emailSource={getMessageContents?.data?.Message} />
          ) : (
            <Skeleton variant="rectangular" height={400} />
          )}
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
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {getMessageHeaders.isSuccess ? (
            <Typography
              component="pre"
              variant="body2"
              sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
            >
              {getMessageHeaders?.data?.Header}
            </Typography>
          ) : (
            <Skeleton variant="rectangular" height={400} />
          )}
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
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {getMessageTraceDetails.isPending && (
            <Typography variant="body1" sx={{ py: 4 }}>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Loading message trace
              details...
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

export default CippQuarantineTable
