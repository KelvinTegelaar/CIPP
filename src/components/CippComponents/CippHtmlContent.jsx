import DOMPurify from 'dompurify'
import { Box } from '@mui/material'

// Links open in a new tab so HTML from Microsoft (message center, service health) can't navigate CIPP away.
const withSafeLinks = (html) =>
  html.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')

export const CippHtmlContent = ({ html, sx }) => {
  if (!html) return null
  return (
    <Box
      sx={{
        typography: 'body2',
        overflowWrap: 'anywhere',
        '& > :first-of-type': { mt: 0 },
        '& a': { color: 'primary.main' },
        '& img': { maxWidth: '100%', height: 'auto' },
        '& table': { borderCollapse: 'collapse', maxWidth: '100%' },
        '& td, & th': { border: 1, borderColor: 'divider', p: 0.5 },
        ...sx,
      }}
      dangerouslySetInnerHTML={{
        __html: withSafeLinks(DOMPurify.sanitize(String(html))),
      }}
    />
  )
}

export default CippHtmlContent
