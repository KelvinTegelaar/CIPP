import {
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import CippButtonCard from '../CippCards/CippButtonCard'
import { CippAutoComplete } from '../CippComponents/CippAutocomplete'
import { COVER_STOCK_OPTIONS, useBrandingSettings } from '../CippPdf'
import { CHART_KINDS } from './reportSettings'

// Editors for the report builder's structured blocks — the ones that carry data rather than prose.
//
// Text blocks stay in the builder page with the rich-text editor they need; these live here because
// they are all the same shape (a title, a small table of values, a couple of options) and because
// the page was already long enough.

/* ── Block definitions ───────────────────────────────────── */

// Data tokens resolve against the reporting database when the report renders, on the server, so a
// scheduled report reads the same data a preview does. Charts and tables pick their data with the
// DataSourcePicker below; free-text figures can still use a token.
const DATA_TOKEN_HINT =
  'Figures can be data tokens, read when the report renders: &Users& counts a collection, ' +
  '&Devices.complianceState=compliant& counts the rows that match, &Mailboxes.TotalItemSize:sum& adds a field up.'

/**
 * Pre-built components grouped by topic. The picker offers the topic (Licences, MFA, Devices...) as
 * the second step and, when a topic has more than one visual, the chart type as a third step, so a
 * consistent naming scheme (topic then chart type) replaces a long flat list. Each variant's `preset`
 * is a key in BLOCK_PRESETS below.
 */
export const PRESET_TOPICS = [
  {
    label: 'Secure Score',
    value: 'securescore',
    variants: [
      { label: 'Trend', preset: 'securescore' },
      { label: 'Controls to improve (table)', preset: 'securescorefailing' },
    ],
  },
  {
    label: 'Licences',
    value: 'licences',
    variants: [
      { label: 'Usage (bar)', preset: 'licenseusage' },
      { label: 'Summary (table)', preset: 'licensetable' },
      { label: 'Flow (Sankey)', preset: 'licenseflow' },
    ],
  },
  {
    label: 'MFA',
    value: 'mfa',
    variants: [
      { label: 'Registration (donut)', preset: 'mfaregistration' },
      { label: 'Coverage flow (Sankey)', preset: 'mfaflow' },
      { label: 'Auth methods (Sankey)', preset: 'authmethods' },
    ],
  },
  { label: 'Conditional Access', value: 'ca', variants: [{ label: 'By state (donut)', preset: 'castate' }] },
  {
    label: 'Devices',
    value: 'devices',
    variants: [
      { label: 'Compliance (donut)', preset: 'devicecompliance' },
      { label: 'Compliance flow (Sankey)', preset: 'devicecomplianceflow' },
      { label: 'By OS (donut)', preset: 'deviceos' },
      { label: 'By manufacturer (donut)', preset: 'devicemanufacturer' },
      { label: 'By ownership (donut)', preset: 'deviceownership' },
      { label: 'By encryption (donut)', preset: 'deviceencryption' },
    ],
  },
  { label: 'Users', value: 'users', variants: [{ label: 'By type (donut)', preset: 'usertype' }] },
  {
    label: 'Mailboxes',
    value: 'mailboxes',
    variants: [
      { label: 'By type (donut)', preset: 'mailboxesbytype' },
      { label: 'Busiest by items (bar)', preset: 'mailboxbusiest' },
      { label: 'Largest by storage (bar)', preset: 'mailboxbusieststorage' },
      { label: 'Top senders (bar)', preset: 'mailboxtopsenders' },
      { label: 'Top recipients (bar)', preset: 'mailboxtoprecipients' },
    ],
  },
  { label: 'Groups', value: 'groups', variants: [{ label: 'By type (donut)', preset: 'groupsbytype' }] },
  { label: 'Domains', value: 'domains', variants: [{ label: 'Mail security (table)', preset: 'domainsecurity' }] },
  { label: 'Risky users', value: 'risk', variants: [{ label: 'By risk level (donut)', preset: 'riskyusers' }] },
  { label: 'Tenant', value: 'tenant', variants: [{ label: 'Summary (cards)', preset: 'tenantsummary' }] },
]

/**
 * Every block the builder can add, grouped the way the picker offers them: a category first, then
 * the block. One flat list of all of them is more than a dropdown reads well with. The text blocks
 * ('blank', 'test', 'database') keep their editors in the builder page; everything else is a
 * structured block with an editor below. This mirrors the server engine's block vocabulary
 * (ReportComponents.RenderBlock) - a block type not listed here has no way into a report.
 */
export const BLOCK_CATEGORIES = [
  {
    label: 'Text',
    value: 'text',
    blocks: [
      { label: 'Custom Block', value: 'blank' },
      { label: 'Note', value: 'note' },
      { label: 'Bullet List', value: 'richbullets' },
      { label: 'Numbered List', value: 'numbered' },
      { label: 'Indented Text', value: 'paragraphindent' },
      { label: 'Code Block', value: 'code' },
      { label: 'Callout', value: 'infobox' },
      { label: 'Callout Grid', value: 'infoboxcolumns' },
    ],
  },
  {
    label: 'Data',
    value: 'data',
    blocks: [
      { label: 'Test Result', value: 'test' },
      { label: 'Database Data', value: 'database' },
      { label: 'Table', value: 'richtable' },
    ],
  },
  {
    label: 'Visuals',
    value: 'visuals',
    blocks: [
      { label: 'Chart', value: 'chart' },
      { label: 'Flow (Sankey)', value: 'sankey' },
      { label: 'Score Cards', value: 'scorecard' },
      { label: 'Progress Bars', value: 'progress' },
    ],
  },
  {
    label: 'Layout',
    value: 'layout',
    blocks: [
      { label: 'Cover', value: 'cover' },
      { label: 'Titled Page', value: 'page' },
      { label: 'Infographic', value: 'hero' },
      { label: 'Divider', value: 'hr' },
      { label: 'Page Break', value: 'pagebreak' },
    ],
  },
  // Pre-built components: one click drops a block already wired to the right data source, so the
  // common dashboard visuals aren't assembled by hand. The second step is the topic (below); when the
  // topic has several visuals the builder adds a third step to pick the chart type. A topic value is
  // 'topic:<key>' resolved via presetVariantsFor; each variant maps to a BLOCK_PRESETS factory.
  {
    label: 'Pre-built',
    value: 'presets',
    blocks: PRESET_TOPICS.map((topic) => ({ label: topic.label, value: `topic:${topic.value}` })),
  },
]

export const isPresetTopic = (value) => typeof value === 'string' && value.startsWith('topic:')

/** The chart-type variants a pre-built topic offers (the picker's third step). */
export const presetVariantsFor = (topicValue) =>
  (PRESET_TOPICS.find((topic) => `topic:${topic.value}` === topicValue)?.variants ?? []).map((variant) => ({
    label: variant.label,
    value: variant.preset,
  }))

// The in-app compliance test results as a data-source "collection", so a chart/table/flow can be
// driven by test data the same way as a reporting collection. Its fields mirror what a test writes
// (Add-CippTestResult); the server resolves a 'TestResults' source from CippTestResults. Merged into
// the picker's collection list (which otherwise comes from the reporting database shape).
export const TEST_RESULTS_SHAPE = {
  type: 'TestResults',
  count: null,
  fields: [
    { name: 'Status', type: 'string' },
    { name: 'TestType', type: 'string' },
    { name: 'Risk', type: 'string' },
    { name: 'Category', type: 'string' },
    { name: 'Name', type: 'string' },
    { name: 'ImplementationEffort', type: 'string' },
    { name: 'UserImpact', type: 'string' },
  ],
}

// A chart's page width: full, or half so two can sit side by side (the engine pairs adjacent halves).
export const CHART_WIDTHS = [
  { label: 'Full width', value: 'full' },
  { label: 'Half (side by side)', value: 'half' },
]

// A chart source in the shape the picker saves + the server resolver reads. `field` is the "Per"
// axis/label; `valueField` (with `aggregate`) plots a numeric field instead of counting rows.
const source = (
  type,
  { field = null, valueField = null, aggregate = null, filter = null, scale = null, preset = null } = {}
) => ({
  type,
  field,
  valueField,
  aggregate,
  filter,
  // Optional: divide plotted values before drawing (bytes -> GB); or a derived builder for data a flat
  // single-collection read cannot express (a table preset).
  ...(scale ? { scale } : {}),
  ...(preset ? { preset } : {}),
})

/**
 * The pre-built components, keyed by preset name. A factory returns the block(s) to insert, already
 * configured against the reporting database - no bespoke server code, they ride the same chartSource /
 * dataSource resolver every hand-built chart uses (Resolve-CippReportDataToken). Collection Type names
 * and field names match what the collectors store (New-CIPPDbRequest -Type). Add a pre-built component
 * by adding a factory here and an entry to the 'Pre-built' category above.
 *
 * A tenant that has not cached a collection renders that block as "No data available" rather than
 * failing, so a preset is always safe to drop in.
 */
export const BLOCK_PRESETS = {
  // Microsoft Secure Score history: plot currentScore per day (a date field makes it a trend).
  securescore: () => ({
    type: 'chart',
    static: true,
    title: 'Secure Score',
    chartKind: 'trend',
    chartSource: source('SecureScore', { field: 'createdDateTime', valueField: 'currentScore' }),
    chartCaption: 'Microsoft Secure Score over time',
    chartCentreLabel: '',
    chartMax: '',
  }),
  // Assigned seats per licence (CountUsed is stored as a string; the resolver coerces it to a number).
  licenseusage: () => ({
    type: 'chart',
    static: true,
    title: 'Licence usage',
    chartKind: 'bar',
    chartSource: source('LicenseOverview', {
      field: 'License',
      valueField: 'CountUsed',
      aggregate: 'sum',
    }),
    chartCaption: 'Assigned seats per licence',
    chartCentreLabel: '',
    chartMax: '',
  }),
  // The full licence position as a table: assigned / available / total per SKU.
  licensetable: () => ({
    type: 'richtable',
    static: true,
    title: 'Licences',
    dataSource: source('LicenseOverview'),
    columns: [
      { key: 'c1', header: 'Licence', field: 'License' },
      { key: 'c2', header: 'Assigned', field: 'CountUsed' },
      { key: 'c3', header: 'Available', field: 'CountAvailable' },
      { key: 'c4', header: 'Total', field: 'TotalLicenses' },
    ],
    rows: [],
  }),
  // Registered vs not, among enabled users (MFAState.MFARegistration is a boolean -> True/False slices).
  mfaregistration: () => ({
    type: 'chart',
    static: true,
    title: 'MFA registration',
    chartKind: 'donut',
    chartSource: source('MFAState', {
      field: 'MFARegistration',
      filter: { field: 'AccountEnabled', op: '=', value: 'true' },
    }),
    chartCaption: 'Registered MFA methods (enabled users) - True = registered',
    chartCentreLabel: 'Users',
    chartMax: '',
  }),
  // Conditional Access policies by state: enabled / disabled / report-only.
  castate: () => ({
    type: 'chart',
    static: true,
    title: 'Conditional Access policies',
    chartKind: 'donut',
    chartSource: source('ConditionalAccessPolicies', { field: 'state' }),
    chartCaption: 'Policies by state',
    chartCentreLabel: 'Policies',
    chartMax: '',
  }),
  // Managed devices by Intune compliance state.
  devicecompliance: () => ({
    type: 'chart',
    static: true,
    title: 'Device compliance',
    chartKind: 'donut',
    chartSource: source('ManagedDevices', { field: 'complianceState' }),
    chartCaption: 'Managed devices by compliance state',
    chartCentreLabel: 'Devices',
    chartMax: '',
  }),
  // Managed devices by operating system.
  deviceos: () => ({
    type: 'chart',
    static: true,
    title: 'Devices by OS',
    chartKind: 'donut',
    chartSource: source('ManagedDevices', { field: 'operatingSystem' }),
    chartCaption: 'Managed devices by operating system',
    chartCentreLabel: 'Devices',
    chartMax: '',
  }),
  // Directory users split by member vs guest.
  usertype: () => ({
    type: 'chart',
    static: true,
    title: 'Users by type',
    chartKind: 'donut',
    chartSource: source('Users', { field: 'userType' }),
    chartCaption: 'Members vs guests',
    chartCentreLabel: 'Users',
    chartMax: '',
  }),
  // Faithful ports of the dashboard sankeys - the server (Get-CippReportSankeyData) runs the exact
  // computation the dashboard card does, so the report matches the dashboard. `preset` names which one.
  // The dashboard LicenseCard: the top-5 licences by total, each fanning out to its own assigned/available.
  licenseflow: () => ({
    type: 'sankey',
    static: true,
    title: 'Licence allocation',
    chartCaption: 'Top licences: assigned vs available seats',
    sankeySource: { type: 'LicenseOverview', preset: 'licenseAllocation' },
  }),
  // The dashboard MFACard: enabled users -> registered / not registered -> how MFA is enforced.
  mfaflow: () => ({
    type: 'sankey',
    static: true,
    title: 'User authentication',
    chartCaption: 'Enabled users: MFA registration and how it is enforced',
    sankeySource: { type: 'MFAState', preset: 'mfaCoverage' },
  }),
  // The dashboard AuthMethodCard: users by factor class (single / multi / phishable / phish-resistant)
  // and the method breakdown beneath.
  authmethods: () => ({
    type: 'sankey',
    static: true,
    title: 'All users auth methods',
    chartCaption: 'Enabled users by authentication strength',
    sankeySource: { type: 'MFAState', preset: 'authMethods' },
  }),
  // Managed devices -> operating system -> compliance state (server-computed, faithful to the dashboard).
  devicecomplianceflow: () => ({
    type: 'sankey',
    static: true,
    title: 'Device compliance',
    chartCaption: 'Managed devices by operating system and compliance state',
    sankeySource: { type: 'ManagedDevices', preset: 'deviceCompliance' },
  }),
  // Managed devices split other ways (same collection as compliance/OS).
  devicemanufacturer: () => ({
    type: 'chart',
    static: true,
    title: 'Devices by manufacturer',
    chartKind: 'donut',
    chartSource: source('ManagedDevices', { field: 'manufacturer' }),
    chartCaption: 'Managed devices by manufacturer',
    chartCentreLabel: 'Devices',
    chartMax: '',
  }),
  deviceownership: () => ({
    type: 'chart',
    static: true,
    title: 'Devices by ownership',
    chartKind: 'donut',
    chartSource: source('ManagedDevices', { field: 'managedDeviceOwnerType' }),
    chartCaption: 'Corporate vs personal devices',
    chartCentreLabel: 'Devices',
    chartMax: '',
  }),
  // Managed devices split by disk-encryption state (BitLocker / FileVault reported by Intune).
  deviceencryption: () => ({
    type: 'chart',
    static: true,
    title: 'Devices by encryption',
    chartKind: 'donut',
    chartSource: source('ManagedDevices', { field: 'isEncrypted' }),
    chartCaption: 'Encrypted vs unencrypted devices',
    chartCentreLabel: 'Devices',
    chartMax: '',
  }),
  // Mailboxes by recipient type (user / shared / room ...).
  mailboxesbytype: () => ({
    type: 'chart',
    static: true,
    title: 'Mailboxes by type',
    chartKind: 'donut',
    chartSource: source('Mailboxes', { field: 'recipientTypeDetails' }),
    chartCaption: 'Mailboxes by recipient type',
    chartCentreLabel: 'Mailboxes',
    chartMax: '',
  }),
  // Busiest mailboxes by item count (readable, unlike raw storage bytes).
  mailboxbusiest: () => ({
    type: 'chart',
    static: true,
    title: 'Busiest mailboxes',
    chartKind: 'bar',
    chartSource: source('MailboxUsage', { field: 'displayName', valueField: 'itemCount', aggregate: 'max' }),
    chartCaption: 'Top mailboxes by item count',
    chartCentreLabel: '',
    chartMax: '',
  }),
  // Largest mailboxes by storage; scaled from bytes to GB so the bar labels read sensibly.
  mailboxbusieststorage: () => ({
    type: 'chart',
    static: true,
    title: 'Largest mailboxes',
    chartKind: 'bar',
    chartSource: source('MailboxUsage', {
      field: 'displayName',
      valueField: 'storageUsedInBytes',
      aggregate: 'max',
      scale: 1073741824,
    }),
    chartCaption: 'Top mailboxes by storage used (GB)',
    chartCentreLabel: '',
    chartMax: '',
  }),
  // Top mailboxes by messages sent (last 30 days), from the cached mail traffic summary.
  mailboxtopsenders: () => ({
    type: 'chart',
    static: true,
    title: 'Top senders',
    chartKind: 'bar',
    chartSource: source('MailTrafficSummary', {
      field: 'name',
      valueField: 'count',
      aggregate: 'sum',
      filter: { field: 'category', op: '=', value: 'TopMailSender' },
    }),
    chartCaption: 'Mailboxes by messages sent (30 days)',
    chartCentreLabel: '',
    chartMax: '',
  }),
  // Top mailboxes by messages received (last 30 days), from the cached mail traffic summary.
  mailboxtoprecipients: () => ({
    type: 'chart',
    static: true,
    title: 'Top recipients',
    chartKind: 'bar',
    chartSource: source('MailTrafficSummary', {
      field: 'name',
      valueField: 'count',
      aggregate: 'sum',
      filter: { field: 'category', op: '=', value: 'TopMailRecipient' },
    }),
    chartCaption: 'Mailboxes by messages received (30 days)',
    chartCentreLabel: '',
    chartMax: '',
  }),
  // Groups by calculated type (security / Microsoft 365 / distribution ...).
  groupsbytype: () => ({
    type: 'chart',
    static: true,
    title: 'Groups by type',
    chartKind: 'donut',
    chartSource: source('Groups', { field: 'calculatedGroupType' }),
    chartCaption: 'Groups by type',
    chartCentreLabel: 'Groups',
    chartMax: '',
  }),
  // Domain mail-security posture (the dashboard "Mail hygiene" data) as a table.
  domainsecurity: () => ({
    type: 'richtable',
    static: true,
    title: 'Domain mail security',
    dataSource: source('DomainAnalyser'),
    limit: 50,
    columns: [
      { key: 'c1', header: 'Domain', field: 'Domain' },
      { key: 'c2', header: 'SPF', field: 'SPFPassAll' },
      { key: 'c3', header: 'DKIM', field: 'DKIMEnabled' },
      { key: 'c4', header: 'DMARC', field: 'DMARCPresent' },
      { key: 'c5', header: 'DNSSEC', field: 'DNSSECPresent' },
      { key: 'c6', header: 'Score', field: 'ScorePercentage', align: 'right' },
    ],
    rows: [],
  }),
  // Risky users by risk level (Identity Protection).
  riskyusers: () => ({
    type: 'chart',
    static: true,
    title: 'Risky users',
    chartKind: 'donut',
    chartSource: source('RiskyUsers', { field: 'riskLevel' }),
    chartCaption: 'Users by risk level',
    chartCentreLabel: 'Users',
    chartMax: '',
  }),
  // Tenant headline counts as score cards, resolved from the reporting database via data tokens.
  tenantsummary: () => ({
    type: 'scorecard',
    static: true,
    title: 'Tenant summary',
    stats: [
      { label: 'Users', value: '&Users&' },
      { label: 'Guests', value: '&Guests&' },
      { label: 'Groups', value: '&Groups&' },
      { label: 'Mailboxes', value: '&Mailboxes&' },
    ],
  }),
  // Secure Score controls that are not fully achieved, from the latest snapshot. The per-control scores
  // are nested in the snapshot, so a derived builder flattens them (dataSource preset), worst first.
  securescorefailing: () => ({
    type: 'richtable',
    static: true,
    title: 'Secure Score - controls to improve',
    dataSource: source('SecureScore', { preset: 'secureScoreFailing' }),
    limit: 25,
    columns: [
      { key: 'c1', header: 'Control', field: 'control' },
      { key: 'c2', header: 'Category', field: 'category' },
      { key: 'c3', header: 'Status', field: 'status' },
      { key: 'c4', header: 'Score', field: 'percent', align: 'right' },
    ],
    rows: [],
  }),
}

export const isPreset = (value) => typeof value === 'string' && value.startsWith('preset:')

/** Build the block(s) a pre-built picker entry inserts, assigning each a unique id. */
export const createPresetBlocks = (value, idBase) => {
  const factory = BLOCK_PRESETS[String(value).replace(/^preset:/, '')]
  if (!factory) return []
  const made = factory()
  const list = Array.isArray(made) ? made : [made]
  return list.map((block, position) => ({ ...block, id: `${idBase}-${position}` }))
}

/** The blocks a category offers: the second step of the picker. */
export const blockTypesFor = (category) =>
  BLOCK_CATEGORIES.find((entry) => entry.value === category)?.blocks ?? []

// One callout to the picker, three block types to the renderer; the editor switches between them.
export const CALLOUT_STYLES = [
  { label: 'Info', value: 'infobox' },
  { label: 'Good news', value: 'clearbox' },
  { label: 'Warning', value: 'alertbox' },
]

const BLOCK_META = {
  chart: { label: 'Chart', Icon: CippIcons.BarChart, colour: 'primary' },
  sankey: { label: 'Flow', Icon: CippIcons.AccountTree, colour: 'primary' },
  scorecard: { label: 'Score Cards', Icon: CippIcons.Assessment, colour: 'success' },
  progress: { label: 'Progress Bars', Icon: CippIcons.Speed, colour: 'info' },
  hero: { label: 'Infographic', Icon: CippIcons.ViewCarousel, colour: 'warning' },
  pagebreak: { label: 'Page Break', Icon: CippIcons.HorizontalRule, colour: 'default' },
  cover: { label: 'Cover', Icon: CippIcons.Window, colour: 'default' },
  page: { label: 'Titled Page', Icon: CippIcons.Description, colour: 'default' },
  note: { label: 'Note', Icon: CippIcons.InfoOutlined, colour: 'default' },
  richbullets: { label: 'Bullet List', Icon: CippIcons.List, colour: 'primary' },
  numbered: { label: 'Numbered List', Icon: CippIcons.ListAlt, colour: 'primary' },
  paragraphindent: { label: 'Indented Text', Icon: CippIcons.Description, colour: 'default' },
  code: { label: 'Code Block', Icon: CippIcons.Code, colour: 'default' },
  hr: { label: 'Divider', Icon: CippIcons.Remove, colour: 'default' },
  infobox: { label: 'Callout', Icon: CippIcons.Info, colour: 'info' },
  clearbox: { label: 'Callout', Icon: CippIcons.CheckCircle, colour: 'success' },
  alertbox: { label: 'Callout', Icon: CippIcons.Warning, colour: 'warning' },
  infoboxcolumns: { label: 'Callout Grid', Icon: CippIcons.ViewModule, colour: 'info' },
  richtable: { label: 'Table', Icon: CippIcons.TableChart, colour: 'secondary' },
}

export const isStructuredBlock = (type) => Object.prototype.hasOwnProperty.call(BLOCK_META, type)

/** The picker entries that are structured blocks, in picker order. */
export const STRUCTURED_BLOCK_TYPES = BLOCK_CATEGORIES.flatMap((entry) => entry.blocks).filter(
  (option) => isStructuredBlock(option.value)
)

// The stock covers, in the {label, value} shape CippAutoComplete works in.
const HERO_BACKGROUND_OPTIONS = COVER_STOCK_OPTIONS.map((option) => ({
  label: option.label,
  value: option.path,
}))

/** Starting content for a newly added block, so every one arrives with something to look at. */
export const createStructuredBlock = (type, id) => {
  const base = { id, type, title: '', static: true }
  switch (type) {
    case 'chart':
      return {
        ...base,
        title: 'Chart',
        chartKind: 'donut',
        chartData: [
          { label: 'Compliant', value: 0 },
          { label: 'Non-compliant', value: 0 },
        ],
        chartCaption: '',
        chartCentreLabel: 'Total',
        chartMax: '',
      }
    case 'sankey':
      return {
        ...base,
        title: 'Flow',
        chartCaption: '',
        nodes: [
          { id: 'Licensed', nodeColor: 'hsl(210, 70%, 50%)' },
          { id: 'Assigned', nodeColor: 'hsl(99, 70%, 45%)' },
          { id: 'Available', nodeColor: 'hsl(28, 100%, 53%)' },
        ],
        links: [
          { source: 'Licensed', target: 'Assigned', value: 80 },
          { source: 'Licensed', target: 'Available', value: 20 },
        ],
      }
    case 'scorecard':
      return {
        ...base,
        title: 'Key Figures',
        stats: [
          { label: 'Users', value: '0' },
          { label: 'Devices', value: '0' },
        ],
      }
    case 'progress':
      return {
        ...base,
        title: 'Coverage',
        items: [{ label: 'MFA enforced', value: 0, max: 100 }],
      }
    case 'hero':
      return {
        ...base,
        title: 'Section heading',
        heroHighlight: '',
        heroSubText: '',
        heroFooterText: '',
        heroImage: '/reportImages/board.jpg',
      }
    case 'pagebreak':
      return { ...base, title: '' }
    case 'cover':
      return { ...base, title: '', coverAccent: '', subtitle: '', coverLabel: '' }
    case 'page':
      return { ...base, title: 'New page', subtitle: '' }
    case 'note':
      return { ...base, content: 'A short aside for the reader.' }
    case 'paragraphindent':
      return { ...base, content: 'Indented body text, stepped in under a heading.' }
    case 'code':
      return { ...base, content: 'Sample-Command -Parameter Value' }
    case 'hr':
      return { ...base }
    case 'numbered':
      return {
        ...base,
        title: 'Steps',
        items: [{ text: 'First step.' }, { text: 'Second step.' }],
      }
    case 'richbullets':
      return {
        ...base,
        title: 'Key points',
        items: [{ label: 'First point.', text: 'What it means for the organisation.' }],
      }
    case 'infobox':
    case 'clearbox':
    case 'alertbox':
      return { ...base, title: 'Worth noting', content: 'Something the reader should not miss.' }
    case 'infoboxcolumns':
      return {
        ...base,
        columns: 2,
        items: [
          { title: 'Point one', content: 'A short explanation.' },
          { title: 'Point two', content: 'A short explanation.' },
        ],
      }
    case 'richtable':
      return {
        ...base,
        title: 'Table',
        columns: [
          { header: 'Item', key: 'c1' },
          { header: 'Value', key: 'c2' },
        ],
        rows: [{ c1: '', c2: '' }],
      }
    default:
      return base
  }
}

/* ── Data source switch ──────────────────────────────────── */

/**
 * Where a chart's or table's data comes from: typed in by hand, or the reporting database. Chosen
 * first, so each mode shows only its own controls. "Cache" mode with nothing picked yet is a source
 * object with no collection, which the renderer ignores until one is chosen.
 */
const EMPTY_SOURCE = { type: null, field: null, valueField: null, aggregate: null, filter: null }

const SourceSwitch = ({ value, onChange }) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    color="primary"
    aria-label="Data source"
    value={value}
    onChange={(event, next) => next && onChange(next)}
  >
    <ToggleButton value="manual">Manual</ToggleButton>
    <ToggleButton value="cache">Reporting database</ToggleButton>
  </ToggleButtonGroup>
)

