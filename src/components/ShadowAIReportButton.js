import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { Close, Download, PictureAsPdf, Settings } from '@mui/icons-material'
import { PDFViewer } from '@react-pdf/renderer'
import { useSettings } from '../hooks/use-settings'
import {
  Bold,
  BulletList,
  Columns,
  ContentPage,
  DataTable,
  DonutChart,
  HeroPage,
  InfoBox,
  Paragraph,
  ReportDocument,
  Section,
  StatRow,
} from './CippPdf'

// Risk bands keep the semantic red-to-green scale rather than the brand series: red has to mean
// high risk whatever colours the MSP picked.
const RISK_COLOURS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
  informational: '#10B981',
}
const riskColor = (risk) => RISK_COLOURS[String(risk).toLowerCase()] ?? '#A0AEC0'

// Executive Shadow AI report. Written as a pages fragment with no theme, stylesheet or page
// furniture of its own, which is what lets the executive report drop the same pages into its own
// document and have them come out branded identically (see ExecutiveReportButton).
export const ShadowAIReportPages = ({
  tenantName,
  data,
  sectionConfig = {
    executiveSummary: true,
    infographics: true,
    background: true,
    riskLevels: true,
    sanctionedTools: true,
    detectedSoftware: true,
    entraApplications: true,
    recommendations: true,
  },
}) => {
  const summary = data?.summary ?? {}
  const detectedApps = data?.detectedApps ?? []
  const consentedApps = data?.consentedApps ?? []
  const topTools = data?.topTools ?? []
  const byRisk = data?.byRisk ?? []

  const riskAreas = [
    {
      title: 'Data Leakage',
      color: '#EF4444',
      text: 'Customer records, credentials, source code and financials pasted into consumer AI tools may be retained by the provider and used to train future models, permanently placing them outside your control. Every prompt is a data transfer to a third party.',
    },
    {
      title: 'Compliance & Legal Exposure',
      color: '#F59E0B',
      text: 'Processing personal data through unvetted AI services can breach GDPR, HIPAA and industry-specific regulations, and undermines contractual confidentiality commitments made to customers.',
    },
    {
      title: 'Excessive Application Permissions',
      color: '#D69E2E',
      text: 'AI meeting assistants and productivity plugins often request broad access to mailboxes, calendars and files. A single user consent can expose organization-wide data to a third-party service, and that access persists until the consent is revoked.',
    },
    {
      title: 'Unreliable Output in Business Processes',
      color: '#3B82F6',
      text: 'AI-generated content flows into quotes, contracts and customer communication without review. Errors produced by unmanaged tools are difficult to trace because the organization does not know the tools are in use.',
    },
  ]

  const riskLevels = [
    {
      name: 'High',
      text: 'Consumer tools that train on submitted data, retain prompts indefinitely, or operate from jurisdictions without adequate data protection. Content pasted into these tools should be treated as disclosed to an unvetted third party.',
    },
    {
      name: 'Medium',
      text: 'Tools with business-grade privacy options that are typically used through personal, unmanaged accounts. Risk depends heavily on the plan and account type in use.',
    },
    {
      name: 'Low',
      text: 'Tools with enterprise controls, contractual data-processing terms and no training on customer data when configured correctly.',
    },
    {
      name: 'Informational',
      text: 'Company sanctioned tools that have been explicitly approved for use in this tenant. They remain in the report for visibility but no longer contribute to the risk figures.',
    },
  ]

  const recommendations = [
    {
      label: 'Review & Decide:',
      text: 'Evaluate each detected tool with stakeholders and decide whether it should be sanctioned, replaced with an approved alternative, or blocked.',
    },
    {
      label: 'Sanction Approved Tools:',
      text: 'Maintain a list of company sanctioned tools so future reports separate approved AI use from true shadow AI.',
    },
    {
      label: 'Offer an Alternative:',
      text: 'Provide a sanctioned option such as Microsoft 365 Copilot before blocking popular tools - blocking without an alternative drives usage to personal devices.',
    },
    {
      label: 'Restrict Consent:',
      text: 'Require admin approval for unverified applications in Entra ID so new AI services cannot access company data through user consent.',
    },
    {
      label: 'Block & Monitor:',
      text: 'Deploy Conditional Access and Defender for Cloud Apps policies to block or monitor unsanctioned AI web services.',
    },
    {
      label: 'Extend DLP:',
      text: 'Cover generative AI endpoints with data loss prevention policies to stop sensitive data from being pasted into chat prompts.',
    },
    {
      label: 'Train Users:',
      text: 'Publish an acceptable AI use policy and train users on what data may never be shared with AI tools.',
    },
    {
      label: 'Review Monthly:',
      text: 'Re-run this report on a regular cadence - new AI tools appear in tenants within days of release.',
    },
  ]

  const detectedRows = detectedApps.slice(0, 18)
  const consentedRows = consentedApps.slice(0, 18)

  // Distinct sanctioned tools across both sources, with their footprint
  const sanctionedMap = {}
  for (const app of detectedApps) {
    if (app.status !== 'Sanctioned') continue
    if (!sanctionedMap[app.aiTool]) {
      sanctionedMap[app.aiTool] = {
        tool: app.aiTool,
        vendor: app.vendor,
        category: app.category,
        devices: 0,
        users: 0,
      }
    }
    sanctionedMap[app.aiTool].devices += app.deviceCount ?? 0
  }
  for (const app of consentedApps) {
    if (app.status !== 'Sanctioned') continue
    if (!sanctionedMap[app.aiTool]) {
      sanctionedMap[app.aiTool] = {
        tool: app.aiTool,
        vendor: app.vendor,
        category: app.category,
        devices: 0,
        users: 0,
      }
    }
    sanctionedMap[app.aiTool].users += app.activeUsersLast7Days ?? 0
  }
  const sanctionedToolsList = Object.values(sanctionedMap).slice(0, 18)

  return (
    <>
      {/* AI SUMMARY. Not "Executive Summary": these pages are appended to the executive report,
          which opens with a page of that name, so two unrelated sections carried the same
          heading. */}
      {sectionConfig.executiveSummary && (
        <ContentPage
          title="AI Summary"
          subtitle="Strategic overview of AI usage in your Microsoft 365 environment"
        >
          <Section>
            <Paragraph>
              This report identifies the artificial intelligence tools discovered in the{' '}
              <Bold>{tenantName || 'your organization'}</Bold> environment, combining software
              inventory from managed devices (Intune) with cloud application consent data from Entra
              ID. Each tool is matched against a curated catalog of known AI services and assigned a
              risk level based on its data handling practices.
            </Paragraph>
            <Paragraph>
              Tools that have been explicitly approved are marked as company sanctioned and report
              the Informational risk level. Everything else represents shadow AI: tools adopted by
              employees without review or approval, whose handling of company data is unknown.
            </Paragraph>
          </Section>

          <Section title="AI Usage Overview">
            <StatRow
              stats={[
                { value: summary.aiToolsDetected ?? 0, label: 'AI Tools' },
                { value: summary.deviceInstalls ?? 0, label: 'Device Installs' },
                { value: summary.consentedAiApps ?? 0, label: 'Entra AI Apps' },
                {
                  value: summary.highRiskTools ?? 0,
                  label: 'High Risk',
                  colour: riskColor('high'),
                },
                {
                  value: summary.sanctionedTools ?? 0,
                  label: 'Sanctioned',
                  colour: riskColor('informational'),
                },
              ]}
            />
          </Section>

          {topTools.length > 0 && (
            <Section title="Most Used AI Tools">
              <DataTable
                limit={topTools.length}
                columns={[
                  { header: 'Tool', key: 'tool', width: 3, bold: true },
                  { header: 'Category', key: 'category', width: 3 },
                  { header: 'Status', key: 'status', width: 2 },
                  { header: 'Devices', key: 'devices', width: 1.5 },
                  { header: 'Users (7d)', key: 'users', width: 1.5 },
                ]}
                rows={topTools.map((tool) => ({
                  ...tool,
                  status: tool.status ?? 'Unsanctioned',
                }))}
              />
            </Section>
          )}
        </ContentPage>
      )}

      {/* CHAPTER SPLITTER */}
      {sectionConfig.infographics && (
        <HeroPage
          backgroundImage="/reportImages/laptop.jpg"
          highlight="75%"
          subText={
            <>
              of knowledge workers already{'\n'}
              use <Bold>generative AI</Bold> at work -{'\n'}
              most without their employer knowing
            </>
          }
          footerText={
            <>
              <Bold>Visibility</Bold> is the first step{'\n'}
              to <Bold>control</Bold>
            </>
          }
        />
      )}

      {/* UNDERSTANDING SHADOW AI */}
      {sectionConfig.background && (
        <ContentPage
          title="Understanding Shadow AI"
          subtitle="What unmanaged AI usage means for your organization"
        >
          <Section>
            <Paragraph>
              Shadow AI is the use of artificial intelligence tools by employees without the
              knowledge or approval of the organization - the AI-era equivalent of shadow IT.
              Because most AI tools are free, browser-based and immediately useful, adoption happens
              quietly and quickly: an employee pastes a customer email into a chatbot to draft a
              reply, uploads a spreadsheet for analysis, or installs an AI notetaker that joins
              every meeting.
            </Paragraph>
            <Paragraph>
              The goal of a shadow AI program is not zero AI usage, but zero unsanctioned usage.
              Every tool in this report should end up either approved and managed, or replaced and
              blocked. The four risk areas below explain why unmanaged usage deserves attention.
            </Paragraph>
          </Section>

          <Section title="Key Risk Areas">
            {riskAreas.map((area) => (
              <InfoBox key={area.title} title={area.title} colour={area.color}>
                {area.text}
              </InfoBox>
            ))}
          </Section>
        </ContentPage>
      )}

      {/* RISK LEVELS & DISTRIBUTION */}
      {sectionConfig.riskLevels && (
        <ContentPage
          title="AI Tool Risk Levels"
          subtitle="How risk is assigned and how it is distributed in this tenant"
        >
          <Section>
            <Paragraph>
              Detected tools are matched against a curated catalog of known AI services, each
              carrying a risk classification based on its data handling practices, account model and
              enterprise controls. Marking a tool as company sanctioned overrides its catalog risk
              with the Informational level, so the figures below reflect only unapproved use.
            </Paragraph>
          </Section>

          <DonutChart
            title="AI Tool Risk Distribution"
            centreLabel="Tools"
            data={byRisk.map((item) => ({
              label: item.risk,
              value: item.tools,
              colour: riskColor(item.risk),
            }))}
          />

          <Section>
            {[0, 2].map((start) => (
              <Columns key={start}>
                {riskLevels.slice(start, start + 2).map((level) => (
                  <InfoBox
                    key={level.name}
                    title={level.name}
                    colour={riskColor(level.name)}
                    tintTitle
                  >
                    {level.text}
                  </InfoBox>
                ))}
              </Columns>
            ))}
          </Section>
        </ContentPage>
      )}

      {/* SANCTIONED TOOLS */}
      {sectionConfig.sanctionedTools && sanctionedToolsList.length > 0 && (
        <ContentPage
          title="Company Sanctioned AI Tools"
          subtitle="AI tools that are approved for use in this organization"
        >
          <Section>
            <Paragraph>
              The tools listed below are permitted in this environment. They are allowed either
              because a business justification exists for their use, or because the system
              administrator has explicitly approved these tools for deployment. Sanctioned tools
              report the Informational risk level and are excluded from the shadow AI risk figures
              in this report; they remain listed for visibility into where AI is used across the
              organization.
            </Paragraph>
            <Paragraph>
              Approval is not permanent: sanctioned tools should be reviewed periodically to confirm
              that the plan in use, the vendor's data handling terms and the business justification
              still hold.
            </Paragraph>
          </Section>

          <Section>
            <DataTable
              limit={sanctionedToolsList.length}
              columns={[
                { header: 'Tool', key: 'tool', width: 3, bold: true },
                { header: 'Vendor', key: 'vendor', width: 3 },
                { header: 'Category', key: 'category', width: 3 },
                { header: 'Devices', key: 'devices', width: 2 },
                { header: 'Users (7d)', key: 'users', width: 2 },
              ]}
              rows={sanctionedToolsList}
            />
          </Section>
        </ContentPage>
      )}

      {/* DETECTED SOFTWARE */}
      {sectionConfig.detectedSoftware && (
        <ContentPage
          title="AI Software on Managed Devices"
          subtitle="AI applications found in the Intune software inventory"
        >
          <Section>
            <Paragraph>
              The following AI applications were detected in the software inventory of managed
              devices
              {detectedApps.length > detectedRows.length
                ? `, showing the top ${detectedRows.length} of ${detectedApps.length} entries`
                : ''}
              . Device counts indicate how widely each application has spread through the
              environment.
            </Paragraph>
          </Section>

          <Section>
            <DataTable
              limit={detectedRows.length}
              emptyText="No AI software was detected on managed devices during the last inventory sync."
              columns={[
                { header: 'Application', key: 'application', width: 4, bold: true },
                { header: 'AI Tool', key: 'aiTool', width: 3 },
                { header: 'Category', key: 'category', width: 3 },
                { header: 'Risk', key: 'risk', width: 2, colour: (row) => riskColor(row.risk) },
                { header: 'Status', key: 'status', width: 2.5 },
                { header: 'Devices', key: 'deviceCount', width: 1.5 },
              ]}
              rows={detectedRows}
            />
          </Section>
        </ContentPage>
      )}

      {/* ENTRA APPLICATIONS */}
      {sectionConfig.entraApplications && (
        <ContentPage
          title="AI Applications in Entra ID"
          subtitle="AI services with a footprint in your identity platform"
        >
          <Section>
            <Paragraph>
              The following AI services are registered as applications in the tenant, including any
              permissions users have consented to
              {consentedApps.length > consentedRows.length
                ? `, showing the top ${consentedRows.length} of ${consentedApps.length} entries`
                : ''}
              . The consent date shows when each service first gained a foothold in the environment.
            </Paragraph>
          </Section>

          <Section>
            <DataTable
              limit={consentedRows.length}
              emptyText="No AI applications were found in Entra ID."
              columns={[
                { header: 'Application', key: 'application', width: 4, bold: true },
                { header: 'AI Tool', key: 'aiTool', width: 3 },
                { header: 'Risk', key: 'risk', width: 2, colour: (row) => riskColor(row.risk) },
                { header: 'Status', key: 'status', width: 2.5 },
                { header: 'Users (7d)', key: 'activeUsersLast7Days', width: 2 },
                { header: 'First Consented', key: 'firstConsented', width: 2.5 },
              ]}
              rows={consentedRows.map((app) => ({
                ...app,
                firstConsented: app.firstConsentedDateTime
                  ? new Date(app.firstConsentedDateTime).toLocaleDateString()
                  : 'Unknown',
              }))}
            />
          </Section>
        </ContentPage>
      )}

      {/* CHAPTER SPLITTER */}
      {sectionConfig.infographics && (
        <HeroPage
          backgroundImage="/reportImages/working.jpg"
          highlight="1 in 3"
          subText={
            <>
              employees shares <Bold>sensitive work data</Bold>
              {'\n'}
              with AI tools without approval
            </>
          }
          footerText={
            <>
              <Bold>Sanctioned alternatives</Bold> keep{'\n'}
              your data <Bold>under contract</Bold>
            </>
          }
        />
      )}

      {/* RECOMMENDATIONS */}
      {sectionConfig.recommendations && (
        <ContentPage
          title="Recommendations"
          subtitle="A structured response to shadow AI in your environment"
        >
          <Section>
            <Paragraph>
              A structured response to shadow AI combines approval of useful tools with controls on
              the rest. The following actions are recommended based on the findings in this report:
            </Paragraph>
          </Section>

          <Section title="Action Plan">
            <BulletList items={recommendations} />
          </Section>

          <Section>
            <InfoBox title="Next Review">
              The AI tool landscape changes quickly and new tools appear in tenants within days of
              release. We recommend re-running this assessment monthly and reviewing newly detected
              tools against your acceptable AI use policy.
            </InfoBox>
          </Section>
        </ContentPage>
      )}
    </>
  )
}

