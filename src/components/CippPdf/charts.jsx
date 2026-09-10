import {
  Circle,
  G,
  Line,
  Path,
  Rect,
  Svg,
  Text,
  Text as SvgText,
  View,
} from '@react-pdf/renderer'
import { REPORT_COLOURS } from './reportTheme'
import { useReportStyles } from './reportContext'

// Charts for CIPP's PDF reports.
//
// react-pdf has no charting library, so these draw SVG paths directly. They used to live inline in
// ExecutiveReportButton as ~150-line IIFEs inside JSX; pulling them out is what lets the report
// builder offer a chart block at all, since there was previously no chart to reuse.
//
// Every chart draws into a 400x200 viewBox and scales with its container, so a caller only decides
// data and colour — never geometry.

const VIEW_WIDTH = 400
const VIEW_HEIGHT = 200

const toNumber = (value) => {
  const parsed = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Normalise the loose shapes a caller (or a saved report block) might hold data in. */
export const normaliseChartData = (data) =>
  (Array.isArray(data) ? data : [])
    .map((entry) => ({
      label: String(entry?.label ?? ''),
      value: toNumber(entry?.value),
      colour: entry?.colour || entry?.color || null,
    }))
    .filter((entry) => entry.label !== '' || entry.value !== 0)

const seriesColour = (theme, entry, index) =>
  entry.colour || theme?.series?.[index % (theme?.series?.length || 1)] || REPORT_COLOURS.info

const ChartFrame = ({ styles, title, caption, children, empty, emptyText }) => (
  <View style={styles.chartContainer} wrap={false}>
    {title ? <Text style={styles.chartTitle}>{title}</Text> : null}
    {empty ? (
      <Text style={styles.chartEmpty}>{emptyText}</Text>
    ) : (
      <Svg style={styles.chartCanvas} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
        {children}
      </Svg>
    )}
    {caption && !empty ? <Text style={styles.chartCaption}>{caption}</Text> : null}
  </View>
)

/**
 * Legend laid out in rows beneath the plot.
 *
 * The original inline version placed every entry on one row at a fixed 90pt pitch, so a fifth
 * category ran off the right edge of the canvas. Widths are measured off the label lengths here so
 * entries wrap instead.
 */
const renderLegend = ({ entries, theme, y }) => {
  const perRow = entries.length <= 3 ? entries.length : Math.ceil(entries.length / 2)
  const columnWidth = (VIEW_WIDTH - 40) / Math.max(perRow, 1)

  return entries.map((entry, index) => {
    const row = Math.floor(index / perRow)
    const column = index % perRow
    const x = 20 + column * columnWidth
    const rowY = y + row * 14

    return (
      <G key={`legend-${index}`}>
        <Rect
          x={x}
          y={rowY - 6}
          width="8"
          height="8"
          fill={seriesColour(theme, entry, entry.seriesIndex ?? index)}
          rx="1"
        />
        <SvgText x={x + 12} y={rowY + 1} fontSize="7" fill={REPORT_COLOURS.body}>
          {`${entry.label} (${entry.value})`}
        </SvgText>
      </G>
    )
  })
}

/**
 * Donut chart with an optional total in the middle.
 *
 * A slice covering the whole circle is drawn at 359.99° rather than 360°: at exactly 360 the arc's
 * start and end points coincide and the renderer draws nothing at all, so a tenant whose data fell
 * entirely into one category used to get an empty chart.
 */
export const DonutChart = ({
  data,
  title,
  caption,
  centreLabel,
  emptyText = 'No data available for this chart.',
  ...props
}) => {
  const { styles, theme } = useReportStyles(props)
  const entries = normaliseChartData(data).map((entry, index) => ({ ...entry, seriesIndex: index }))
  const visible = entries.filter((entry) => entry.value > 0)
  const total = visible.reduce((sum, entry) => sum + entry.value, 0)

  if (total === 0) {
    return <ChartFrame styles={styles} title={title} empty emptyText={emptyText} />
  }

  const centreX = VIEW_WIDTH / 2
  const centreY = 85
  const outerRadius = 60
  const innerRadius = 25

  // Each slice's start is derived from the values before it rather than accumulated in a running
  // variable, so the geometry is a pure function of the data — the list is short enough that the
  // repeated prefix sum costs nothing.
  const slices = visible.map((entry, index) => {
    const preceding = visible.slice(0, index).reduce((sum, item) => sum + item.value, 0)
    // Start at twelve o'clock rather than three.
    const startAngle = -90 + (preceding / total) * 360
    const angle = Math.min((entry.value / total) * 360, 359.99)
    const endAngle = startAngle + angle

    const point = (radius, degrees) => ({
      x: centreX + radius * Math.cos((degrees * Math.PI) / 180),
      y: centreY + radius * Math.sin((degrees * Math.PI) / 180),
    })

    const outerStart = point(outerRadius, startAngle)
    const outerEnd = point(outerRadius, endAngle)
    const innerStart = point(innerRadius, startAngle)
    const innerEnd = point(innerRadius, endAngle)
    const largeArc = angle > 180 ? 1 : 0

    return {
      entry,
      d: [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        'Z',
      ].join(' '),
    }
  })

  return (
    <ChartFrame styles={styles} title={title} caption={caption}>
      {slices.map((slice, index) => (
        <Path
          key={index}
          d={slice.d}
          fill={seriesColour(theme, slice.entry, slice.entry.seriesIndex)}
          stroke="#FFFFFF"
          strokeWidth="1"
        />
      ))}
      <SvgText
        x={centreX}
        y={centreY - 2}
        textAnchor="middle"
        fontSize="14"
        fill={REPORT_COLOURS.ink}
      >
        {String(total)}
      </SvgText>
      {centreLabel ? (
        <SvgText
          x={centreX}
          y={centreY + 10}
          textAnchor="middle"
          fontSize="7"
          fill={REPORT_COLOURS.muted}
        >
          {centreLabel}
        </SvgText>
      ) : null}
      {renderLegend({ entries: visible, theme, y: 172 })}
    </ChartFrame>
  )
}

/**
 * Line-and-area trend, as used for the secure score history.
 *
 * `max` fixes the top of the axis. Left unset it is taken from the data, which is right for an
 * arbitrary series but wrong for a score out of a known maximum — pass it when one exists.
 */
export const TrendChart = ({
  data,
  title,
  caption,
  max,
  emptyText = 'Historical data not available.',
  ...props
}) => {
  const { styles, theme } = useReportStyles(props)
  const entries = normaliseChartData(data)

  if (entries.length === 0) {
    return <ChartFrame styles={styles} title={title} empty emptyText={emptyText} />
  }

  const colour = theme?.primary || REPORT_COLOURS.info
  const plotLeft = 40
  const plotTop = 20
  const plotWidth = 320
  const plotHeight = 140
  const plotBottom = plotTop + plotHeight

  const dataMax = Math.max(...entries.map((entry) => entry.value), 0)
  const scaleMax = toNumber(max) > 0 ? toNumber(max) : dataMax > 0 ? dataMax : 1
  const spacing = plotWidth / Math.max(entries.length - 1, 1)

  const pointAt = (entry, index) => ({
    x: plotLeft + index * spacing,
    y: plotBottom - Math.min(entry.value / scaleMax, 1) * plotHeight,
  })

  const points = entries.map(pointAt)
  // A single reading has no line to draw — the point alone still shows where it sits on the axis.
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`

  // Only label as many x ticks as will fit without overlapping.
  const labelStride = Math.ceil(entries.length / 7)

  return (
    <ChartFrame styles={styles} title={title} caption={caption}>
      <Rect
        x={plotLeft}
        y={plotTop}
        width={plotWidth}
        height={plotHeight}
        fill={REPORT_COLOURS.panel}
        stroke={REPORT_COLOURS.line}
        strokeWidth="1"
      />
      {[0, 1, 2, 3, 4].map((index) => (
        <Line
          key={`grid-${index}`}
          x1={plotLeft}
          y1={plotTop + index * (plotHeight / 4)}
          x2={plotLeft + plotWidth}
          y2={plotTop + index * (plotHeight / 4)}
          stroke={REPORT_COLOURS.line}
          strokeWidth="0.5"
        />
      ))}
      {points.length > 1 ? <Path d={areaPath} fill={colour} fillOpacity="0.3" /> : null}
      {points.length > 1 ? <Path d={linePath} fill="none" stroke={colour} strokeWidth="2" /> : null}
      {points.map((point, index) => (
        <Circle key={`point-${index}`} cx={point.x} cy={point.y} r="3" fill={colour} />
      ))}
      {entries.map((entry, index) =>
        index % labelStride === 0 ? (
          <SvgText
            key={`x-${index}`}
            x={points[index].x}
            y={plotBottom + 20}
            textAnchor="middle"
            fontSize="7"
            fill={REPORT_COLOURS.muted}
          >
            {entry.label}
          </SvgText>
        ) : null
      )}
      {[0, 0.25, 0.5, 0.75, 1].map((fraction, index) => (
        <SvgText
          key={`y-${index}`}
          x={plotLeft - 5}
          y={plotBottom - fraction * plotHeight + 3}
          textAnchor="end"
          fontSize="7"
          fill={REPORT_COLOURS.muted}
        >
          {String(Math.round(scaleMax * fraction))}
        </SvgText>
      ))}
    </ChartFrame>
  )
}

/** Vertical bar chart, for category comparisons that do not sum to a meaningful whole. */
export const BarChart = ({
  data,
  title,
  caption,
  emptyText = 'No data available for this chart.',
  ...props
}) => {
  const { styles, theme } = useReportStyles(props)
  const entries = normaliseChartData(data)

  if (entries.length === 0) {
    return <ChartFrame styles={styles} title={title} empty emptyText={emptyText} />
  }

  const plotLeft = 40
  const plotTop = 20
  const plotWidth = 340
  const plotHeight = 130
  const plotBottom = plotTop + plotHeight

  const maxValue = Math.max(...entries.map((entry) => entry.value), 0) || 1
  const slot = plotWidth / entries.length
  const barWidth = Math.min(slot * 0.6, 46)

  return (
    <ChartFrame styles={styles} title={title} caption={caption}>
      <Line
        x1={plotLeft}
        y1={plotBottom}
        x2={plotLeft + plotWidth}
        y2={plotBottom}
        stroke={REPORT_COLOURS.line}
        strokeWidth="1"
      />
      {entries.map((entry, index) => {
        // Zero-valued bars still get a hairline so the category reads as present-but-empty rather
        // than missing from the chart.
        const height = Math.max((entry.value / maxValue) * plotHeight, entry.value > 0 ? 2 : 1)
        const x = plotLeft + index * slot + (slot - barWidth) / 2
        const y = plotBottom - height

        return (
          <G key={`bar-${index}`}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              fill={seriesColour(theme, entry, index)}
              rx="2"
            />
            <SvgText
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="7"
              fill={REPORT_COLOURS.body}
            >
              {String(entry.value)}
            </SvgText>
            <SvgText
              x={x + barWidth / 2}
              y={plotBottom + 12}
              textAnchor="middle"
              fontSize="7"
              fill={REPORT_COLOURS.muted}
            >
              {entry.label.length > 14 ? `${entry.label.slice(0, 13)}…` : entry.label}
            </SvgText>
          </G>
        )
      })}
    </ChartFrame>
  )
}

export const CHART_KINDS = [
  { label: 'Donut', value: 'donut' },
  { label: 'Bar', value: 'bar' },
  { label: 'Trend line', value: 'trend' },
]

/** Render whichever chart a saved block asked for. Unknown kinds fall back to a bar chart. */
export const ReportChart = ({ kind, ...props }) => {
  if (kind === 'donut') return <DonutChart {...props} />
  if (kind === 'trend') return <TrendChart {...props} />
  return <BarChart {...props} />
}
