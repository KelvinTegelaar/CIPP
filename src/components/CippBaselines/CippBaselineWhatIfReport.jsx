import { useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Download, PictureAsPdf } from '@mui/icons-material'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { CippPdfPreview } from '../CippPdf/CippPdfPreview'
import { parseCippDate } from '../../utils/parse-cipp-date'

const operatorLabels = {
  eq: 'equals',
  ne: 'does not equal',
  startsWith: 'starts with',
  notStartsWith: 'does not start with',
}

// Human-readable summary of a stage's graduation conditions. Shared with the alignment page.
export const describeStageConditions = (stage) => {
  if (!stage?.conditions?.length) return 'no conditions configured'
  const parts = stage.conditions.map((condition) => {
    switch (condition.type) {
      case 'time':
        return `${condition.days} ${condition.unit ?? 'days'} in the previous stage`
      case 'variable':
        return `${condition.variable} ${operatorLabels[condition.operator] ?? condition.operator} '${condition.value}'`
      case 'success':
        return 'all previous stage items applied successfully'
      case 'manual':
        return 'manual approval by an operator'
      default:
        return condition.type
    }
  })
  return parts.join(stage.logic === 'or' ? ' OR ' : ' AND ')
}

const accent = '#F77F00'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#2D3748',
    padding: 40,
  },
  accentBar: {
    height: 6,
    backgroundColor: accent,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 6,
    color: '#1A202C',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  statBox: {
    flex: 1,
    border: '1 solid #E2E8F0',
    borderRadius: 6,
    padding: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: accent,
  },
  statLabel: {
    fontSize: 8,
    color: '#718096',
    textTransform: 'uppercase',
  },
  item: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeft: `2 solid ${accent}`,
  },
  itemTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  itemText: {
    fontSize: 9.5,
    color: '#4A5568',
  },
  meta: {
    fontSize: 8.5,
    color: '#718096',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#A0AEC0',
    textAlign: 'center',
  },
})