// Exported so the branding preview can render this report against sample data, and so tests can
// render it to a real PDF.
export const ShadowAIReportDocument = ({ tenantName, brandingSettings, ...props }) => (
  <ReportDocument
    brandingSettings={brandingSettings}
    tenantName={tenantName}
    reportName="Shadow AI Report"
    coverLabel="AI RISK ASSESSMENT"
    coverTitle="Shadow AI"
    coverAccent="Report"
    coverSubtitle="Discovery and risk assessment of AI tools in use across managed devices and cloud applications"
    coverTenant={tenantName || 'Organization Name'}
    coverFallbackImage="/reportImages/city.jpg"
    footerLabel={`${tenantName} - Shadow AI Report`}
  >
    <ShadowAIReportPages tenantName={tenantName} {...props} />
  </ReportDocument>
)

const sectionOptions = [
  {
    key: 'coverPage',
    label: 'Cover Page',
    description: 'Branded title page with tenant name and date',
  },
  {
    key: 'executiveSummary',
    label: 'Executive Summary',
    description: 'High-level overview, usage statistics and top tools',
  },
  {
    key: 'infographics',
    label: 'Infographic Pages',
    description: 'Statistical pages with visual elements between sections',
  },
  {
    key: 'background',
    label: 'Understanding Shadow AI',
    description: 'Explains shadow AI and its key risk areas',
  },
  {
    key: 'riskLevels',
    label: 'Risk Levels & Distribution',
    description: 'Risk methodology and distribution chart',
  },
  {
    key: 'sanctionedTools',
    label: 'Sanctioned Tools',
    description: 'Company approved AI tools and their footprint',
  },
  {
    key: 'detectedSoftware',
    label: 'AI Software (Intune)',
    description: 'AI applications found on managed devices',
  },
  {
    key: 'entraApplications',
    label: 'AI Applications (Entra)',
    description: 'AI services with consented permissions in Entra ID',
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    description: 'Action plan for managing shadow AI',
  },
]

