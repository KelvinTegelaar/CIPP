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
const plural = (count, singular, pluralForm) =>
  `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`

/**
 * Grades permission exposure. A tenant-wide claim dominates because it grants access to the whole
 * organisation in one entry, regardless of what the site's membership says.
 */
const assessExposure = (summary) => {
  let score = 0
  if (nz(summary.broadClaimGrants) > 0) score += 5
  if (nz(summary.externalGrants) > 0) score += 3
  if (nz(summary.directFullControlGrants) > 0) score += 2
  if (nz(summary.uniquePermissionLibraries) > 0) score += 1

  if (score >= 7) return { level: 'High', severity: 'high' }
  if (score >= 3) return { level: 'Medium', severity: 'medium' }
  return { level: 'Low', severity: 'low' }
}

const CLAIM_LABELS = {
  Everyone: 'Everyone (includes external users)',
  EveryoneExceptExternal: 'Everyone except external users',
  AllUsers: 'All Users',
}

const PermissionsReportDocument = ({
  permissionsData,
  brandingSettings,
  tenantName,
  generatedOn,
}) => {
  const brandColor = brandingSettings?.colour || DEFAULT_BRAND_COLOUR
  const styles = createReportStyles(brandColor)
  const logo = brandingSettings?.logo
  const footerLabel = `${tenantName} — SharePoint Permissions`

  const summary = permissionsData?.summary ?? {}
  const assignments = permissionsData?.assignments ?? []
  const skippedSites = permissionsData?.skippedSites ?? []

  const exposure = assessExposure(summary)
  const exposureColour = severityColour(exposure.severity)

  // Placeholder rows carry no principal, and Limited Access grants nothing on its own — both are
  // excluded from the counts, so they have to be excluded here or the tables contradict them.
  const realAssignments = assignments.filter((row) => row.principalId && !row.isSystemManaged)
  const broadClaimRows = realAssignments.filter((row) => row.broadClaim)
  const externalGrantRows = realAssignments.filter((row) => row.isGuest === true)
  const fullControlRows = realAssignments.filter(
    (row) => row.permissionLevel === 'Full Control' && row.principalType !== 'SharePoint Group'
  )
  const libraryRows = realAssignments.filter((row) => row.scope === 'Library')

  // getAllSites does not always return a display name, so fall back to the URL.
  const siteLabel = (row) => row.siteName || row.siteUrl || 'Unnamed site'
  const scopeLabel = (row) =>
    row.scope === 'Library' ? `${siteLabel(row)} / ${row.libraryTitle}` : siteLabel(row)

  return (
    <Document>
      {/* COVER */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          <View>{logo ? <Image style={styles.logo} src={logo} cache={false} /> : null}</View>
          <Text style={styles.dateStamp}>{generatedOn}</Text>
        </View>

        <View style={styles.coverHero}>
          <Text style={styles.coverLabel}>Access Review</Text>
          <Text style={styles.mainTitle}>
            Permissions{'\n'}
            <Text style={styles.titleAccent}>Report</Text>
          </Text>
          <Text style={styles.subtitle}>
            Who is structurally allowed into SharePoint sites and document libraries at {tenantName}
            , and where that access reaches further than intended.
          </Text>
          <View>
            <Text style={styles.coverMetaLabel}>{tenantName}</Text>
            <Text style={styles.coverMetavalue}>
              {nz(summary.sitesScanned)} sites · {nz(summary.librariesScanned)} libraries ·{' '}
              {nz(summary.totalAssignments)} permission assignments
            </Text>
            <Text style={[styles.dateStamp, { marginTop: 8 }]}>
              Permission exposure: {exposure.level}
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
          subtitle="Who is allowed in, and how widely"
          logo={logo}
        />

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            Permissions are set by administrators on a site or document library and decide who is
            structurally allowed in. They change rarely, which is what makes them worth auditing: a
            permission granted for one project stays in place indefinitely, and a permission granted
            to the whole organisation looks identical to one granted to a single team until somebody
            reads it. This report covers <Text style={styles.bold}>{tenantName}</Text>.
          </Text>

          <StatRow
            styles={styles}
            stats={[
              {
                value: nz(summary.broadClaimGrants),
                label: 'Tenant-Wide Grants',
                colour: nz(summary.broadClaimGrants) > 0 ? REPORT_COLOURS.danger : undefined,
              },
              {
                value: nz(summary.externalGrants),
                label: 'External Grants',
                colour: nz(summary.externalGrants) > 0 ? REPORT_COLOURS.warning : undefined,
              },
              {
                value: nz(summary.directFullControlGrants),
                label: 'Direct Full Control',
                colour:
                  nz(summary.directFullControlGrants) > 0 ? REPORT_COLOURS.warning : undefined,
              },
              {
                value: nz(summary.uniquePermissionLibraries),
                label: 'Detached Libraries',
              },
            ]}
          />

          <AlertBox
            styles={styles}
            title={`Permission Exposure: ${exposure.level}`}
            colour={exposureColour}
          >
            {exposure.level === 'High' &&
              'Content is reachable by people it was never meant for. A tenant-wide grant is present, which opens the content to the entire organisation regardless of who the site membership says should have it — and it is the most common reason material turns up unexpectedly in search results and AI assistant answers. Treat the findings below as immediate remediation work.'}
            {exposure.level === 'Medium' &&
              'Access extends past the intended audience in places. Each finding below is individually manageable, but each one widens what a single compromised account reaches.'}
            {exposure.level === 'Low' &&
              'Permissions broadly match what the structure intends. No tenant-wide grants were found. Continue reviewing periodically, particularly after site or library changes.'}
          </AlertBox>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of This Review</Text>
          <InfoBox styles={styles} title="What was examined">
            {nz(summary.sitesScanned)} SharePoint sites and {nz(summary.librariesScanned)} document
            libraries were read, producing {nz(summary.totalAssignments)} permission assignments.
            Data is taken from the last completed sync, not read live.
          </InfoBox>
          <InfoBox styles={styles} title="What is not covered">
            Permissions are reported as grant paths, not effective access — a group holding a
            permission is one entry and its members are not expanded, so a person may hold access
            that shows here only via their group. Permissions on individual folders and files are
            not enumerated. OneDrive personal sites are out of scope. Access handed out by sharing
            link is a separate path, covered by the Sharing Report.
          </InfoBox>
          {skippedSites.length > 0 ? (
            <AlertBox
              styles={styles}
              title={`${plural(skippedSites.length, 'site')} could not be read`}
              colour={REPORT_COLOURS.warning}
            >
              These sites could not be read on the most recent scan. Where a site was read
              successfully before, its earlier results are still shown and are as old as that scan;
              a site never read successfully contributes nothing. Either way, an absence of findings
              for these sites is not evidence of good configuration.
            </AlertBox>
          ) : null}
        </View>

        <PageFooter styles={styles} label={footerLabel} />
      </Page>

      {/* FINDINGS */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          styles={styles}
          title="Findings"
          subtitle="Permissions worth reviewing, most urgent first"
          logo={logo}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 1: Tenant-Wide Grants</Text>
          <InfoBox styles={styles} title="Why this matters">
            SharePoint offers a handful of special audiences — Everyone, Everyone except external
            users, and All Users — that resolve to the whole organisation rather than to named
            people. A library carrying one is readable by every employee no matter what the site's
            membership says, and it is the single most common cause of data appearing in search
            results or AI assistant answers where it was not expected.
          </InfoBox>
          {broadClaimRows.length > 0 ? (
            <>
              <AlertBox
                styles={styles}
                title={`${plural(broadClaimRows.length, 'tenant-wide grant')} found`}
                colour={REPORT_COLOURS.danger}
              >
                Confirm the content is genuinely meant to be organisation-wide. If not, replace the
                grant with a specific group — one edit removes access for everyone who was never
                meant to have it.
              </AlertBox>
              <DataTable
                styles={styles}
                columns={[
                  { header: 'Location', key: 'location', width: 2.4 },
                  { header: 'Audience', key: 'audience', width: 2 },
                  { header: 'Permission', key: 'level', width: 1.2 },
                ]}
                rows={broadClaimRows.map((row) => ({
                  location: scopeLabel(row),
                  audience: CLAIM_LABELS[row.broadClaim] ?? row.broadClaim,
                  level: row.permissionLevel,
                }))}
              />
            </>
          ) : (
            <ClearBox styles={styles} title="✓ No tenant-wide grants found">
              No site or library grants access to Everyone, Everyone except external users, or All
              Users.
            </ClearBox>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 2: External and Guest Access</Text>
          <InfoBox styles={styles} title="Why this matters">
            Guest accounts holding permissions retain that access until somebody removes it — unlike
            a sharing link, nothing expires it. Guests from finished projects are a common source of
            standing access nobody is reviewing.
          </InfoBox>
          {externalGrantRows.length > 0 ? (
            <>
              <AlertBox
                styles={styles}
                title={`${plural(externalGrantRows.length, 'grant')} held by external identities`}
                colour={REPORT_COLOURS.warning}
              >
                Verify each guest still needs access and that the relationship is current.
              </AlertBox>
              <DataTable
                styles={styles}
                columns={[
                  { header: 'Location', key: 'location', width: 2.2 },
                  { header: 'Identity', key: 'identity', width: 2.4 },
                  { header: 'Permission', key: 'level', width: 1.2 },
                ]}
                rows={externalGrantRows.map((row) => ({
                  location: scopeLabel(row),
                  identity: row.email || row.title || row.loginName,
                  level: row.permissionLevel,
                }))}
              />
            </>
          ) : (
            <ClearBox styles={styles} title="✓ No external grants found">
              No guest or external identity holds a permission on a scanned site or library.
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
          subtitle="Elevated rights and inheritance"
          logo={logo}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 3: Directly Granted Full Control</Text>
          <InfoBox styles={styles} title="Why this matters">
            Every site has an Owners group that holds Full Control by design, and that is expected.
            Full Control granted straight to a person or a directory group is different: it sits
            outside the membership structure, so it is not removed when someone leaves a team and it
            is easy to overlook when reviewing who administers a site.
          </InfoBox>
          {fullControlRows.length > 0 ? (
            <>
              <AlertBox
                styles={styles}
                title={`${plural(fullControlRows.length, 'direct Full Control grant')}`}
                colour={REPORT_COLOURS.warning}
              >
                Move these into the site's Owners group where the access is legitimate, so
                membership changes take effect automatically.
              </AlertBox>
              <DataTable
                styles={styles}
                columns={[
                  { header: 'Location', key: 'location', width: 2.2 },
                  { header: 'Principal', key: 'principal', width: 2.2 },
                  { header: 'Type', key: 'type', width: 1.2 },
                ]}
                rows={fullControlRows.map((row) => ({
                  location: scopeLabel(row),
                  principal: row.title || row.email || row.loginName,
                  type: row.principalType,
                }))}
              />
            </>
          ) : (
            <ClearBox styles={styles} title="✓ Full Control is held through Owners groups">
              No user or directory group holds Full Control outside a site's Owners group.
            </ClearBox>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finding 4: Libraries With Their Own Permissions</Text>
          <InfoBox styles={styles} title="Why this matters">
            A library normally inherits from its site, so managing the site manages everything in
            it. A detached library keeps its own permissions and later site-level changes no longer
            reach it. That is legitimate when deliberate and a blind spot when not — removing
            somebody from the site does not remove them here.
          </InfoBox>
          {nz(summary.uniquePermissionLibraries) > 0 ? (
            <Text style={styles.bodyText}>
              {nz(summary.uniquePermissionLibraries)} of {nz(summary.librariesScanned)} libraries no
              longer inherit from their site. Their assignments are listed in the appendix. Review
              whether each detachment was intentional and is still needed.
            </Text>
          ) : (
            <ClearBox styles={styles} title="✓ All libraries inherit from their site">
              Every scanned library takes its permissions from its site, so site-level access
              management covers them all.
            </ClearBox>
          )}
        </View>

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
            Ordered by how much access each removes relative to the effort involved.
          </Text>
          <BulletList
            styles={styles}
            items={[
              {
                marker: '1.',
                label: 'Replace tenant-wide grants.',
                text: 'Swap Everyone and All Users grants for a specific group. This is the highest-value change available: a single edit removes access for everyone who was never meant to have it.',
              },
              {
                marker: '2.',
                label: 'Review guest permissions.',
                text: 'Guests keep permissions indefinitely. Remove those whose projects have ended, and prefer time-boxed sharing for new external work.',
              },
              {
                marker: '3.',
                label: 'Move direct Full Control into Owners groups.',
                text: 'Administrative rights held through the Owners group follow joiners and leavers. Held directly, they have to be remembered.',
              },
              {
                marker: '4.',
                label: 'Re-inherit libraries detached without reason.',
                text: 'Restoring inheritance brings a library back under site-level management. Only do this where the detachment was not deliberate — it discards the library’s own permissions.',
              },
              {
                marker: '5.',
                label: 'Prefer groups over individual grants.',
                text: 'A permission held by a group updates itself as people join and leave. One held by a person does not.',
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
                text: 'Permissions drift as projects start and end. A periodic review catches drift while it is still small.',
              },
              {
                label: 'Manage access at the site, not the library.',
                text: 'Leaving libraries inherited keeps one place to look when somebody joins or leaves.',
              },
              {
                label: 'Check effective access, not just the lists.',
                text: 'A group holding Edit says nothing about who is in it. Use the access check on a site to confirm what a specific person can actually reach.',
              },
              {
                label: 'Avoid tenant-wide audiences by default.',
                text: 'Where content genuinely is organisation-wide, say so deliberately and review it, rather than reaching for Everyone because it is convenient.',
              },
            ]}
          />
        </View>

        <PageFooter styles={styles} label={footerLabel} />
      </Page>

      {/* APPENDIX */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          styles={styles}
          title="Appendix: Detached Library Permissions"
          subtitle="Assignments on libraries that no longer inherit from their site"
          logo={logo}
        />

        <View style={styles.section}>
          <DataTable
            styles={styles}
            columns={[
              { header: 'Site', key: 'site', width: 1.8 },
              { header: 'Library', key: 'library', width: 1.6 },
              { header: 'Principal', key: 'principal', width: 2.2 },
              { header: 'Permission', key: 'level', width: 1.2 },
            ]}
            rows={libraryRows.map((row) => ({
              site: siteLabel(row),
              library: row.libraryTitle,
              principal: row.title || row.email || row.loginName,
              level: row.permissionLevel,
            }))}
            limit={40}
            emptyText="No libraries hold their own permissions."
          />
        </View>

        <PageFooter styles={styles} label={footerLabel} />
      </Page>
    </Document>
  )
}

export const PermissionsReportButton = ({ permissionsData, tenantName }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generatedOn, setGeneratedOn] = useState('')
  const brandingSettings = useSettings()?.customBranding
  const hasData = !!permissionsData?.summary

  const handleOpen = () => {
    setGeneratedOn(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    )
    setDialogOpen(true)
  }

  const documentNode = (
    <PermissionsReportDocument
      permissionsData={permissionsData}
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      generatedOn={generatedOn}
    />
  )

  return (
    <>
      <Tooltip title="Generate a client-ready PDF of the permission findings">
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
              Permissions Report Preview
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
            fileName={`Permissions_Report_${tenantName}_${new Date().toISOString().split('T')[0]}.pdf`}
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

export default PermissionsReportButton
