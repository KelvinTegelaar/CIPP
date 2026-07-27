import { StyleSheet } from '@react-pdf/renderer'

// The @react-pdf/renderer style system shared by CIPP's client-facing PDF reports: a cover page,
// branded content pages, stat cards, callout boxes, data tables and a footer with page numbers.
//
// The existing report components (BECRemediationReportButton, ExecutiveReportButton,
// ShadowAIReportButton, ReportBuilderPDF) each carry their own copy of roughly this sheet. They
// are deliberately left alone - this module exists so new reports stop adding to that, and so
// those four can adopt it later without a risky big-bang refactor.

export const DEFAULT_BRAND_COLOUR = '#F77F00'

// Status colours, matching the severity language used across the reports.
export const REPORT_COLOURS = {
  danger: '#742A2A',
  dangerBg: '#FED7D7',
  warning: '#744210',
  warningBg: '#FEEBC8',
  success: '#22543D',
  successBg: '#C6F6D5',
  info: '#2C5282',
  infoBg: '#BEE3F8',
  ink: '#1A202C',
  body: '#2D3748',
  muted: '#4A5568',
  faint: '#718096',
  line: '#E2E8F0',
  panel: '#F7FAFC',
}

export const createReportStyles = (brandColor = DEFAULT_BRAND_COLOUR) =>
  StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.4,
      color: REPORT_COLOURS.body,
      padding: 40,
      paddingBottom: 60,
    },

    // COVER
    coverPage: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      padding: 60,
      justifyContent: 'space-between',
      minHeight: '100%',
    },
    coverHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 80,
    },
    logo: { height: 100, marginRight: 12 },
    headerLogo: { height: 30 },
    dateStamp: {
      fontSize: 9,
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    coverHero: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', paddingTop: 40 },
    coverLabel: {
      backgroundColor: brandColor,
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 30,
      alignSelf: 'flex-start',
    },
    mainTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: REPORT_COLOURS.ink,
      lineHeight: 1.1,
      marginBottom: 20,
      letterSpacing: -1,
    },
    titleAccent: { color: brandColor },
    subtitle: {
      fontSize: 14,
      color: '#000000',
      lineHeight: 1.5,
      marginBottom: 40,
      maxWidth: 400,
    },
    coverMetaLabel: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 8 },
    coverMetavalue: { fontSize: 12, color: '#333333', marginBottom: 4 },
    coverFooter: { textAlign: 'center', marginTop: 60 },
    confidential: {
      fontSize: 9,
      color: '#A0AEC0',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // CONTENT PAGES
    pageHeader: {
      borderBottom: `1px solid ${brandColor}`,
      paddingBottom: 12,
      marginBottom: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    pageHeaderContent: { flex: 1 },
    pageTitle: { fontSize: 20, fontWeight: 'bold', color: REPORT_COLOURS.ink, marginBottom: 8 },
    pageSubtitle: { fontSize: 11, color: REPORT_COLOURS.muted },

    section: { marginBottom: 24, pageBreakInside: 'avoid', breakInside: 'avoid' },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: brandColor, marginBottom: 12 },
    bodyText: {
      fontSize: 9,
      color: REPORT_COLOURS.body,
      lineHeight: 1.5,
      marginBottom: 12,
      textAlign: 'justify',
    },
    bold: { fontWeight: 'bold' },

    bulletList: { marginLeft: 12, marginBottom: 12 },
    bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
    bulletPoint: {
      fontSize: 8,
      color: brandColor,
      marginRight: 6,
      fontWeight: 'bold',
      marginTop: 1,
    },
    bulletText: { fontSize: 9, color: REPORT_COLOURS.body, lineHeight: 1.4, flex: 1 },

    // CALLOUTS
    alertBox: {
      backgroundColor: '#FFF5F5',
      border: `2px solid ${brandColor}`,
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
    },
    alertTitle: { fontSize: 11, fontWeight: 'bold', color: brandColor, marginBottom: 6 },
    alertText: { fontSize: 9, color: REPORT_COLOURS.body, lineHeight: 1.4 },

    infoBox: {
      backgroundColor: REPORT_COLOURS.panel,
      border: `1px solid ${REPORT_COLOURS.line}`,
      borderLeft: `4px solid ${brandColor}`,
      borderRadius: 4,
      padding: 12,
      marginBottom: 12,
    },
    infoTitle: { fontSize: 10, fontWeight: 'bold', color: REPORT_COLOURS.body, marginBottom: 6 },
    infoText: { fontSize: 8, color: REPORT_COLOURS.muted, lineHeight: 1.4 },
    okBox: { backgroundColor: '#F0FDF4' },
    okTitle: { color: REPORT_COLOURS.success },

    // STATS
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
    },
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      border: `1px solid ${REPORT_COLOURS.line}`,
      borderRadius: 6,
      padding: 16,
      alignItems: 'center',
      borderTop: `3px solid ${brandColor}`,
    },
    statNumber: { fontSize: 20, fontWeight: 'bold', color: brandColor, marginBottom: 4 },
    statLabel: {
      fontSize: 7,
      color: REPORT_COLOURS.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
      fontWeight: 'bold',
    },

    // TABLES
    table: {
      border: `1px solid ${REPORT_COLOURS.line}`,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 16,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: brandColor,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    tableHeaderCell: {
      fontSize: 7,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: REPORT_COLOURS.panel,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'flex-start',
    },
    tableCell: { fontSize: 8, color: REPORT_COLOURS.body, lineHeight: 1.3 },
    tableEmpty: { fontSize: 8, color: REPORT_COLOURS.faint, fontStyle: 'italic', padding: 12 },
    truncationNote: {
      fontSize: 8,
      color: REPORT_COLOURS.faint,
      fontStyle: 'italic',
      marginLeft: 12,
      marginBottom: 12,
    },

    // FOOTER
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: `1px solid ${REPORT_COLOURS.line}`,
      paddingTop: 8,
    },
    footerText: { fontSize: 7, color: REPORT_COLOURS.faint },
    pageNumber: { fontSize: 7, color: REPORT_COLOURS.faint, fontWeight: 'bold' },
  })
