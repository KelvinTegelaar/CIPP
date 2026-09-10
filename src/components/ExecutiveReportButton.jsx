import { useState, useMemo } from 'react'
import { CippIcons } from '../utils/icon-registry'
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Switch,
  Paper,
  Stack,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material'
import { CippAutoComplete } from './CippComponents/CippAutocomplete'
import { CippOffCanvas } from './CippComponents/CippOffCanvas'
import { Document, Page, Text, View, Image } from '@react-pdf/renderer'
import { CippPdfPreview } from './CippPdf/CippPdfPreview'
import { useSettings } from '../hooks/use-settings'
import { useSecureScore } from '../hooks/use-securescore'
import { ApiGetCall } from '../api/ApiCall'
import { ShadowAIReportPages } from './ShadowAIReportButton'
import { DEFAULT_BRANDING_OPTION } from './ReportBuilder/reportSettings'
import { useReportVariables } from './CippPdf/useReportVariables'
import { useBrandingSettings } from './CippPdf/useBrandingSettings'
import { isCloudPcDevice } from '../utils/is-cloud-pc-device'
import {
  Bold,
  BulletList,
  ContentPage,
  DataTable,
  DonutChart,
  HeroPage,
  InfoBox,
  Paragraph,
  ReportDocument,
  REPORT_SERIES_SEMANTIC,
  Section,
  StatRow,
  StatusText,
  TrendChart,
} from './CippPdf'

// Conditional access policy states, as Graph spells them and as a reader should read them.
const CA_STATE_LABELS = {
  enabled: 'Enabled',
  enabledForReportingButNotEnforced: 'Report Only',
  disabled: 'Disabled',
}
const CA_STATE_TONES = {
  enabled: 'pass',
  enabledForReportingButNotEnforced: 'warn',
  disabled: 'fail',
}
const CA_CONTROL_LABELS = { mfa: 'MFA', block: 'Block', compliantDevice: 'Compliant Device' }

const caControlsText = (policy) => {
  const controls = Object.entries(CA_CONTROL_LABELS)
    .filter(([control]) => policy.builtInControls?.includes(control))
    .map(([, label]) => label)
  return controls.length > 0 ? controls.join(', ') : 'Custom'
}

// The generated standards catalogue, loaded once. Three separate `require` calls inside render
// paths used to reload it per deviation row.
let standardsCatalog = null
try {
  standardsCatalog = require('../data/standards.json')
} catch (error) {
  standardsCatalog = null
}

