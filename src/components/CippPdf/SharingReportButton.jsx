import { useState } from 'react'
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
import { Close, Download, PictureAsPdf } from '@mui/icons-material'
import { Document, Page, Text, View, Image, PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { createReportStyles, DEFAULT_BRAND_COLOUR, REPORT_COLOURS } from './reportPdfStyles'
import {
  AlertBox,
  BulletList,
  ClearBox,
  DataTable,
  InfoBox,
  PageFooter,
  PageHeader,
  StatRow,
  severityColour,
} from './reportPdfPrimitives'
import { useSettings } from '../../hooks/use-settings'

const nz = (value) => Number(value ?? 0)
const joinList = (value) => (Array.isArray(value) ? value.join(', ') : (value ?? ''))
const plural = (count, singular, pluralForm) =>
  `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`

/**
 * Grades sharing exposure. An anonymous link that also allows editing dominates because it is the
 * only combination that lets an unidentified person change content, with no record of who did it.
 */
const assessExposure = (summary) => {
  let score = 0
  if (nz(summary.anonymousEditLinks) > 0) score += 5
  if (nz(summary.neverExpiringAnonymous) > 0) score += 3
  if (nz(summary.anonymousLinks) > 0) score += 2
  if (nz(summary.folderShares) > 0) score += 2
  if (nz(summary.externalLinks) > 0) score += 1

  if (score >= 7) return { level: 'High', severity: 'high' }
  if (score >= 3) return { level: 'Medium', severity: 'medium' }
  return { level: 'Low', severity: 'low' }
}

const SharingReportDocument = ({ sharingData, brandingSettings, tenantName, generatedOn }) => {
  const brandColor = brandingSettings?.colour || DEFAULT_BRAND_COLOUR
  const styles = createReportStyles(brandColor)
  const logo = brandingSettings?.logo
  const footerLabel = `${tenantName} — SharePoint & OneDrive Sharing`

  const summary = sharingData?.summary ?? {}
  const links = sharingData?.links ?? []
  const topRecipients = sharingData?.topRecipients ?? []
  const topLibraries = sharingData?.topLibraries ?? []

  const exposure = assessExposure(summary)
  const exposureColour = severityColour(exposure.severity)

  const canEdit = (row) =>
    joinList(row.roles).includes('write') || joinList(row.roles).includes('owner')
  const anonEditRows = links.filter((row) => row.classification === 'Anonymous' && canEdit(row))
  const neverExpiringRows = links.filter(
    (row) => row.classification === 'Anonymous' && !row.expirationDateTime
  )
  const folderShareRows = links.filter(
    (row) => row.itemType === 'Folder' && ['Anonymous', 'External'].includes(row.classification)
  )
  const externalRows = links.filter((row) => row.classification === 'External')

  const locationOf = (row) =>
    `${row.siteName || row.siteUrl || 'Unknown site'}${row.driveName ? ` / ${row.driveName}` : ''}`
  const expiryOf = (row) =>
    row.expirationDateTime ? new Date(row.expirationDateTime).toLocaleDateString() : 'Never'

  return (
    <Document>
      {/* COVER */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          <View>{logo ? <Image style={styles.logo} src={logo} cache={false} /> : null}</View>
          <Text style={styles.dateStamp}>{generatedOn}</Text>
        </View>

        <View style={styles.coverHero}>
          <Text style={styles.coverLabel}>Data Sharing Review</Text>
          <Text style={styles.mainTitle}>
            Sharing{'\n'}
            <Text style={styles.titleAccent}>Report</Text>
          </Text>
          <Text style={styles.subtitle}>
            What has been shared out of SharePoint and OneDrive at {tenantName}, who it reaches, and
            which of those shares are worth acting on.
          </Text>
          <View>
            <Text style={styles.coverMetaLabel}>{tenantName}</Text>
            <Text style={styles.coverMetavalue}>
              {nz(summary.totalLinks)} sharing links · {nz(summary.itemsShared)} items ·{' '}
              {nz(summary.externalRecipients)} external recipients
            </Text>
            <Text style={[styles.dateStamp, { marginTop: 8 }]}>
              Sharing exposure: {exposure.level}
            </Text>
          </View>
        </View>

        <View style={styles.coverFooter}>
          <Text style={styles.confidential}>Confidential — For Internal Use Only</Text>
        </View>
      </Page>

      {/* EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          styles={styles}
          title="Executive Summary"
          subtitle="What has been shared, and how far it reaches"
          logo={logo}
        />

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            Sharing links are created by users on individual files and folders. They hand out access
            outside the permission structure an administrator sets on a site or library, they
            accumulate quietly as people work, and nothing prompts anyone to review them. This
            report covers what exists today across SharePoint and OneDrive in{' '}
            <Text style={styles.bold}>{tenantName}</Text>.
          </Text>

          <StatRow
            styles={styles}
            stats={[
              {
                value: nz(summary.anonymousEditLinks),
                label: 'Anonymous & Editable',
                colour: nz(summary.anonymousEditLinks) > 0 ? REPORT_COLOURS.danger : undefined,
              },
              {
                value: nz(summary.neverExpiringAnonymous),
                label: 'Anonymous, No Expiry',
                colour: nz(summary.neverExpiringAnonymous) > 0 ? REPORT_COLOURS.danger : undefined,
              },
              {
                value: nz(summary.folderShares),
                label: 'Shared Folders',
                colour: nz(summary.folderShares) > 0 ? REPORT_COLOURS.warning : undefined,
              },
              {
                value: nz(summary.externalRecipients),
                label: 'External Recipients',
                colour: nz(summary.externalRecipients) > 0 ? REPORT_COLOURS.warning : undefined,
              },
            ]}
          />

          <AlertBox
            styles={styles}
            title={`Sharing Exposure: ${exposure.level}`}
            colour={exposureColour}
          >
            {exposure.level === 'High' &&
              'Content is reachable by people who cannot be identified. Anonymous links work for anyone holding them, with no sign-in and no record of use — and where those links also allow editing, changes are attributed to nobody. Treat the findings below as immediate remediation work.'}
            {exposure.level === 'Medium' &&
              'Sharing extends beyond the intended audience in places. Each finding below is individually manageable, but every open link widens what a single forwarded message can expose.'}
            {exposure.level === 'Low' &&
              'No high-risk sharing was found. Links are scoped and time-bounded. Continue reviewing periodically, since sharing accumulates as projects come and go.'}
          </AlertBox>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of This Review</Text>
          <InfoBox styles={styles} title="What was examined">
            {nz(summary.totalLinks)} sharing links and external shares across{' '}
            {nz(summary.sharePointSites)} SharePoint sites, {nz(summary.teamsSites)} Teams-connected
            sites and {nz(summary.oneDriveAccounts)} OneDrive accounts, covering{' '}
            {nz(summary.itemsShared)} distinct shared items. Data is taken from the last completed
            sync, not read live.
          </InfoBox>
          <InfoBox styles={styles} title="What is not covered">
            This report covers sharing links only. Permissions granted on a site or document library
            are a separate access path, governed differently, and are covered by the Permissions
            Report. A clean result here does not mean access is restricted — it means nothing has
            been shared out by link.
          </InfoBox>
        </View>

        <PageFooter styles={styles} label={footerLabel} />
      </Page>

      {/* FINDINGS */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          styles={styles}
          title="Findings"
          subtitle="Shares worth reviewing, most urgent first"
          logo={logo}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 1: Anonymous Links That Allow Editing</Text>
          <InfoBox styles={styles} title="Why this matters">
            An anonymous link works for anyone who holds it — no sign-in, no record of who used it.
            When that link also grants editing, anyone it has been forwarded to can change or delete
            the content, and the change is attributed to nobody. This is the only combination that
            allows untraceable modification.
          </InfoBox>
          {anonEditRows.length > 0 ? (
            <>
              <AlertBox
                styles={styles}
                title={plural(anonEditRows.length, 'anonymous editable link')}
                colour={REPORT_COLOURS.danger}
              >
                Revoke these, or downgrade them to view-only where the sharing is still needed.
              </AlertBox>
              <DataTable
                styles={styles}
                columns={[
                  { header: 'Item', key: 'item', width: 2.4 },
                  { header: 'Location', key: 'location', width: 2 },
                  { header: 'Expires', key: 'expires', width: 1 },
                ]}
                rows={anonEditRows.map((row) => ({
                  item: row.fileName,
                  location: locationOf(row),
                  expires: expiryOf(row),
                }))}
              />
            </>
          ) : (
            <ClearBox styles={styles} title="✓ No anonymous editable links">
              No anonymous link grants write access.
            </ClearBox>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 2: Anonymous Links That Never Expire</Text>
          <InfoBox styles={styles} title="Why this matters">
            A link with no expiry date stays live indefinitely, long after the reason for sharing
            has passed. Expiry is the only control that withdraws this access without somebody
            remembering to do it.
          </InfoBox>
          {neverExpiringRows.length > 0 ? (
            <>
              <AlertBox
                styles={styles}
                title={`${plural(neverExpiringRows.length, 'anonymous link')} with no expiry`}
                colour={REPORT_COLOURS.warning}
              >
                Set a tenant-level default expiry so this cannot recur, then revoke the existing
                links that are no longer needed.
              </AlertBox>
              <DataTable
                styles={styles}
                columns={[
                  { header: 'Item', key: 'item', width: 2.4 },
                  { header: 'Location', key: 'location', width: 2 },
                  { header: 'Permission', key: 'roles', width: 1 },
                ]}
                rows={neverExpiringRows.map((row) => ({
                  item: row.fileName,
                  location: locationOf(row),
                  roles: joinList(row.roles),
                }))}
              />
            </>
          ) : (
            <ClearBox styles={styles} title="✓ All anonymous links expire">
              Every anonymous link has an expiry date set.
            </ClearBox>
          )}
        </View>

        <PageFooter styles={styles} label={footerLabel} />
      </Page>

      {/* FINDINGS CONTINUED */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          styles={styles}
          title="Findings (continued)"
          subtitle="Reach and recipients"
          logo={logo}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 3: Shared Folders</Text>
          <InfoBox styles={styles} title="Why this matters">
            Sharing a folder shares everything inside it, including anything added later. The
            recipient's access grows over time without anyone re-approving it, which is the main way
            a small share quietly becomes a large one.
          </InfoBox>
          {folderShareRows.length > 0 ? (
            <>
              <AlertBox
                styles={styles}
                title={`${plural(folderShareRows.length, 'folder')} shared externally or anonymously`}
                colour={REPORT_COLOURS.warning}
              >
                Check what each folder holds now, not what it held when it was shared.
              </AlertBox>
              <DataTable
                styles={styles}
                columns={[
                  { header: 'Folder', key: 'item', width: 2.2 },
                  { header: 'Location', key: 'location', width: 2 },
                  { header: 'Audience', key: 'audience', width: 1.2 },
                ]}
                rows={folderShareRows.map((row) => ({
                  item: row.fileName,
                  location: locationOf(row),
                  audience: row.classification,
                }))}
              />
            </>
          ) : (
            <ClearBox styles={styles} title="✓ No externally shared folders">
              External and anonymous shares point at individual files rather than folders.
            </ClearBox>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 4: External Recipients</Text>
          <InfoBox styles={styles} title="Why this matters">
            Every external recipient is a person outside the organisation holding access that was
            granted individually, usually for a specific piece of work. Nothing withdraws it when
            that work ends.
          </InfoBox>
          {topRecipients.length > 0 ? (
            <>
              <Text style={styles.bodyText}>
                {plural(nz(summary.externalRecipients), 'external identity', 'external identities')}{' '}
                hold shared content, across {plural(externalRows.length, 'share')}. The most
                frequent are listed below.
              </Text>
              <DataTable
                styles={styles}
                columns={[
                  { header: 'Recipient', key: 'recipient', width: 3 },
                  { header: 'Shares', key: 'shares', width: 1 },
                ]}
                rows={topRecipients.map((row) => ({
                  recipient: row.recipient,
                  shares: String(row.links),
                }))}
                limit={15}
              />
            </>
          ) : (
            <ClearBox styles={styles} title="✓ No external recipients">
              Nothing has been shared with an identity outside the organisation.
            </ClearBox>
          )}
        </View>

        {topLibraries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where Sharing Concentrates</Text>
            <Text style={styles.bodyText}>
              The libraries below account for the most sharing links. Concentration is not a problem
              in itself, but it shows where a review will have the most effect.
            </Text>
            <DataTable
              styles={styles}
              columns={[
                { header: 'Library', key: 'library', width: 3 },
                { header: 'Links', key: 'links', width: 1 },
              ]}
              rows={topLibraries.map((row) => ({
                library: row.library,
                links: String(row.links),
              }))}
              limit={10}
            />
          </View>
        )}

        <PageFooter styles={styles} label={footerLabel} />
      </Page>

      {/* RECOMMENDATIONS */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          styles={styles}
          title="Recommendations"
          subtitle="What to do about the findings"
          logo={logo}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Actions</Text>
          <Text style={styles.bodyText}>
            Ordered by how much exposure each removes relative to the effort involved.
          </Text>
          <BulletList
            styles={styles}
            items={[
              {
                marker: '1.',
                label: 'Revoke or downgrade anonymous editable links.',
                text: 'Anonymous plus editable is the only combination allowing untracked changes. Switching to view-only keeps the sharing working while removing the ability to alter content.',
              },
              {
                marker: '2.',
                label: 'Set a default expiry for anonymous links.',
                text: 'A tenant-level expiry policy stops never-expiring links being created again. This fixes the cause rather than the instances, so the problem does not rebuild.',
              },
              {
                marker: '3.',
                label: 'Review folder-level external shares.',
                text: 'Share specific files where practical. A folder share keeps granting access to content that did not exist when it was approved.',
              },
              {
                marker: '4.',
                label: 'Review long-standing external recipients.',
                text: 'Revoke shares belonging to finished engagements. External access has no natural end unless someone gives it one.',
              },
              {
                marker: '5.',
                label: 'Require sign-in where the audience is known.',
                text: 'A link scoped to specific people records who opened it. Anonymous links cannot be attributed to anyone.',
              },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keeping It That Way</Text>
          <BulletList
            styles={styles}
            items={[
              {
                label: 'Re-run this review regularly.',
                text: 'Sharing accumulates continuously. A periodic review catches it while the list is still short.',
              },
              {
                label: 'Set sharing defaults at tenant and site level.',
                text: 'Default link type, expiry and permitted domains stop the riskiest shares being created at all, which is far cheaper than finding them later.',
              },
              {
                label: 'Restrict anonymous links to view-only.',
                text: 'If anonymous sharing is needed at all, removing the edit option eliminates untraceable changes without blocking the sharing itself.',
              },
              {
                label: 'Password-protect sensitive shares.',
                text: 'A password meaningfully narrows who can use a link that has been forwarded on.',
              },
            ]}
          />
        </View>

        <PageFooter styles={styles} label={footerLabel} />
      </Page>
    </Document>
  )
}

export const SharingReportButton = ({ sharingData, tenantName }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generatedOn, setGeneratedOn] = useState('')
  const brandingSettings = useSettings()?.customBranding
  const hasData = !!sharingData?.summary

  const handleOpen = () => {
    setGeneratedOn(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    )
    setDialogOpen(true)
  }

  const documentNode = (
    <SharingReportDocument
      sharingData={sharingData}
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      generatedOn={generatedOn}
    />
  )

  return (
    <>
      <Tooltip title="Generate a client-ready PDF of the sharing findings">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleOpen}
            disabled={!hasData}
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
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              Sharing Report Preview
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {dialogOpen && (
            <PDFViewer width="100%" height="100%">
              {documentNode}
            </PDFViewer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <PDFDownloadLink
            document={documentNode}
            fileName={`Sharing_Report_${tenantName}_${new Date().toISOString().split('T')[0]}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SharingReportButton
