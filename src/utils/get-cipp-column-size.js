// Returns { size, minSize } overrides for columns where the rendered cell
// doesn't match the text-measured width (icons, progress bars, etc.).
// Returns null when measurement should be used as-is.
// header is the translated column title text.
export const getCippColumnSize = (accessorKey, header) => {
  // Portal columns render as a small icon — size based on title length
  // plus room for sort icon, column actions, and resize handle.
  if (accessorKey && accessorKey.startsWith('portal_')) {
    const titleLen = header ? header.length : 6
    const px = Math.round(titleLen * 8 + 85)
    return { size: px, minSize: px }
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

    // String arrays that named handlers transform into CippDataTableButton
    // ("X items" button) — don't measure the raw text.
    case 'proxyAddresses':
      return { size: 'header', minSize: 'header' }

    default:
      return null
  }
}