export const ShadowAIReportButton = ({ data, tenantName, disabled }) => {
  const settings = useSettings()
  const brandingSettings = settings.customBranding
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sectionConfig, setSectionConfig] = useState({
    coverPage: true,
    executiveSummary: true,
    infographics: true,
    background: true,
    riskLevels: true,
    sanctionedTools: true,
    detectedSoftware: true,
    entraApplications: true,
    recommendations: true,
  })

  const handleSectionToggle = (sectionKey) => {
    setSectionConfig((prev) => {
      const enabledSections = Object.values(prev).filter(Boolean).length
      // Keep at least one section enabled
      if (prev[sectionKey] && enabledSections === 1) {
        return prev
      }
      return { ...prev, [sectionKey]: !prev[sectionKey] }
    })
  }

  const fileName = `Shadow_AI_Report_${String(tenantName).replace(/[^a-zA-Z0-9]/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`

  const reportDocument = useMemo(() => {
    if (!previewOpen) return null
    return (
      <ShadowAIReportDocument
        tenantName={tenantName}
        data={data}
        brandingSettings={brandingSettings}
        sectionConfig={sectionConfig}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOpen, tenantName, data, brandingSettings, JSON.stringify(sectionConfig)])

  return (
    <>
      <Tooltip title="Generate an executive report about AI usage and shadow AI risk in this tenant">
        <span>
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => setPreviewOpen(true)}
            startIcon={
              <SvgIcon fontSize="small">
                <PictureAsPdf />
              </SvgIcon>
            }
          >
            Executive Shadow AI Report
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '95vh', maxHeight: '95vh' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="div">
            Shadow AI Report - {tenantName}
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%', display: 'flex' }}>
          {/* Left Panel - Section Configuration */}
          <Paper
            sx={{
              width: 320,
              flexShrink: 0,
              borderRadius: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Settings size={20} />
                Report Sections
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure which sections to include in your Shadow AI report. Changes are reflected
                in real-time.
              </Typography>

              <Stack spacing={1.5}>
                {sectionOptions.map((option) => (
                  <Paper
                    key={option.key}
                    onClick={() => handleSectionToggle(option.key)}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: sectionConfig[option.key] ? 'primary.main' : 'divider',
                      bgcolor: sectionConfig[option.key] ? 'primary.50' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: sectionConfig[option.key] ? 'primary.100' : 'primary.25',
                      },
                    }}
                  >
                    <Switch
                      checked={sectionConfig[option.key]}
                      onChange={(event) => {
                        event.stopPropagation()
                        handleSectionToggle(option.key)
                      }}
                      onClick={(event) => event.stopPropagation()}
                      color="primary"
                      size="small"
                      disabled={
                        sectionConfig[option.key] &&
                        Object.values(sectionConfig).filter(Boolean).length === 1
                      }
                    />
                    <Box sx={{ ml: 1, flexGrow: 1 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {option.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {option.description}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Paper>

          {/* Right Panel - PDF Preview */}
          <Box sx={{ flex: 1, height: '100%' }}>
            {reportDocument && (
              <PDFViewer
                key={`shadow-ai-pdf-viewer-${Date.now()}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                showToolbar={true}
              >
                {reportDocument}
              </PDFViewer>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Sections enabled: {Object.values(sectionConfig).filter(Boolean).length} of{' '}
              {sectionOptions.length}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              const downloadDocument = (
                <ShadowAIReportDocument
                  tenantName={tenantName}
                  data={data}
                  brandingSettings={brandingSettings}
                  sectionConfig={sectionConfig}
                />
              )
              import('@react-pdf/renderer').then(({ pdf }) => {
                pdf(downloadDocument)
                  .toBlob()
                  .then((blob) => {
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = fileName
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  })
                  .catch((error) => {
                    console.error('Error generating Shadow AI PDF:', error)
                  })
              })
            }}
          >
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