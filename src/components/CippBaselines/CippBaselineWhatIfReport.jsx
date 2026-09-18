import { useMemo, useState } from 'react'
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
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CippAutoComplete } from '../CippComponents/CippAutocomplete'
import { CippOffCanvas } from '../CippComponents/CippOffCanvas'
import { CippPdfPreview } from '../CippPdf/CippPdfPreview'
import {
  Bold,
  BulletList,
  ClearBox,
  ContentPage,
  CoverMeta,
  DataTable,
  Paragraph,
  ReportDocument,
  Section,
  StatRow,
  StatusText,
} from '../CippPdf'
import { useReportVariables } from '../CippPdf/useReportVariables'
import { useBrandingSettings } from '../CippPdf/useBrandingSettings'
import { DEFAULT_BRANDING_OPTION } from '../ReportBuilder/reportSettings'
import { ApiGetCall } from '../../api/ApiCall'

const operatorLabels = {
  eq: 'equals',
  ne: 'does not equal',
  startsWith: 'starts with',
  notStartsWith: 'does not start with',
}

// Human-readable summary of a stage's graduation conditions. Used by the alignment and
// template pages - deliberately NOT by the PDF, which tells the rollout in plain words.
export const describeStageConditions = (stage) => {
  if (!stage?.conditions?.length) return 'no conditions configured'
  const parts = stage.conditions.map((condition) => {
    switch (condition.type) {
      case 'time':
        return `${condition.days} ${condition.unit ?? 'days'} in the previous stage`
      case 'variable':
        return `${condition.variable} ${operatorLabels[condition.operator] ?? condition.operator} '${condition.value}'`
      case 'group':
        return `the tenant is in the '${condition.groupName ?? condition.group}' group`
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

// ---- report content generation -------------------------------------------------------

// Row statuses that mean "we will change this". Everything the engine writes lands in one
// of the statusPresentation buckets below for the current-state table.
const changeStatuses = [
  'Drift',
  'Partially Accepted',
  'Denied - Remediate Pending',
  'Denied - Delete Pending',
]

// How each engine status reads in the current-state table.
const statusPresentation = (status) => {
  if (status === 'Compliant') return { tone: 'pass', label: 'In place', order: 0 }
  if (changeStatuses.includes(status)) {
    return { tone: 'warn', label: 'Being corrected', order: 1 }
  }
  if (status === 'Accepted') return { tone: 'muted', label: 'Agreed exception', order: 2 }
  if (status === 'No Data') return { tone: 'muted', label: 'First check pending', order: 3 }
  if (status === 'Failed') return { tone: 'fail', label: 'Check failed', order: 4 }
  if (status === 'Skipped - No License') {
    return { tone: 'muted', label: 'License missing', order: 5 }
  }
  if (`${status ?? ''}`.startsWith('Skipped')) {
    return { tone: 'muted', label: 'Not applicable', order: 5 }
  }
  return { tone: 'muted', label: status ?? 'Unknown', order: 6 }
}

// Base standard families that deploy whole policies rather than change a setting.
const caFamilies = ['ConditionalAccessTemplate', 'ConditionalAccessTemplatePackage']
const intuneFamilies = ['IntuneTemplate', 'IntuneTemplatePackage']
const policyFamilies = [...caFamilies, ...intuneFamilies]

const baseNameOf = (standardName) => `${standardName}`.split('#')[0].split('~')[0]

// Legacy template saves stored option objects ({label, value}) for some variables.
const unwrapValue = (value) => value?.value ?? value

// What a CA policy protects against, read from its own content. Each phrase is written
// for an executive; duplicates across policies collapse into one sentence.
const caBenefitPhrases = (policy) => {
  const phrases = []
  if (!policy || typeof policy !== 'object') return phrases
  const grant = policy.grantControls ?? {}
  const conditions = policy.conditions ?? {}
  const controls = [].concat(grant.builtInControls ?? [])
  if (grant.authenticationStrength?.displayName) {
    phrases.push(
      `require ${grant.authenticationStrength.displayName} (phishing-resistant) sign-in`
    )
  } else if (controls.includes('mfa')) {
    phrases.push('enforce multi-factor authentication')
  }
  if (controls.includes('compliantDevice') || controls.includes('domainJoinedDevice')) {
    phrases.push('only allow access from compliant, company-managed devices')
  }
  if (controls.includes('passwordChange')) {
    phrases.push('force a password change when an account looks compromised')
  }
  if (controls.includes('block')) {
    phrases.push('block the targeted sign-ins entirely')
  }
  const includeLocations = [].concat(conditions.locations?.includeLocations ?? [])
  const excludeLocations = [].concat(conditions.locations?.excludeLocations ?? [])
  if (
    (includeLocations.length > 0 && !includeLocations.includes('All')) ||
    excludeLocations.length > 0
  ) {
    phrases.push('only allow sign-ins from approved locations')
  }
  const clientApps = [].concat(conditions.clientAppTypes ?? [])
  if (clientApps.includes('exchangeActiveSync') || clientApps.includes('other')) {
    phrases.push('block legacy sign-in methods that cannot do multi-factor authentication')
  }
  if ([].concat(conditions.signInRiskLevels ?? []).length > 0) {
    phrases.push('respond automatically to risky sign-ins')
  }
  if ([].concat(conditions.userRiskLevels ?? []).length > 0) {
    phrases.push('respond automatically to accounts marked as at risk')
  }
  if (policy.sessionControls?.signInFrequency?.isEnabled) {
    const frequency = policy.sessionControls.signInFrequency
    phrases.push(
      `require signing in again every ${frequency.value ?? ''} ${frequency.type ?? 'hours'}`.replace('  ', ' ')
    )
  }
  return phrases
}

// A light, one-line description of what a CA policy does, from its own content.
const caLightDescription = (policy) => {
  const phrases = caBenefitPhrases(policy)
  if (phrases.length === 0) return 'Applies custom sign-in controls.'
  const text = phrases.slice(0, 3).join(', ')
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`
}

// Who a CA policy applies to (or spares), summarized lightly from its users condition.
// CIPP CA templates store display names rather than ids, so the names are readable.
const capJoin = (values, cap = 3) => {
  const list = [].concat(values ?? []).filter(Boolean)
  if (list.length <= cap) return list.join(', ')
  return `${list.slice(0, cap).join(', ')} +${list.length - cap} more`
}

const summarizeCaUsers = (policy, kind) => {
  const users = policy?.conditions?.users ?? {}
  const parts = []
  const people = [].concat(users[`${kind}Users`] ?? [])
  if (people.includes('All')) parts.push('All users')
  else if (people.length > 0 && !people.includes('None')) parts.push(capJoin(people))
  const groups = [].concat(users[`${kind}Groups`] ?? [])
  if (groups.length > 0) parts.push(`Groups: ${capJoin(groups)}`)
  const roles = [].concat(users[`${kind}Roles`] ?? [])
  if (roles.length > 0) parts.push(`Roles: ${capJoin(roles)}`)
  const guests = users[`${kind}GuestsOrExternalUsers`]
  if (guests && (typeof guests !== 'object' || Object.keys(guests).length > 0)) {
    parts.push('Guests / external users')
  }
  if (parts.length === 0) return kind === 'include' ? '—' : 'None'
  return parts.join('\n')
}

const caStateLabel = (state) => {
  const value = `${state ?? ''}`.toLowerCase()
  if (value === 'enabledforreportingbutnotenforced' || value === 'reportonly') {
    return 'in report-only mode first, so we can measure the impact before anyone is blocked'
  }
  if (value === 'disabled') return 'switched off until we enable them together'
  return 'fully enforced from day one'
}

// The friendly name of a deployed policy: the rendered content's displayName when the
// engine computed one, a legacy picker label otherwise, and for package instances the
// bundle's own name (a package deploys every template tagged with it).
const policyDisplayName = (item) => {
  const packageName =
    unwrapValue(item.variables?.caTemplatePackage) ??
    unwrapValue(item.variables?.intuneTemplatePackage)
  // A displayName that is still a template file id (unresolved token render) is never
  // shown - the saved picker label or the instance label beats a GUID.
  const rendered = item.expectedValue?.displayName
  return (
    (rendered && !/\.json$/i.test(rendered) ? rendered : undefined) ??
    item.variables?.caTemplate?.label ??
    item.variables?.intuneTemplate?.label ??
    (packageName ? `Every policy in the '${packageName}' bundle` : item.label)
  )
}

const prettifyKey = (key) =>
  `${key}`
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (first) => first.toUpperCase())

const prettifyValue = (value) => {
  if (value === true) return 'On'
  if (value === false) return 'Off'
  if (Array.isArray(value)) {
    const parts = value.map(prettifyValue).filter((part) => part !== null)
    return parts.length > 0 ? parts.join(', ') : null
  }
  if (value !== null && typeof value === 'object') return null // summarized by caller
  return `${value}`
}

// Render a definition's expected block with the baseline's configured variables (falling
// back to recommended/default), so a simulated standard shows the values it would apply.
// Entries that still hold a tenant-specific token (e.g. %defaultdomain%) are left out -
// they resolve per tenant at run time.
const renderExpected = (definition, variables) => {
  if (!definition?.expected) return null
  const rendered = {}
  const resolveVariable = (name) => {
    const declared = definition.variables?.[name]
    const value =
      unwrapValue(variables?.[name]) ?? declared?.recommended ?? declared?.default
    return value === undefined || value === null || value === '' ? undefined : value
  }
  Object.entries(definition.expected).forEach(([key, template]) => {
    if (typeof template === 'string') {
      const exact = template.match(/^%(\w+)%$/)
      if (exact) {
        const value = resolveVariable(exact[1])
        if (value !== undefined) rendered[key] = value
        return
      }
      const replaced = template.replace(/%(\w+)%/g, (token, name) => {
        const value = resolveVariable(name)
        return value === undefined ? token : `${value}`
      })
      if (!/%\w+%/.test(replaced)) rendered[key] = replaced
    } else if (template === null || typeof template !== 'object') {
      rendered[key] = template
    } else if (!JSON.stringify(template).includes('%')) {
      rendered[key] = template
    }
  })
  return Object.keys(rendered).length > 0 ? rendered : null
}

// One "Label: value" line per entry of an expected-shaped object, using the definition's
// own variable and option labels where an expected key maps to exactly one variable.
const describeValues = (definition, values) => {
  if (values === null || values === undefined) return ''
  if (Array.isArray(values) || typeof values !== 'object') {
    return prettifyValue(values) ?? 'Configured'
  }
  const tokenFor = {}
  Object.entries(definition?.expected ?? {}).forEach(([key, template]) => {
    if (typeof template === 'string') {
      const match = template.match(/^%(\w+)%$/)
      if (match) tokenFor[key] = match[1]
    }
  })
  const parts = []
  Object.entries(values).forEach(([key, value]) => {
    const variable = tokenFor[key] ? definition?.variables?.[tokenFor[key]] : null
    const label = variable?.label ?? prettifyKey(key)
    let display = prettifyValue(value)
    if (display === null) {
      display = Object.entries(value ?? {})
        .map(([nestedKey, nestedValue]) => {
          const nested = prettifyValue(nestedValue)
          return nested === null ? null : `${prettifyKey(nestedKey)}: ${nested}`
        })
        .filter(Boolean)
        .join(', ')
      if (!display) display = 'configured'
    }
    const option = (variable?.options ?? []).find(
      (candidate) => `${candidate.value}` === `${value}`
    )
    if (option) display = option.label
    if (display === '') display = 'Not set'
    parts.push(`${label}: ${display}`)
  })
  if (parts.length > 8) {
    return [...parts.slice(0, 8), `… and ${parts.length - 8} more values`].join('\n')
  }
  return parts.join('\n')
}

const describeChange = (definition, expectedValue) => {
  const text = describeValues(definition, expectedValue)
  return text || 'Enforced as described'
}

// What the setting is today. The current value is projected onto the keys the baseline
// cares about, so the "from" column shows the relevant values rather than the whole
// object the API returned.
const describeToday = (definition, expectedValue, currentValue) => {
  if (currentValue === null || currentValue === undefined) return 'Not configured yet'
  if (
    expectedValue &&
    typeof expectedValue === 'object' &&
    !Array.isArray(expectedValue) &&
    currentValue &&
    typeof currentValue === 'object' &&
    !Array.isArray(currentValue)
  ) {
    const projected = {}
    Object.keys(expectedValue).forEach((key) => {
      if (currentValue[key] !== undefined) projected[key] = currentValue[key]
    })
    if (Object.keys(projected).length > 0) return describeValues(definition, projected)
  }
  return describeValues(definition, currentValue) || 'Not configured yet'
}

// Why the setting was chosen, from the definition's own metadata: who recommends it,
// which framework requires it, and how disruptive it is.
const describeWhy = (definition) => {
  const parts = []
  const recommendedBy = [].concat(definition?.recommendedBy ?? []).filter(Boolean)
  if (recommendedBy.length > 0) {
    parts.push(`Recommended by ${recommendedBy.join(' and ')}`)
  }
  const frameworkTag = []
    .concat(definition?.tag ?? [])
    .find((tag) => /CIS|CISA|NIST/i.test(tag))
  if (frameworkTag) parts.push(`required for ${frameworkTag}`)
  if (parts.length === 0) parts.push('Security best practice')
  const impact = `${definition?.impact ?? ''}`.toLowerCase()
  if (impact) parts.push(`${impact} change for users`)
  return `${parts.join('; ')}.`
}

// The enforcement content a template instance is configured with, resolved the same way
// for a not-yet-checked standard of an assigned baseline and for a simulated one: CA and
// Intune variables hold a template GUID that the resolvers map to the stored template
// content (so the report shows the real policy name and, for CA, derives the benefit
// sentence from the policy itself); plain settings render their expected block with the
// configured variables.
const resolveConfiguredExpected = (base, variables, catalogByName, resolvers) => {
  if (caFamilies.includes(base)) {
    const content = resolvers?.caByGuid?.[unwrapValue(variables.caTemplate)]
    if (!content) return null
    const state = unwrapValue(variables.state)
    return {
      ...content,
      state: state && state !== 'donotchange' ? state : content.state,
    }
  }
  if (intuneFamilies.includes(base)) {
    const content = resolvers?.intuneByGuid?.[unwrapValue(variables.intuneTemplate)]
    return content ? { displayName: content.displayName } : null
  }
  return renderExpected(catalogByName[base], variables)
}

// Everything the baseline will apply: current deviations, standards still awaiting their
// first check (they are part of the assigned baselines and WILL be enforced - their
// values come from the baseline's own configuration), and everything the simulated
// baselines would add.
const collectChanges = (
  tenant,
  assignedTemplates,
  simulatedTemplates,
  catalogByName,
  resolvers
) => {
  const items = []
  ;(tenant?.rows ?? [])
    .filter((row) => changeStatuses.includes(row.status))
    .forEach((row) => {
      items.push({
        key: row.standardName,
        base: baseNameOf(row.standardName),
        label: row.standardLabel,
        expectedValue: row.expectedValue,
        currentValue: row.currentValue,
        definition: catalogByName[baseNameOf(row.standardName)],
        simulated: false,
      })
    })

  // A No Data row carries no values yet, so its enforcement content is looked up in the
  // assigned baseline's saved configuration (matched by instance key, its own template
  // first when several baselines are assigned).
  const configFor = (row) => {
    const orderedTemplates = [...(assignedTemplates ?? [])].sort((a, b) => {
      if (a.GUID === row.templateId) return -1
      if (b.GUID === row.templateId) return 1
      return 0
    })
    for (const template of orderedTemplates) {
      for (const stage of template.stages ?? []) {
        const config = (stage.standardsConfig ?? []).find(
          (candidate) => (candidate.instance ?? candidate.standard) === row.standardName
        )
        if (config) return config
      }
    }
    return null
  }
  ;(tenant?.rows ?? [])
    .filter((row) => row.status === 'No Data')
    .forEach((row) => {
      const base = baseNameOf(row.standardName)
      const variables = configFor(row)?.variables ?? {}
      // A No Data row's expectedValue is the RAW token render - for a policy instance its
      // displayName is still the template GUID, because the prepare hook that swaps in
      // the real policy content never ran. The stored template is the truth for those;
      // for plain settings the engine's render (with real tenant tokens) is better than
      // re-rendering from defaults.
      const expectedValue = policyFamilies.includes(base)
        ? (resolveConfiguredExpected(base, variables, catalogByName, resolvers) ??
          row.expectedValue)
        : (row.expectedValue ??
          resolveConfiguredExpected(base, variables, catalogByName, resolvers))
      items.push({
        key: row.standardName,
        base,
        label: row.standardLabel,
        expectedValue,
        currentValue: null,
        variables,
        definition: catalogByName[base],
        simulated: false,
        pending: true,
      })
    })

  const presentNames = new Set((tenant?.rows ?? []).map((row) => row.standardName))
  ;(simulatedTemplates ?? []).forEach((template) => {
    template.stages.forEach((stage) => {
      ;(stage.standards ?? []).forEach((instance) => {
        if (presentNames.has(instance)) return
        if (items.some((item) => item.key === instance)) return
        const config = (stage.standardsConfig ?? []).find(
          (candidate) => (candidate.instance ?? candidate.standard) === instance
        )
        const base = baseNameOf(instance)
        const variables = config?.variables ?? {}
        items.push({
          key: instance,
          base,
          label: catalogByName[base]?.label ?? base,
          expectedValue: resolveConfiguredExpected(
            base,
            variables,
            catalogByName,
            resolvers
          ),
          currentValue: null,
          variables,
          definition: catalogByName[base],
          simulated: true,
          sourceTemplateName: template.templateName,
        })
      })
    })
  })
  return items
}

const formatAdvanceDate = (epoch) => {
  if (!epoch) return null
  const date = new Date(epoch > 1e12 ? epoch : epoch * 1000)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Exported so tests can render the report to a real PDF against fixture data.
export const WhatIfReportDocument = ({
  tenant,
  stageStates,
  assignedTemplates = [],
  simulatedTemplates = [],
  catalogByName,
  resolvers,
  brandingSettings,
  variables,
  generatedOn,
  sectionConfig = { alreadyAligned: true, rolloutStages: true },
}) => {
  const tenantName = tenant?.displayName ?? tenant?.tenantFilter ?? 'Organization'
  const rows = tenant?.rows ?? []
  const definitionFor = (row) => catalogByName[baseNameOf(row.standardName)]

  // The current-state table: every standard in the baseline, what it does, and whether it
  // is correct today. Deployed policy instances show the policy's own name.
  const stateRows = rows
    .map((row) => {
      const presentation = statusPresentation(row.status)
      return {
        name: row.expectedValue?.displayName ?? row.standardLabel ?? row.standardName,
        description:
          definitionFor(row)?.executiveText ?? definitionFor(row)?.helpText ?? '',
        tone: presentation.tone,
        statusLabel: presentation.label,
        order: presentation.order,
      }
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

  // What is already deployed and verified, with the same treatment as the planned work:
  // policies by name and content, settings with their enforced values.
  const alignedRows = rows.filter((row) => row.status === 'Compliant')
  const alignedCa = alignedRows.filter((row) => caFamilies.includes(baseNameOf(row.standardName)))
  const alignedIntune = alignedRows.filter((row) =>
    intuneFamilies.includes(baseNameOf(row.standardName))
  )
  const alignedSettings = alignedRows.filter(
    (row) => !policyFamilies.includes(baseNameOf(row.standardName))
  )
  // Both CA tables share one row shape: the policy, what it lightly does, and who it
  // includes and excludes - read from the policy content itself.
  const caTableColumns = [
    { header: 'Policy', key: 'policy', width: 1.5, bold: true },
    { header: 'What it does', key: 'does', width: 2.3 },
    { header: 'Applies to', key: 'includes', width: 1.3 },
    { header: 'Excluded', key: 'excludes', width: 1.3 },
  ]

  const acceptedRows = rows.filter((row) => row.status === 'Accepted')
  const pendingCount = rows.filter((row) => row.status === 'No Data').length

  const changes = collectChanges(
    tenant,
    assignedTemplates,
    simulatedTemplates,
    catalogByName,
    resolvers
  )
  const caChanges = changes.filter((item) => caFamilies.includes(item.base))
  const intuneChanges = changes.filter((item) => intuneFamilies.includes(item.base))
  const settingChanges = changes.filter((item) => !policyFamilies.includes(item.base))
  // Corrections are drift being fixed; pending items apply once their first check runs,
  // and are already counted by their own stat card.
  const corrections = changes.filter((item) => !item.pending)

  const caStateFor = (item) =>
    caStateLabel(item.expectedValue?.state ?? unwrapValue(item.variables?.state))
  const caStates = [...new Set(caChanges.map(caStateFor))]
  const simulatedNote = (item) =>
    item.simulated ? ` (added by the '${item.sourceTemplateName}' baseline)` : ''
  const simulatedNames = simulatedTemplates.map((template) => template.templateName)

  // The rollout, one bullet per wave, in plain words - what each wave holds and when the
  // next one lands. Never the raw graduation conditions.
  const waveBullets = (stageStates ?? []).flatMap((state) => {
    const prefix = (stageStates ?? []).length > 1 ? `${state.templateName} — ` : ''
    const liveCount = rows.filter(
      (row) => !row.templateId || !state.templateId || row.templateId === state.templateId
    ).length
    const bullets = [
      {
        label: `${prefix}Wave ${state.currentStage} of ${state.totalStages ?? state.currentStage}${state.stageName ? ` ('${state.stageName}')` : ''}:`,
        text: `live now${liveCount > 0 ? `, covering ${liveCount} protection${liveCount === 1 ? '' : 's'}` : ''}.`,
      },
    ]
    if (state.nextStage) {
      const upcoming = state.nextStage.standards ?? []
      const names = upcoming
        .slice(0, 3)
        .map((key) => catalogByName[baseNameOf(key)]?.label ?? baseNameOf(key))
      const date = formatAdvanceDate(state.estimatedAdvanceAt)
      bullets.push({
        label: `${prefix}Wave ${state.currentStage + 1}${state.nextStageName ? ` ('${state.nextStageName}')` : ''}:`,
        text:
          `adds ${upcoming.length > 0 ? `${upcoming.length} more protection${upcoming.length === 1 ? '' : 's'}` : 'further protections'}` +
          (names.length > 0
            ? ` - ${names.join(', ')}${upcoming.length > names.length ? ' and more' : ''}`
            : '') +
          `. ${date ? `Expected around ${date}` : 'Deploys once the current wave has settled in'}` +
          `${state.manualAdvance ? ', after we approve the move together' : ''}.`,
      })
    }
    return bullets
  })

  const fullyAligned =
    rows.length > 0 && changes.length === 0 && pendingCount === 0 && simulatedTemplates.length === 0
  const showAligned =
    sectionConfig.alreadyAligned !== false &&
    (alignedCa.length > 0 || alignedIntune.length > 0 || alignedSettings.length > 0)
  const showStages = sectionConfig.rolloutStages !== false && waveBullets.length > 0

  return (
    <ReportDocument
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      reportName="Security Baseline Report"
      generatedOn={generatedOn}
      variables={variables}
      coverLabel="SECURITY BASELINE"
      coverTitle="Baseline"
      coverAccent="Report"
      coverSubtitle="The security protections in place today, the improvements rolling out next, and the reasons behind each choice."
      coverFallbackImage="/reportImages/soc.jpg"
      footerLabel={`${tenantName} — Security Baseline`}
      coverMeta={
        <CoverMeta
          lines={[
            [
              `${alignedRows.length} protection${alignedRows.length === 1 ? '' : 's'} in place`,
              `${corrections.length} improvement${corrections.length === 1 ? '' : 's'} underway`,
              pendingCount > 0
                ? `${pendingCount} applying after ${pendingCount === 1 ? 'its' : 'their'} first check`
                : null,
            ]
              .filter(Boolean)
              .join(' · '),
          ]}
          note={
            simulatedNames.length > 0
              ? `Includes a simulation of: ${simulatedNames.join(', ')}`
              : undefined
          }
        />
      }
    >
      <ContentPage
        title="Executive Summary"
        subtitle="What is protecting you today, and what we will improve next"
      >
        <Section>
          <Paragraph>
            Your environment is protected by a <Bold>managed security baseline</Bold>: an
            agreed set of security policies and settings that we deploy, check
            continuously, and repair when anything drifts out of line. This report shows
            where that baseline stands today, what we will change next, and why each
            choice was made
            {simulatedNames.length > 0
              ? `. It also shows everything the following baseline${simulatedNames.length === 1 ? '' : 's'} would add: ${simulatedNames.join(', ')}`
              : ''}
            .
          </Paragraph>

          <StatRow
            stats={[
              { value: alignedRows.length, label: 'In Place' },
              { value: corrections.length, label: 'Being Improved' },
              { value: pendingCount, label: 'First Check Pending' },
              { value: acceptedRows.length, label: 'Agreed Exceptions' },
            ]}
          />

          {fullyAligned && (
            <ClearBox title="✔️ Fully aligned">
              Every part of the baseline is in effect and verified. We keep checking on
              every run, and anything that drifts is corrected automatically.
            </ClearBox>
          )}
        </Section>

        <Section title="Where The Baseline Stands Today">
          <Paragraph>
            Every protection in the baseline is listed below with its current state.{' '}
            <Bold>In place</Bold> means it is deployed and verified as correct.{' '}
            <Bold>Being corrected</Bold> means it drifted from the agreed value and is
            covered in the changes on the next pages. <Bold>First check pending</Bold>{' '}
            means it was recently assigned - what it will apply is already listed in the
            changes on the next pages, and the first verification run confirms it.
          </Paragraph>
          <DataTable
            columns={[
              { header: 'Protection', key: 'name', width: 1.7, bold: true },
              { header: 'What it does', key: 'description', width: 2.9 },
              {
                header: 'Status',
                key: 'statusLabel',
                width: 1,
                render: (row) => <StatusText tone={row.tone}>{row.statusLabel}</StatusText>,
              },
            ]}
            rows={stateRows}
            limit={150}
            emptyText="The baseline was just assigned - the first verification run has not completed yet."
          />
        </Section>
      </ContentPage>

      {showAligned && (
        <ContentPage
          title="What Is Already In Place"
          subtitle="Deployed, verified, and re-checked on every run"
        >
          {alignedCa.length > 0 && (
            <Section title="Conditional Access Policies In Force">
              <Paragraph>
                The following Conditional Access policies are deployed and verified:
              </Paragraph>
              <DataTable
                columns={caTableColumns}
                rows={alignedCa.map((row) => ({
                  policy: row.expectedValue?.displayName ?? row.standardLabel,
                  does: caLightDescription(row.expectedValue),
                  includes: summarizeCaUsers(row.expectedValue, 'include'),
                  excludes: summarizeCaUsers(row.expectedValue, 'exclude'),
                }))}
                limit={50}
              />
            </Section>
          )}

          {alignedIntune.length > 0 && (
            <Section title="Intune Policies In Force">
              <Paragraph>
                The following Intune policies are deployed and keeping your devices
                configured to the agreed standard:
              </Paragraph>
              <BulletList
                items={alignedIntune.map((row) => ({
                  label: row.expectedValue?.displayName ?? row.standardLabel,
                }))}
              />
            </Section>
          )}

          {alignedSettings.length > 0 && (
            <Section title="Settings Enforced Today">
              <DataTable
                columns={[
                  { header: 'Setting', key: 'setting', width: 1.4, bold: true },
                  { header: 'What it does', key: 'description', width: 2.4 },
                  { header: 'Set to', key: 'value', width: 1.5 },
                  { header: 'Why', key: 'why', width: 1.4 },
                ]}
                rows={alignedSettings.map((row) => ({
                  setting: row.standardLabel,
                  description:
                    definitionFor(row)?.executiveText ?? definitionFor(row)?.helpText ?? '',
                  value: describeChange(
                    definitionFor(row),
                    row.currentValue ?? row.expectedValue
                  ),
                  why: describeWhy(definitionFor(row)),
                }))}
                limit={150}
              />
            </Section>
          )}
        </ContentPage>
      )}

      {(caChanges.length > 0 || intuneChanges.length > 0) && (
        <ContentPage
          title="Policies We Will Deploy"
          subtitle="New protection rolling out, and what it adds"
        >
          {caChanges.length > 0 && (
            <Section title="Conditional Access Policies">
              <Paragraph>
                We will deploy the following Conditional Access policies, which control
                who can sign in, from where, and under what conditions:
              </Paragraph>
              <DataTable
                columns={caTableColumns}
                rows={caChanges.map((item) => ({
                  policy: `${policyDisplayName(item)}${item.simulated ? ' *' : ''}`,
                  does:
                    caLightDescription(item.expectedValue) +
                    (caStates.length > 1 ? ` Deployed ${caStateFor(item)}.` : ''),
                  includes: summarizeCaUsers(item.expectedValue, 'include'),
                  excludes: summarizeCaUsers(item.expectedValue, 'exclude'),
                }))}
                limit={50}
              />
              {caStates.length === 1 && (
                <Paragraph>
                  These policies will be deployed <Bold>{caStates[0]}</Bold>.
                </Paragraph>
              )}
              {caChanges.some((item) => item.simulated) && (
                <Paragraph>
                  * added by a simulated baseline ({simulatedNames.join(', ')}).
                </Paragraph>
              )}
            </Section>
          )}

          {intuneChanges.length > 0 && (
            <Section title="Intune Policies">
              <Paragraph>We will implement the following Intune policies:</Paragraph>
              <BulletList
                items={intuneChanges.map((item) => ({
                  label: policyDisplayName(item),
                  text: simulatedNote(item).trim(),
                }))}
              />
              <Paragraph>
                These policies configure and protect the devices your staff work on, so
                every device meets the same security bar before it touches company data.
              </Paragraph>
            </Section>
          )}
        </ContentPage>
      )}

      {settingChanges.length > 0 && (
        <ContentPage
          title="Settings We Will Change"
          subtitle="Each setting: what it does, what it is today, what we set it to, and why"
        >
          <Section>
            <DataTable
              columns={[
                { header: 'Setting', key: 'setting', width: 1.3, bold: true },
                { header: 'What it does', key: 'description', width: 2.1 },
                { header: 'Today', key: 'today', width: 1.3 },
                { header: 'We will set it to', key: 'change', width: 1.4 },
                { header: 'Why', key: 'why', width: 1.3 },
              ]}
              rows={settingChanges.map((item) => ({
                setting: `${item.label}${item.simulated ? ' *' : ''}`,
                description:
                  item.definition?.executiveText ?? item.definition?.helpText ?? '',
                today:
                  item.simulated || item.pending
                    ? item.pending
                      ? 'Not checked yet'
                      : '—'
                    : describeToday(item.definition, item.expectedValue, item.currentValue),
                change: describeChange(item.definition, item.expectedValue),
                why: describeWhy(item.definition),
              }))}
              limit={150}
            />
            {settingChanges.some((item) => item.simulated) && (
              <Paragraph>
                * added by a simulated baseline ({simulatedNames.join(', ')}).
              </Paragraph>
            )}
          </Section>
        </ContentPage>
      )}

      {(showStages || acceptedRows.length > 0) && (
        <ContentPage
          title="Rollout Plan"
          subtitle="How the changes arrive, and agreed exceptions"
        >
          {showStages && (
            <Section title="How The Rollout Works">
              <Paragraph>
                The baseline is deployed in waves rather than all at once, so your team
                never faces every change on the same day. Each wave is monitored until it
                has proven stable before the next one begins.
              </Paragraph>
              <BulletList items={waveBullets} />
            </Section>
          )}
          {acceptedRows.length > 0 && (
            <Section title="Agreed Exceptions We Will Not Change">
              <Paragraph>
                These deviations from the baseline were reviewed and accepted, so they
                stay as they are:
              </Paragraph>
              <BulletList
                items={acceptedRows.map((row) => ({
                  label: row.standardLabel,
                  text: row.deviationReason ? `— ${row.deviationReason}` : '',
                }))}
              />
            </Section>
          )}
        </ContentPage>
      )}
    </ReportDocument>
  )
}

// Report option toggles shown in the sidebar, in the executive report's card style.
const sectionOptions = [
  {
    key: 'alreadyAligned',
    label: 'What Is Already In Place',
    description: 'Deployed policies and enforced settings, with their values',
  },
  {
    key: 'rolloutStages',
    label: 'Rollout Stages',
    description: 'How the remaining waves arrive and when',
  },
]

// Button + preview dialog in the executive report's shape: an options rail on the left
// (branding, simulated baselines, section toggles) and the live PDF preview on the right.
export const CippBaselineWhatIfReport = ({
  tenant,
  stageStates,
  baselines = [],
  catalog = [],
}) => {
  const [open, setOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [simulatedSelection, setSimulatedSelection] = useState([])
  const [generatedOn, setGeneratedOn] = useState('')
  const [sectionConfig, setSectionConfig] = useState({
    alreadyAligned: true,
    rolloutStages: true,
  })
  // Null until the operator picks one, so the branding setting for this report type keeps
  // applying as it changes. An explicit choice - including "Default" - wins from then on.
  const [presetOverride, setPresetOverride] = useState(null)
  const defaultBranding = useBrandingSettings()
  const brandingPresetId = presetOverride ?? defaultBranding?.reportDefaults?.baseline ?? ''

  // Named branding sets a report can be rendered against instead of the default branding.
  const brandingPresets = ApiGetCall({
    url: '/api/ListBrandingPresets',
    data: { includeImages: true },
    queryKey: 'ListBrandingPresets-withImages',
    waiting: open,
  })
  const presetOptions = useMemo(
    () => [
      DEFAULT_BRANDING_OPTION,
      ...(Array.isArray(brandingPresets.data) ? brandingPresets.data : []).map(
        (preset) => ({ label: preset.name, value: preset.id })
      ),
    ],
    [brandingPresets.data]
  )
  const brandingSettings = useMemo(() => {
    if (!brandingPresetId) return defaultBranding
    const presets = Array.isArray(brandingPresets.data) ? brandingPresets.data : []
    return presets.find((preset) => preset.id === brandingPresetId) || defaultBranding
  }, [brandingPresetId, brandingPresets.data, defaultBranding])

  const variables = useReportVariables()
  const tenantLabel = tenant?.displayName ?? tenant?.tenantFilter ?? 'tenant'

  const catalogByName = Object.fromEntries(
    catalog.map((standard) => [standard.name, standard])
  )

  // Simulated baselines only store a template GUID for CA/Intune instances - the stored
  // templates give us the policy names (and full CA content for the benefit sentence).
  const caTemplatesApi = ApiGetCall({
    url: '/api/ListCATemplates',
    queryKey: 'ListCATemplates',
    waiting: open,
  })
  const intuneTemplatesApi = ApiGetCall({
    url: '/api/ListIntuneTemplates',
    queryKey: 'ListIntuneTemplates',
    waiting: open,
  })
  const resolvers = {
    caByGuid: Object.fromEntries(
      (caTemplatesApi.data ?? []).map((template) => [template.GUID, template])
    ),
    intuneByGuid: Object.fromEntries(
      (intuneTemplatesApi.data ?? []).map((template) => [template.GUID, template])
    ),
  }

  // Assigned baselines carry the saved configuration that tells us what a standard still
  // awaiting its first check will enforce; the rest can be simulated in the report.
  const assignedTemplates = baselines.filter((template) =>
    stageStates.some((state) => state.templateId === template.GUID)
  )
  const availableTemplates = baselines.filter(
    (template) => !stageStates.some((state) => state.templateId === template.GUID)
  )
  const simulatedTemplates = simulatedSelection
    .map((option) => availableTemplates.find((template) => template.GUID === option.value))
    .filter(Boolean)

  const handleOpen = () => {
    setGeneratedOn(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    )
    setOpen(true)
  }

  const documentNode = (
    <WhatIfReportDocument
      tenant={tenant}
      stageStates={stageStates}
      assignedTemplates={assignedTemplates}
      simulatedTemplates={simulatedTemplates}
      catalogByName={catalogByName}
      resolvers={resolvers}
      brandingSettings={brandingSettings}
      variables={variables}
      generatedOn={generatedOn}
      sectionConfig={sectionConfig}
    />
  )

  // One definition, two homes: the desktop rail and the mobile drawer. The drawer's own
  // header already says "Report Options", so it takes the panel without the heading.
  const optionsPanel = ({ showHeading = true } = {}) => (
    <Box sx={{ p: 2 }}>
      {showHeading && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CippIcons.Settings size={20} />
          Report Options
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 3
        }}>
        Configure what the baseline report includes. Changes are reflected in real-time.
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
            presetOptions.find((option) => option.value === brandingPresetId) ??
            presetOptions[0]
          }
          onChange={(option) => setPresetOverride(option?.value ?? '')}
        />
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          Presets are managed in Settings → Branding
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <CippAutoComplete
          size="small"
          label="Simulate additional baselines"
          multiple={true}
          creatable={false}
          options={availableTemplates.map((template) => ({
            label: template.templateName,
            value: template.GUID,
          }))}
          value={simulatedSelection}
          onChange={(options) => setSimulatedSelection(options ?? [])}
        />
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          Everything these baselines would add appears in the report as planned changes.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {sectionOptions.map((option) => (
          <Paper
            key={option.key}
            onClick={() =>
              setSectionConfig((prev) => ({ ...prev, [option.key]: !prev[option.key] }))
            }
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
                setSectionConfig((prev) => ({
                  ...prev,
                  [option.key]: !prev[option.key],
                }))
              }}
              onClick={(event) => event.stopPropagation()}
              color="primary"
              size="small"
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
    </Box>
  )

  return (
    <>
      <Tooltip title="Preview what applying the configured standards would change for this tenant, including upcoming stages">
        <Button
          variant="contained"
          startIcon={<CippIcons.PictureAsPdf />}
          onClick={handleOpen}
        >
          What-If Report
        </Button>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
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
            Baseline Report - {tenantLabel}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {/* The options rail's stand-in below md, in the title bar because the dialog
                is full-screen there and this is the only chrome that stays put. */}
            <IconButton
              onClick={() => setOptionsOpen(true)}
              size="small"
              aria-label="Report options"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <CippIcons.Settings />
            </IconButton>
            <IconButton onClick={() => setOpen(false)} size="small" aria-label="Close preview">
              <CippIcons.Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%', display: 'flex' }}>
          {/* Left Panel - report options. Below md it lives in the drawer instead. */}
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
            {optionsPanel()}
          </Paper>

          {/* Right Panel - PDF preview */}
          <Box sx={{ flex: 1, height: '100%', minWidth: 0 }}>
            {open && (
              <CippPdfPreview
                // Remount when the inputs change so react-pdf re-renders cleanly
                viewerKey={`${simulatedSelection.map((option) => option.value).join('-') || 'assigned-only'}-${brandingPresetId}-${sectionConfig.alreadyAligned}-${sectionConfig.rolloutStages}`}
                width="100%"
                height="100%"
                title={`Baseline Report - ${tenantLabel}`}
                fileName={`Baseline_Report_${tenantLabel}.pdf`}
              >
                {documentNode}
              </CippPdfPreview>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <PDFDownloadLink
            document={documentNode}
            fileName={`Baseline_Report_${tenantLabel.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
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

        <CippOffCanvas
          visible={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          title="Report Options"
          size="sm"
          contentPadding={0}
          aboveModal
        >
          {optionsPanel({ showHeading: false })}
        </CippOffCanvas>
      </Dialog>
    </>
  );
}

export default CippBaselineWhatIfReport
