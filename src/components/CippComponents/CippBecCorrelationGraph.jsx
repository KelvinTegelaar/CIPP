import { useMemo } from 'react'
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  buildBecCorrelationGraph,
  BEC_OBJECTIVE_COLOR,
  BEC_OBJECTIVE_LABEL,
} from '../../utils/bec-timeline'

const fmt = (ts) =>
  new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

// Column geometry. Four left-to-right lanes: the compromised account, the source IPs it acted from,
// the events from each source, and the other accounts those events reached.
const ACCOUNT_W = 176
const ACCOUNT_H = 56
const HUB_W = 184
const HUB_H = 60
const EVENT_W = 250
const EVENT_H = 80
const TARGET_W = 184
const TARGET_H = 52
const ACCOUNT_X = 8
const HUB_X = 252
const EVENT_X = 524
const TARGET_X = 856
const ROW = EVENT_H + 20
const CLUSTER_GAP = 28
const PAD = 24

// A horizontal cubic-bezier from one node's right edge to the next node's left edge.
const edgePath = (x1, y1, x2, y2) => {
  const dx = Math.max((x2 - x1) * 0.5, 24)
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
}

const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

// The non-linear view, drawn natively (SVG edges + themed HTML nodes — no graph library). It reads the
// same correlated events as the timeline but groups them by where they came from and who they reached,
// so lateral movement onto other accounts is visible as edges, not buried in a list.
// `fill` swaps the fixed-height scroll box for one that takes the rest of a flex parent (full screen).
export const CippBecCorrelationGraph = ({
  becData,
  windowDays = 7,
  userData,
  fill = false,
}) => {
  const theme = useTheme()

  const { nodes, edges, width, height, hasData } = useMemo(() => {
    const graph = buildBecCorrelationGraph(
      becData,
      windowDays,
      userData?.userPrincipalName
    )
    const accountName = userData?.userPrincipalName || graph.account
    const clusters = [
      ...graph.hubs,
      ...(graph.orphans.length > 0
        ? [{ ip: null, location: null, foreign: false, events: graph.orphans }]
        : []),
    ]
    if (clusters.length === 0) {
      return { nodes: [], edges: [], width: 0, height: 0, hasData: false }
    }

    const startId = graph.startOfCompromise?.id
    const nodeList = []
    const edgeList = []
    const eventCentre = new Map()

    const neutralStroke = alpha(theme.palette.text.primary, 0.22)
    const targetStroke = alpha(theme.palette.text.primary, 0.3)

    // Place each source's events in a vertical block; the hub centres on its block. A running cursor
    // stacks the blocks top to bottom so nothing overlaps.
    let cursorY = PAD
    clusters.forEach((cluster, hubIndex) => {
      const hubId = `hub-${hubIndex}`
      const count = cluster.events.length
      const blockTop = cursorY
      cluster.events.forEach((event, eventIndex) => {
        eventCentre.set(event.id, blockTop + eventIndex * ROW + EVENT_H / 2)
      })
      const hubCentre = blockTop + ((count - 1) * ROW + EVENT_H) / 2
      // an address judged the attacker's is flagged like a foreign one, even at home
      const flaggedHub = cluster.foreign || cluster.attacker
      const hubColour = cluster.ip
        ? flaggedHub
          ? theme.palette.error.main
          : theme.palette.text.secondary
        : theme.palette.text.disabled

      nodeList.push({
        id: hubId,
        kind: 'hub',
        x: HUB_X,
        y: hubCentre - HUB_H / 2,
        w: HUB_W,
        h: HUB_H,
        colour: hubColour,
        cluster,
      })
      edgeList.push({
        id: `e-account-${hubId}`,
        d: edgePath(
          ACCOUNT_X + ACCOUNT_W,
          0, // account centre filled in after totalHeight is known
          HUB_X,
          hubCentre
        ),
        y1Ref: 'account',
        toY: hubCentre,
        stroke: flaggedHub ? theme.palette.error.main : neutralStroke,
        width: flaggedHub ? 2 : 1,
      })

      cluster.events.forEach((event) => {
        const centre = eventCentre.get(event.id)
        const colour = BEC_OBJECTIVE_COLOR[event.objective] || '#718096'
        nodeList.push({
          id: event.id,
          kind: 'event',
          x: EVENT_X,
          y: centre - EVENT_H / 2,
          w: EVENT_W,
          h: EVENT_H,
          colour,
          isStart: event.id === startId,
          event,
        })
        edgeList.push({
          id: `e-${hubId}-${event.id}`,
          d: edgePath(HUB_X + HUB_W, hubCentre, EVENT_X, centre),
          stroke: alpha(colour, 0.65),
          width: 1,
        })
      })
      cursorY += count * ROW + CLUSTER_GAP
    })

    const contentHeight = cursorY - CLUSTER_GAP + PAD
    const accountCentre = Math.max(contentHeight / 2, ACCOUNT_H / 2 + PAD)
    nodeList.push({
      id: 'account',
      kind: 'account',
      x: ACCOUNT_X,
      y: accountCentre - ACCOUNT_H / 2,
      w: ACCOUNT_W,
      h: ACCOUNT_H,
      name: accountName,
    })
    // Now the account centre is known, anchor the account→hub edges' start point to it.
    edgeList.forEach((edge) => {
      if (edge.y1Ref === 'account') {
        edge.d = edgePath(ACCOUNT_X + ACCOUNT_W, accountCentre, HUB_X, edge.toY)
      }
    })

    // Affected accounts: centre each on the mean of the events that reached it, then push apart any
    // that would overlap. Edges run from each event to the account it touched.
    let hasTargets = false
    let lastTargetY = -Infinity
    const targetCentre = new Map()
    const sortedTargets = graph.targets
      .map((target) => {
        const centres = target.events
          .map((event) => eventCentre.get(event.id))
          .filter((value) => typeof value === 'number')
        const mean = centres.length
          ? centres.reduce((sum, value) => sum + value, 0) / centres.length
          : accountCentre
        return { ...target, mean }
      })
      .sort((a, b) => a.mean - b.mean)

    sortedTargets.forEach((target, index) => {
      hasTargets = true
      const y = Math.max(target.mean, lastTargetY + TARGET_H + 16)
      lastTargetY = y
      targetCentre.set(target.account, y)
      nodeList.push({
        id: `target-${index}`,
        kind: 'target',
        x: TARGET_X,
        y: y - TARGET_H / 2,
        w: TARGET_W,
        h: TARGET_H,
        target,
      })
    })

    // Event → affected-account edges, drawn once the target centres are settled.
    nodeList
      .filter((node) => node.kind === 'event' && node.event.affects)
      .forEach((node) => {
        const y2 = targetCentre.get(node.event.affects)
        if (typeof y2 !== 'number') return
        edgeList.push({
          id: `e-${node.id}-target`,
          d: edgePath(
            EVENT_X + EVENT_W,
            eventCentre.get(node.event.id),
            TARGET_X,
            y2
          ),
          stroke: targetStroke,
          width: 1,
          dashed: true,
        })
      })

    const width = hasTargets
      ? TARGET_X + TARGET_W + PAD
      : EVENT_X + EVENT_W + PAD
    const height = Math.max(contentHeight, lastTargetY + TARGET_H / 2 + PAD)
    return { nodes: nodeList, edges: edgeList, width, height, hasData: true }
  }, [becData, windowDays, userData, theme])

  if (!hasData) {
    return (
      <Typography variant="body2" color="text.secondary">
        No timestamped events in the analysis window.
      </Typography>
    )
  }

  return (
    <Box
      sx={
        fill
          ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
          : undefined
      }
    >
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          The account fans out to each source it acted from, each source to what
          was done from it, and those actions out to the other accounts they
          reached. Red = foreign or attacker source; ringed = likely start of
          compromise.
        </Typography>
        {Object.entries(BEC_OBJECTIVE_LABEL).map(([key, label]) => (
          <Chip
            key={key}
            size="small"
            variant="outlined"
            label={label}
            sx={{
              height: 20,
              borderColor: BEC_OBJECTIVE_COLOR[key],
              color: BEC_OBJECTIVE_COLOR[key],
            }}
          />
        ))}
      </Stack>
      <Box
        sx={{
          ...(fill ? { flex: 1, minHeight: 320 } : { height: 560 }),
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ position: 'relative', width, height }}>
          <svg
            width={width}
            height={height}
            style={{ position: 'absolute', inset: 0 }}
          >
            {edges.map((edge) => (
              <path
                key={edge.id}
                d={edge.d}
                fill="none"
                stroke={edge.stroke}
                strokeWidth={edge.width}
                strokeDasharray={edge.dashed ? '4 4' : undefined}
              />
            ))}
          </svg>

          {nodes.map((node) => {
            if (node.kind === 'account') {
              return (
                <Tooltip key={node.id} title={node.name} placement="top">
                  <Box
                    sx={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: node.w,
                      height: node.h,
                      borderRadius: 2,
                      px: 1.25,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={oneLine}>
                      {node.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      compromised account
                    </Typography>
                  </Box>
                </Tooltip>
              )
            }

            if (node.kind === 'hub') {
              const { cluster, colour } = node
              const title = cluster.ip
                ? `${cluster.ip}${cluster.location ? ` · ${cluster.location}` : ''}${cluster.verdict ? ` · verdict: ${cluster.verdict}` : ''}${cluster.foreign ? ' · foreign source' : ''}`
                : 'Events with no recorded source IP'
              return (
                <Tooltip key={node.id} title={title} placement="top">
                  <Box
                    sx={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: node.w,
                      height: node.h,
                      borderRadius: 2,
                      px: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      textAlign: 'center',
                      border: '2px solid',
                      borderColor: colour,
                      bgcolor:
                        cluster.foreign || cluster.attacker
                          ? alpha(theme.palette.error.main, 0.08)
                          : 'background.paper',
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ ...oneLine, color: colour }}
                    >
                      {cluster.ip
                        ? `${cluster.foreign ? '🌐 ' : ''}${cluster.ip}`
                        : 'No source IP'}
                    </Typography>
                    {cluster.location && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={oneLine}
                      >
                        {cluster.location}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {cluster.events.length} event
                      {cluster.events.length === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                </Tooltip>
              )
            }

            if (node.kind === 'target') {
              const { target } = node
              return (
                <Tooltip key={node.id} title={target.account} placement="top">
                  <Box
                    sx={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: node.w,
                      height: node.h,
                      borderRadius: 2,
                      px: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderLeft: '3px solid',
                      borderLeftColor: 'text.secondary',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} sx={oneLine}>
                      👥 {target.account}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {target.events.length} action
                      {target.events.length === 1 ? '' : 's'} against
                    </Typography>
                  </Box>
                </Tooltip>
              )
            }

            // event
            const { event, colour, isStart } = node
            const tip = [
              event.label,
              fmt(event.ts),
              event.graphDetail,
              event.affects ? `→ ${event.affects}` : null,
            ]
              .filter(Boolean)
              .join(' · ')
            return (
              <Tooltip key={node.id} title={tip} placement="top">
                <Box
                  sx={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                    width: node.w,
                    height: node.h,
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: '4px solid',
                    borderLeftColor: colour,
                    bgcolor: 'background.paper',
                    boxShadow: isStart
                      ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.45)}`
                      : 'none',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {fmt(event.ts)}
                    </Typography>
                    {isStart && (
                      <Chip
                        color="error"
                        label="start"
                        size="small"
                        sx={{ height: 16 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" fontWeight={600} sx={oneLine}>
                    {event.label}
                  </Typography>
                  {event.graphDetail && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={oneLine}
                    >
                      {event.graphDetail}
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default CippBecCorrelationGraph
