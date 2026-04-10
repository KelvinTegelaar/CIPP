// Returns { size, minSize } overrides for columns where the rendered cell
// doesn't match the text-measured width (icons, progress bars, etc.).
// Returns null when measurement should be used as-is.
export const getCippColumnSize = (accessorKey) => {
  // Portal columns render as a small icon — header width is enough.
  if (accessorKey && accessorKey.startsWith('portal_')) {
    return { size: 'header', minSize: 'header' }
  }

  // Progress bar / percentage columns need room for the bar component.
  switch (accessorKey) {
    case 'alignmentScore':
    case 'combinedAlignmentScore':
    case 'LicenseMissingPercentage':
    case 'ScorePercentage':
      return { size: 250, minSize: 250 }

    // Columns that render as small icons or compact elements
    case 'info.logoUrl':
      return { size: 'header', minSize: 'header' }

    default:
      return null
  }
}