/* ── Data source picker ──────────────────────────────────── */

const FILTER_OPS = [
  { label: 'is', value: '=' },
  { label: 'is not', value: '!=' },
]

const COUNT_ROWS = { label: 'Count of rows', value: '__count' }

const AGGREGATES = [
  { label: 'One point per row', value: null },
  { label: 'Add them up', value: 'sum' },
  { label: 'Average them', value: 'avg' },
  { label: 'Take the highest', value: 'max' },
  { label: 'Take the lowest', value: 'min' },
]

/**
 * Where a chart or table gets its data: a collection from the reporting database; for a chart what
 * to show - a count of rows, or a field's value - and the field to show it per (a date field makes
 * a trend, any other a category), optionally combining rows that share a label; and a condition
 * rows must meet. Saved as { type, field, valueField, aggregate, filter } and resolved on the server
 * when the report renders. The collections and fields on offer are the shapes recorded when the
 * cache was written; a field can still be typed, since a shape is sampled.
 */
export const DataSourcePicker = ({ mode, value, onChange, dataShape = [] }) => {
  const source = value && typeof value === 'object' ? value : null
  const collections = dataShape.map((entry) => ({
    label: entry.count == null ? entry.type : `${entry.type} (${entry.count})`,
    value: entry.type,
  }))
  const fields = (dataShape.find((entry) => entry.type === source?.type)?.fields ?? []).map(
    (field) => ({ label: field.type ? `${field.name} (${field.type})` : field.name, value: field.name })
  )
  const filter = source?.filter ?? null
  const asOption = (name) => (name ? (fields.find((f) => f.value === name) ?? { label: name, value: name }) : null)
  const plotting = Boolean(source?.valueField && source.valueField !== '__count')
  const patch = (next) =>
    onChange({
      // Spread first so a preset's extra keys (scale, preset) survive edits to the visible controls.
      ...(source || {}),
      type: source?.type ?? null,
      field: source?.field ?? null,
      valueField: source?.valueField ?? null,
      aggregate: source?.aggregate ?? null,
      filter,
      ...next,
    })

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Box sx={{ flex: 1 }}>
          <CippAutoComplete
            size="small"
            label="Collection"
            placeholder="Pick a collection"
            multiple={false}
            creatable={false}
            options={collections}
            value={collections.find((option) => option.value === source?.type) ?? null}
            onChange={(option) =>
              onChange(option?.value ? { ...EMPTY_SOURCE, type: option.value } : EMPTY_SOURCE)
            }
          />
        </Box>
        {mode !== 'table' && source?.type ? (
          <>
            <Box sx={{ flex: 1 }}>
              <CippAutoComplete
                size="small"
                label="Show"
                multiple={false}
                creatable={true}
                disableClearable={true}
                options={[COUNT_ROWS, ...fields]}
                value={plotting ? asOption(source.valueField) : COUNT_ROWS}
                onChange={(option) =>
                  patch({
                    valueField: option?.value && option.value !== '__count' ? option.value : null,
                    aggregate: null,
                  })
                }
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <CippAutoComplete
                size="small"
                label="Per"
                placeholder={plotting ? 'Row order' : 'No field: a single count'}
                multiple={false}
                creatable={true}
                options={fields}
                value={asOption(source.field)}
                onChange={(option) => patch({ field: option?.value ?? null })}
              />
            </Box>
          </>
        ) : null}
      </Stack>
      {mode !== 'table' && plotting && source?.field ? (
        <Box sx={{ maxWidth: 320 }}>
          <CippAutoComplete
            size="small"
            label="Rows sharing a label"
            multiple={false}
            creatable={false}
            disableClearable={true}
            options={AGGREGATES}
            value={AGGREGATES.find((option) => option.value === (source.aggregate ?? null)) ?? AGGREGATES[0]}
            onChange={(option) => patch({ aggregate: option?.value ?? null })}
          />
        </Box>
      ) : null}
      {source?.type ? (
        <Stack direction="row" spacing={1}>
          <Box sx={{ flex: 1 }}>
            <CippAutoComplete
              size="small"
              label="Only rows where"
              placeholder="Every row"
              multiple={false}
              creatable={true}
              options={fields}
              value={asOption(filter?.field)}
              onChange={(option) =>
                patch({
                  filter: option?.value
                    ? { field: option.value, op: filter?.op ?? '=', value: filter?.value ?? '' }
                    : null,
                })
              }
            />
          </Box>
          {filter?.field ? (
            <>
              <Box sx={{ minWidth: 130 }}>
                <CippAutoComplete
                  size="small"
                  label="Condition"
                  multiple={false}
                  creatable={false}
                  disableClearable={true}
                  options={FILTER_OPS}
                  value={FILTER_OPS.find((option) => option.value === filter.op) ?? FILTER_OPS[0]}
                  onChange={(option) => patch({ filter: { ...filter, op: option?.value ?? '=' } })}
                />
              </Box>
              <TextField
                size="small"
                label="Value"
                placeholder="compliant, true, Win*"
                value={filter.value ?? ''}
                onChange={(event) => patch({ filter: { ...filter, value: event.target.value } })}
                sx={{ flex: 1 }}
              />
            </>
          ) : null}
        </Stack>
      ) : null}
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {mode === 'table'
          ? 'The rows of the collection (those the condition keeps) fill the table when the report renders; each column reads the field it names.'
          : mode === 'scorecard'
            ? 'Read from the reporting database when the report renders: one card per value of the field, showing a count of rows (or a field\'s value combined per label).'
            : mode === 'progress'
              ? 'Read from the reporting database when the report renders: one bar per value of the field, filled by its share of the total (or a field\'s value combined per label).'
              : 'Read from the reporting database when the report renders. Counting rows gives one slice per value of the field; a field\'s value per date field gives a trend, the last 30 points in date order.'}
      </Typography>
    </Stack>
  )
}