const WhatIfDocument = ({
  tenant,
  stageStates,
  simulatedTemplate,
  catalogByName,
}) => {
  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const changesNow = tenant.rows.filter((row) =>
    [
      'Drift',
      'Partially Accepted',
      'Denied - Remediate Pending',
      'Denied - Delete Pending',
    ].includes(row.status)
  )
  const acceptedRows = tenant.rows.filter((row) => row.status === 'Accepted')
  const plannedStages = stageStates.filter((state) => state.nextStage)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />
        <Text style={styles.title}>Baseline What-If Report</Text>
        <Text style={styles.subtitle}>
          {tenant.displayName} ({tenant.tenantFilter}) - generated {generatedAt}
          . No changes have been made; this report previews what applying the
          configured standards would change.
        </Text>

        <Text style={styles.sectionTitle}>Where you stand today</Text>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{tenant.alignedPercentage}%</Text>
            <Text style={styles.statLabel}>
              Compliant incl. accepted deviations
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{tenant.verifiedPercentage}%</Text>
            <Text style={styles.statLabel}>Compliant with baseline</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{changesNow.length}</Text>
            <Text style={styles.statLabel}>Changes to make</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{acceptedRows.length}</Text>
            <Text style={styles.statLabel}>Agreed exceptions</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Changes we would make now ({changesNow.length})
        </Text>
        {changesNow.length === 0 && (
          <Text style={styles.itemText}>
            Nothing to change - every enforced standard is already in its
            expected state.
          </Text>
        )}
        {changesNow.map((row) => (
          <View key={row.standardName} style={styles.item} wrap={false}>
            <Text style={styles.itemTitle}>{row.standardLabel}</Text>
            <Text style={styles.itemText}>
              {catalogByName[row.standardName]?.executiveText ??
                row.standardLabel}
            </Text>
            <Text style={styles.meta}>
              {row.impact}
              {row.secureScoreImpact > 0
                ? ` - increases Secure Score by up to ${row.secureScoreImpact} points`
                : ''}
              {row.status?.startsWith('Denied')
                ? ' - deviation denied, fix pending'
                : ''}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>
          Planned future changes (staged rollout)
        </Text>
        {plannedStages.length === 0 && (
          <Text style={styles.itemText}>
            This tenant is in the final stage of every assigned baseline - no
            further staged changes are planned.
          </Text>
        )}
        {plannedStages.map((state) => {
          const timeCondition = state.nextStage.conditions?.find(
            (condition) => condition.type === 'time'
          )
          const estimatedAt = timeCondition
            ? new Date(
                parseCippDate(state.enteredStageAt).getTime() +
                  timeCondition.days *
                    (timeCondition.unit === 'weeks' ? 7 : 1) *
                    24 *
                    60 *
                    60 *
                    1000
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : null
          return (
            <View
              key={state.templateId}
              style={{ marginBottom: 8 }}
              wrap={false}
            >
              <Text style={styles.itemTitle}>{state.templateName}</Text>
              <Text style={styles.itemText}>
                Currently in Stage {state.currentStage} of {state.totalStages} (
                {state.stageName}). Next: Stage {state.currentStage + 1} (
                {state.nextStageName}) - advances when{' '}
                {describeStageConditions(state.nextStage)}
                {estimatedAt ? `, estimated around ${estimatedAt}` : ''}.
              </Text>
              {state.nextStage.standards.map((standardName) => {
                const standard = catalogByName[standardName]
                if (!standard) return null
                return (
                  <View
                    key={standardName}
                    style={[styles.item, { marginTop: 4 }]}
                    wrap={false}
                  >
                    <Text style={styles.itemTitle}>{standard.label}</Text>
                    <Text style={styles.itemText}>
                      {standard.executiveText}
                    </Text>
                  </View>
                )
              })}
            </View>
          )
        })}

        {simulatedTemplate && (
          <>
            <Text style={styles.sectionTitle}>
              What-if: additionally assigning the{' '}
              {simulatedTemplate.templateName} baseline
            </Text>
            <Text style={styles.itemText}>
              {simulatedTemplate.description}. This baseline is not assigned to
              the tenant today - below is what assigning it would roll out,
              stage by stage.
            </Text>
            {simulatedTemplate.stages.map((stage, index) => (
              <View key={stage.name} style={{ marginBottom: 6 }} wrap={false}>
                <Text style={[styles.itemTitle, { marginTop: 6 }]}>
                  Stage {index + 1}: {stage.name}
                  {index === 0
                    ? ' - applies immediately'
                    : ` - advances when ${describeStageConditions(stage)}`}
                </Text>
                {[
                  ...new Set(stage.standards.map((key) => key.split('#')[0])),
                ].map((name) => {
                  const standard = catalogByName[name]
                  if (!standard) return null
                  const currentRow = tenant.rows.find(
                    (row) => row.standardName === name
                  )
                  const alreadyAligned = currentRow?.status === 'Compliant'
                  return (
                    <View
                      key={name}
                      style={[styles.item, { marginTop: 4 }]}
                      wrap={false}
                    >
                      <Text style={styles.itemTitle}>{standard.label}</Text>
                      <Text style={styles.itemText}>
                        {standard.executiveText}
                      </Text>
                      <Text style={styles.meta}>
                        {alreadyAligned
                          ? `No change - already aligned today (configured by ${currentRow.sourceTemplate})`
                          : 'Would change this tenant when the stage applies'}
                      </Text>
                    </View>
                  )
                })}
              </View>
            ))}
          </>
        )}

        {acceptedRows.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Agreed exceptions we will not change ({acceptedRows.length})
            </Text>
            {acceptedRows.map((row) => (
              <View key={row.standardName} style={styles.item} wrap={false}>
                <Text style={styles.itemTitle}>{row.standardLabel}</Text>
                <Text style={styles.itemText}>{row.deviationReason}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.footer} fixed>
          Generated by CIPP Baselines - what-if preview, no changes were made.
        </Text>
      </Page>
    </Document>
  )
}

// Button + preview dialog in the style of the Executive Report button.
export const CippBaselineWhatIfReport = ({
  tenant,
  stageStates,
  baselines = [],
  catalog = [],
}) => {
  const [open, setOpen] = useState(false)
  const [simulatedTemplate, setSimulatedTemplate] = useState(null)

  const catalogByName = Object.fromEntries(
    catalog.map((standard) => [standard.name, standard])
  )

  // Baselines not currently rolled out to this tenant can be simulated in the report.
  const availableTemplates = baselines.filter(
    (template) =>
      !stageStates.some((state) => state.templateId === template.GUID)
  )

  const reportDocument = (
    <WhatIfDocument
      tenant={tenant}
      stageStates={stageStates}
      simulatedTemplate={simulatedTemplate}
      catalogByName={catalogByName}
    />
  )

  const handleDownload = () => {
    import('@react-pdf/renderer').then(({ pdf }) => {
      pdf(reportDocument)
        .toBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `WhatIf_Report_${tenant.displayName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        })
    })
  }

  return (
    <>
      <Tooltip title="Preview what applying the configured standards would change for this tenant, including upcoming stages">
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={() => setOpen(true)}
        >
          What-If Report
        </Button>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>What-If Report - {tenant.displayName}</DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            height: '75vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Autocomplete
              size="small"
              options={availableTemplates}
              getOptionLabel={(option) => option.templateName}
              value={simulatedTemplate}
              onChange={(event, value) => setSimulatedTemplate(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Simulate assigning an additional baseline"
                />
              )}
              sx={{ maxWidth: 460 }}
            />
          </Box>
          {open && (
            <CippPdfPreview
              // Remount when the simulation changes so react-pdf re-renders cleanly
              viewerKey={simulatedTemplate?.GUID ?? 'assigned-only'}
              title="Baseline what-if report"
              fileName="Baseline_WhatIf_Report.pdf"
              style={{ width: '100%', height: '100%', border: 'none' }}
              showToolbar={true}
            >
              {reportDocument}
            </CippPdfPreview>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Exec-friendly preview - safe to send to customers. No changes are
              made.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CippBaselineWhatIfReport
