// byRisk comes back from the API in arbitrary order; sort for a stable legend and assign each
// slice an explicit semantic colour (red = high, amber = medium, blue = low, green = informational).
export const RISK_SEVERITY_ORDER = ['informational', 'low', 'medium', 'high']

export const sortByRiskSeverity = (byRisk) =>
  [...byRisk].sort((a, b) => {
    const severityIndex = (item) => {
      const index = RISK_SEVERITY_ORDER.indexOf((item.risk ?? '').toLowerCase())
      return index === -1 ? RISK_SEVERITY_ORDER.length : index
    }
    return severityIndex(a) - severityIndex(b)
  })

export const riskChartColor = (risk, theme) => {
  switch (String(risk).toLowerCase()) {
    case 'high':
      return theme.palette.error.main
    case 'medium':
      return theme.palette.warning.main
    case 'low':
      return theme.palette.info.main
    case 'informational':
      return theme.palette.success.main
    default:
      return theme.palette.neutral[200]
  }
}