// PRODUCTION-GRADE PDF SYSTEM WITH CONDITIONAL RENDERING
// Exported so the report can be rendered to a real PDF in tests. A report that only throws once
// the renderer walks it is the failure mode a stubbed test cannot see.
export const ExecutiveReportDocument = ({
  tenantName,
  userStats,
  brandingSettings,
  variables,
  secureScoreData,
  licensingData,
  deviceData,
  conditionalAccessData,
  standardsCompareData,
  driftComplianceData,
  standardTemplatesData,
  shadowAIData,
  sectionConfig = {
    executiveSummary: true,
    securityStandards: true,
    driftCompliance: false,
    secureScore: true,
    licenseManagement: true,
    deviceManagement: true,
    conditionalAccess: true,
    infographics: true,
    shadowAI: false,
  },
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Both arrive as an array on the happy path and as an error object or `undefined` when their
  // endpoint failed. The page-level guards below check that, but these run unconditionally, so
  // they have to check it too.
  const caPolicies = Array.isArray(conditionalAccessData) ? conditionalAccessData : []
  const devices = Array.isArray(deviceData) ? deviceData : []

  const caEnabledCount = caPolicies.filter((policy) => policy.state === 'enabled').length
  const caReportOnlyCount = caPolicies.filter(
    (policy) => policy.state === 'enabledForReportingButNotEnforced'
  ).length

  // Secure score history, oldest first, in the shape the shared trend chart takes. The API returns
  // newest first, which would draw the trend backwards.
  const scoreTrendData = [...(secureScoreData?.secureScore?.data?.Results ?? [])]
    .reverse()
    .map((point) => ({
      label: new Date(point.createdDateTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: point.currentScore,
    }))

  // PROCESS REAL STANDARDS DATA
  const processStandardsData = (apiData, standardTemplates) => {
    const standardsData = standardsCatalog

    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      return []
    }

    // Build a lookup map from template configurations
    // Format: { "GUID": "Display Name" }
    const templateDisplayNameMap = {}

    if (standardTemplates && Array.isArray(standardTemplates)) {
      standardTemplates.forEach((template) => {
        if (template.standards) {
          // Process IntuneTemplate arrays
          if (Array.isArray(template.standards.IntuneTemplate)) {
            template.standards.IntuneTemplate.forEach((templateItem) => {
              if (templateItem?.TemplateList?.value && templateItem?.TemplateList?.label) {
                templateDisplayNameMap[templateItem.TemplateList.value.toLowerCase()] =
                  templateItem.TemplateList.label
              }
              // Handle TemplateList-Tags expansion
              const tagTemplates =
                templateItem?.['TemplateList-Tags']?.addedFields?.templates ||
                templateItem?.['TemplateList-Tags']?.rawData?.templates
              if (tagTemplates && Array.isArray(tagTemplates)) {
                tagTemplates.forEach((expandedTemplate) => {
                  if (
                    expandedTemplate?.GUID &&
                    (expandedTemplate?.displayName || expandedTemplate?.name)
                  ) {
                    templateDisplayNameMap[expandedTemplate.GUID.toLowerCase()] =
                      expandedTemplate.displayName || expandedTemplate.name
                  }
                })
              }
            })
          }
          // Process ConditionalAccessTemplate arrays
          if (Array.isArray(template.standards.ConditionalAccessTemplate)) {
            template.standards.ConditionalAccessTemplate.forEach((templateItem) => {
              if (templateItem?.TemplateList?.value && templateItem?.TemplateList?.label) {
                templateDisplayNameMap[templateItem.TemplateList.value.toLowerCase()] =
                  templateItem.TemplateList.label
              }
              // Handle TemplateList-Tags expansion
              const tagTemplates =
                templateItem?.['TemplateList-Tags']?.addedFields?.templates ||
                templateItem?.['TemplateList-Tags']?.rawData?.templates
              if (tagTemplates && Array.isArray(tagTemplates)) {
                tagTemplates.forEach((expandedTemplate) => {
                  if (
                    expandedTemplate?.GUID &&
                    (expandedTemplate?.displayName || expandedTemplate?.name)
                  ) {
                    templateDisplayNameMap[expandedTemplate.GUID.toLowerCase()] =
                      expandedTemplate.displayName || expandedTemplate.name
                  }
                })
              }
            })
          }
        }
      })
    }

    const processedStandards = []
    const tenantData = apiData[0] // Get the first tenant's data

    // Process each standard from the API response
    Object.keys(tenantData).forEach((key) => {
      if (key.startsWith('standards.') && key !== 'tenantFilter') {
        const standardKey = key
        const standardValue = tenantData[key]
        const standardDef = standardsData?.find((std) => std.name === standardKey)

        if (standardDef) {
          // Determine compliance status using the same logic as applied-standards.js
          let status = 'Review'
          let isCompliant = false

          // FIRST: Check if CurrentValue and ExpectedValue exist and match
          if (
            standardValue?.CurrentValue !== undefined &&
            standardValue?.ExpectedValue !== undefined
          ) {
            const sortedCurrent =
              typeof standardValue.CurrentValue === 'object' && standardValue.CurrentValue !== null
                ? Object.keys(standardValue.CurrentValue)
                    .sort()
                    .reduce((obj, key) => {
                      obj[key] = standardValue.CurrentValue[key]
                      return obj
                    }, {})
                : standardValue.CurrentValue
            const sortedExpected =
              typeof standardValue.ExpectedValue === 'object' &&
              standardValue.ExpectedValue !== null
                ? Object.keys(standardValue.ExpectedValue)
                    .sort()
                    .reduce((obj, key) => {
                      obj[key] = standardValue.ExpectedValue[key]
                      return obj
                    }, {})
                : standardValue.ExpectedValue
            isCompliant = JSON.stringify(sortedCurrent) === JSON.stringify(sortedExpected)
          }
          // SECOND: Check if Value is explicitly true
          else if (standardValue?.Value === true) {
            isCompliant = true
          }

          status = isCompliant ? 'Compliant' : 'Review'

          // Get tags for display - fix the tags access
          const tags =
            standardDef.tag && Array.isArray(standardDef.tag) && standardDef.tag.length > 0
              ? standardDef.tag.slice(0, 2).join(', ') // Show first 2 tags
              : 'No tags'
          processedStandards.push({
            name: standardDef.label,
            description:
              standardDef.executiveText || standardDef.helpText || 'No description available',
            status: status,
            tags: tags,
          })
        } else {
          // If no definition found, still add it with basic info
          let status = 'Review'
          let isCompliant = false

          // FIRST: Check if CurrentValue and ExpectedValue exist and match
          if (
            standardValue?.CurrentValue !== undefined &&
            standardValue?.ExpectedValue !== undefined
          ) {
            const sortedCurrent =
              typeof standardValue.CurrentValue === 'object' && standardValue.CurrentValue !== null
                ? Object.keys(standardValue.CurrentValue)
                    .sort()
                    .reduce((obj, key) => {
                      obj[key] = standardValue.CurrentValue[key]
                      return obj
                    }, {})
                : standardValue.CurrentValue
            const sortedExpected =
              typeof standardValue.ExpectedValue === 'object' &&
              standardValue.ExpectedValue !== null
                ? Object.keys(standardValue.ExpectedValue)
                    .sort()
                    .reduce((obj, key) => {
                      obj[key] = standardValue.ExpectedValue[key]
                      return obj
                    }, {})
                : standardValue.ExpectedValue
            isCompliant = JSON.stringify(sortedCurrent) === JSON.stringify(sortedExpected)
          }
          // SECOND: Check if Value is explicitly true
          else if (standardValue?.Value === true) {
            isCompliant = true
          }

          status = isCompliant ? 'Compliant' : 'Review'

          // Create a proper name from the key - handle template types specially
          let displayName = ''

          // Check if this is an IntuneTemplate or ConditionalAccessTemplate
          const intuneTemplateMatch = standardKey.match(/^standards\.IntuneTemplate\.([0-9a-f-]+)/i)
          const caTemplateMatch = standardKey.match(
            /^standards\.ConditionalAccessTemplate\.([0-9a-f-]+)/i
          )

          if (intuneTemplateMatch) {
            // IntuneTemplate - look up display name from template configurations
            const guid = intuneTemplateMatch[1]
            const lookupName = templateDisplayNameMap[guid.toLowerCase()]
            displayName = lookupName || `Intune Template - ${guid.substring(0, 8)}`
          } else if (caTemplateMatch) {
            // ConditionalAccessTemplate - look up display name from template configurations
            const guid = caTemplateMatch[1]
            const lookupName = templateDisplayNameMap[guid.toLowerCase()]
            displayName = lookupName || `CA Template - ${guid.substring(0, 8)}`
          } else {
            // Regular standard - use basic name formatting
            displayName = standardKey
              .replace('standards.', '')
              .replace(/([A-Z])/g, ' $1') // Add space before capital letters
              .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
              .trim()
          }

          processedStandards.push({
            name: displayName,
            description: 'Security standard implementation',
            status: status,
            tags: 'No tags',
          })
        }
      }
    })

    return processedStandards
  }

  // PROCESS DRIFT COMPLIANCE DATA
  const processDriftComplianceData = (driftData, standardsCompareData) => {
    if (!driftData || !Array.isArray(driftData) || driftData.length === 0) {
      return {
        acceptedDeviationsCount: 0,
        currentDeviationsCount: 0,
        deniedDeviationsCount: 0,
        customerSpecificDeviationsCount: 0,
        alignedCount: 0,
        acceptedDeviations: [],
        currentDeviations: [],
        deniedDeviations: [],
        customerSpecificDeviations: [],
        appliedStandards: [],
      }
    }

    const standardsData = standardsCatalog

    // Helper function to get pretty name from standards.json (same as manage-drift)
    const getStandardPrettyName = (standardName) => {
      if (!standardName) return 'Unknown Standard'
      const standard = standardsData?.find((s) => s.name === standardName)
      if (standard && standard.label) {
        return standard.label
      }
      return null
    }

    // Helper function to process deviations with pretty names
    const processDeviations = (deviations) => {
      return (deviations || []).map((deviation) => ({
        ...deviation,
        prettyName:
          deviation.standardDisplayName ||
          getStandardPrettyName(deviation.standardName) ||
          deviation.standardName ||
          'Unknown Standard',
      }))
    }

    // Aggregate data across all standards for this tenant
    const aggregatedData = driftData.reduce(
      (acc, item) => {
        acc.acceptedDeviationsCount += item.acceptedDeviationsCount || 0
        acc.currentDeviationsCount += item.currentDeviationsCount || 0
        acc.alignedCount += item.alignedCount || 0
        acc.customerSpecificDeviationsCount += item.customerSpecificDeviationsCount || 0
        acc.deniedDeviationsCount += item.deniedDeviationsCount || 0

        // Collect deviations with pretty names
        if (item.currentDeviations && Array.isArray(item.currentDeviations)) {
          acc.currentDeviations.push(
            ...processDeviations(item.currentDeviations.filter((dev) => dev !== null))
          )
        }
        if (item.acceptedDeviations && Array.isArray(item.acceptedDeviations)) {
          acc.acceptedDeviations.push(
            ...processDeviations(item.acceptedDeviations.filter((dev) => dev !== null))
          )
        }
        if (item.customerSpecificDeviations && Array.isArray(item.customerSpecificDeviations)) {
          acc.customerSpecificDeviations.push(
            ...processDeviations(item.customerSpecificDeviations.filter((dev) => dev !== null))
          )
        }
        if (item.deniedDeviations && Array.isArray(item.deniedDeviations)) {
          acc.deniedDeviations.push(
            ...processDeviations(item.deniedDeviations.filter((dev) => dev !== null))
          )
        }

        return acc
      },
      {
        acceptedDeviationsCount: 0,
        currentDeviationsCount: 0,
        alignedCount: 0,
        customerSpecificDeviationsCount: 0,
        deniedDeviationsCount: 0,
        currentDeviations: [],
        acceptedDeviations: [],
        customerSpecificDeviations: [],
        deniedDeviations: [],
        appliedStandards: [],
      }
    )

    // Get complete list of applied standards from standards comparison data (like policies-deployed)
    if (
      standardsData &&
      standardsCompareData &&
      Array.isArray(standardsCompareData) &&
      standardsCompareData.length > 0
    ) {
      const tenantData = standardsCompareData[0]
      const appliedStandards = []

      // Process each standard from the API response
      Object.keys(tenantData).forEach((key) => {
        if (key.startsWith('standards.') && key !== 'tenantFilter') {
          const standardKey = key
          const standardDef = standardsData.find((std) => std.name === standardKey)

          if (standardDef) {
            appliedStandards.push({
              name: standardDef.label || standardKey,
              executiveDescription:
                standardDef.executiveText || standardDef.helpText || 'No description available',
              category: standardDef.cat || 'General',
            })
          }
        }
      })

      aggregatedData.appliedStandards = appliedStandards
    }

    return aggregatedData
  }

  let securityControls = processStandardsData(standardsCompareData, standardTemplatesData)
  let driftComplianceInfo = processDriftComplianceData(driftComplianceData, standardsCompareData)

  // Compliance grade -> the shared status vocabulary.
  const badgeTone = (status) => {
    switch (status) {
      case 'Compliant':
        return 'pass'
      case 'Partial':
        return 'warn'
      case 'Review':
      case 'Review Required':
        return 'fail'
      default:
        return null
    }
  }

  // The four deviation buckets flattened into one set of table rows. They were four copies of the
  // same twenty lines, each re-requiring standards.json inside its own map.
  const deviationRows = [
    {
      list: driftComplianceInfo?.currentDeviations,
      take: 5,
      status: 'Current',
      tone: 'fail',
      fallback: 'Policy deviation detected',
    },
    {
      list: driftComplianceInfo?.acceptedDeviations,
      take: 3,
      status: 'Accepted',
      tone: 'pass',
      fallback: 'Accepted policy deviation',
    },
    {
      list: driftComplianceInfo?.customerSpecificDeviations,
      take: 3,
      status: 'Client Specific',
      tone: 'warn',
      fallback: 'Customer-specific policy configuration',
    },
    {
      list: driftComplianceInfo?.deniedDeviations,
      take: 2,
      status: 'Denied',
      tone: 'fail',
      fallback: 'Denied policy deviation',
    },
  ].flatMap((bucket) =>
    (bucket.list ?? []).slice(0, bucket.take).map((deviation) => {
      const standardDef = standardsCatalog?.find((std) => std.name === deviation.standardName)
      return {
        policy: deviation.prettyName || 'Unknown Policy',
        description: standardDef?.executiveText || standardDef?.helpText || bucket.fallback,
        status: bucket.status,
        tone: bucket.tone,
      }
    })
  )

  // Compliance state arrives under either casing depending on which endpoint fed the report.
  const isCompliant = (device) =>
    (device.complianceState || device.ComplianceState || '').toLowerCase() === 'compliant'
  const compliantDevices = devices.filter(isCompliant)

  // Applied standards grouped under their category heading.
  const appliedStandardsByCategory = Object.entries(
    (driftComplianceInfo?.appliedStandards ?? []).reduce((groups, standard) => {
      const category = standard.category || 'General'
      ;(groups[category] ??= []).push(standard)
      return groups
    }, {})
  )

  return (
    <ReportDocument
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      reportName="Executive Summary"
      generatedOn={currentDate}
      variables={variables}
      coverLabel="SECURITY ASSESSMENT"
      coverTitle="Executive"
      coverAccent="Summary"
      coverSubtitle={`Security & Compliance Assessment for ${tenantName || 'your organization'}`}
      coverTenant={tenantName || 'Organization Name'}
    >
      {/* EXECUTIVE SUMMARY - MODULAR COMPOSITION (FROST) */}
      {sectionConfig.executiveSummary && (
        <ContentPage
          title="Executive Summary"
          subtitle="Strategic overview of your Microsoft 365 security posture"
        >
          <Section>
            <Paragraph>
              This security assessment for <Bold>{tenantName || 'your organization'}</Bold> provides
              a clear picture of your organization's cybersecurity posture and readiness against
              modern threats. We've evaluated your current security measures against industry best
              practices to identify strengths and opportunities for improvement.
            </Paragraph>

            <Paragraph>
              Our assessment follows globally recognized security standards to ensure your
              organization meets regulatory requirements and industry benchmarks. This approach
              helps protect your business assets, maintain customer trust, and reduce operational
              risks from cyber threats.
            </Paragraph>
          </Section>

          <Section title="Environment Overview">
            <StatRow
              stats={[
                { value: userStats?.licensedUsers || '0', label: 'Licensed Users' },
                { value: userStats?.unlicensedUsers || '0', label: 'Unlicensed Users' },
                { value: userStats?.guests || '0', label: 'Guest Users' },
                {
                  value: userStats?.globalAdmins || '0',
                  label: 'Global Admins',
                  // PIM view on Entra ID P2 tenants: standing versus eligible administrators.
                  caption: userStats?.pimCapable
                    ? `${userStats.permanentGlobalAdmins} permanent, ${userStats.eligibleGlobalAdmins} eligible`
                    : undefined,
                },
              ]}
            />
          </Section>
        </ContentPage>
      )}

      {/* STATISTIC PAGE 1 - CHAPTER SPLITTER */}
      {sectionConfig.infographics && (
        <HeroPage
          backgroundImage="/reportImages/board.jpg"
          highlight="83%"
          subText={
            <>
              of organizations experienced{'\n'}
              more than one <Bold>cyberattack</Bold>
              {'\n'}
              in the past year
            </>
          }
          footerText={
            <>
              <Bold>Proactive security</Bold> prevents{'\n'}
              <Bold>repeated attacks</Bold>
            </>
          }
        />
      )}

      {/* SECURITY CONTROLS - Only show if standards data is available and enabled and drift compliance is disabled */}
      {sectionConfig.securityStandards &&
        !sectionConfig.driftCompliance &&
        (() => {
          return securityControls && securityControls.length > 0
        })() && (
          <ContentPage
            title="Security Standards Assessment"
            subtitle="Detailed evaluation of implemented security standards"
          >
            <Section>
              <Paragraph>
                Your security standards have been carefully evaluated against industry best
                practices to protect your business from cyber threats while ensuring smooth daily
                operations. These standards help maintain business continuity, protect sensitive
                data, and meet regulatory requirements that are essential for your industry.
              </Paragraph>
            </Section>

            <Section title="Security Standards Status">
              <DataTable
                limit={securityControls.length}
                columns={[
                  { header: 'Standard', key: 'name', width: 2, bold: true },
                  { header: 'Description', key: 'description', width: 4 },
                  { header: 'Tags', key: 'tags', width: 2 },
                  {
                    header: 'Status',
                    key: 'status',
                    width: 1.5,
                    align: 'center',
                    render: (control) => (
                      <StatusText tone={badgeTone(control.status)}>{control.status}</StatusText>
                    ),
                  },
                ]}
                rows={securityControls.map((control) => ({
                  ...control,
                  name:
                    control.name.length > 100
                      ? control.name.substring(0, 100) + '...'
                      : control.name,
                  tags: control.tags.length > 0 ? control.tags : 'No tags',
                }))}
              />
            </Section>

            <Section title="Key Recommendations">
              <BulletList
                items={[
                  {
                    label: 'Immediate Actions:',
                    text: 'Address standards marked as "Review" to enhance security posture',
                  },
                  {
                    label: 'Compliance:',
                    text: 'Ensure all security standards are properly implemented and maintained',
                  },
                  {
                    label: 'Monitoring:',
                    text: 'Establish regular review cycles for all security standards',
                  },
                  {
                    label: 'Training:',
                    text: 'Implement security awareness programs to reduce human risk factors',
                  },
                ]}
              />
            </Section>
          </ContentPage>
        )}

      {/* DRIFT COMPLIANCE - Only show if drift compliance is enabled and security standards is disabled */}
      {sectionConfig.driftCompliance &&
        !sectionConfig.securityStandards &&
        driftComplianceInfo &&
        (driftComplianceInfo.currentDeviationsCount > 0 ||
          driftComplianceInfo.acceptedDeviationsCount > 0 ||
          driftComplianceInfo.deniedDeviationsCount > 0 ||
          driftComplianceInfo.customerSpecificDeviationsCount > 0 ||
          driftComplianceInfo.appliedStandards.length > 0) && (
          <>
            <ContentPage
              title="Drift Compliance Assessment"
              subtitle="Detailed evaluation of policy drift and compliance deviations"
            >
              <Section>
                <Paragraph>
                  Your drift compliance assessment shows how your current security policies compare
                  to your organization's approved standards. This analysis helps identify where
                  configurations have drifted from intended baselines and provides insights into
                  policy compliance across your Microsoft 365 environment.
                </Paragraph>
              </Section>

              <Section title="Drift Compliance Overview">
                <DonutChart
                  title="Policy Deviation Distribution"
                  centreLabel="Total Policies"
                  data={[
                    { label: 'Aligned', value: driftComplianceInfo.alignedCount },
                    { label: 'Accepted', value: driftComplianceInfo.acceptedDeviationsCount },
                    {
                      label: 'Client Specific',
                      value: driftComplianceInfo.customerSpecificDeviationsCount,
                    },
                    { label: 'Current', value: driftComplianceInfo.currentDeviationsCount },
                    { label: 'Denied', value: driftComplianceInfo.deniedDeviationsCount },
                  ].map((entry, index) => ({
                    ...entry,
                    // Compliance categories keep the semantic green-to-red scale rather than the
                    // brand series: red has to mean denied whatever colours the MSP picked.
                    colour: REPORT_SERIES_SEMANTIC[index],
                  }))}
                />
              </Section>

              <Section title="Deviation Statistics">
                <StatRow
                  stats={[
                    {
                      value: driftComplianceInfo.acceptedDeviationsCount,
                      label: 'Accepted Deviations',
                    },
                    {
                      value: driftComplianceInfo.customerSpecificDeviationsCount,
                      label: 'Client Specific',
                    },
                    {
                      value: driftComplianceInfo.deniedDeviationsCount,
                      label: 'Denied Deviations',
                    },
                    {
                      value: driftComplianceInfo.currentDeviationsCount,
                      label: 'Current Deviations',
                    },
                  ]}
                />
              </Section>

              <Section title="Deviation Types Explained">
                <BulletList
                  items={[
                    {
                      label: 'Aligned:',
                      text: 'Policies that match the approved template exactly with no deviations',
                    },
                    {
                      label: 'Accepted Deviations:',
                      text: 'Policy differences that have been reviewed and approved by administrators',
                    },
                    {
                      label: 'Client Specific Deviations:',
                      text: 'Policy configurations approved as customer-specific business requirements',
                    },
                    {
                      label: 'Current Deviations:',
                      text: 'Policy differences that require review and administrative action',
                    },
                    {
                      label: 'Denied Deviations:',
                      text: 'Policy differences that have been rejected and require remediation',
                    },
                  ]}
                />
              </Section>
            </ContentPage>

            {/* Deviations Detail Page */}
            {(driftComplianceInfo.currentDeviations.length > 0 ||
              driftComplianceInfo.acceptedDeviations.length > 0 ||
              driftComplianceInfo.deniedDeviations.length > 0 ||
              driftComplianceInfo.customerSpecificDeviations.length > 0) && (
              <ContentPage
                title="Policy Deviations Detail"
                subtitle="Comprehensive list of all policy deviations and their status"
              >
                <Section>
                  <Paragraph>
                    The following table shows all identified policy deviations, their current
                    status, and executive descriptions of what each deviation means for your
                    organization's security posture and compliance requirements.
                  </Paragraph>
                </Section>

                <Section title="Policy Deviations">
                  <DataTable
                    limit={deviationRows.length}
                    columns={[
                      { header: 'Policy', key: 'policy', width: 3, bold: true },
                      { header: 'Description', key: 'description', width: 6 },
                      {
                        header: 'Status',
                        key: 'status',
                        width: 2,
                        render: (row) => (
                          <StatusText tone={row.tone}>{row.status}</StatusText>
                        ),
                      },
                    ]}
                    rows={deviationRows}
                  />
                </Section>
              </ContentPage>
            )}

            {/* Applied Standards Page */}
            {driftComplianceInfo.appliedStandards.length > 0 && (
              <ContentPage
                title="Applied Standards"
                subtitle="Security standards currently implemented in your environment"
              >
                <Section>
                  <Paragraph>
                    These are the security standards that have been applied to your Microsoft 365
                    environment. Each standard represents a specific security control or policy
                    designed to protect your organization's data and systems.
                  </Paragraph>
                </Section>

                {appliedStandardsByCategory.map(([category, standards]) => (
                  <Section key={category} title={category}>
                    <BulletList
                      items={standards.map((standard) => ({
                        label: `${standard.name}:`,
                        text: standard.executiveDescription,
                      }))}
                    />
                  </Section>
                ))}

                <Section title="Compliance Summary">
                  <InfoBox title="Overall Compliance Status">
                    Your organization has {driftComplianceInfo.appliedStandards.length} security
                    standards implemented with {driftComplianceInfo.alignedCount} policies fully
                    aligned,{' '}
                    {driftComplianceInfo.acceptedDeviationsCount +
                      driftComplianceInfo.customerSpecificDeviationsCount}{' '}
                    approved deviations, and {driftComplianceInfo.currentDeviationsCount} deviations
                    requiring attention.
                  </InfoBox>
                </Section>
              </ContentPage>
            )}
          </>
        )}

      {/* STATISTIC PAGE 2 - CHAPTER SPLITTER - Only show if secure score data is available and enabled */}
      {sectionConfig.infographics &&
        sectionConfig.secureScore &&
        secureScoreData &&
        secureScoreData?.isSuccess &&
        secureScoreData?.translatedData && (
          <HeroPage
            backgroundImage="/reportImages/glasses.jpg"
            highlight="95%"
            subText={
              <>
                of successful cyber attacks{'\n'}
                could have been prevented with{'\n'}
                <Bold>proactive security measures</Bold>
              </>
            }
            footerText={
              <>
                Your <Bold>security resilience</Bold> is{'\n'}
                our <Bold>primary mission</Bold>
              </>
            }
          />
        )}

      {/* MICROSOFT SECURE SCORE - DEDICATED PAGE - Only show if secure score data is available and enabled */}
      {sectionConfig.secureScore &&
        secureScoreData &&
        secureScoreData?.isSuccess &&
        secureScoreData?.translatedData && (
          <ContentPage
            title="Microsoft Secure Score"
            subtitle="Comprehensive security posture measurement and benchmarking"
          >
            <Section>
              <Paragraph>
                Microsoft Secure Score measures how well your organization is protected against
                cyber threats. This score reflects the effectiveness of your current security
                measures and helps identify areas where additional protection could strengthen your
                business resilience.
              </Paragraph>
            </Section>

            <Section title="Score Comparison">
              <StatRow
                stats={[
                  {
                    value: secureScoreData?.translatedData?.currentScore || 'N/A',
                    label: 'Current Score',
                  },
                  {
                    value: secureScoreData?.translatedData?.maxScore || 'N/A',
                    label: 'Max Score',
                  },
                  {
                    value: `${secureScoreData?.translatedData?.percentageVsSimilar || 'N/A'}%`,
                    label: 'vs Similar Orgs',
                  },
                  {
                    value: `${secureScoreData?.translatedData?.percentageVsAllTenants || 'N/A'}%`,
                    label: 'vs All Orgs',
                  },
                ]}
              />
            </Section>

            <Section title="7-Day Score Trend">
              <TrendChart
                title="Secure Score Progress"
                max={secureScoreData?.translatedData?.maxScore}
                caption={`Current: ${secureScoreData?.translatedData?.currentScore ?? 'N/A'} / ${
                  secureScoreData?.translatedData?.maxScore ?? 'N/A'
                } (${secureScoreData?.translatedData?.percentageCurrent ?? 'N/A'}%)`}
                // With no history to plot, the caption's figures are all the reader gets, so the
                // achievement rate belongs here too.
                emptyText={`Current Score: ${
                  secureScoreData?.translatedData?.currentScore ?? 'N/A'
                } / ${secureScoreData?.translatedData?.maxScore ?? 'N/A'} — Achievement Rate: ${
                  secureScoreData?.translatedData?.percentageCurrent ?? 'N/A'
                }% — historical data not available.`}
                data={scoreTrendData}
              />
            </Section>

            <InfoBox title="What Your Score Means">
              Your current score of {secureScoreData?.translatedData?.currentScore || 'N/A'}{' '}
              represents {secureScoreData?.translatedData?.percentageCurrent || 'N/A'}% of the
              maximum protection level available. This indicates how well your organization is
              currently defended against common cyber threats and data breaches.
            </InfoBox>

            <InfoBox title="Why Scores Change">
              • Business growth and new employees may temporarily lower scores until security
              measures are applied{'\n'}• Changes in software licenses can affect available security
              features{'\n'}• New security threats require updated protections, which may impact
              scores{'\n'}• Regular security improvements help maintain and increase your protection
              level
            </InfoBox>
          </ContentPage>
        )}

      {/* LICENSING PAGE - Only show if license data is available */}
      {sectionConfig.licenseManagement &&
        licensingData &&
        Array.isArray(licensingData) &&
        licensingData.length > 0 && (
          <>
            {/* STATISTIC PAGE 3 - CHAPTER SPLITTER */}
            {sectionConfig.infographics && (
              <HeroPage
                backgroundImage="/reportImages/working.jpg"
                overtitle="Every"
                highlight="39"
                headline="seconds"
                subText={
                  <>
                    a business falls victim to{'\n'}
                    <Bold>ransomware attacks</Bold>
                  </>
                }
                footerText={
                  <>
                    <Bold>Proactive defense</Bold> beats{'\n'}
                    <Bold>reactive recovery</Bold>
                  </>
                }
              />
            )}
            <ContentPage
              title="License Management"
              subtitle="Microsoft 365 license allocation and utilization analysis"
            >
              <Section>
                <Paragraph>
                  Smart license management helps control costs while ensuring your team has the
                  tools they need to be productive. This analysis shows how your current licenses
                  are being used and identifies opportunities to optimize spending without
                  compromising business operations.
                </Paragraph>
              </Section>

              <Section title="License Allocation Summary">
                <DataTable
                  limit={licensingData.length}
                  columns={[
                    { header: 'License Type', key: 'name', width: 5, bold: true },
                    { header: 'Used', key: 'used', width: 1.5, align: 'center', bold: true },
                    {
                      header: 'Available',
                      key: 'available',
                      width: 1.5,
                      align: 'center',
                      bold: true,
                    },
                    { header: 'Total', key: 'total', width: 1.5, align: 'center', bold: true },
                  ]}
                  rows={licensingData.map((license) => ({
                    name: license.License || license.license || 'N/A',
                    used: license.CountUsed || license.countUsed || '0',
                    available: license.CountAvailable || license.countAvailable || '0',
                    total: license.TotalLicenses || license.totalLicenses || '0',
                  }))}
                />
              </Section>

              <Section title="License Optimization Recommendations">
                <BulletList
                  items={[
                    {
                      label: 'Usage Monitoring:',
                      text: 'Track how licenses are being used to identify cost-saving opportunities',
                    },
                    {
                      label: 'Cost Control:',
                      text: 'Review unused licenses to reduce unnecessary spending',
                    },
                    {
                      label: 'Growth Planning:',
                      text: 'Ensure you have enough licenses for business expansion without overspending',
                    },
                    {
                      label: 'Regular Reviews:',
                      text: 'Conduct quarterly reviews to maintain cost-effective license allocation',
                    },
                  ]}
                />
              </Section>
            </ContentPage>
          </>
        )}

      {/* DEVICES PAGE - Only show if device data is available */}
      {sectionConfig.deviceManagement &&
        deviceData &&
        Array.isArray(deviceData) &&
        deviceData.length > 0 && (
          <>
            {/* STATISTIC PAGE 4 - CHAPTER SPLITTER */}
            {sectionConfig.infographics && (
              <HeroPage
                backgroundImage="/reportImages/laptop.jpg"
                highlight="$4.45M"
                subText={
                  <>
                    average cost of a{'\n'}
                    <Bold>data breach in 2024</Bold>
                  </>
                }
                footerText={
                  <>
                    <Bold>Investment in security</Bold>
                    {'\n'}
                    saves <Bold>millions in recovery</Bold>
                  </>
                }
              />
            )}
            <ContentPage
              title="Device Management"
              subtitle="Device compliance status and management overview"
            >
              <Section>
                <Paragraph>
                  Managing employee devices is essential for protecting your business data and
                  maintaining productivity. This analysis shows which devices meet your security
                  standards and identifies any that may need attention to prevent data breaches or
                  operational disruptions.
                </Paragraph>
              </Section>

              <Section title="Device Compliance Overview">
                <StatRow
                  stats={[
                    { value: deviceData.length, label: 'Total Devices' },
                    { value: compliantDevices.length, label: 'Compliant' },
                    {
                      value: deviceData.length - compliantDevices.length,
                      label: 'Non-Compliant',
                    },
                    {
                      value: `${Math.round((compliantDevices.length / deviceData.length) * 100)}%`,
                      label: 'Compliance Rate',
                    },
                  ]}
                />
              </Section>

              <Section title="Device Management Summary">
                <DataTable
                  limit={8}
                  columns={[
                    { header: 'Device Name', key: 'name', width: 3, bold: true },
                    { header: 'OS', key: 'os', width: 2, bold: true },
                    {
                      header: 'Compliance',
                      key: 'compliance',
                      width: 2,
                      render: (row) => (
                        <StatusText tone={row.compliant ? 'pass' : 'fail'}>
                          {row.compliance}
                        </StatusText>
                      ),
                    },
                    { header: 'Last Sync', key: 'lastSync', width: 2, bold: true },
                  ]}
                  rows={deviceData.map((device) => ({
                    name: device.deviceName || 'N/A',
                    os: device.operatingSystem || 'N/A',
                    compliance: device.complianceState || device.ComplianceState || 'Unknown',
                    compliant: isCompliant(device),
                    lastSync: device.lastSyncDateTime
                      ? new Date(device.lastSyncDateTime).toLocaleDateString()
                      : 'N/A',
                  }))}
                />
              </Section>

              <Section title="Device Insights">
                <StatRow
                  stats={[
                    {
                      value: deviceData.filter((device) => device.operatingSystem === 'Windows')
                        .length,
                      label: 'Windows Devices',
                    },
                    {
                      value: deviceData.filter((device) => device.operatingSystem === 'iOS').length,
                      label: 'iOS Devices',
                    },
                    {
                      value: deviceData.filter((device) => device.operatingSystem === 'Android')
                        .length,
                      label: 'Android Devices',
                    },
                    {
                      // Cloud PCs never report BitLocker but are platform-encrypted by Azure.
                      value: deviceData.filter(
                        (device) => device.isEncrypted === true || isCloudPcDevice(device),
                      ).length,
                      label: 'Encrypted',
                    },
                  ]}
                />
              </Section>

              <InfoBox title="Device Management Recommendations">
                Keep devices updated and secure to protect business data. Regularly check that all
                employee devices meet security standards and address any issues promptly. Consider
                automated policies to maintain consistent security across all devices and conduct
                regular reviews to identify potential risks.
              </InfoBox>
            </ContentPage>
          </>
        )}

      {/* CONDITIONAL ACCESS POLICIES PAGE - Only show if data is available */}
      {sectionConfig.conditionalAccess &&
        conditionalAccessData &&
        Array.isArray(conditionalAccessData) &&
        conditionalAccessData.length > 0 && (
          <>
            {/* STATISTIC PAGE 5 - CHAPTER SPLITTER */}
            {sectionConfig.infographics && (
              <HeroPage
                backgroundImage="/reportImages/city.jpg"
                highlight="277"
                headline="days"
                subText={
                  <>
                    average time to identify and{'\n'}
                    contain a <Bold>data breach</Bold>
                  </>
                }
                footerText={
                  <>
                    <Bold>Early detection</Bold> minimizes{'\n'}
                    <Bold>business impact</Bold>
                  </>
                }
              />
            )}
            <ContentPage
              title="Conditional Access Policies"
              subtitle="Identity and access management security controls"
            >
              <Section>
                <Paragraph>
                  Access control policies help protect your business by ensuring only the right
                  people can access sensitive information under appropriate circumstances. These
                  smart security measures automatically evaluate each access request and apply
                  additional verification when needed, balancing security with employee
                  productivity.
                </Paragraph>
              </Section>

              <Section title="How Access Controls Protect Your Business">
                <Paragraph>
                  These policies work like intelligent security guards, making decisions based on
                  who is trying to access what, from where, and when. For example, accessing email
                  from the office might be seamless, but accessing it from an unusual location might
                  require additional verification. This approach protects your data while minimizing
                  disruption to daily work.
                </Paragraph>
              </Section>

              <Section title="Current Policy Configuration">
                <DataTable
                  limit={8}
                  columns={[
                    { header: 'Policy Name', key: 'name', width: 4, bold: true },
                    {
                      header: 'State',
                      key: 'state',
                      width: 2,
                      render: (row) => (
                        <StatusText tone={row.tone}>{row.state}</StatusText>
                      ),
                    },
                    { header: 'Applications', key: 'applications', width: 2, bold: true },
                    { header: 'Controls', key: 'controls', width: 3, bold: true },
                  ]}
                  rows={conditionalAccessData.map((policy) => ({
                    name: policy.displayName || 'N/A',
                    state: CA_STATE_LABELS[policy.state] ?? policy.state ?? 'Unknown',
                    tone: CA_STATE_TONES[policy.state] ?? null,
                    applications: policy.includeApplications || 'All',
                    controls: caControlsText(policy),
                  }))}
                />
              </Section>

              <Section title="Policy Overview">
                <StatRow
                  stats={[
                    { value: conditionalAccessData.length, label: 'Total Policies' },
                    { value: caEnabledCount, label: 'Enabled' },
                    { value: caReportOnlyCount, label: 'Report Only' },
                    {
                      value: conditionalAccessData.filter((policy) =>
                        policy.builtInControls?.includes('mfa')
                      ).length,
                      label: 'MFA Policies',
                    },
                  ]}
                />
              </Section>

              <Section title="Policy Analysis">
                <BulletList
                  items={[
                    {
                      label: 'Policy Coverage:',
                      text: `${conditionalAccessData.length} conditional access policies configured`,
                    },
                    {
                      label: 'Enforcement Status:',
                      text: `${caEnabledCount} policies actively enforced`,
                    },
                    {
                      label: 'Testing Phase:',
                      text: `${caReportOnlyCount} policies in report-only mode`,
                    },
                    {
                      label: 'Security Controls:',
                      text: 'Multi-factor authentication and access blocking implemented',
                    },
                  ]}
                />
              </Section>

              <InfoBox title="Access Control Recommendations">
                {caReportOnlyCount > 0
                  ? `Consider activating ${caReportOnlyCount} policies currently in testing mode after ensuring they don't disrupt business operations. `
                  : 'Your access controls are properly configured. '}
                Regularly review how these policies affect employee productivity and adjust as
                needed. Consider additional location-based protections for enhanced security without
                impacting daily operations.
              </InfoBox>
            </ContentPage>
          </>
        )}

      {/* SHADOW AI SECTION - the Shadow AI report pages appended to this document. It takes the
          theme from this document's context, so its pages carry the same branding as the rest. */}
      {sectionConfig.shadowAI && shadowAIData && (
        <ShadowAIReportPages
          tenantName={tenantName}
          data={shadowAIData}
          sectionConfig={{
            executiveSummary: true,
            infographics: sectionConfig.infographics,
            background: true,
            riskLevels: true,
            sanctionedTools: true,
            detectedSoftware: true,
            entraApplications: true,
            recommendations: true,
          }}
        />
      )}
    </ReportDocument>
  )
}

export const ExecutiveReportButton = (props) => {
  const { variant: buttonVariant, onClick: onClickProp, ...other } = props
  const settings = useSettings()
  const defaultBranding = useBrandingSettings()

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false)
  // Null until the operator picks one, so the branding setting for this report type keeps applying
  // as it changes. An explicit choice — including "Default" — wins from then on.
  const [presetOverride, setPresetOverride] = useState(null)
  const brandingPresetId = presetOverride ?? defaultBranding?.reportDefaults?.executive ?? ''

  // Named branding sets a report can be rendered against instead of the default branding.
  const brandingPresets = ApiGetCall({
    url: '/api/ListBrandingPresets',
    data: { includeImages: true },
    queryKey: 'ListBrandingPresets-withImages',
    waiting: previewOpen,
  })

  const presetOptions = useMemo(
    () => [
      // Imported rather than restated: this option used to read "Global branding settings" here
      // while the branding page called the same thing "Default".
      DEFAULT_BRANDING_OPTION,
      ...(Array.isArray(brandingPresets.data) ? brandingPresets.data : []).map((preset) => ({
        label: preset.name,
        value: preset.id,
      })),
    ],
    [brandingPresets.data]
  )

  const brandingSettings = useMemo(() => {
    if (!brandingPresetId) return defaultBranding
    const presets = Array.isArray(brandingPresets.data) ? brandingPresets.data : []
    // A preset deleted since it was picked falls back to the default branding rather than
    // rendering unbranded.
    return presets.find((preset) => preset.id === brandingPresetId) || defaultBranding
  }, [brandingPresetId, brandingPresets.data, defaultBranding])

  const variables = useReportVariables()

  const [sectionConfig, setSectionConfig] = useState({
    executiveSummary: true,
    securityStandards: true,
    driftCompliance: false,
    secureScore: true,
    licenseManagement: true,
    deviceManagement: true,
    conditionalAccess: true,
    infographics: true,
    shadowAI: false,
  })

  // Fetch organization data - only when preview is open
  const organization = ApiGetCall({
    url: '/api/ListGraphRequest',
    queryKey: `${settings.currentTenant}-ListGraphRequest-organization-report`,
    data: { tenantFilter: settings.currentTenant, Endpoint: 'organization' },
    waiting: previewOpen,
  })

  const organizationRecord = organization.data?.Results?.[0]

  // Fetch user counts - only when preview is open
  const dashboard = ApiGetCall({
    url: '/api/ListuserCounts',
    data: { tenantFilter: settings.currentTenant },
    queryKey: `${settings.currentTenant}-ListuserCounts-report`,
    waiting: previewOpen,
  })

  // Only fetch additional data when preview dialog is opened
  const secureScore = useSecureScore({ waiting: previewOpen })

  // Get real license data - only when preview is open
  const licenseData = ApiGetCall({
    url: '/api/ListLicenses',
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `licenses-report-${settings.currentTenant}`,
    waiting: previewOpen,
  })

  // Get real device data - only when preview is open
  const deviceData = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      tenantFilter: settings.currentTenant,
      Endpoint: 'deviceManagement/managedDevices',
    },
    queryKey: `ListGraphRequest-devices-report-${settings.currentTenant}`,
    waiting: previewOpen,
  })

  // Get real conditional access policy data - only when preview is open
  const conditionalAccessData = ApiGetCall({
    url: '/api/ListConditionalAccessPolicies',
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `ca-policies-report-${settings.currentTenant}`,
    waiting: previewOpen,
  })

  // Get real standards data - only when preview is open
  const standardsCompareData = ApiGetCall({
    url: '/api/ListStandardsCompare',
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `standards-compare-report-${settings.currentTenant}`,
    waiting: previewOpen,
  })

  // Get drift compliance data - only when preview is open
  const driftComplianceData = ApiGetCall({
    url: '/api/listTenantDrift',
    data: {
      TenantFilter: settings.currentTenant,
    },
    queryKey: `drift-compliance-report-${settings.currentTenant}`,
    waiting: previewOpen,
  })

  // Load all standard templates to resolve template display names
  const standardTemplatesData = ApiGetCall({
    url: `/api/listStandardTemplates`,
    data: {}, // No templateId filter - get all templates
    queryKey: `standard-templates-report-all`,
    waiting: previewOpen,
  })

  // Shadow AI data for the optional Shadow AI section - only fetched when that section is
  // enabled. Requires a single tenant; the CIPPDb cache must have been synced for data to show.
  const shadowAIEnabled = sectionConfig.shadowAI && settings.currentTenant !== 'AllTenants'
  const shadowAIData = ApiGetCall({
    url: '/api/ListShadowAI',
    data: { tenantFilter: settings.currentTenant },
    queryKey: `ListShadowAI-${settings.currentTenant}`,
    waiting: previewOpen && shadowAIEnabled,
  })

  // Check if all data is loaded (either successful or failed) - only relevant when preview is open
  const isDataLoading =
    previewOpen &&
    (organization.isFetching ||
      dashboard.isFetching ||
      secureScore.isFetching ||
      licenseData.isFetching ||
      deviceData.isFetching ||
      conditionalAccessData.isFetching ||
      standardsCompareData.isFetching ||
      driftComplianceData.isFetching ||
      standardTemplatesData.isFetching ||
      (shadowAIEnabled && shadowAIData.isFetching))

  const hasAllDataFinished =
    !previewOpen ||
    ((organization.isSuccess || organization.isError) &&
      (dashboard.isSuccess || dashboard.isError) &&
      (secureScore.isSuccess || secureScore.isError) &&
      (licenseData.isSuccess || licenseData.isError) &&
      (deviceData.isSuccess || deviceData.isError) &&
      (conditionalAccessData.isSuccess || conditionalAccessData.isError) &&
      (standardsCompareData.isSuccess || standardsCompareData.isError) &&
      (driftComplianceData.isSuccess || driftComplianceData.isError) &&
      (standardTemplatesData.isSuccess || standardTemplatesData.isError) &&
      (!shadowAIEnabled || shadowAIData.isSuccess || shadowAIData.isError))

  // Button is always available now since we don't need to wait for data
  const shouldShowButton = true

  const tenantName = organizationRecord?.displayName || 'Tenant'
  const tenantId = organizationRecord?.id
  const userStats = {
    licensedUsers: dashboard.data?.LicUsers || 0,
    unlicensedUsers:
      dashboard.data?.Users && dashboard.data?.LicUsers
        ? dashboard.data?.Users - dashboard.data?.LicUsers
        : 0,
    guests: dashboard.data?.Guests || 0,
    globalAdmins: dashboard.data?.Gas || 0,
    permanentGlobalAdmins: dashboard.data?.PermanentGas ?? 0,
    eligibleGlobalAdmins: dashboard.data?.EligibleGas ?? 0,
    pimCapable: dashboard.data?.PIMCapable === true,
  }

  const fileName = `Executive_Report_${tenantName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Tenant'}_${
    new Date().toISOString().split('T')[0]
  }.pdf`

  // Memoize the document to prevent unnecessary re-renders - only when dialog is open
  const reportDocument = useMemo(() => {
    // Don't create document if dialog is closed
    if (!previewOpen) {
      return null
    }

    // Only create document if preview is open and data is ready
    if (!hasAllDataFinished) {
      return (
        <Document>
          <Page size="A4" style={{ padding: 40, fontFamily: 'Helvetica' }}>
            <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 100 }}>
              Loading report data...
            </Text>
          </Page>
        </Document>
      )
    }

    try {
      return (
        <ExecutiveReportDocument
          tenantName={tenantName}
          tenantId={tenantId}
          userStats={userStats}
          standardsData={driftComplianceData.data}
          organizationData={organizationRecord}
          brandingSettings={brandingSettings}
          variables={variables}
          secureScoreData={secureScore.isSuccess ? secureScore : null}
          licensingData={licenseData.isSuccess ? licenseData?.data : null}
          deviceData={deviceData.isSuccess ? deviceData?.data?.Results : null}
          conditionalAccessData={
            conditionalAccessData.isSuccess ? conditionalAccessData?.data?.Results : null
          }
          standardsCompareData={standardsCompareData.isSuccess ? standardsCompareData?.data : null}
          driftComplianceData={driftComplianceData.isSuccess ? driftComplianceData?.data : null}
          standardTemplatesData={
            standardTemplatesData.isSuccess ? standardTemplatesData?.data : null
          }
          shadowAIData={shadowAIEnabled && shadowAIData.isSuccess ? shadowAIData.data : null}
          sectionConfig={sectionConfig}
        />
      )
    } catch (error) {
      console.error('Error creating ExecutiveReportDocument:', error)
      return (
        <Document>
          <Page size="A4" style={{ padding: 40, fontFamily: 'Helvetica' }}>
            <Text style={{ fontSize: 14, color: 'red' }}>
              Error creating document: {error.message}
            </Text>
          </Page>
        </Document>
      )
    }
  }, [
    previewOpen, // Most important - prevents creation when dialog is closed
    hasAllDataFinished,
    tenantName,
    tenantId,
    userStats,
    organizationRecord,
    dashboard.data,
    brandingSettings,
    // Resolved asynchronously, so without this the document keeps the copy built before the
    // values landed and the footer shows %cippurl% instead of the URL.
    variables,
    secureScore?.isSuccess,
    licenseData?.isSuccess,
    deviceData?.isSuccess,
    conditionalAccessData?.isSuccess,
    standardsCompareData?.isSuccess,
    driftComplianceData?.isSuccess,
    shadowAIData?.isSuccess,
    JSON.stringify(sectionConfig), // Stringify to prevent reference issues
  ])

  // Handle section toggle with mutual exclusion logic
  const handleSectionToggle = (sectionKey) => {
    setSectionConfig((prev) => {
      // Count currently enabled sections
      const enabledSections = Object.values(prev).filter(Boolean).length

      // If trying to disable the last remaining section, prevent it
      if (prev[sectionKey] && enabledSections === 1) {
        return prev // Don't change state
      }

      // Mutual exclusion logic for Security Standards and Drift Compliance
      if (sectionKey === 'securityStandards' && !prev[sectionKey]) {
        // Enabling Security Standards, disable Drift Compliance
        return {
          ...prev,
          securityStandards: true,
          driftCompliance: false,
        }
      }

      if (sectionKey === 'driftCompliance' && !prev[sectionKey]) {
        // Enabling Drift Compliance, disable Security Standards
        return {
          ...prev,
          driftCompliance: true,
          securityStandards: false,
        }
      }

      return {
        ...prev,
        [sectionKey]: !prev[sectionKey],
      }
    })
  }

  // Close handler with cleanup
  const handleClose = () => {
    setPreviewOpen(false)
  }

  // Below md the 320px config rail would leave the preview about 70px wide, so it moves into
  // a drawer and the preview takes the whole dialog.
  const [sectionsOpen, setSectionsOpen] = useState(false)

  // Section configuration options
  const sectionOptions = [
    {
      key: 'executiveSummary',
      label: 'Executive Summary',
      description: 'High-level overview and statistics',
    },
    {
      key: 'securityStandards',
      label: 'Security Standards',
      description: 'Compliance assessment and standards evaluation',
    },
    {
      key: 'driftCompliance',
      label: 'Drift Compliance',
      description: 'Policy drift analysis and deviation management',
    },
    {
      key: 'secureScore',
      label: 'Microsoft Secure Score',
      description: 'Security posture measurement and trends',
    },
    {
      key: 'licenseManagement',
      label: 'License Management',
      description: 'License allocation and optimization',
    },
    {
      key: 'deviceManagement',
      label: 'Device Management',
      description: 'Device compliance and insights',
    },
    {
      key: 'conditionalAccess',
      label: 'Conditional Access',
      description: 'Access control policies and analysis',
    },
    {
      key: 'infographics',
      label: 'Infographic Pages',
      description: 'Statistical pages with visual elements between sections',
    },
    {
      key: 'shadowAI',
      label: 'Shadow AI Report',
      description: 'AI usage discovery and risk pages from the Shadow AI report',
    },
  ]

  // One definition, two homes: the desktop rail and the mobile drawer. The drawer's own
  // header already says "Report Sections", so it takes the panel without the heading.
  const sectionPanel = ({ showHeading = true } = {}) => (
    <Box sx={{ p: 2 }}>
      {showHeading && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CippIcons.Settings size={20} />
          Report Sections
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 3
        }}>
        Configure which sections to include in your executive report. Changes are reflected in
        real-time.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CippAutoComplete
          size="small"
          label="Branding"
          multiple={false}
          creatable={false}
          disableClearable={true}
          isFetching={brandingPresets.isFetching}
          options={presetOptions}
          value={
            presetOptions.find((option) => option.value === brandingPresetId) ?? presetOptions[0]
          }
          onChange={(option) => setPresetOverride(option?.value ?? '')}
        />
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          Presets are managed in Settings → Branding
        </Typography>
      </Box>

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
            <Box sx={{ ml: 1, flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  fontSize: '0.875rem'
                }}>
                {option.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: '0.75rem'
                }}>
                {option.description}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: "primary.main",
            fontWeight: "bold"
          }}>
          💡 Pro Tip
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            mt: 0.5
          }}>
          Enable only the sections relevant to your audience to create focused, impactful reports.
          At least one section must be enabled.
        </Typography>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Main Executive Summary Button - Always available */}
      {buttonVariant === 'menuItem' ? (
        <MenuItem
          onClick={() => {
            setPreviewOpen(true)
            onClickProp?.()
          }}
          {...other}
        >
          <ListItemIcon>
            <CippIcons.PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText>Executive Summary</ListItemText>
        </MenuItem>
      ) : (
        <Tooltip title="Generate Executive Report with preview and configuration">
          <Box component="span" sx={{ display: 'inline-flex', width: '100%', minWidth: 0 }}>
            <Button
              variant="contained"
              startIcon={<CippIcons.PictureAsPdf />}
              onClick={() => setPreviewOpen(true)}
              sx={{
                minWidth: 0,
                width: '100%',
                pl: 1,
                pr: 1,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                justifyContent: 'center',
                '& .MuiButton-startIcon': {
                  marginLeft: 0,
                  marginRight: 0.75,
                  flexShrink: 0,
                },
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease-in-out',
              }}
              {...other}
            >
              <Box
                component="span"
                sx={{
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}
              >
                Executive Summary
              </Box>
            </Button>
          </Box>
        </Tooltip>
      )}

      {/* Combined Preview and Configuration Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            // dvh, not vh: iOS counts the collapsing address bar in vh, so 95vh overflows.
            height: { xs: '100dvh', md: '95vh' },
            maxHeight: { xs: '100dvh', md: '95vh' },
          },
        }}
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
          <Typography variant="h6" component="div" noWrap sx={{ minWidth: 0 }}>
            Executive Report - {tenantName}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {/* The config rail's stand-in below md, in the title bar because the dialog is
                full-screen there and this is the only chrome that stays put. */}
            <IconButton
              onClick={() => setSectionsOpen(true)}
              size="small"
              aria-label="Report sections"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <CippIcons.Settings />
            </IconButton>
            <IconButton onClick={handleClose} size="small" aria-label="Close preview">
              <CippIcons.Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: '100%', display: 'flex' }}>
          {/* Left Panel - Section Configuration. Below md it lives in the drawer instead. */}
          <Paper
            sx={{
              width: 320,
              flexShrink: 0,
              borderRadius: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              height: '100%',
              overflow: 'auto',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {sectionPanel()}
          </Paper>

          {/* Right Panel - PDF Preview */}
          <Box sx={{ flex: 1, height: '100%', minWidth: 0 }}>
            {isDataLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 2,
                  // Gutters and a measure: this pane is the full width of the screen below md,
                  // where the second line is long enough to run edge to edge and break badly.
                  px: 3,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6">Loading Report Data...</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    maxWidth: '40ch'
                  }}>
                  Fetching additional data for comprehensive report generation
                </Typography>
              </Box>
            ) : reportDocument ? (
              <CippPdfPreview
                viewerKey={`pdf-viewer-${Date.now()}`} // Fix for react-pdf "Eo is not a function" error
                title={`Executive Report - ${tenantName}`}
                fileName={`Executive_Report_${tenantName}.pdf`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                showToolbar={true}
              >
                {reportDocument}
              </CippPdfPreview>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="body1" sx={{
                  color: "text.secondary"
                }}>
                  Report preview will appear here
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
            // Caption plus two buttons in one row leaves nothing usable at 390px; the primary
            // action goes to the bottom of the stack, in thumb reach.
            flexDirection: { xs: 'column-reverse', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            '& > :not(style) ~ :not(style)': { ml: { xs: 0, md: 1 } },
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              Sections enabled: {Object.values(sectionConfig).filter(Boolean).length} of{' '}
              {sectionOptions.length}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<CippIcons.Download />}
            disabled={isDataLoading}
            sx={{ minWidth: 140 }}
            onClick={() => {
              // Create document dynamically when download is clicked
              const downloadDocument = (
                <ExecutiveReportDocument
                  tenantName={tenantName}
                  tenantId={tenantId}
                  userStats={userStats}
                  standardsData={driftComplianceData.data}
                  organizationData={organizationRecord}
                  brandingSettings={brandingSettings}
                  variables={variables}
                  secureScoreData={secureScore.isSuccess ? secureScore : null}
                  licensingData={licenseData.isSuccess ? licenseData?.data : null}
                  deviceData={deviceData.isSuccess ? deviceData?.data?.Results : null}
                  conditionalAccessData={
                    conditionalAccessData.isSuccess ? conditionalAccessData?.data?.Results : null
                  }
                  standardsCompareData={
                    standardsCompareData.isSuccess ? standardsCompareData?.data : null
                  }
                  driftComplianceData={
                    driftComplianceData.isSuccess ? driftComplianceData?.data : null
                  }
                  shadowAIData={
                    shadowAIEnabled && shadowAIData.isSuccess ? shadowAIData.data : null
                  }
                  sectionConfig={sectionConfig}
                />
              )

              // Use react-pdf's pdf() function to generate and download
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
                    console.error('Error generating PDF:', error)
                  })
              })
            }}
          >
            {isDataLoading ? 'Loading...' : 'Download PDF'}
          </Button>

          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        </DialogActions>

        {/* Mounted inside the Dialog so it inherits its theme scope; aboveModal lifts it over
            the dialog it is opened from. */}
        <CippOffCanvas
          visible={sectionsOpen}
          onClose={() => setSectionsOpen(false)}
          title="Report Sections"
          size="sm"
          contentPadding={0}
          aboveModal
        >
          {sectionPanel({ showHeading: false })}
        </CippOffCanvas>
      </Dialog>
    </>
  );
}
