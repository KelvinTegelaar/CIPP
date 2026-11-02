import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../../hooks/use-settings'
import { ServerPdfPane, useServerPdf } from './useServerPdf'

// Renders a real report server-side - the same document a client would receive - against sample
// data, so the branding being edited can be checked on every page rather than on a mock of the
// cover. The sample data lives beside the renderer (Config/ReportSampleData.json).

// A colour picker drag changes the branding many times a second; the render is asked for once the
// values have settled.
const useSettled = (value, ms) => {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return settled
}

const CippBrandingReportPreview = ({
  reportType = 'executive',
  brandingSettings,
}) => {
  // Resolved against the selected tenant, so a footer written with %cippurl% or a custom variable
  // previews the value it will print rather than the token.
  const tenantFilter = useSettings().currentTenant
  const requestKey = useSettled(
    JSON.stringify({ reportType, branding: brandingSettings, tenantFilter }),
    600
  )
  const body = useMemo(() => JSON.parse(requestKey), [requestKey])
  const pdf = useServerPdf({ url: '/api/ExecPreviewBrandingReportPdf', body })

  return (
    <ServerPdfPane
      {...pdf}
      title="Branding preview"
      errorText="The preview could not be rendered."
    />
  )
}

export default CippBrandingReportPreview
