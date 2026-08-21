import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { Download, OpenInNew, PictureAsPdf } from '@mui/icons-material'
import { PDFViewer, usePDF } from '@react-pdf/renderer'
import { useIsMobileLayout } from '../../hooks/use-breakpoint'

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return null
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * The mobile half. `PDFViewer` is an iframe pointed at a blob URL, and iOS Safari renders a
 * PDF in an iframe as a fixed first-page preview: it does not scroll, at any iframe height.
 * No amount of CSS fixes that, so below md we stop pretending to embed the document and hand
 * it to the platform viewer, which scrolls, pinch-zooms, shares and prints.
 *
 * Both actions are real anchors rather than window.open in a click handler — a programmatic
 * open from an async callback is what mobile popup blockers exist to stop.
 */
const MobileHandoff = ({ document, fileName, title, showDownload }) => {
  const [instance] = usePDF({ document })

  if (instance.loading) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: '100%', p: 3 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Building report…
        </Typography>
      </Stack>
    )
  }

  if (instance.error || !instance.url) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%', p: 3 }}>
        <Typography variant="subtitle1">Report could not be generated</Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {instance.error ? String(instance.error) : 'No document was produced.'}
        </Typography>
      </Stack>
    )
  }

  const size = formatSize(instance.blob?.size)

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ height: '100%', p: 3, textAlign: 'center' }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
        }}
      >
        <PictureAsPdf sx={{ fontSize: 34, color: 'text.secondary' }} />
      </Box>

      <Stack spacing={0.5} sx={{ minWidth: 0, maxWidth: '100%' }}>
        <Typography variant="subtitle1" noWrap>
          {title ?? 'Report'}
        </Typography>
        {size && (
          <Typography variant="body2" color="text.secondary">
            PDF · {size}
          </Typography>
        )}
      </Stack>

      <Stack spacing={1} sx={{ width: '100%', maxWidth: 320 }}>
        <Button
          component="a"
          href={instance.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          startIcon={<OpenInNew />}
          sx={{ minHeight: 44 }}
        >
          Open report
        </Button>
        {/* Off by default: six of the eight hosts already put a Download in their dialog
            actions, and two of them side by side is what this looked like on a phone. */}
        {showDownload && (
          <Button
            component="a"
            href={instance.url}
            download={fileName ?? 'report.pdf'}
            variant="outlined"
            startIcon={<Download />}
            sx={{ minHeight: 44 }}
          >
            Download
          </Button>
        )}
      </Stack>
    </Stack>
  )
}

/**
 * Drop-in for `<PDFViewer>`: identical on desktop, a platform handoff below md.
 *
 * `title` labels the card and `fileName` names the download; both are mobile-only, as is
 * `showDownload` — pass it only where the host has no download action of its own. `viewerKey`
 * is applied to the desktop iframe alone: one caller remounts it per render to dodge a
 * react-pdf error, and doing that on mobile would rebuild the blob every render.
 */
export const CippPdfPreview = (props) => {
  const { children, fileName, title, viewerKey, showDownload = false, ...viewerProps } = props
  const isMobile = useIsMobileLayout()

  if (isMobile) {
    return (
      <MobileHandoff
        document={children}
        fileName={fileName}
        title={title}
        showDownload={showDownload}
      />
    )
  }

  return (
    <PDFViewer key={viewerKey} {...viewerProps}>
      {children}
    </PDFViewer>
  )
}

export default CippPdfPreview
