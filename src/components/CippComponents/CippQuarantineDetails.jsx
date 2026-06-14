import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { CippPropertyList } from './CippPropertyList'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import { getCippFormatting } from '../../utils/get-cipp-formatting'
import { ApiGetCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'

// Convert camelCase/underscore Graph enum values to readable text, e.g. 'softFail' -> 'Soft fail'
const formatEnum = (value) => {
  if (typeof value !== 'string' || value === '') return value
  const spaced = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

const releaseStatusLabels = {
  NOTRELEASED: 'Not released',
  RELEASED: 'Released',
  REQUESTED: 'Release requested',
  DENIED: 'Release denied',
  PREPARING: 'Preparing',
  ERROR: 'Error',
}

const joinList = (value) => (Array.isArray(value) ? value.filter(Boolean).join(', ') : value)

const threatChipColor = (threatType) => {
  // Match on substrings: the same threat arrives in different forms depending on the source,
  // e.g. 'HighConfPhish' (enum) vs 'High Confidence Phish' (Exchange display value).
  const threat = String(threatType ?? '').toLowerCase()
  if (!threat) return 'default'
  if (threat.includes('malware') || threat.includes('phish')) return 'error'
  if (threat.includes('spam') || threat.includes('bulk')) return 'warning'
  return 'default'
}

const formatBytes = (bytes) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return bytes
  if (bytes < 1024) return `${bytes} B`
  let value = bytes
  let unit = 'B'
  for (const nextUnit of ['KB', 'MB', 'GB']) {
    value = value / 1024
    unit = nextUnit
    if (value < 1024) break
  }
  return `${value.toFixed(1)} ${unit}`
}

const hasValue = (value) => {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

const buildProperties = (fields) =>
  fields
    .filter(({ value }) => hasValue(value))
    .map(({ label, value, field }) => ({
      label,
      value: field ? getCippFormatting(value, field) : value,
    }))

const Section = ({ title, isFetching = false, fields, children, defaultExpanded = true }) => {
  // While fetching, show label-only skeleton rows; otherwise drop empty fields entirely
  const propertyItems = fields
    ? isFetching
      ? fields.map(({ label }) => ({ label }))
      : buildProperties(fields)
    : []
  if (!isFetching && propertyItems.length === 0 && !children) return null
  return (
    <Accordion
      variant="outlined"
      disableGutters
      defaultExpanded={defaultExpanded}
      sx={{ '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle1">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, pb: 1 }}>
        {children ?? (
          <CippPropertyList
            align="vertical"
            layout="double"
            copyItems
            showDivider={false}
            isFetching={isFetching}
            propertyItems={propertyItems}
          />
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export const CippQuarantineDetails = ({ row }) => {
  const currentTenant = useSettings().currentTenant
  // The Defender lookup must target the tenant the message belongs to (AllTenants view)
  const tenantFilter = row?.Tenant ?? currentTenant
  const isEmail = (row?.EntityType ?? 'Email') === 'Email'
  const networkMessageId = row?.NetworkMessageId ?? row?.Identity?.split('\\')[0]
  const recipient = Array.isArray(row?.RecipientAddress)
    ? row.RecipientAddress[0]
    : row?.RecipientAddress

  const details = ApiGetCall({
    url: '/api/ListMailQuarantineMessageDetails',
    data: {
      tenantFilter: tenantFilter,
      NetworkMessageId: networkMessageId,
      RecipientAddress: recipient,
      ReceivedTime: row?.ReceivedTime,
      Identity: row?.Identity,
    },
    waiting: Boolean(row && isEmail && networkMessageId && tenantFilter),
    queryKey: `QuarantineMessageDetails-${tenantFilter}-${networkMessageId}-${recipient}`,
  })

  if (!row) return null

  const analyzed =
    details.data?.Results?.find(
      (entry) => entry.recipientEmailAddress?.toLowerCase() === recipient?.toLowerCase()
    ) ?? details.data?.Results?.[0]
  const isEnriching = isEmail && details.isFetching
  const enrichmentUnavailable = isEmail && details.isSuccess && !analyzed
  const headerFallback = isEmail && details.data?.Metadata?.Source === 'Headers'

  const quarantineFields = [
    { label: 'Received', value: row.ReceivedTime, field: 'ReceivedTime' },
    { label: 'Expires', value: row.Expires, field: 'Expires' },
    { label: 'Subject', value: row.Subject },
    { label: 'Quarantine Reason', value: row.Type },
    { label: 'Policy Type', value: row.PolicyType },
    { label: 'Policy Name', value: row.PolicyName },
    { label: 'Release Status', value: releaseStatusLabels[row.ReleaseStatus] ?? row.ReleaseStatus },
    { label: 'Released By', value: row.ReleasedUser, field: 'ReleasedUser' },
    { label: 'Quarantined User', value: row.QuarantinedUser, field: 'QuarantinedUser' },
    { label: 'Reported', value: row.Reported, field: 'Reported' },
    { label: 'Override Sources', value: joinList(analyzed?.overrideSources?.map(formatEnum)) },
  ]

  const deliveryFields = [
    { label: 'Original Threats', value: analyzed?.originalDelivery?.originalThreats },
    { label: 'Latest Threats', value: analyzed?.latestDelivery?.latestThreats },
    { label: 'Original Location', value: formatEnum(analyzed?.originalDelivery?.location) },
    { label: 'Latest Delivery Location', value: formatEnum(analyzed?.latestDelivery?.location) },
    { label: 'Delivery Action', value: formatEnum(analyzed?.originalDelivery?.action) },
    { label: 'Latest Delivery Action', value: formatEnum(analyzed?.latestDelivery?.action) },
    { label: 'Detection Technologies', value: joinList(analyzed?.detectionMethods) },
    {
      label: 'Threat Types',
      value: joinList(
        analyzed?.threatTypes
          ?.filter((threat) => !['none', 'unknown'].includes(threat))
          .map(formatEnum)
      ),
    },
    { label: 'Primary Override Source', value: formatEnum(analyzed?.primaryOverrideSource) },
    { label: 'Policy Action', value: formatEnum(analyzed?.policyAction) },
    { label: 'Phish Confidence Level', value: analyzed?.phishConfidenceLevel },
    { label: 'Spam Confidence Level', value: analyzed?.spamConfidenceLevel },
    { label: 'Bulk Complaint Level', value: analyzed?.bulkComplaintLevel },
  ]

  const emailFields = [
    { label: 'Sender Display Name', value: analyzed?.senderDetail?.displayName },
    {
      label: 'Sender Address',
      value: analyzed?.senderDetail?.mailFromAddress ?? row.SenderAddress,
    },
    { label: 'Sender Mail From Address', value: analyzed?.senderDetail?.fromAddress },
    { label: 'Return Path', value: analyzed?.returnPath },
    { label: 'Sender IP', value: analyzed?.senderDetail?.ipv4 },
    { label: 'Sender Location', value: analyzed?.senderDetail?.location },
    { label: 'Recipient(s)', value: row.RecipientAddress, field: 'RecipientAddress' },
    { label: 'Distribution List', value: analyzed?.distributionList },
    { label: 'Direction', value: formatEnum(analyzed?.directionality) ?? row.Direction },
    { label: 'Network Message ID', value: networkMessageId },
    { label: 'Internet Message ID', value: analyzed?.internetMessageId ?? row.MessageId },
    { label: 'Size', value: row.Size, field: 'Size' },
    { label: 'Language', value: analyzed?.language },
    { label: 'Entity Type', value: row.EntityType },
    { label: 'Teams Conversation Type', value: row.TeamsConversationType },
  ]

  const authenticationFields = [
    { label: 'DMARC', value: formatEnum(analyzed?.authenticationDetails?.dmarc) },
    { label: 'DKIM', value: formatEnum(analyzed?.authenticationDetails?.dkim) },
    { label: 'SPF', value: formatEnum(analyzed?.authenticationDetails?.senderPolicyFramework) },
    {
      label: 'Composite Authentication',
      value: formatEnum(analyzed?.authenticationDetails?.compositeAuthentication),
    },
  ]

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Stack spacing={1} sx={{ px: 1 }}>
        <Typography variant="h6">{row.Subject}</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {hasValue(row.Type) && (
            <Chip
              size="small"
              variant="outlined"
              color={threatChipColor(row.Type)}
              label={row.Type}
            />
          )}
          {hasValue(row.ReleaseStatus) && (
            <Chip
              size="small"
              variant="outlined"
              label={releaseStatusLabels[row.ReleaseStatus] ?? row.ReleaseStatus}
            />
          )}
          {analyzed?.attachments?.length > 0 && (
            <Chip
              size="small"
              variant="outlined"
              label={`${analyzed.attachments.length} attachment${
                analyzed.attachments.length === 1 ? '' : 's'
              }`}
            />
          )}
          {analyzed?.urls?.length > 0 && (
            <Chip
              size="small"
              variant="outlined"
              label={`${analyzed.urls.length} link${analyzed.urls.length === 1 ? '' : 's'}`}
            />
          )}
        </Stack>
        {enrichmentUnavailable && (
          <Typography variant="caption" color="text.secondary">
            Extended threat details are unavailable for this message (requires Microsoft Defender
            for Office 365).
          </Typography>
        )}
        {headerFallback && (
          <Typography variant="caption" color="text.secondary">
            Showing details parsed from the message headers and message contents. Microsoft per-URL
            and per-attachment threat verdicts require Microsoft Defender for Office 365 Plan 2.
          </Typography>
        )}
      </Stack>
      <Stack>
        <Section title="Quarantine Details" fields={quarantineFields} />
        <Section title="Delivery Details" fields={deliveryFields} isFetching={isEnriching} />
        <Section
          title={isEmail ? 'Email Details' : 'Item Details'}
          fields={emailFields}
          isFetching={isEnriching}
        />
        <Section title="Authentication" fields={authenticationFields} isFetching={isEnriching} />
        {analyzed?.urls?.length > 0 && (
          <Section title={`URLs (${analyzed.urls.length})`}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Threat</TableCell>
                  <TableCell>Detection Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyzed.urls.map((urlEntry, index) => (
                  <TableRow key={`${urlEntry.url}-${index}`}>
                    <TableCell sx={{ wordBreak: 'break-all' }}>
                      {urlEntry.url}
                      <CippCopyToClipBoard text={urlEntry.url} type="button" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={threatChipColor(urlEntry.threatType)}
                        label={formatEnum(urlEntry.threatType) ?? 'Unknown'}
                      />
                    </TableCell>
                    <TableCell>{urlEntry.detectionMethod}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        )}
        {analyzed?.attachments?.length > 0 && (
          <Section title={`Attachments (${analyzed.attachments.length})`}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Threat</TableCell>
                  <TableCell>Malware Family</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>SHA256</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyzed.attachments.map((attachment, index) => (
                  <TableRow key={`${attachment.fileName}-${index}`}>
                    <TableCell sx={{ wordBreak: 'break-all' }}>{attachment.fileName}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={threatChipColor(attachment.threatType)}
                        label={formatEnum(attachment.threatType) ?? 'Unknown'}
                      />
                    </TableCell>
                    <TableCell>{attachment.malwareFamily}</TableCell>
                    <TableCell>{formatBytes(attachment.fileSize)}</TableCell>
                    <TableCell>
                      {attachment.sha256 && (
                        <CippCopyToClipBoard text={attachment.sha256} type="button" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        )}
      </Stack>
    </Stack>
  )
}

export default CippQuarantineDetails
