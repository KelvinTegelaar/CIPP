import { useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CippPdfPreview } from './CippPdfPreview'
import {
  AlertBox,
  Bold,
  BulletList,
  ClearBox,
  ContentPage,
  CoverMeta,
  DataTable,
  DonutChart,
  InfoBox,
  Paragraph,
  REPORT_COLOURS,
  ReportDocument,
  Section,
  StatRow,
  TrendChart,
  severityColour,
} from './index'
import { useReportVariables } from './useReportVariables'
import { useBrandingSettings } from './useBrandingSettings'

const nz = (value) => Number(value ?? 0)
const num = (value) => nz(value).toLocaleString()
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0)

// Get-MailFlowStatusReport event types, in the order they read as a funnel: delivered mail first,
// then the things that stopped mail, worst last.
const DISPOSITIONS = [
  { key: 'GoodMail', label: 'Good mail' },
  { key: 'TransportRules', label: 'Transport rules' },
  { key: 'SpamDetections', label: 'Spam' },
  { key: 'EdgeBlockSpam', label: 'Edge blocked spam' },
  { key: 'EmailPhish', label: 'Phish' },
  { key: 'EmailMalware', label: 'Malware' },
]

/**
 * Grades mail hygiene from the share of the window's mail that each threat class accounts for.
 *
 * Shares rather than counts, because a raw count of blocked phish means nothing without the volume
 * it was drawn from. Malware and phish are weighted far harder than spam: spam is nuisance traffic
 * every tenant carries, while a targeted-payload rate above roughly one percent of all mail means
 * the organisation is being actively worked on rather than incidentally scraped.
 */
const assessHygiene = (totals, totalMail) => {
  if (totalMail <= 0) return { level: 'Good', severity: 'low' }
  const targeted = pct(nz(totals.EmailMalware) + nz(totals.EmailPhish), totalMail)
  const spam = pct(nz(totals.SpamDetections) + nz(totals.EdgeBlockSpam), totalMail)

  if (targeted > 1 || spam > 25) return { level: 'Attention Needed', severity: 'high' }
  if (targeted > 0.25 || spam > 10) return { level: 'Fair', severity: 'medium' }
  return { level: 'Good', severity: 'low' }
}