/* ── Shared shell ────────────────────────────────────────── */

const BlockShell = ({ block, index, totalBlocks, onRemove, onMoveUp, onMoveDown, chips, children }) => {
  const meta = BLOCK_META[block.type] || {}
  const Icon = meta.Icon

  return (
    <CippButtonCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {Icon ? <Icon fontSize="small" color={meta.colour === 'default' ? 'disabled' : meta.colour} /> : null}
          <Typography variant="subtitle2" sx={{
            fontWeight: 600
          }}>
            {block.title || meta.label}
          </Typography>
          <Chip
            label={meta.label}
            size="small"
            color={meta.colour === 'default' ? undefined : meta.colour}
            variant="outlined"
          />
          {chips}
        </Box>
      }
      cardActions={
        /* The buttons carry their own aria-label rather than relying on the tooltip: a disabled
           button has to be wrapped in a span for the tooltip to fire, and the label would then
           land on the wrapper, leaving the button itself unnamed to a screen reader. */
        <Stack direction="row" spacing={0.5} sx={{
          alignItems: "center"
        }}>
          <Tooltip title="Move up">
            <span>
              <IconButton
                size="small"
                aria-label="Move up"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
              >
                <CippIcons.ArrowUpward fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down">
            <span>
              <IconButton
                size="small"
                aria-label="Move down"
                onClick={() => onMoveDown(index)}
                disabled={index === totalBlocks - 1}
              >
                <CippIcons.ArrowDownward fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove block">
            <IconButton
              size="small"
              color="error"
              aria-label="Remove block"
              onClick={() => onRemove(index)}
            >
              <CippIcons.Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      {children}
    </CippButtonCard>
  );
}

