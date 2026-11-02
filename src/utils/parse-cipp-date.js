// Parse a date value coming from the CIPP API into a JS Date.
//
// Some backend tables (e.g. ScheduledTasks / Extension Sync) store timestamps as a
// Unix epoch in *seconds*, often cast to a string (e.g. "1719225600"). Passing that
// straight to `new Date()` yields an Invalid Date, which silently breaks table
// sorting and date-range filtering. Numeric / all-digit values are therefore treated
// as epoch seconds and multiplied by 1000; everything else (ISO 8601 strings, etc.)
// is passed through to the native Date parser.
const allDigits = /^\d+$/

export const parseCippDate = (data) => {
  if (typeof data === 'number' || (typeof data === 'string' && allDigits.test(data))) {
    return new Date(Number(data) * 1000)
  }
  return new Date(data)
}