// Exported so the branding preview can render this report against sample data, and so tests can
// render it to a real PDF.
export const MailFlowReportDocument = ({
  mailFlowData,
  brandingSettings,
  tenantName,
  generatedOn,
  variables,
}) => {
  const days = nz(mailFlowData?.days) || 14
  const totals = mailFlowData?.totals ?? {}
  const directionTotals = mailFlowData?.directionTotals ?? {}
  const daily = mailFlowData?.daily ?? []
  const topSenders = mailFlowData?.topSenders ?? []
  const topSpamRecipients = mailFlowData?.topSpamRecipients ?? []

  const totalMail = DISPOSITIONS.reduce((sum, item) => sum + nz(totals[item.key]), 0)
  const goodMailPct = pct(nz(totals.GoodMail), totalMail)
  const phish = nz(totals.EmailPhish)
  const malware = nz(totals.EmailMalware)
  const threats = phish + malware
  const transportRules = nz(totals.TransportRules)

  const hygiene = assessHygiene(totals, totalMail)
  const hygieneColour = severityColour(hygiene.severity)

  const dayLabel = (value) =>
    value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''

  const volumeSeries = daily.map((row) => ({
    label: dayLabel(row.date),
    value: DISPOSITIONS.reduce((sum, item) => sum + nz(row[item.key]), 0),
  }))

  const directionSeries = [
    { label: 'Inbound', value: nz(directionTotals.Inbound) },
    { label: 'Outbound', value: nz(directionTotals.Outbound) },
    { label: 'Intra-org', value: nz(directionTotals.IntraOrg) },
  ]

  // Numbered after filtering, so a report that drops a conditional action still counts from one.
  const priorityActions = [
    threats > 0 && {
      label: 'Review anti-phishing and anti-malware policy strength.',
      text: `${num(threats)} messages were blocked as phishing or malware in this window. Confirm the tenant is on the current preset security policies, that impersonation protection lists the people who would actually be impersonated, and that Safe Links and Safe Attachments cover every mailbox rather than a pilot group.`,
    },
    topSpamRecipients.length > 0 && {
      label: 'Give the most-targeted users stronger protection.',
      text: 'The recipients listed in this report absorb a disproportionate share of unwanted mail. Priority accounts, tighter quarantine policy and a short conversation about what they are receiving cost little and are aimed exactly where the traffic is going.',
    },
    {
      label: 'Verify SPF, DKIM and DMARC are published and enforcing.',
      text: 'These records decide whether mail claiming to be from the domain is accepted elsewhere. A DMARC policy left at p=none reports abuse without stopping it, which means the organisation can be impersonated to its own customers regardless of how well inbound filtering performs.',
    },
    transportRules > 0 && {
      label: 'Audit the transport rules acting on mail.',
      text: `Transport rules handled ${num(transportRules)} messages here. Rules accumulate, outlive the reason they were written, and silently override filtering decisions — confirm each one is still wanted and that none bypasses protection for a sender that no longer needs the exception.`,
    },
  ]
    .filter(Boolean)
    .map((item, index) => ({ ...item, marker: `${index + 1}.` }))

  const dispositionRows = DISPOSITIONS.map((item) => ({
    disposition: item.label,
    messages: num(totals[item.key]),
    share: `${pct(nz(totals[item.key]), totalMail)}%`,
  }))

  return (
    <ReportDocument
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      reportName="Mail Flow Report"
      generatedOn={generatedOn}
      variables={variables}
      coverLabel="Email Traffic Review"
      coverTitle="Mail Flow"
      coverAccent="Report"
      coverSubtitle={`Where email at ${tenantName} came from over the last ${days} days, how much of it was delivered, and what was stopped before it reached a mailbox.`}
      coverFallbackImage="/reportImages/city.jpg"
      coverFooterNote="Confidential — For Internal Use Only"
      footerLabel={`${tenantName} — Mail Flow`}
      coverMeta={
        <CoverMeta
          lines={[
            `${num(totalMail)} messages · ${goodMailPct}% delivered · ${num(threats)} threats caught`,
          ]}
          note={`Mail hygiene: ${hygiene.level}`}
        />
      }
    >
      {/* EXECUTIVE SUMMARY */}
      <ContentPage title="Executive Summary" subtitle={`Email traffic over the last ${days} days`}>
        <Section>
          <Paragraph>
            Every message entering or leaving the organisation is given a disposition — delivered,
            held by a transport rule, filtered as spam, or blocked as phishing or malware. Those
            dispositions are the clearest single measure of what the mail environment is being asked
            to handle, because they count what the filters actually did rather than what they are
            configured to do. This report covers the last {days} days of mail flow at{' '}
            <Bold>{tenantName}</Bold>.
          </Paragraph>

          <StatRow
            stats={[
              { value: num(totalMail), label: 'Total Messages' },
              { value: `${goodMailPct}%`, label: 'Delivered Clean' },
              {
                value: num(phish),
                label: 'Phish Blocked',
                colour: phish > 0 ? REPORT_COLOURS.warning : undefined,
              },
              {
                value: num(malware),
                label: 'Malware Blocked',
                colour: malware > 0 ? REPORT_COLOURS.danger : undefined,
              },
            ]}
          />

          <AlertBox title={`Mail Hygiene: ${hygiene.level}`} colour={hygieneColour}>
            {hygiene.level === 'Attention Needed' &&
              'Threat traffic is a material share of total mail. At this rate the organisation is being targeted rather than incidentally caught by bulk campaigns, and the filters are absorbing volume that protection policy and user awareness should be reducing at source. Treat the recommendations as current work.'}
            {hygiene.level === 'Fair' &&
              'Threats are being caught at a level that is normal for an organisation of this profile, but not negligible. The filtering is working; the value now is in checking which users absorb most of it and whether their protection matches their exposure.'}
            {hygiene.level === 'Good' &&
              'Threat traffic is a small fraction of total mail and is being stopped before delivery. Nothing here needs action beyond keeping the review cadence, since a change in this profile is usually the first visible sign of a campaign starting.'}
          </AlertBox>
        </Section>

        <Section title="Scope of This Review">
          <InfoBox title="What this data is">
            Figures come from Microsoft's mail flow status report for the tenant, aggregated as daily
            counts per disposition and direction. It is a count of messages, not a record of them:
            individual senders, subjects and recipients are not part of this data set, and a message
            appears once under the disposition that was applied to it.
          </InfoBox>
          <InfoBox title="What it does not show">
            A blocked message is a filter working, not an incident. Nothing here indicates that a
            threat reached a user or that an account was compromised — that requires message trace
            and sign-in data, which are reviewed separately. Equally, a clean result does not prove
            nothing got through; it proves nothing was recognised.
          </InfoBox>
        </Section>
      </ContentPage>

      {/* VOLUME & DISPOSITIONS */}
      <ContentPage title="Volume & Dispositions" subtitle="How much mail, and what happened to it">
        <Section title="Daily Volume">
          <Paragraph>
            Total messages handled per day across every disposition. Steady volume with occasional
            peaks is normal; a sustained step change usually reflects a business event — a campaign,
            an onboarding, a new integration — and is worth being able to explain.
          </Paragraph>
          <TrendChart
            data={volumeSeries}
            title="Messages per day"
            caption={`${num(totalMail)} messages over ${days} days`}
            emptyText="No daily mail flow data available for this window."
          />
        </Section>

        <Section title="Dispositions">
          <Paragraph>
            The share each disposition accounts for matters more than the counts. Good mail should
            dominate; anything else growing as a proportion is the signal.
          </Paragraph>
          <DataTable
            columns={[
              { header: 'Disposition', key: 'disposition', width: 2.4 },
              { header: 'Messages', key: 'messages', width: 1.2 },
              { header: '% of Total', key: 'share', width: 1 },
            ]}
            rows={dispositionRows}
          />
        </Section>

        <Section title="Direction">
          <Paragraph>
            Inbound, outbound and internal traffic in proportion. An unusual outbound share is the
            one to watch: mail leaving in volume that the business did not generate is how a
            compromised mailbox or an unsecured relay first shows up in these figures.
          </Paragraph>
          <DonutChart
            data={directionSeries}
            title="Messages by direction"
            centreLabel="messages"
            emptyText="No directional breakdown available for this window."
          />
        </Section>
      </ContentPage>

      {/* SENDERS & SPAM TARGETS */}
      <ContentPage title="Senders & Spam Targets" subtitle="Who sends the most, and who is targeted">
        <Section title="Top Mail Senders">
          <InfoBox title="Why this matters">
            The heaviest senders are normally the ones you would expect — shared mailboxes,
            ticketing systems, scan-to-email devices, marketing platforms. What is worth a second
            look is a name that does not belong on that list. A user account sending at machine
            volume is either an unmanaged automation nobody documented, or a mailbox someone else is
            using.
          </InfoBox>
          {topSenders.length > 0 ? (
            <DataTable
              columns={[
                { header: 'Sender', key: 'name', width: 3 },
                { header: 'Messages', key: 'count', width: 1 },
              ]}
              rows={topSenders.map((row) => ({
                name: row.Name ?? row.name ?? 'Unknown',
                count: num(row.Count ?? row.count),
              }))}
              limit={10}
            />
          ) : (
            <ClearBox title="✔️ No sender data">
              Microsoft returned no top-sender breakdown for this window.
            </ClearBox>
          )}
        </Section>

        <Section title="Top Spam Recipients">
          <InfoBox title="Why this matters">
            Unwanted mail does not spread evenly. A handful of addresses — usually the published
            ones, and the people whose names appear on the website — absorb most of it, and those
            same addresses are the ones a targeted attempt will use. Concentration here identifies
            exactly who benefits most from stricter policy and from being asked to be careful.
          </InfoBox>
          {topSpamRecipients.length > 0 ? (
            <DataTable
              columns={[
                { header: 'Recipient', key: 'name', width: 3 },
                { header: 'Messages', key: 'count', width: 1 },
              ]}
              rows={topSpamRecipients.map((row) => ({
                name: row.Name ?? row.name ?? 'Unknown',
                count: num(row.Count ?? row.count),
              }))}
              limit={10}
            />
          ) : (
            <ClearBox title="✔️ No concentrated spam targets">
              No recipient stands out as absorbing spam over this window.
            </ClearBox>
          )}
        </Section>
      </ContentPage>

      {/* RECOMMENDATIONS */}
      <ContentPage title="Recommendations" subtitle="What to do with these figures">
        <Section title="Priority Actions">
          <Paragraph>
            Ordered by what this window's data actually shows, rather than by a generic checklist.
          </Paragraph>
          <BulletList items={priorityActions} />
        </Section>

        <Section title="Keeping It That Way">
          <BulletList
            items={[
              {
                label: 'Review mail flow on a fixed cadence.',
                text: 'These figures are only meaningful against previous ones. A monthly look establishes the normal shape of the traffic, which is what makes an abnormal month visible at a glance.',
              },
              {
                label: 'Watch the outbound share, not just the inbound.',
                text: 'Inbound threat volume reflects the internet. Outbound volume reflects the organisation, so a change there is far more likely to mean something has gone wrong inside it.',
              },
              {
                label: 'Alert on the conditions, not the counts.',
                text: 'Configure alert policies for outbound spam and unusual sending volume. A report read monthly finds a compromised mailbox weeks late; an alert finds it the same day.',
              },
              {
                label: 'Keep quarantine reviewed and released promptly.',
                text: 'Filtering only holds if people trust it. Where legitimate mail sits in quarantine unattended, users route around the controls — and that habit costs more than the filtering saves.',
              },
            ]}
          />
        </Section>
      </ContentPage>
    </ReportDocument>
  )
}