/**
 * Editable list of rows.
 *
 * `columns` is [{ key, label, width, type }]. Deliberately plain MUI rather than react-hook-form:
 * these arrays are variable length and live inside a reorderable list, and field-array bookkeeping
 * would have to be rebuilt every time a block moves.
 */
const RowsEditor = ({ rows, columns, onChange, addLabel = 'Add row', minRows = 1 }) => {
  const update = (rowIndex, key, value) =>
    onChange(rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)))

  const remove = (rowIndex) => onChange(rows.filter((_, i) => i !== rowIndex))

  const add = () =>
    onChange([...rows, Object.fromEntries(columns.map((column) => [column.key, '']))])

  return (
    <Stack spacing={1}>
      {rows.map((row, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={1} sx={{
          alignItems: "center"
        }}>
          {columns.map((column) => (
            <TextField
              key={column.key}
              size="small"
              label={column.label}
              type={column.type || 'text'}
              slotProps={{ htmlInput: column.inputProps }}
              value={row[column.key] ?? ''}
              onChange={(event) => update(rowIndex, column.key, event.target.value)}
              sx={{ flex: column.width ?? 1 }}
            />
          ))}
          <Tooltip title="Remove row">
            <span>
              <IconButton
                size="small"
                color="error"
                aria-label="Remove row"
                onClick={() => remove(rowIndex)}
                disabled={rows.length <= minRows}
              >
                <CippIcons.Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ))}
      <Box>
        <IconButton size="small" onClick={add} aria-label={addLabel}>
          <CippIcons.Add fontSize="small" />
        </IconButton>
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          {addLabel}
        </Typography>
      </Box>
    </Stack>
  );
}

