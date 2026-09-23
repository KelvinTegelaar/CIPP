import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { CippBecTimelineCustom } from './CippBecTimelineCustom'
import { CippBecCorrelationGraph } from './CippBecCorrelationGraph'

const VERSIONS = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'graph', label: 'Correlation graph' },
]

// Two takes on the same correlated events: a compact vertical timeline, and a non-linear graph that
// groups events by the source they came from and the accounts they reached. Both render natively and
// follow the app theme; the toggle just swaps which one shows. Full screen opens the same view in a
// full-screen dialog (the graph then fills the screen instead of its fixed-height scroll box).
export const CippBecTimelineEvaluator = ({
  becData,
  windowDays = 7,
  userData,
}) => {
  const [version, setVersion] = useState('timeline')
  const [fullScreen, setFullScreen] = useState(false)

  const toggle = (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={version}
      onChange={(event, value) => value && setVersion(value)}
    >
      {VERSIONS.map((option) => (
        <ToggleButton key={option.key} value={option.key}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )

  const view = (fill) =>
    version === 'timeline' ? (
      <CippBecTimelineCustom becData={becData} windowDays={windowDays} />
    ) : (
      <CippBecCorrelationGraph
        becData={becData}
        windowDays={windowDays}
        userData={userData}
        fill={fill}
      />
    )

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1.5 }}
      >
        <Typography variant="body2" color="text.secondary">
          The same correlated events as a dense timeline, or as a graph grouped
          by attacker source and the accounts it reached.
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          {toggle}
          <Button
            size="small"
            variant="outlined"
            startIcon={<CippIcons.Fullscreen />}
            onClick={() => setFullScreen(true)}
          >
            Full screen
          </Button>
        </Stack>
      </Stack>
      {!fullScreen && view(false)}

      <Dialog
        fullScreen
        open={fullScreen}
        onClose={() => setFullScreen(false)}
        aria-labelledby="bec-timeline-fullscreen-title"
      >
        <DialogTitle
          id="bec-timeline-fullscreen-title"
          sx={{ px: { xs: 1.5, sm: 3 }, py: 1.5 }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
          >
            <Box component="span">Attack timeline</Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              {toggle}
              <Tooltip title="Close">
                <IconButton
                  aria-label="close full screen"
                  onClick={() => setFullScreen(false)}
                >
                  <CippIcons.Close />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            px: { xs: 1, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {fullScreen && view(true)}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default CippBecTimelineEvaluator
