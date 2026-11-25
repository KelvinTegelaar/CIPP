import { useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ApiGetCall } from '../../api/ApiCall'
import { CippCardTabPanel } from '../CippComponents/CippCardTabPanel'
import { CippCopyToClipBoard } from '../CippComponents/CippCopyToClipboard'
import { markdownStyles } from '../CippTestDetail/CippTestDetailOffCanvas'
import { getCippError } from '../../utils/get-cipp-error'

// The API serializes single-element arrays as a bare object; lists need real arrays.
const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const boxSx = {
  p: 1.5,
  borderRadius: '12px',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

const SectionTitle = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      fontWeight: 600,
      color: 'text.secondary',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}
  >
    {children}
  </Typography>
)

const Markdown = ({ children }) => (
  <Box sx={markdownStyles}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children: label, ...props }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {label}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  </Box>
)

// Ask with one of: id (published baseline), requestId (custom request) or guid (added baseline).
export const CippManagedBaselineGuide = ({ id, requestId, guid }) => {
  const key = id ?? requestId ?? guid
  const guide = ApiGetCall({
    url: '/api/ListManagedBaselineGuide',
    data: id ? { id } : requestId ? { requestId } : { GUID: guid },
    queryKey: `ManagedBaselineGuide-${key}`,
    waiting: !!key,
  })

  if (guide.isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{getCippError(guide.error)}</Alert>
      </Box>
    )
  }
  if (!guide.isSuccess) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={160} />
      </Box>
    )
  }

  const result = guide.data?.Results ?? {}
  const stages = asArray(result.stages)
  const hasGuide =
    !!result.overview ||
    stages.some(
      (stage) => stage.guide || asArray(stage.communications).length > 0
    )
  if (!hasGuide) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          CyberDrain has not published a guide for this baseline yet.
        </Alert>
      </Box>
    )
  }

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {result.importedVersion && result.importedVersion !== result.version && (
        <Alert severity="info">
          This guide is for CyberDrain version {result.version}. You have
          version {result.importedVersion}.
        </Alert>
      )}
      {result.overview && (
        <>
          <SectionTitle>Implementation Guide</SectionTitle>
          <Markdown>{result.overview}</Markdown>
        </>
      )}
      {stages.map((stage, index) => (
        <Box key={`${stage.name}-${index}`} sx={boxSx}>
          <Chip
            variant="outlined"
            size="small"
            color="info"
            label={`Stage ${index + 1}: ${stage.name}`}
          />
          {stage.guide && <Markdown>{stage.guide}</Markdown>}
          {asArray(stage.communications).length > 0 && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <SectionTitle>Communication Examples</SectionTitle>
              {asArray(stage.communications).map((example, exampleIndex) => (
                <Box
                  key={`${example.title}-${exampleIndex}`}
                  sx={{ ...boxSx, bgcolor: 'background.default' }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Typography variant="subtitle2">
                        {example.title}
                      </Typography>
                      {example.audience && (
                        <Chip
                          variant="outlined"
                          size="small"
                          label={example.audience}
                        />
                      )}
                    </Stack>
                    <CippCopyToClipBoard text={example.body} />
                  </Stack>
                  <Markdown>{example.body}</Markdown>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  )
}

// Details panel with a Guide tab beside it; the guide is only fetched once its tab is opened.
export const CippManagedBaselineGuideTabs = ({ children, ...guideProps }) => {
  const [tab, setTab] = useState(0)
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(event, value) => setTab(value)}
          aria-label="managed baseline details tabs"
          size="small"
        >
          <Tab label="Details" />
          <Tab label="Guide" />
        </Tabs>
      </Box>
      <CippCardTabPanel value={tab} index={0}>
        {children}
      </CippCardTabPanel>
      <CippCardTabPanel value={tab} index={1}>
        <CippManagedBaselineGuide {...guideProps} />
      </CippCardTabPanel>
    </Box>
  )
}