const TitleField = ({ block, index, onUpdate, label = 'Block title', helperText }) => (
  <TextField
    size="small"
    fullWidth
    label={label}
    helperText={helperText}
    value={block.title ?? ''}
    onChange={(event) => onUpdate(index, { ...block, title: event.target.value })}
  />
)

/* ── Chart ───────────────────────────────────────────────── */

export const ChartBlockCard = ({ block, index, onUpdate, dataShape, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  const kind = block.chartKind || 'donut'

  return (
    <BlockShell
      block={block}
      index={index}
      onUpdate={onUpdate}
      chips={<Chip label={kind} size="small" variant="outlined" />}
      {...shell}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          <TitleField block={block} index={index} onUpdate={onUpdate} />
          <Box sx={{ minWidth: 170 }}>
            <CippAutoComplete
              size="small"
              label="Chart type"
              multiple={false}
              creatable={false}
              disableClearable={true}
              options={CHART_KINDS}
              value={CHART_KINDS.find((option) => option.value === kind) ?? CHART_KINDS[0]}
              onChange={(option) => set({ chartKind: option?.value ?? 'donut' })}
            />
          </Box>
          <Box sx={{ minWidth: 170 }}>
            <CippAutoComplete
              size="small"
              label="Width"
              multiple={false}
              creatable={false}
              disableClearable={true}
              options={CHART_WIDTHS}
              value={CHART_WIDTHS.find((option) => option.value === (block.width || 'full')) ?? CHART_WIDTHS[0]}
              onChange={(option) => set({ width: option?.value === 'half' ? 'half' : null })}
            />
          </Box>
        </Stack>
        {block.width === 'half' ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Half width: two half-width charts in a row render side by side. Best for donut charts.
          </Typography>
        ) : null}

        <SourceSwitch
          value={block.chartSource ? 'cache' : 'manual'}
          onChange={(next) => set({ chartSource: next === 'cache' ? EMPTY_SOURCE : null })}
        />
        {block.chartSource ? (
          <DataSourcePicker
            mode="chart"
            value={block.chartSource}
            onChange={(chartSource) => set({ chartSource })}
            dataShape={dataShape}
          />
        ) : (
          <RowsEditor
            rows={block.chartData || []}
            columns={[
              { key: 'label', label: 'Label', width: 2 },
              { key: 'value', label: 'Value', width: 1, type: 'number' },
              { key: 'colour', label: 'Colour (optional)', width: 1 },
            ]}
            onChange={(chartData) => set({ chartData })}
            addLabel="Add data point"
          />
        )}

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            label="Caption"
            value={block.chartCaption ?? ''}
            onChange={(event) => set({ chartCaption: event.target.value })}
          />
          {kind === 'donut' ? (
            <TextField
              size="small"
              label="Centre label"
              value={block.chartCentreLabel ?? ''}
              onChange={(event) => set({ chartCentreLabel: event.target.value })}
              sx={{ minWidth: 160 }}
            />
          ) : null}
          {kind === 'trend' ? (
            <TextField
              size="small"
              type="number"
              label="Axis maximum"
              helperText="Blank = highest value"
              value={block.chartMax ?? ''}
              onChange={(event) => set({ chartMax: event.target.value })}
              sx={{ minWidth: 160 }}
            />
          ) : null}
        </Stack>
      </Stack>
    </BlockShell>
  )
}

/* ── Flow (Sankey) ───────────────────────────────────────── */

// A sankey's data source, defaulted for "flow" mode (the common case). The renderer builds nodes and
// links from it on the server; manual nodes/links are used when this is null.
const EMPTY_SANKEY_SOURCE = {
  type: null,
  mode: 'flow',
  fields: [],
  valueField: null,
  field: null,
  measures: [],
  filter: null,
}

const SANKEY_MODES = [
  { label: 'Flow between fields', value: 'flow' },
  { label: 'Split by measures', value: 'measures' },
]

/**
 * Where a sankey gets its flow from a reporting-database collection. Two shapes:
 *  - flow: an ordered set of categorical fields; each adjacent pair becomes a stage of the diagram,
 *    ribbons weighted by the number of rows (or a value field).
 *  - measures: one category field on the left and numeric measure fields on the right (e.g. a licence
 *    fanning out to Assigned / Available).
 * Saved as { type, mode, fields, valueField, field, measures, filter } and resolved on the server.
 */
