// Keys whose nested objects are intentionally NOT recursed into.
//
// The data table renders these as a single column (via getCippFormatting) rather
// than splitting them into dotted sub-columns. The CSV and PDF exporters must use
// the same list when flattening rows, otherwise a value like `location` is
// flattened to `location.city` / `location.countryOrRegion` while the column id
// stays `location`, so the export looks up `location`, finds nothing, and writes
// "No data" for every row (GitHub issue #6237).
export const SKIP_RECURSION_KEYS = ['location', 'ScheduledBackupValues', 'Tenant']
