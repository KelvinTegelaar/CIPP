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
import {
  Document,
  Font,
  Image,
  Page,
  Path,
  PDFViewer,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer'
import { useSettings } from '../hooks/use-settings'

// react-pdf hyphenates words by default ("Detected" becomes "De-tected" in narrow stat cards);
// keep words whole and let them wrap instead.
Font.registerHyphenationCallback((word) => [word])

// Executive Shadow AI report following the same design system as the executive report:
// full-bleed cover, branded page headers, black infographic chapter splitters, and data pages.
const ShadowAIReportDocument = ({
  tenantName,
  data,
  brandingSettings,
  sectionConfig = {
    coverPage: true,
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
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const brandColor = brandingSettings?.colour || '#F77F00'

  const summary = data?.summary ?? {}
  const detectedApps = data?.detectedApps ?? []
  const consentedApps = data?.consentedApps ?? []
  const topTools = data?.topTools ?? []
  const byRisk = data?.byRisk ?? []

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.4,
      color: '#2D3748',
      padding: 40,
      paddingBottom: 60,
    },

    // COVER PAGE
    coverPage: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      padding: 60,
      justifyContent: 'space-between',
      minHeight: '100%',
    },
    coverHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 80,
    },
    logo: {
      height: 100,
      marginRight: 12,
    },
    headerLogo: {
      height: 30,
    },
    dateStamp: {
      fontSize: 9,
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    coverHero: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingTop: 40,
    },
    coverLabel: {
      backgroundColor: brandColor,
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 30,
      alignSelf: 'flex-start',
    },
    mainTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#1A202C',
      lineHeight: 1.1,
      marginBottom: 20,
      letterSpacing: -1,
      textTransform: 'uppercase',
    },
    titleAccent: {
      color: brandColor,
    },
    subtitle: {
      fontSize: 14,
      color: '#000000',
      fontWeight: 'normal',
      lineHeight: 1.5,
      marginBottom: 40,
      maxWidth: 400,
    },
    tenantName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 8,
    },
    coverFooter: {
      textAlign: 'center',
      marginTop: 60,
    },
    confidential: {
      fontSize: 9,
      color: '#A0AEC0',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // CONTENT PAGES
    pageHeader: {
      borderBottom: `1px solid ${brandColor}`,
      paddingBottom: 12,
      marginBottom: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    pageHeaderContent: {
      flex: 1,
    },
    pageTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1A202C',
      marginBottom: 8,
    },
    pageSubtitle: {
      fontSize: 11,
      color: '#4A5568',
      fontWeight: 'normal',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: brandColor,
      marginBottom: 12,
    },
    bodyText: {
      fontSize: 9,
      color: '#2D3748',
      lineHeight: 1.5,
      marginBottom: 12,
      textAlign: 'justify',
    },

    // STATS GRID
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      padding: 16,
      alignItems: 'center',
      borderTop: `3px solid ${brandColor}`,
    },
    statNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      color: brandColor,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 7,
      color: '#4A5568',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
      fontWeight: 'bold',
    },

    // TABLES
    controlsTable: {
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: brandColor,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    headerCell: {
      fontSize: 7,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#F7FAFC',
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    cellName: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#2D3748',
    },
    cellDesc: {
      fontSize: 7,
      color: '#4A5568',
      lineHeight: 1.3,
    },

    // INFO BOXES
    infoBox: {
      backgroundColor: '#FFFFFF',
      border: `1px solid #E2E8F0`,
      borderLeft: `4px solid ${brandColor}`,
      borderRadius: 4,
      padding: 12,
      marginBottom: 12,
    },
    infoTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#2D3748',
      marginBottom: 6,
    },
    infoText: {
      fontSize: 8,
      color: '#4A5568',
      lineHeight: 1.4,
    },

    // RECOMMENDATIONS
    recommendationsList: {
      gap: 8,
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    recommendationBullet: {
      fontSize: 8,
      color: brandColor,
      marginRight: 6,
      fontWeight: 'bold',
      marginTop: 1,
    },
    recommendationText: {
      fontSize: 8,
      color: '#2D3748',
      lineHeight: 1.4,
      flex: 1,
    },
    recommendationLabel: {
      fontWeight: 'bold',
    },

    // CHART
    chartContainer: {
      backgroundColor: '#FFFFFF',
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#2D3748',
      marginBottom: 12,
    },
    svgChart: {
      width: 400,
      height: 180,
      marginBottom: 8,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      alignSelf: 'flex-start',
    },
    legendSwatch: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 8,
      color: '#4A5568',
    },

    // FOOTER
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid #E2E8F0',
      paddingTop: 8,
    },
    footerText: {
      fontSize: 7,
      color: '#718096',
    },
    pageNumber: {
      fontSize: 7,
      color: '#718096',
      fontWeight: 'bold',
    },

    // BLACK STATISTIC PAGES
    statPage: {
      flexDirection: 'column',
      backgroundColor: '#000000',
      fontFamily: 'Helvetica',
      padding: 0,
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '100%',
      position: 'relative',
    },
    statBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.5,
    },
    statOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 60,
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    statHighlight: {
      fontSize: 72,
      color: brandColor,
      fontWeight: '900',
      lineHeight: 1,
      marginBottom: 8,
    },
    statSubText: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: 'bold',
      lineHeight: 1.3,
      marginBottom: 40,
    },
    statFooterText: {
      position: 'absolute',
      bottom: 60,
      right: 60,
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'right',
      lineHeight: 1.3,
    },
  })

  const PageFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{tenantName} - Shadow AI Report</Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  )

  const ContentPageHeader = ({ title, subtitle }) => (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderContent}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageSubtitle}>{subtitle}</Text>
      </View>
      {brandingSettings?.logo && (
        <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
      )}
    </View>
  )

  const riskColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#3B82F6',
    informational: '#10B981',
  }
  const riskColor = (risk) => riskColors[String(risk).toLowerCase()] ?? '#A0AEC0'

  // Donut chart for the risk distribution, same construction as the drift donut in the
  // executive report.
  const RiskDonut = () => {
    const chartData = byRisk.filter((item) => item.tools > 0)
    const total = chartData.reduce((sum, item) => sum + item.tools, 0)
    if (total === 0) return null

    const centerX = 200
    const centerY = 90
    const outerRadius = 60
    const innerRadius = 25

    let currentAngle = 0
    const slices = chartData.map((item) => {
      // Cap a full-circle slice just below 360 degrees - an arc with identical start and
      // end points renders as nothing.
      const angle = Math.min((item.tools / total) * 360, 359.99)
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const outerStartX = centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180)
      const outerStartY = centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180)
      const outerEndX = centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180)
      const outerEndY = centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180)
      const innerStartX = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180)
      const innerStartY = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180)
      const innerEndX = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180)
      const innerEndY = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180)
      const largeArcFlag = angle > 180 ? 1 : 0

      const pathData = [
        `M ${outerStartX} ${outerStartY}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
        `L ${innerEndX} ${innerEndY}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
        'Z',
      ].join(' ')

      return { pathData, color: riskColor(item.risk) }
    })

    return (
      <View style={styles.chartContainer} wrap={false}>
        <Text style={styles.chartTitle}>AI Tool Risk Distribution</Text>
        <Svg style={styles.svgChart} viewBox="0 0 400 180">
          {slices.map((slice, index) => (
            <Path key={index} d={slice.pathData} fill={slice.color} />
          ))}
        </Svg>
        {chartData.map((item) => (
          <View style={styles.legendRow} key={item.risk}>
            <View style={[styles.legendSwatch, { backgroundColor: riskColor(item.risk) }]} />
            <Text style={styles.legendText}>
              {item.risk}: {item.tools} {item.tools === 1 ? 'tool' : 'tools'}
            </Text>
          </View>
        ))}
      </View>
    )
  }

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
    <Document>
      {/* COVER PAGE */}
      {sectionConfig.coverPage && (
        <Page size="A4" style={styles.coverPage}>
          <Image style={styles.statBackground} src="/reportImages/city.jpg" />
          <View style={styles.coverHeader}>
            <View>
              {brandingSettings?.logo && (
                <Image style={styles.logo} src={brandingSettings.logo} cache={false} />
              )}
            </View>
            <Text style={styles.dateStamp}>{currentDate}</Text>
          </View>

          <View style={styles.coverHero}>
            <Text style={styles.coverLabel}>AI RISK ASSESSMENT</Text>

            <Text style={styles.mainTitle}>
              Shadow AI{'\n'}
              <Text style={styles.titleAccent}>Report</Text>
            </Text>

            <Text style={styles.subtitle}>
              Discovery and risk assessment of AI tools in use across managed devices and cloud
              applications
            </Text>

            <Text style={styles.tenantName}>{tenantName || 'Organization Name'}</Text>
          </View>

          <View style={styles.coverFooter}>
            <Text style={styles.confidential}>Confidential & Proprietary</Text>
          </View>
        </Page>
      )}

      {/* EXECUTIVE SUMMARY */}
      {sectionConfig.executiveSummary && (
        <Page size="A4" style={styles.page}>
          <ContentPageHeader
            title="Executive Summary"
            subtitle="Strategic overview of AI usage in your Microsoft 365 environment"
          />

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              This report identifies the artificial intelligence tools discovered in the{' '}
              <Text style={{ fontWeight: 'bold' }}>{tenantName || 'your organization'}</Text>{' '}
              environment, combining software inventory from managed devices (Intune) with cloud
              application consent data from Entra ID. Each tool is matched against a curated catalog
              of known AI services and assigned a risk level based on its data handling practices.
            </Text>
            <Text style={styles.bodyText}>
              Tools that have been explicitly approved are marked as company sanctioned and report
              the Informational risk level. Everything else represents shadow AI: tools adopted by
              employees without review or approval, whose handling of company data is unknown.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Usage Overview</Text>
            <View style={styles.statsGrid} wrap={false}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{summary.aiToolsDetected ?? 0}</Text>
                <Text style={styles.statLabel}>AI Tools</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{summary.deviceInstalls ?? 0}</Text>
                <Text style={styles.statLabel}>Device Installs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{summary.consentedAiApps ?? 0}</Text>
                <Text style={styles.statLabel}>Entra AI Apps</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                  {summary.highRiskTools ?? 0}
                </Text>
                <Text style={styles.statLabel}>High Risk</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>
                  {summary.sanctionedTools ?? 0}
                </Text>
                <Text style={styles.statLabel}>Sanctioned</Text>
              </View>
            </View>
          </View>

          {topTools.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Most Used AI Tools</Text>
              <View style={styles.controlsTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { flex: 3 }]}>Tool</Text>
                  <Text style={[styles.headerCell, { flex: 3, marginLeft: 8 }]}>Category</Text>
                  <Text style={[styles.headerCell, { flex: 2, marginLeft: 8 }]}>Status</Text>
                  <Text style={[styles.headerCell, { flex: 1.5, marginLeft: 8 }]}>Devices</Text>
                  <Text style={[styles.headerCell, { flex: 1.5, marginLeft: 8 }]}>Users (7d)</Text>
                </View>
                {topTools.map((tool, index) => (
                  <View style={styles.tableRow} key={`${tool.tool}-${index}`} wrap={false}>
                    <Text style={[styles.cellName, { flex: 3 }]}>{tool.tool}</Text>
                    <Text style={[styles.cellDesc, { flex: 3, marginLeft: 8 }]}>
                      {tool.category}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 2, marginLeft: 8 }]}>
                      {tool.status ?? 'Unsanctioned'}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 1.5, marginLeft: 8 }]}>
                      {tool.devices}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 1.5, marginLeft: 8 }]}>
                      {tool.users}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <PageFooter />
        </Page>
      )}

      {/* STATISTIC PAGE - CHAPTER SPLITTER */}
      {sectionConfig.infographics && (
        <Page size="A4" style={styles.statPage}>
          <Image style={styles.statBackground} src="/reportImages/laptop.jpg" />
          <View style={styles.statOverlay}>
            <Text style={styles.statHighlight}>75%</Text>
            <Text style={styles.statSubText}>
              of knowledge workers already{'\n'}
              use <Text style={{ fontWeight: 'bold' }}>generative AI</Text> at work -{'\n'}
              most without their employer knowing
            </Text>
          </View>
          <Text style={styles.statFooterText}>
            <Text style={{ fontWeight: 'bold' }}>Visibility</Text> is the first step{'\n'}
            to <Text style={{ fontWeight: 'bold' }}>control</Text>
          </Text>
        </Page>
      )}

      {/* UNDERSTANDING SHADOW AI */}
      {sectionConfig.background && (
        <Page size="A4" style={styles.page}>
          <ContentPageHeader
            title="Understanding Shadow AI"
            subtitle="What unmanaged AI usage means for your organization"
          />

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              Shadow AI is the use of artificial intelligence tools by employees without the
              knowledge or approval of the organization - the AI-era equivalent of shadow IT.
              Because most AI tools are free, browser-based and immediately useful, adoption happens
              quietly and quickly: an employee pastes a customer email into a chatbot to draft a
              reply, uploads a spreadsheet for analysis, or installs an AI notetaker that joins
              every meeting.
            </Text>
            <Text style={styles.bodyText}>
              The goal of a shadow AI program is not zero AI usage, but zero unsanctioned usage.
              Every tool in this report should end up either approved and managed, or replaced and
              blocked. The four risk areas below explain why unmanaged usage deserves attention.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Risk Areas</Text>
            {riskAreas.map((area) => (
              <View
                style={[styles.infoBox, { borderLeft: `4px solid ${area.color}` }]}
                key={area.title}
                wrap={false}
              >
                <Text style={styles.infoTitle}>{area.title}</Text>
                <Text style={styles.infoText}>{area.text}</Text>
              </View>
            ))}
          </View>

          <PageFooter />
        </Page>
      )}

      {/* RISK LEVELS & DISTRIBUTION */}
      {sectionConfig.riskLevels && (
        <Page size="A4" style={styles.page}>
          <ContentPageHeader
            title="AI Tool Risk Levels"
            subtitle="How risk is assigned and how it is distributed in this tenant"
          />

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              Detected tools are matched against a curated catalog of known AI services, each
              carrying a risk classification based on its data handling practices, account model and
              enterprise controls. Marking a tool as company sanctioned overrides its catalog risk
              with the Informational level, so the figures below reflect only unapproved use.
            </Text>
          </View>

          <RiskDonut />

          <View style={styles.section}>
            {[0, 2].map((start) => (
              <View style={{ flexDirection: 'row', gap: 12 }} key={start} wrap={false}>
                {riskLevels.slice(start, start + 2).map((level) => (
                  <View
                    style={[
                      styles.infoBox,
                      { flex: 1, borderLeft: `4px solid ${riskColor(level.name)}` },
                    ]}
                    key={level.name}
                  >
                    <Text style={[styles.infoTitle, { color: riskColor(level.name) }]}>
                      {level.name}
                    </Text>
                    <Text style={styles.infoText}>{level.text}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <PageFooter />
        </Page>
      )}

      {/* SANCTIONED TOOLS */}
      {sectionConfig.sanctionedTools && sanctionedToolsList.length > 0 && (
        <Page size="A4" style={styles.page}>
          <ContentPageHeader
            title="Company Sanctioned AI Tools"
            subtitle="AI tools that are approved for use in this organization"
          />

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              The tools listed below are permitted in this environment. They are allowed either
              because a business justification exists for their use, or because the system
              administrator has explicitly approved these tools for deployment. Sanctioned tools
              report the Informational risk level and are excluded from the shadow AI risk figures
              in this report; they remain listed for visibility into where AI is used across the
              organization.
            </Text>
            <Text style={styles.bodyText}>
              Approval is not permanent: sanctioned tools should be reviewed periodically to confirm
              that the plan in use, the vendor's data handling terms and the business justification
              still hold.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.controlsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 3 }]}>Tool</Text>
                <Text style={[styles.headerCell, { flex: 3, marginLeft: 8 }]}>Vendor</Text>
                <Text style={[styles.headerCell, { flex: 3, marginLeft: 8 }]}>Category</Text>
                <Text style={[styles.headerCell, { flex: 2, marginLeft: 8 }]}>Devices</Text>
                <Text style={[styles.headerCell, { flex: 2, marginLeft: 8 }]}>Users (7d)</Text>
              </View>
              {sanctionedToolsList.map((tool, index) => (
                <View style={styles.tableRow} key={`${tool.tool}-${index}`} wrap={false}>
                  <Text style={[styles.cellName, { flex: 3 }]}>{tool.tool}</Text>
                  <Text style={[styles.cellDesc, { flex: 3, marginLeft: 8 }]}>{tool.vendor}</Text>
                  <Text style={[styles.cellDesc, { flex: 3, marginLeft: 8 }]}>{tool.category}</Text>
                  <Text style={[styles.cellDesc, { flex: 2, marginLeft: 8 }]}>{tool.devices}</Text>
                  <Text style={[styles.cellDesc, { flex: 2, marginLeft: 8 }]}>{tool.users}</Text>
                </View>
              ))}
            </View>
          </View>

          <PageFooter />
        </Page>
      )}

      {/* DETECTED SOFTWARE */}
      {sectionConfig.detectedSoftware && (
        <Page size="A4" style={styles.page}>
          <ContentPageHeader
            title="AI Software on Managed Devices"
            subtitle="AI applications found in the Intune software inventory"
          />

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              The following AI applications were detected in the software inventory of managed
              devices
              {detectedApps.length > detectedRows.length
                ? `, showing the top ${detectedRows.length} of ${detectedApps.length} entries`
                : ''}
              . Device counts indicate how widely each application has spread through the
              environment.
            </Text>
          </View>

          <View style={styles.section}>
            {detectedRows.length === 0 ? (
              <Text style={styles.bodyText}>
                No AI software was detected on managed devices during the last inventory sync.
              </Text>
            ) : (
              <View style={styles.controlsTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { flex: 4 }]}>Application</Text>
                  <Text style={[styles.headerCell, { flex: 3, marginLeft: 8 }]}>AI Tool</Text>
                  <Text style={[styles.headerCell, { flex: 3, marginLeft: 8 }]}>Category</Text>
                  <Text style={[styles.headerCell, { flex: 2, marginLeft: 8 }]}>Risk</Text>
                  <Text style={[styles.headerCell, { flex: 2.5, marginLeft: 8 }]}>Status</Text>
                  <Text style={[styles.headerCell, { flex: 1.5, marginLeft: 8 }]}>Devices</Text>
                </View>
                {detectedRows.map((app, index) => (
                  <View style={styles.tableRow} key={`${app.application}-${index}`} wrap={false}>
                    <Text style={[styles.cellName, { flex: 4 }]}>{app.application}</Text>
                    <Text style={[styles.cellDesc, { flex: 3, marginLeft: 8 }]}>{app.aiTool}</Text>
                    <Text style={[styles.cellDesc, { flex: 3, marginLeft: 8 }]}>
                      {app.category}
                    </Text>
                    <Text
                      style={[
                        styles.cellDesc,
                        { flex: 2, marginLeft: 8, fontWeight: 'bold', color: riskColor(app.risk) },
                      ]}
                    >
                      {app.risk}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 2.5, marginLeft: 8 }]}>
                      {app.status}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 1.5, marginLeft: 8 }]}>
                      {app.deviceCount}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <PageFooter />
        </Page>
      )}

      {/* ENTRA APPLICATIONS */}
      {sectionConfig.entraApplications && (
        <Page size="A4" style={styles.page}>
          <ContentPageHeader
            title="AI Applications in Entra ID"
            subtitle="AI services with a footprint in your identity platform"
          />

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              The following AI services are registered as applications in the tenant, including any
              permissions users have consented to
              {consentedApps.length > consentedRows.length
                ? `, showing the top ${consentedRows.length} of ${consentedApps.length} entries`
                : ''}
              . The consent date shows when each service first gained a foothold in the environment.
            </Text>
          </View>

          <View style={styles.section}>
            {consentedRows.length === 0 ? (
              <Text style={styles.bodyText}>No AI applications were found in Entra ID.</Text>
            ) : (
              <View style={styles.controlsTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { flex: 4 }]}>Application</Text>
                  <Text style={[styles.headerCell, { flex: 3, marginLeft: 8 }]}>AI Tool</Text>
                  <Text style={[styles.headerCell, { flex: 2, marginLeft: 8 }]}>Risk</Text>
                  <Text style={[styles.headerCell, { flex: 2.5, marginLeft: 8 }]}>Status</Text>
                  <Text style={[styles.headerCell, { flex: 2, marginLeft: 8 }]}>Users (7d)</Text>
                  <Text style={[styles.headerCell, { flex: 2.5, marginLeft: 8 }]}>
                    First Consented
                  </Text>
                </View>
                {consentedRows.map((app, index) => (
                  <View style={styles.tableRow} key={`${app.applicationId}-${index}`} wrap={false}>
                    <Text style={[styles.cellName, { flex: 4 }]}>{app.application}</Text>
                    <Text style={[styles.cellDesc, { flex: 3, marginLeft: 8 }]}>{app.aiTool}</Text>
                    <Text
                      style={[
                        styles.cellDesc,
                        { flex: 2, marginLeft: 8, fontWeight: 'bold', color: riskColor(app.risk) },
                      ]}
                    >
                      {app.risk}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 2.5, marginLeft: 8 }]}>
                      {app.status}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 2, marginLeft: 8 }]}>
                      {app.activeUsersLast7Days}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 2.5, marginLeft: 8 }]}>
                      {app.firstConsentedDateTime
                        ? new Date(app.firstConsentedDateTime).toLocaleDateString()
                        : 'Unknown'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <PageFooter />
        </Page>
      )}

      {/* STATISTIC PAGE - CHAPTER SPLITTER */}
      {sectionConfig.infographics && (
        <Page size="A4" style={styles.statPage}>
          <Image style={styles.statBackground} src="/reportImages/working.jpg" />
          <View style={styles.statOverlay}>
            <Text style={styles.statHighlight}>1 in 3</Text>
            <Text style={styles.statSubText}>
              employees shares <Text style={{ fontWeight: 'bold' }}>sensitive work data</Text>
              {'\n'}
              with AI tools without approval
            </Text>
          </View>
          <Text style={styles.statFooterText}>
            <Text style={{ fontWeight: 'bold' }}>Sanctioned alternatives</Text> keep{'\n'}
            your data <Text style={{ fontWeight: 'bold' }}>under contract</Text>
          </Text>
        </Page>
      )}

      {/* RECOMMENDATIONS */}
      {sectionConfig.recommendations && (
        <Page size="A4" style={styles.page}>
          <ContentPageHeader
            title="Recommendations"
            subtitle="A structured response to shadow AI in your environment"
          />

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              A structured response to shadow AI combines approval of useful tools with controls on
              the rest. The following actions are recommended based on the findings in this report:
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Plan</Text>
            <View style={styles.recommendationsList}>
              {recommendations.map((recommendation, index) => (
                <View style={styles.recommendationItem} key={index} wrap={false}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>
                    <Text style={styles.recommendationLabel}>{recommendation.label}</Text>{' '}
                    {recommendation.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.infoBox} wrap={false}>
              <Text style={styles.infoTitle}>Next Review</Text>
              <Text style={styles.infoText}>
                The AI tool landscape changes quickly and new tools appear in tenants within days of
                release. We recommend re-running this assessment monthly and reviewing newly
                detected tools against your acceptable AI use policy.
              </Text>
            </View>
          </View>

          <PageFooter />
        </Page>
      )}
    </Document>
  )
}

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