const SankeySourcePicker = ({ value, onChange, dataShape = [] }) => {
  const source = value && typeof value === 'object' ? value : EMPTY_SANKEY_SOURCE
  const mode = source.mode === 'measures' ? 'measures' : 'flow'
  const collections = dataShape.map((entry) => ({
    label: entry.count == null ? entry.type : `${entry.type} (${entry.count})`,
    value: entry.type,
  }))
  const fields = (dataShape.find((entry) => entry.type === source.type)?.fields ?? []).map((f) => ({
    label: f.type ? `${f.name} (${f.type})` : f.name,
    value: f.name,
  }))
  const asOption = (name) =>
    name ? (fields.find((f) => f.value === name) ?? { label: name, value: name }) : null
  const patch = (next) => onChange({ ...EMPTY_SANKEY_SOURCE, ...source, ...next })
  const stages = source.fields ?? []
  const setStage = (position, name) => {
    const next = [...stages]
    if (name) next[position] = name
    else next.splice(position, 1)
    patch({ fields: next.filter(Boolean) })
  }
  const filter = source.filter ?? null

  // A pre-built dashboard sankey (`preset`) is computed faithfully on the server from fixed card logic,
  // so there are no fields to edit here - show a note with an escape hatch to a custom flow.
  if (source.preset) {
    return (
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Built-in dashboard layout ({source.preset}) from {source.type}. It matches the dashboard and is
          not edited here.
        </Typography>
        <Box>
          <ToggleButton size="small" value="reset" onClick={() => onChange(EMPTY_SANKEY_SOURCE)}>
            Switch to a custom flow
          </ToggleButton>
        </Box>
      </Stack>
    )
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Box sx={{ flex: 1 }}>
          <CippAutoComplete
            size="small"
            label="Collection"
            placeholder="Pick a collection"
            multiple={false}
            creatable={false}
            options={collections}
            value={collections.find((option) => option.value === source.type) ?? null}
            onChange={(option) =>
              onChange(option?.value ? { ...EMPTY_SANKEY_SOURCE, type: option.value } : EMPTY_SANKEY_SOURCE)
            }
          />
        </Box>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          aria-label="Flow shape"
          value={mode}
          onChange={(event, next) => next && patch({ mode: next })}
        >
          {SANKEY_MODES.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {source.type && mode === 'flow' ? (
        <Stack direction="row" spacing={1}>
          {[0, 1, 2].map((position) => (
            <Box key={position} sx={{ flex: 1 }}>
              <CippAutoComplete
                size="small"
                label={position === 0 ? 'From field' : position === 1 ? 'To field' : 'Then (optional)'}
                placeholder={position > 1 ? 'Optional stage' : 'Pick a field'}
                multiple={false}
                creatable={true}
                options={fields}
                value={asOption(stages[position])}
                onChange={(option) => setStage(position, option?.value ?? null)}
              />
            </Box>
          ))}
        </Stack>
      ) : null}

      {source.type && mode === 'measures' ? (
        <>
          <Box sx={{ maxWidth: 320 }}>
            <CippAutoComplete
              size="small"
              label="Category field"
              placeholder="e.g. License"
              multiple={false}
              creatable={true}
              options={fields}
              value={asOption(source.field)}
              onChange={(option) => patch({ field: option?.value ?? null })}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Measures: each numeric field becomes a node the category flows into.
          </Typography>
          <RowsEditor
            rows={source.measures ?? []}
            columns={[
              { key: 'field', label: 'Value field', width: 1 },
              { key: 'label', label: 'Shown as', width: 1 },
            ]}
            onChange={(measures) => patch({ measures })}
            addLabel="Add measure"
          />
        </>
      ) : null}

      {source.type ? (
        <Stack direction="row" spacing={1}>
          <Box sx={{ flex: 1 }}>
            <CippAutoComplete
              size="small"
              label="Only rows where"
              placeholder="Every row"
              multiple={false}
              creatable={true}
              options={fields}
              value={asOption(filter?.field)}
              onChange={(option) =>
                patch({
                  filter: option?.value
                    ? { field: option.value, op: filter?.op ?? '=', value: filter?.value ?? '' }
                    : null,
                })
              }
            />
          </Box>
          {filter?.field ? (
            <>
              <Box sx={{ minWidth: 130 }}>
                <CippAutoComplete
                  size="small"
                  label="Condition"
                  multiple={false}
                  creatable={false}
                  disableClearable={true}
                  options={FILTER_OPS}
                  value={FILTER_OPS.find((option) => option.value === filter.op) ?? FILTER_OPS[0]}
                  onChange={(option) => patch({ filter: { ...filter, op: option?.value ?? '=' } })}
                />
              </Box>
              <TextField
                size="small"
                label="Value"
                placeholder="true, compliant, Win*"
                value={filter.value ?? ''}
                onChange={(event) => patch({ filter: { ...filter, value: event.target.value } })}
                sx={{ flex: 1 }}
              />
            </>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  )
}

export const SankeyBlockCard = ({ block, index, onUpdate, dataShape, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  const nodes = block.nodes || []
  const links = block.links || []

  return (
    <BlockShell
      block={block}
      index={index}
      chips={
        <Chip
          label={block.sankeySource ? 'from data' : `${nodes.length} nodes`}
          size="small"
          variant="outlined"
        />
      }
      {...shell}
    >
      <Stack spacing={2}>
        <TitleField block={block} index={index} onUpdate={onUpdate} />
        <SourceSwitch
          value={block.sankeySource ? 'cache' : 'manual'}
          onChange={(next) => set({ sankeySource: next === 'cache' ? EMPTY_SANKEY_SOURCE : null })}
        />
        {block.sankeySource ? (
          <SankeySourcePicker
            value={block.sankeySource}
            onChange={(sankeySource) => set({ sankeySource })}
            dataShape={dataShape}
          />
        ) : (
          <>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Nodes are the boxes; links join them by node ID and their value sets the ribbon
              thickness. Columns and heights are worked out from the flow. Colours accept hex or hsl().
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Nodes
            </Typography>
            <RowsEditor
              rows={nodes}
              columns={[
                { key: 'id', label: 'Node ID', width: 2 },
                { key: 'nodeColor', label: 'Colour', width: 1 },
                { key: 'label', label: 'Label (optional)', width: 1 },
              ]}
              onChange={(next) => set({ nodes: next })}
              addLabel="Add node"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Links
            </Typography>
            <RowsEditor
              rows={links}
              columns={[
                { key: 'source', label: 'From (node ID)', width: 2 },
                { key: 'target', label: 'To (node ID)', width: 2 },
                { key: 'value', label: 'Value', width: 1, type: 'number' },
              ]}
              onChange={(next) => set({ links: next })}
              addLabel="Add link"
            />
          </>
        )}
        <TextField
          size="small"
          fullWidth
          label="Caption"
          value={block.chartCaption ?? ''}
          onChange={(event) => set({ chartCaption: event.target.value })}
        />
      </Stack>
    </BlockShell>
  )
}

/* ── Score cards ─────────────────────────────────────────── */

export const ScorecardBlockCard = ({ block, index, onUpdate, dataShape, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  const stats = block.stats || []

  return (
    <BlockShell block={block} index={index} chips={<Chip label={`${stats.length} cards`} size="small" variant="outlined" />} {...shell}>
      <Stack spacing={2}>
        <TitleField block={block} index={index} onUpdate={onUpdate} />
        <SourceSwitch
          value={block.statsSource ? 'cache' : 'manual'}
          onChange={(next) => set({ statsSource: next === 'cache' ? EMPTY_SOURCE : null })}
        />
        {block.statsSource ? (
          <>
            <DataSourcePicker
              mode="scorecard"
              value={block.statsSource}
              onChange={(statsSource) => set({ statsSource })}
              dataShape={dataShape}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Card colours and captions are set by hand — switch to Manual to add them.
            </Typography>
          </>
        ) : (
          <>
            <RowsEditor
              rows={stats}
              columns={[
                { key: 'value', label: 'Figure', width: 1 },
                { key: 'label', label: 'Label', width: 2 },
                { key: 'caption', label: 'Caption (optional)', width: 2 },
                { key: 'colour', label: 'Colour (optional)', width: 1 },
              ]}
              onChange={(next) => set({ stats: next })}
              addLabel="Add card"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {DATA_TOKEN_HINT}
            </Typography>
            {stats.length > 4 ? (
              <Typography variant="caption" sx={{
                color: "warning.main"
              }}>
                More than four cards on a row get too narrow to read in the PDF.
              </Typography>
            ) : null}
          </>
        )}
      </Stack>
    </BlockShell>
  );
}

/* ── Progress bars ───────────────────────────────────────── */

export const ProgressBlockCard = ({ block, index, onUpdate, dataShape, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  return (
    <BlockShell block={block} index={index} {...shell}>
      <Stack spacing={2}>
        <TitleField block={block} index={index} onUpdate={onUpdate} />
        <SourceSwitch
          value={block.itemsSource ? 'cache' : 'manual'}
          onChange={(next) => set({ itemsSource: next === 'cache' ? EMPTY_SOURCE : null })}
        />
        {block.itemsSource ? (
          <>
            <DataSourcePicker
              mode="progress"
              value={block.itemsSource}
              onChange={(itemsSource) => set({ itemsSource })}
              dataShape={dataShape}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Each bar is filled by its share of the total — switch to Manual to set each bar&apos;s
              own target.
            </Typography>
          </>
        ) : (
          <>
            <RowsEditor
              rows={block.items || []}
              columns={[
                { key: 'label', label: 'Label', width: 2 },
                { key: 'value', label: 'Value', width: 1, type: 'number' },
                { key: 'max', label: 'Out of', width: 1, type: 'number' },
              ]}
              onChange={(items) => set({ items })}
              addLabel="Add bar"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {DATA_TOKEN_HINT}
            </Typography>
          </>
        )}
      </Stack>
    </BlockShell>
  )
}

/* ── Infographic ─────────────────────────────────────── */

export const HeroBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  // The stock photos, then the covers uploaded to the branding gallery under the names given there.
  // A gallery cover is stored as 'gallery:<id>' and read into the report when it renders.
  const branding = useBrandingSettings()
  const backgroundOptions = [
    ...HERO_BACKGROUND_OPTIONS,
    ...(branding.coverImages || []).map((image, position) => ({
      label: `Uploaded: ${image.name || `cover ${position + 1}`}`,
      value: `gallery:${image.id}`,
    })),
  ]

  return (
    <BlockShell block={block} index={index} {...shell}>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{
          color: "text.secondary"
        }}>
          Takes a full page of its own, with the background image bleeding to the paper edge.
        </Typography>
        <TextField
          size="small"
          fullWidth
          label="Overtitle"
          placeholder="Small line above the big figure"
          value={block.heroOvertitle ?? ''}
          onChange={(event) => set({ heroOvertitle: event.target.value })}
        />
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Big figure"
            placeholder="83%"
            value={block.heroHighlight ?? ''}
            onChange={(event) => set({ heroHighlight: event.target.value })}
            sx={{ minWidth: 140 }}
          />
          <TitleField block={block} index={index} onUpdate={onUpdate} label="Headline" />
        </Stack>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label="Supporting text"
          value={block.heroSubText ?? ''}
          onChange={(event) => set({ heroSubText: event.target.value })}
        />
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            label="Corner note"
            value={block.heroFooterText ?? ''}
            onChange={(event) => set({ heroFooterText: event.target.value })}
          />
          <Box sx={{ minWidth: 190 }}>
            <CippAutoComplete
              size="small"
              label="Background"
              multiple={false}
              creatable={false}
              disableClearable={true}
              options={backgroundOptions}
              value={
                backgroundOptions.find(
                  (option) => option.value === (block.heroImage || 'none')
                ) ?? backgroundOptions[0]
              }
              onChange={(option) =>
                set({ heroImage: !option || option.value === 'none' ? '' : option.value })
              }
            />
          </Box>
        </Stack>
      </Stack>
    </BlockShell>
  );
}

/* ── Page break ──────────────────────────────────────────── */

export const PageBreakBlockCard = ({ block, index, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <Typography variant="caption" sx={{
      color: "text.secondary"
    }}>
      Everything after this starts on a new page.
    </Typography>
  </BlockShell>
)

/* ── Cover ───────────────────────────────────────────────── */

export const CoverBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })

  return (
    <BlockShell block={block} index={index} {...shell}>
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          The cover page. Leave the title blank to use the report's name; the accent is the part of
          the title set in the brand colour.
        </Typography>
        <Stack direction="row" spacing={1}>
          <TitleField
            block={block}
            index={index}
            onUpdate={onUpdate}
            label="Cover title"
            helperText="Blank = the report's name"
          />
          <TextField
            size="small"
            label="Accent"
            placeholder="Review"
            value={block.coverAccent ?? ''}
            onChange={(event) => set({ coverAccent: event.target.value })}
            sx={{ minWidth: 180 }}
          />
        </Stack>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label="Subtitle"
          value={block.subtitle ?? ''}
          onChange={(event) => set({ subtitle: event.target.value })}
        />
        <TextField
          size="small"
          label="Label"
          placeholder="Assessment Report"
          helperText="The small pill above the title"
          value={block.coverLabel ?? ''}
          onChange={(event) => set({ coverLabel: event.target.value })}
          sx={{ maxWidth: 320 }}
        />
      </Stack>
    </BlockShell>
  )
}

/* ── Titled page ─────────────────────────────────────────── */

export const PageBlockCard = ({ block, index, onUpdate, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Starts a new page with this title and subtitle in its header. The blocks that follow land on
        it.
      </Typography>
      <Stack direction="row" spacing={1}>
        <TitleField block={block} index={index} onUpdate={onUpdate} label="Page title" />
        <TextField
          size="small"
          fullWidth
          label="Subtitle"
          value={block.subtitle ?? ''}
          onChange={(event) => onUpdate(index, { ...block, subtitle: event.target.value })}
        />
      </Stack>
    </Stack>
  </BlockShell>
)

/* ── Note ────────────────────────────────────────────────── */

export const NoteBlockCard = ({ block, index, onUpdate, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <TextField
      size="small"
      fullWidth
      multiline
      minRows={2}
      label="Note"
      helperText="A small italic aside, the size of a caption."
      value={block.content ?? ''}
      onChange={(event) => onUpdate(index, { ...block, content: event.target.value })}
    />
  </BlockShell>
)

/* ── Indented text ───────────────────────────────────────── */

export const IndentedBlockCard = ({ block, index, onUpdate, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <TextField
      size="small"
      fullWidth
      multiline
      minRows={2}
      label="Indented text"
      helperText="Body text stepped in under a heading."
      value={block.content ?? ''}
      onChange={(event) => onUpdate(index, { ...block, content: event.target.value })}
    />
  </BlockShell>
)

/* ── Code block ──────────────────────────────────────────── */

export const CodeBlockCard = ({ block, index, onUpdate, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <TextField
      size="small"
      fullWidth
      multiline
      minRows={3}
      label="Code / command"
      helperText="Rendered in a monospaced block."
      value={block.content ?? ''}
      onChange={(event) => onUpdate(index, { ...block, content: event.target.value })}
      slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }}
    />
  </BlockShell>
)

/* ── Divider ─────────────────────────────────────────────── */

export const DividerBlockCard = ({ block, index, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      A horizontal rule to separate sections.
    </Typography>
  </BlockShell>
)

/* ── Numbered list ───────────────────────────────────────── */

export const NumberedBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const items = block.items || []
  return (
    <BlockShell
      block={block}
      index={index}
      chips={<Chip label={`${items.length} items`} size="small" variant="outlined" />}
      {...shell}
    >
      <Stack spacing={2}>
        <TitleField block={block} index={index} onUpdate={onUpdate} />
        <RowsEditor
          rows={items}
          columns={[{ key: 'text', label: 'Item', width: 1 }]}
          onChange={(next) => onUpdate(index, { ...block, items: next })}
          addLabel="Add item"
        />
      </Stack>
    </BlockShell>
  )
}

/* ── Bullet list ─────────────────────────────────────────── */

export const BulletsBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const items = block.items || []
  return (
    <BlockShell
      block={block}
      index={index}
      chips={<Chip label={`${items.length} bullets`} size="small" variant="outlined" />}
      {...shell}
    >
      <Stack spacing={2}>
        <TitleField block={block} index={index} onUpdate={onUpdate} />
        <RowsEditor
          rows={items}
          columns={[
            { key: 'label', label: 'Lead (bold)', width: 1 },
            { key: 'text', label: 'Text', width: 3 },
          ]}
          onChange={(next) => onUpdate(index, { ...block, items: next })}
          addLabel="Add bullet"
        />
      </Stack>
    </BlockShell>
  )
}

/* ── Callout ─────────────────────────────────────────────── */

// An info callout can be tinted to signal good/for-attention; the other styles carry their own colour.
const CALLOUT_TONES = [
  { label: 'Default', value: '' },
  { label: 'Positive', value: 'ok' },
  { label: 'Attention', value: 'warn' },
]

export const CalloutBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  const style = CALLOUT_STYLES.find((option) => option.value === block.type) ?? CALLOUT_STYLES[0]

  return (
    <BlockShell
      block={block}
      index={index}
      chips={<Chip label={style.label} size="small" variant="outlined" />}
      {...shell}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          <TitleField block={block} index={index} onUpdate={onUpdate} label="Callout title" />
          <Box sx={{ minWidth: 160 }}>
            <CippAutoComplete
              size="small"
              label="Style"
              multiple={false}
              creatable={false}
              disableClearable={true}
              options={CALLOUT_STYLES}
              value={style}
              onChange={(option) => set({ type: option?.value ?? 'infobox' })}
            />
          </Box>
          {block.type === 'infobox' ? (
            <Box sx={{ minWidth: 150 }}>
              <CippAutoComplete
                size="small"
                label="Tone"
                multiple={false}
                creatable={false}
                disableClearable={true}
                options={CALLOUT_TONES}
                value={CALLOUT_TONES.find((option) => option.value === (block.tone || '')) ?? CALLOUT_TONES[0]}
                onChange={(option) => set({ tone: option?.value || null })}
              />
            </Box>
          ) : null}
        </Stack>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={3}
          label="Text"
          helperText={
            block.lines
              ? 'One "Label: value" per line, kept as tight lines.'
              : 'Markdown works here: **bold**, _italic_ and links.'
          }
          value={block.content ?? ''}
          onChange={(event) => set({ content: event.target.value })}
        />
        <Box>
          <ToggleButton
            size="small"
            value="lines"
            selected={!!block.lines}
            onChange={() => set({ lines: block.lines ? null : true })}
          >
            Label : value lines
          </ToggleButton>
        </Box>
      </Stack>
    </BlockShell>
  )
}

/* ── Callout grid ────────────────────────────────────────── */

const GRID_LAYOUT_OPTIONS = [
  { label: '1 across', value: 1 },
  { label: '2 across', value: 2 },
  { label: '3 across', value: 3 },
]

export const CalloutGridBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  const items = block.items || []
  const layout =
    GRID_LAYOUT_OPTIONS.find((option) => option.value === Number(block.columns)) ??
    GRID_LAYOUT_OPTIONS[1]
  const updateItem = (position, patch) =>
    set({ items: items.map((entry, i) => (i === position ? { ...entry, ...patch } : entry)) })

  return (
    <BlockShell
      block={block}
      index={index}
      chips={<Chip label={`${items.length} callouts`} size="small" variant="outlined" />}
      {...shell}
    >
      <Stack spacing={2}>
        <Box sx={{ maxWidth: 200 }}>
          <CippAutoComplete
            size="small"
            label="Layout"
            multiple={false}
            creatable={false}
            disableClearable={true}
            options={GRID_LAYOUT_OPTIONS}
            value={layout}
            onChange={(option) => set({ columns: option?.value ?? 2 })}
          />
        </Box>
        {/* Laid out the way the page will be, so the grid can be judged without a preview. */}
        <Box
          data-testid="callout-grid"
          data-columns={layout.value}
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.value}, minmax(0, 1fr))`,
            gap: 1.5,
          }}
        >
          {items.map((entry, position) => (
            <Box
              key={position}
              sx={{
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Title"
                    value={entry.title ?? ''}
                    onChange={(event) => updateItem(position, { title: event.target.value })}
                  />
                  <Tooltip title="Remove callout">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Remove callout"
                        onClick={() => set({ items: items.filter((_, i) => i !== position) })}
                        disabled={items.length <= 1}
                      >
                        <CippIcons.Delete fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  label="Text"
                  value={entry.content ?? ''}
                  onChange={(event) => updateItem(position, { content: event.target.value })}
                />
              </Stack>
            </Box>
          ))}
        </Box>
        <Box>
          <IconButton
            size="small"
            aria-label="Add callout"
            onClick={() => set({ items: [...items, { title: '', content: '' }] })}
          >
            <CippIcons.Add fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Add callout
          </Typography>
        </Box>
      </Stack>
    </BlockShell>
  )
}

/* ── Table ───────────────────────────────────────────────── */

export const TableBlockCard = ({ block, index, onUpdate, dataShape, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })
  const columns = block.columns || []
  const rows = block.rows || []
  // The picked collection's fields, offered on each column's field input.
  const sourceFields = dataShape?.find((entry) => entry.type === block.dataSource?.type)?.fields ?? []
  const fieldListId = `table-fields-${block.id}`

  // Columns are keyed rather than positional, so renaming a header never detaches the cells under
  // it. A new column takes the next free key; a removed one takes its cells with it.
  const nextKey = () =>
    `c${columns.reduce((max, column) => Math.max(max, Number(String(column.key).replace(/[^0-9]/g, '')) || 0), 0) + 1}`
  const setColumns = (next) => {
    const keyed = next.map((column) => (column.key ? column : { ...column, key: nextKey() }))
    const keep = new Set(keyed.map((column) => column.key))
    set({
      columns: keyed,
      rows: rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => keep.has(key)))),
    })
  }

  return (
    <BlockShell
      block={block}
      index={index}
      chips={<Chip label={`${rows.length} rows`} size="small" variant="outlined" />}
      {...shell}
    >
      <Stack spacing={2}>
        <TitleField block={block} index={index} onUpdate={onUpdate} />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <SourceSwitch
            value={block.dataSource ? 'cache' : 'manual'}
            onChange={(next) => set({ dataSource: next === 'cache' ? EMPTY_SOURCE : null })}
          />
          <TextField
            size="small"
            type="number"
            label="Row limit"
            helperText="Blank = all"
            value={block.limit ?? ''}
            onChange={(event) => set({ limit: event.target.value })}
            sx={{ maxWidth: 130 }}
          />
        </Stack>
        {block.dataSource ? (
          <>
            <DataSourcePicker
              mode="table"
              value={block.dataSource}
              onChange={(dataSource) => set({ dataSource })}
              dataShape={dataShape}
            />
            <datalist id={fieldListId}>
              {sourceFields.map((field) => (
                <option key={field.name} value={field.name} />
              ))}
            </datalist>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Columns: the field each one reads (its header when blank). Align is left/center/right; a
              status field colours the cell by its value (pass/warn/fail).
            </Typography>
            <RowsEditor
              rows={columns}
              columns={[
                { key: 'header', label: 'Column header', width: 2 },
                { key: 'field', label: 'Field', width: 2, inputProps: { list: fieldListId } },
                { key: 'align', label: 'Align', width: 1 },
                { key: 'toneField', label: 'Status field', width: 1, inputProps: { list: fieldListId } },
              ]}
              onChange={setColumns}
              addLabel="Add column"
            />
          </>
        ) : (
          <>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Columns (Align is left/center/right)
            </Typography>
            <RowsEditor
              rows={columns}
              columns={[
                { key: 'header', label: 'Column header', width: 2 },
                { key: 'align', label: 'Align', width: 1 },
              ]}
              onChange={setColumns}
              addLabel="Add column"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Rows
            </Typography>
            <RowsEditor
              rows={rows}
              columns={columns.map((column, position) => ({
                key: column.key,
                label: column.header || `Column ${position + 1}`,
                width: 1,
              }))}
              onChange={(next) => set({ rows: next })}
              addLabel="Add row"
            />
          </>
        )}
      </Stack>
    </BlockShell>
  )
}

/** Pick the editor for a structured block. Returns null for block types handled elsewhere. */
export const StructuredBlockCard = ({ block, ...props }) => {
  switch (block.type) {
    case 'cover':
      return <CoverBlockCard block={block} {...props} />
    case 'page':
      return <PageBlockCard block={block} {...props} />
    case 'note':
      return <NoteBlockCard block={block} {...props} />
    case 'paragraphindent':
      return <IndentedBlockCard block={block} {...props} />
    case 'code':
      return <CodeBlockCard block={block} {...props} />
    case 'hr':
      return <DividerBlockCard block={block} {...props} />
    case 'numbered':
      return <NumberedBlockCard block={block} {...props} />
    case 'richbullets':
      return <BulletsBlockCard block={block} {...props} />
    case 'infobox':
    case 'clearbox':
    case 'alertbox':
      return <CalloutBlockCard block={block} {...props} />
    case 'infoboxcolumns':
      return <CalloutGridBlockCard block={block} {...props} />
    case 'richtable':
      return <TableBlockCard block={block} {...props} />
    case 'chart':
      return <ChartBlockCard block={block} {...props} />
    case 'sankey':
      return <SankeyBlockCard block={block} {...props} />
    case 'scorecard':
      return <ScorecardBlockCard block={block} {...props} />
    case 'progress':
      return <ProgressBlockCard block={block} {...props} />
    case 'hero':
      return <HeroBlockCard block={block} {...props} />
    case 'pagebreak':
      return <PageBreakBlockCard block={block} {...props} />
    default:
      return null
  }
}
