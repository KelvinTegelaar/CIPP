import { Box, Chip, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  BarChart as BarChartIcon,
  Delete,
  HorizontalRule,
  Speed,
  ViewCarousel,
  Assessment,
} from '@mui/icons-material'
import CippButtonCard from '../CippCards/CippButtonCard'
import { CippAutoComplete } from '../CippComponents/CippAutocomplete'
import { CHART_KINDS, COVER_STOCK_OPTIONS } from '../CippPdf'

// Editors for the report builder's structured blocks — the ones that carry data rather than prose.
//
// Text blocks stay in the builder page with the rich-text editor they need; these live here because
// they are all the same shape (a title, a small table of values, a couple of options) and because
// the page was already long enough.

/* ── Block definitions ───────────────────────────────────── */

export const STRUCTURED_BLOCK_TYPES = [
  { label: 'Chart', value: 'chart' },
  { label: 'Score Cards', value: 'scorecard' },
  { label: 'Progress Bars', value: 'progress' },
  { label: 'Section Divider', value: 'hero' },
  { label: 'Page Break', value: 'pagebreak' },
]

const BLOCK_META = {
  chart: { label: 'Chart', Icon: BarChartIcon, colour: 'primary' },
  scorecard: { label: 'Score Cards', Icon: Assessment, colour: 'success' },
  progress: { label: 'Progress Bars', Icon: Speed, colour: 'info' },
  hero: { label: 'Section Divider', Icon: ViewCarousel, colour: 'warning' },
  pagebreak: { label: 'Page Break', Icon: HorizontalRule, colour: 'default' },
}

export const isStructuredBlock = (type) => Object.prototype.hasOwnProperty.call(BLOCK_META, type)

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
    default:
      return base
  }
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
          <Typography variant="subtitle2" fontWeight={600}>
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
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Move up">
            <span>
              <IconButton
                size="small"
                aria-label="Move up"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
              >
                <ArrowUpward fontSize="small" />
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
                <ArrowDownward fontSize="small" />
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
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      {children}
    </CippButtonCard>
  )
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
        <Stack key={rowIndex} direction="row" spacing={1} alignItems="center">
          {columns.map((column) => (
            <TextField
              key={column.key}
              size="small"
              label={column.label}
              type={column.type || 'text'}
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
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ))}
      <Box>
        <IconButton size="small" onClick={add} aria-label={addLabel}>
          <Add fontSize="small" />
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          {addLabel}
        </Typography>
      </Box>
    </Stack>
  )
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

export const ChartBlockCard = ({ block, index, onUpdate, ...shell }) => {
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
          <Box sx={{ minWidth: 180 }}>
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
        </Stack>

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

/* ── Score cards ─────────────────────────────────────────── */

export const ScorecardBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const stats = block.stats || []

  return (
    <BlockShell block={block} index={index} chips={<Chip label={`${stats.length} cards`} size="small" variant="outlined" />} {...shell}>
      <Stack spacing={2}>
        <TitleField block={block} index={index} onUpdate={onUpdate} />
        <RowsEditor
          rows={stats}
          columns={[
            { key: 'value', label: 'Figure', width: 1 },
            { key: 'label', label: 'Label', width: 2 },
            { key: 'caption', label: 'Caption (optional)', width: 2 },
          ]}
          onChange={(next) => onUpdate(index, { ...block, stats: next })}
          addLabel="Add card"
        />
        {stats.length > 4 ? (
          <Typography variant="caption" color="warning.main">
            More than four cards on a row get too narrow to read in the PDF.
          </Typography>
        ) : null}
      </Stack>
    </BlockShell>
  )
}

/* ── Progress bars ───────────────────────────────────────── */

export const ProgressBlockCard = ({ block, index, onUpdate, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <Stack spacing={2}>
      <TitleField block={block} index={index} onUpdate={onUpdate} />
      <RowsEditor
        rows={block.items || []}
        columns={[
          { key: 'label', label: 'Label', width: 2 },
          { key: 'value', label: 'Value', width: 1, type: 'number' },
          { key: 'max', label: 'Out of', width: 1, type: 'number' },
        ]}
        onChange={(items) => onUpdate(index, { ...block, items })}
        addLabel="Add bar"
      />
    </Stack>
  </BlockShell>
)

/* ── Section divider ─────────────────────────────────────── */

export const HeroBlockCard = ({ block, index, onUpdate, ...shell }) => {
  const set = (patch) => onUpdate(index, { ...block, ...patch })

  return (
    <BlockShell block={block} index={index} {...shell}>
      <Stack spacing={2}>
        <Typography variant="caption" color="text.secondary">
          Takes a full page of its own, with the background image bleeding to the paper edge.
        </Typography>
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
              options={HERO_BACKGROUND_OPTIONS}
              value={
                HERO_BACKGROUND_OPTIONS.find(
                  (option) => option.value === (block.heroImage || 'none')
                ) ?? HERO_BACKGROUND_OPTIONS[0]
              }
              onChange={(option) =>
                set({ heroImage: !option || option.value === 'none' ? '' : option.value })
              }
            />
          </Box>
        </Stack>
      </Stack>
    </BlockShell>
  )
}

/* ── Page break ──────────────────────────────────────────── */

export const PageBreakBlockCard = ({ block, index, ...shell }) => (
  <BlockShell block={block} index={index} {...shell}>
    <Typography variant="caption" color="text.secondary">
      Everything after this starts on a new page.
    </Typography>
  </BlockShell>
)

/** Pick the editor for a structured block. Returns null for block types handled elsewhere. */
export const StructuredBlockCard = ({ block, ...props }) => {
  switch (block.type) {
    case 'chart':
      return <ChartBlockCard block={block} {...props} />
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
