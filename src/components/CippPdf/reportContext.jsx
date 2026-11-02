import { createContext, useContext } from 'react'

/**
 * The report a component is being rendered inside.
 *
 * Every primitive here needs the same three things — the theme, the resolved stylesheet and the
 * variables that fill `%reportname%` and friends — and threading them through by hand meant a
 * `styles={styles} theme={theme}` on every single call. That is noise on the page and, worse, a
 * component that quietly renders unstyled the day someone forgets one.
 *
 * A report is one React tree, so the context carries them instead. An explicit prop still wins,
 * which is what lets a caller restyle a single component without a second provider — and is why
 * the older reports kept working while they were migrated one at a time.
 */
const ReportContext = createContext(null)

export const ReportProvider = ReportContext.Provider

/** Read the surrounding report. Returns an empty object outside one, so primitives can fall back. */
export const useReport = () => useContext(ReportContext) ?? {}

/**
 * Resolve a primitive's styles and theme: explicit props first, the surrounding report second.
 *
 * Written as one helper rather than repeated in each primitive so the precedence is stated once.
 */
export const useReportStyles = (props = {}) => {
  const report = useReport()
  return {
    styles: props.styles ?? report.styles,
    theme: props.theme ?? report.theme,
    variables: props.variables ?? report.variables,
    logo: props.logo ?? report.logo,
  }
}