export const MailFlowReportButton = ({ mailFlowData, tenantName, disabled = false }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generatedOn, setGeneratedOn] = useState('')
  const brandingSettings = useBrandingSettings()
  const variables = useReportVariables()
  const hasData = Object.keys(mailFlowData?.totals ?? {}).length > 0

  const handleOpen = () => {
    setGeneratedOn(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    )
    setDialogOpen(true)
  }

  const documentNode = (
    <MailFlowReportDocument
      mailFlowData={mailFlowData}
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      generatedOn={generatedOn}
      variables={variables}
    />
  )

  return (
    <>
      <Tooltip title="Generate a client-ready PDF of the mail flow figures">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CippIcons.PictureAsPdf />}
            onClick={handleOpen}
            disabled={disabled || !hasData}
          >
            Export Report
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: { sx: { height: '90vh' } }
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <Typography variant="h6" component="div">
              Mail Flow Report Preview
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <CippIcons.Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {dialogOpen && (
            <CippPdfPreview
              width="100%"
              height="100%"
              title={`Mail Flow Report - ${tenantName}`}
              fileName={`Mail_Flow_Report_${tenantName}.pdf`}
            >
              {documentNode}
            </CippPdfPreview>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <PDFDownloadLink
            document={documentNode}
            fileName={`Mail_Flow_Report_${tenantName}_${new Date().toISOString().split('T')[0]}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <CippIcons.Download />}
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MailFlowReportButton
