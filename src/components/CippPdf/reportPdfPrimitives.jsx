import { Text, View, Image } from '@react-pdf/renderer'
import { REPORT_COLOURS } from './reportPdfStyles'

// Shared building blocks for CIPP's client-facing PDF reports. Every one takes the `styles` object
// from createReportStyles so a report can restyle without forking the markup.

export const PageHeader = ({ styles, title, subtitle, logo }) => (
  <View style={styles.pageHeader}>
    <View style={styles.pageHeaderContent}>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
    {logo ? <Image style={styles.headerLogo} src={logo} cache={false} /> : null}
  </View>
)

export const PageFooter = ({ styles, label }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>{label}</Text>
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  </View>
)

// A row of stat cards. Pass at most four — beyond that they get too narrow to read.
export const StatRow = ({ styles, stats }) => (
  <View style={styles.statsGrid}>
    {stats.map((stat) => (
      <View key={stat.label} style={styles.statCard}>
        <Text style={[styles.statNumber, stat.colour ? { color: stat.colour } : {}]}>
          {stat.value}
        </Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </View>
    ))}
  </View>
)

export const InfoBox = ({ styles, title, children }) => (
  <View style={styles.infoBox}>
    {title ? <Text style={styles.infoTitle}>{title}</Text> : null}
    <Text style={styles.infoText}>{children}</Text>
  </View>
)

export const AlertBox = ({ styles, title, colour, children }) => (
  <View style={[styles.alertBox, colour ? { borderColor: colour } : {}]}>
    <Text style={[styles.alertTitle, colour ? { color: colour } : {}]}>{title}</Text>
    <Text style={styles.alertText}>{children}</Text>
  </View>
)

// The all-clear counterpart to AlertBox, for a check that found nothing.
export const ClearBox = ({ styles, title, children }) => (
  <View style={[styles.infoBox, styles.okBox]}>
    <Text style={[styles.infoTitle, styles.okTitle]}>{title}</Text>
    <Text style={styles.infoText}>{children}</Text>
  </View>
)

export const BulletList = ({ styles, items }) => (
  <View style={styles.bulletList}>
    {items.map((item, index) => (
      <View key={index} style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>{item.marker ?? '•'}</Text>
        <Text style={styles.bulletText}>
          {item.label ? <Text style={styles.bold}>{item.label} </Text> : null}
          {item.text}
        </Text>
      </View>
    ))}
  </View>
)

/**
 * Fixed-width data table. `columns` is [{ header, key, width }] where width is a flex ratio.
 * Rows beyond `limit` are dropped with a note rather than running to hundreds of pages — the
 * full set is always available from the table export on the page itself.
 */
export const DataTable = ({
  styles,
  columns,
  rows,
  limit = 25,
  emptyText = 'Nothing to report.',
}) => {
  const shown = rows.slice(0, limit)
  const hidden = rows.length - shown.length

  return (
    <>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {columns.map((column) => (
            <Text key={column.key} style={[styles.tableHeaderCell, { flex: column.width ?? 1 }]}>
              {column.header}
            </Text>
          ))}
        </View>
        {shown.length === 0 ? (
          <Text style={styles.tableEmpty}>{emptyText}</Text>
        ) : (
          shown.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              {columns.map((column) => (
                <Text key={column.key} style={[styles.tableCell, { flex: column.width ?? 1 }]}>
                  {row[column.key] ?? ''}
                </Text>
              ))}
            </View>
          ))
        )}
      </View>
      {hidden > 0 ? (
        <Text style={styles.truncationNote}>
          … and {hidden} more. Export the table from the report page for the full list.
        </Text>
      ) : null}
    </>
  )
}

// Shared severity vocabulary so every report grades findings the same way.
export const severityColour = (severity) => {
  switch (severity) {
    case 'high':
      return REPORT_COLOURS.danger
    case 'medium':
      return REPORT_COLOURS.warning
    default:
      return REPORT_COLOURS.success
  }
}
