import React from "react";
import { Button, Tooltip } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { useSettings } from "../hooks/use-settings";

// PRODUCTION-GRADE PDF SYSTEM
const ExecutiveReportDocument = ({
  tenantName,
  tenantId,
  userStats,
  standardsData,
  organizationData,
  brandingSettings,
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const brandColor = brandingSettings?.colour || "#F77F00";

  // ENTERPRISE DESIGN SYSTEM - JOBS/RAMS/IVE PRINCIPLES
  const styles = StyleSheet.create({
    // FOUNDATION - CONSISTENT STATE OWNERSHIP (FLORENCE)
    page: {
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.4,
      color: "#2D3748",
      padding: 40, // Consistent base padding
    },

    // COVER PAGE - PROPORTIONAL & INTENTIONAL (JOBS/RAMS/IVE)
    coverPage: {
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      fontFamily: "Helvetica",
      padding: 60,
      justifyContent: "space-between",
      minHeight: "100%",
    },

    coverHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 80,
    },

    logoSection: {
      flexDirection: "row",
      alignItems: "center",
    },

    logo: {
      width: 40,
      height: 40,
      marginRight: 12,
    },

    brandName: {
      fontSize: 12,
      fontWeight: "bold",
      color: brandColor,
      letterSpacing: 1,
      textTransform: "uppercase",
    },

    dateStamp: {
      fontSize: 9,
      color: "#000000",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // MODERN HERO SECTION
    coverHero: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "flex-start",
      paddingTop: 40,
    },

    coverLabel: {
      backgroundColor: brandColor,
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 30,
      alignSelf: "flex-start",
    },

    mainTitle: {
      fontSize: 48,
      fontWeight: "bold",
      color: "#1A202C",
      lineHeight: 1.1,
      marginBottom: 20,
      letterSpacing: -1,
      textTransform: "uppercase",
    },

    titleAccent: {
      color: brandColor,
    },

    subtitle: {
      fontSize: 14,
      color: "#000000",
      fontWeight: "normal",
      lineHeight: 1.5,
      marginBottom: 40,
      maxWidth: 400,
    },

    tenantCard: {
      backgroundColor: "transparent",
      padding: 0,
      maxWidth: 400,
    },

    tenantName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#000000",
      marginBottom: 8,
      textAlign: "center",
    },

    tenantMeta: {
      fontSize: 11,
      color: "#333333",
      textAlign: "center",
    },

    coverFooter: {
      textAlign: "center",
      marginTop: 60,
    },

    confidential: {
      fontSize: 9,
      color: "#A0AEC0",
      textTransform: "uppercase",
      letterSpacing: 1,
    },

    // CONTENT PAGES - MODULAR COMPOSITION (FROST)
    pageHeader: {
      borderBottom: `1px solid ${brandColor}`,
      paddingBottom: 12,
      marginBottom: 24,
    },

    pageTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1A202C",
      marginBottom: 8,
    },

    pageSubtitle: {
      fontSize: 11,
      color: "#4A5568",
      fontWeight: "normal",
    },

    // SECTIONS - REPEATABLE PATTERNS (FROST)
    section: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: brandColor,
      marginBottom: 12,
    },

    bodyText: {
      fontSize: 9,
      color: "#2D3748",
      lineHeight: 1.5,
      marginBottom: 12,
      textAlign: "justify",
    },

    // STATS GRID - PERFECT ALIGNMENT (SPOOL)
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },

    statCard: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      padding: 16,
      alignItems: "center",
      borderTop: `3px solid ${brandColor}`,
    },

    statNumber: {
      fontSize: 16,
      fontWeight: "bold",
      color: brandColor,
      marginBottom: 4,
    },

    statLabel: {
      fontSize: 7,
      color: "#4A5568",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      textAlign: "center",
      fontWeight: "bold",
    },

    // COMPLIANCE BARS - VISUAL CONFIDENCE (SPOOL)
    complianceList: {
      gap: 8,
    },

    complianceItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      padding: 10,
      borderRadius: 4,
      border: `1px solid #F0F0F0`,
    },

    complianceLabel: {
      fontSize: 8,
      color: "#2D3748",
      width: 80,
      fontWeight: "bold",
    },

    complianceBarContainer: {
      flex: 1,
      height: 6,
      backgroundColor: "#E2E8F0",
      marginHorizontal: 10,
      borderRadius: 3,
      overflow: "hidden",
    },

    complianceBar: {
      height: 6,
      backgroundColor: brandColor,
      borderRadius: 3,
    },

    complianceValue: {
      fontSize: 8,
      color: "#2D3748",
      width: 25,
      textAlign: "right",
      fontWeight: "bold",
    },

    // SECURE SCORE CARDS - ENTERPRISE GRADE
    scoreGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },

    scoreCard: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      padding: 16,
      alignItems: "center",
      borderTop: `3px solid ${brandColor}`,
    },

    scoreNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: brandColor,
      marginBottom: 8,
    },

    scoreLabel: {
      fontSize: 7,
      color: "#4A5568",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      textAlign: "center",
      fontWeight: "bold",
    },

    // CHART AREA - BROWSER CONSTRAINTS (RAUCH)
    chartContainer: {
      backgroundColor: "#FFFFFF",
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      padding: 16,
      marginBottom: 20,
      alignItems: "center",
    },

    chartTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#2D3748",
      marginBottom: 12,
    },

    chartData: {
      fontSize: 9,
      color: "#4A5568",
      textAlign: "center",
      lineHeight: 1.4,
    },

    // CONTROLS TABLE - HIGH PERFORMANCE (RAUCH)
    controlsTable: {
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      overflow: "hidden",
    },

    tableHeader: {
      flexDirection: "row",
      backgroundColor: brandColor,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    headerCell: {
      fontSize: 7,
      fontWeight: "bold",
      color: "#FFFFFF",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    headerName: {
      width: 100,
    },

    headerDesc: {
      flex: 1,
      marginLeft: 12,
    },

    headerStatus: {
      width: 60,
      textAlign: "center",
      marginLeft: 12,
    },

    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#F7FAFC",
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: "center",
    },

    cellName: {
      width: 100,
      fontSize: 8,
      fontWeight: "bold",
      color: "#2D3748",
    },

    cellDesc: {
      flex: 1,
      marginLeft: 12,
      fontSize: 7,
      color: "#4A5568",
      lineHeight: 1.3,
    },

    cellStatus: {
      width: 60,
      marginLeft: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    // STATUS TEXT - SIMPLE APPROACH
    statusText: {
      fontSize: 7,
      fontWeight: "bold",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },

    statusCompliant: {
      color: "#22543D",
    },

    statusPartial: {
      color: "#744210",
    },

    statusReview: {
      color: "#742A2A",
    },

    // INFO BOXES - CONSISTENT PATTERNS (FROST)
    infoBox: {
      backgroundColor: "#FFFFFF",
      border: `1px solid #E2E8F0`,
      borderLeft: `4px solid ${brandColor}`,
      borderRadius: 4,
      padding: 12,
      marginBottom: 12,
    },

    infoTitle: {
      fontSize: 9,
      fontWeight: "bold",
      color: "#2D3748",
      marginBottom: 6,
    },

    infoText: {
      fontSize: 8,
      color: "#4A5568",
      lineHeight: 1.4,
    },

    // RECOMMENDATIONS - SCALABLE SECTIONS (FROST)
    recommendationsList: {
      gap: 8,
    },

    recommendationItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    recommendationBullet: {
      fontSize: 8,
      color: brandColor,
      marginRight: 6,
      fontWeight: "bold",
      marginTop: 1,
    },

    recommendationText: {
      fontSize: 8,
      color: "#2D3748",
      lineHeight: 1.4,
      flex: 1,
    },

    recommendationLabel: {
      fontWeight: "bold",
    },

    // FOOTER - DETERMINISTIC PAGINATION (FLORENCE)
    footer: {
      position: "absolute",
      bottom: 20,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #E2E8F0",
      paddingTop: 8,
    },

    footerText: {
      fontSize: 7,
      color: "#718096",
    },

    pageNumber: {
      fontSize: 7,
      color: "#718096",
      fontWeight: "bold",
    },

    // BLACK STATISTIC PAGES - MODERN DESIGN
    statPage: {
      flexDirection: "column",
      backgroundColor: "#000000",
      fontFamily: "Helvetica",
      padding: 0,
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "100%",
      position: "relative",
    },

    statOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 60,
      justifyContent: "center",
      alignItems: "flex-start",
      zIndex: 10,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },

    statMainText: {
      fontSize: 18,
      color: "#FFFFFF",
      fontWeight: "bold",
      lineHeight: 1.4,
      marginBottom: 8,
    },

    statHighlight: {
      fontSize: 72,
      color: brandColor,
      fontWeight: "900",
      lineHeight: 1,
      marginBottom: 8,
    },

    statBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.5,
    },

    statSubText: {
      fontSize: 14,
      color: "#FFFFFF",
      fontWeight: "bold",
      lineHeight: 1.3,
      marginBottom: 40,
    },

    statFooterText: {
      position: "absolute",
      bottom: 60,
      right: 60,
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "right",
      lineHeight: 1.3,
    },

    statBrandFooter: {
      position: "absolute",
      bottom: 60,
      left: 60,
      fontSize: 8,
      color: "#666666",
      textTransform: "uppercase",
      letterSpacing: 1,
    },

    // CENTERED IMAGE STYLE
    centeredImage: {
      width: 300,
      height: 200,
      alignSelf: "center",
      marginVertical: 20,
      borderRadius: 8,
    },
  });

  // MOCK DATA - DETERMINISTIC (FLORENCE)
  const complianceData = [
    { standard: "CIS Controls v8", compliance: 87 },
    { standard: "CISA Directives", compliance: 94 },
    { standard: "Essential 8", compliance: 82 },
    { standard: "NIST CSF", compliance: 89 },
    { standard: "ISO 27001", compliance: 76 },
  ];

  const secureScoreData = {
    currentScore: 847,
    fourWeeksAgo: 782,
    similarCompanies: 723,
    allCompanies: 654,
    change: 65,
  };

  // Mock licensing data
  const licensingData = [
    {
      tenant: tenantName || "Organization",
      license: "Microsoft 365 E5 Developer (without Windows and Audio Conferencing)",
      countUsed: 13,
      countAvailable: 12,
      totalLicenses: 25,
    },
    {
      tenant: tenantName || "Organization",
      license: "Microsoft Power Apps for Developer",
      countUsed: 3,
      countAvailable: 9997,
      totalLicenses: 10000,
    },
    {
      tenant: tenantName || "Organization",
      license: "Microsoft 365 Business Premium",
      countUsed: 45,
      countAvailable: 5,
      totalLicenses: 50,
    },
    {
      tenant: tenantName || "Organization",
      license: "Microsoft Defender for Office 365 (Plan 1)",
      countUsed: 58,
      countAvailable: 0,
      totalLicenses: 58,
    },
    {
      tenant: tenantName || "Organization",
      license: "Azure Active Directory Premium P2",
      countUsed: 25,
      countAvailable: 25,
      totalLicenses: 50,
    },
  ];

  // Mock device data
  const deviceData = {
    totalDevices: 127,
    compliantDevices: 98,
    nonCompliantDevices: 29,
    devicesNotSeen30Days: [
      {
        deviceName: "LAPTOP-ABC123",
        lastSeen: "2024-11-15",
        user: "john.doe@company.com",
        os: "Windows 11",
      },
      {
        deviceName: "IPHONE-DEF456",
        lastSeen: "2024-11-20",
        user: "jane.smith@company.com",
        os: "iOS 17.1",
      },
      {
        deviceName: "DESKTOP-GHI789",
        lastSeen: "2024-11-10",
        user: "bob.wilson@company.com",
        os: "Windows 10",
      },
      {
        deviceName: "MACBOOK-JKL012",
        lastSeen: "2024-11-18",
        user: "alice.brown@company.com",
        os: "macOS 14.2",
      },
    ],
  };

  // Mock Conditional Access Policies
  const conditionalAccessPolicies = [
    {
      name: "Block Legacy Authentication",
      state: "Enabled",
      users: "All Users",
      conditions: "Legacy authentication protocols",
      controls: "Block access",
    },
    {
      name: "Require MFA for Admins",
      state: "Enabled",
      users: "Directory Roles",
      conditions: "All cloud apps",
      controls: "Require MFA",
    },
    {
      name: "Require Compliant Device",
      state: "Enabled",
      users: "All Users",
      conditions: "Office 365",
      controls: "Require compliant device",
    },
    {
      name: "Block High Risk Sign-ins",
      state: "Enabled",
      users: "All Users",
      conditions: "High risk sign-in",
      controls: "Block access",
    },
    {
      name: "Require MFA for External Users",
      state: "Report-only",
      users: "Guest Users",
      conditions: "All cloud apps",
      controls: "Require MFA",
    },
  ];

  const securityControls = [
    {
      name: "Multi-Factor Auth",
      description: "Enforce MFA for all administrative accounts",
      status: "Compliant",
    },
    {
      name: "Password Policy",
      description: "Strong password requirements with complexity",
      status: "Compliant",
    },
    {
      name: "Conditional Access",
      description: "Location and device-based access controls",
      status: "Partial",
    },
    {
      name: "Data Loss Prevention",
      description: "Monitor and prevent data exfiltration",
      status: "Compliant",
    },
    {
      name: "Audit Logging",
      description: "Comprehensive audit trail and monitoring",
      status: "Compliant",
    },
    {
      name: "Guest Access",
      description: "Restrict external user access permissions",
      status: "Review",
    },
    {
      name: "Privileged Access",
      description: "Just-in-time administrative access",
      status: "Compliant",
    },
    {
      name: "Device Compliance",
      description: "Devices meet organizational standards",
      status: "Partial",
    },
    {
      name: "Email Security",
      description: "Advanced threat protection measures",
      status: "Compliant",
    },
    {
      name: "Identity Protection",
      description: "Risk-based authentication analytics",
      status: "Partial",
    },
  ];

  const getBadgeStyle = (status) => {
    switch (status) {
      case "Compliant":
        return [styles.statusText, styles.statusCompliant];
      case "Partial":
        return [styles.statusText, styles.statusPartial];
      case "Review":
        return [styles.statusText, styles.statusReview];
      default:
        return styles.statusText;
    }
  };

  return (
    <Document>
      {/* COVER PAGE - JOBS/RAMS/IVE PERFECTION */}
      <Page size="A4" style={styles.coverPage}>
        <Image style={styles.statBackground} src="/reportImages/soc.jpg" />
        <View style={styles.coverHeader}>
          <View style={styles.logoSection}>
            {brandingSettings?.logo ? (
              <Image style={styles.logo} src={brandingSettings.logo} />
            ) : (
              <View />
            )}
            <Text style={styles.brandName}>{brandingSettings?.logo ? "" : ""}</Text>
          </View>
          <Text style={styles.dateStamp}>{currentDate}</Text>
        </View>

        <View style={styles.coverHero}>
          <Text style={styles.coverLabel}>SECURITY ASSESSMENT</Text>

          <Text style={styles.mainTitle}>
            Executive{"\n"}
            <Text style={styles.titleAccent}>Summary</Text>
          </Text>

          <Text style={styles.subtitle}>
            Security & Compliance Assessment for {tenantName || "your organization"}
          </Text>

          <View style={styles.tenantCard}>
            <Text style={styles.tenantName}>{tenantName || "Organization Name"}</Text>
            <Text style={styles.tenantMeta}>Generated on {currentDate}</Text>
          </View>
        </View>

        <View style={styles.coverFooter}>
          <Text style={styles.confidential}>Confidential & Proprietary</Text>
        </View>
      </Page>

      {/* EXECUTIVE SUMMARY - MODULAR COMPOSITION (FROST) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Executive Summary</Text>
          <Text style={styles.pageSubtitle}>
            Strategic overview of your Microsoft 365 security posture
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            This comprehensive security assessment for{" "}
            <Text style={{ fontWeight: "bold" }}>{tenantName || "your organization"}</Text> provides
            a detailed analysis of your Microsoft 365 environment's alignment with industry-leading
            security frameworks and best practices. Our evaluation encompasses critical security
            controls, compliance requirements, and risk mitigation strategies.
          </Text>

          <Text style={styles.bodyText}>
            The assessment methodology incorporates standards from the Center for Internet Security
            (CIS), Cybersecurity and Infrastructure Security Agency (CISA), Essential 8 framework,
            and NIST Cybersecurity Framework. This multi-framework approach ensures comprehensive
            coverage of security domains while providing actionable insights for continuous
            improvement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Overview</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.licensedUsers || "0"}</Text>
              <Text style={styles.statLabel}>Licensed Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.unlicensedUsers || "0"}</Text>
              <Text style={styles.statLabel}>Unlicensed Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.guests || "0"}</Text>
              <Text style={styles.statLabel}>Guest Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.globalAdmins || "0"}</Text>
              <Text style={styles.statLabel}>Global Admins</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Framework Alignment</Text>

          <View style={styles.complianceList}>
            {complianceData.map((item, index) => (
              <View key={index} style={styles.complianceItem}>
                <Text style={styles.complianceLabel}>{item.standard}</Text>
                <View style={styles.complianceBarContainer}>
                  <View style={[styles.complianceBar, { width: `${item.compliance}%` }]} />
                </View>
                <Text style={styles.complianceValue}>{item.compliance}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* STATISTIC PAGE 1 - CHAPTER SPLITTER */}
      <Page size="A4" style={styles.statPage}>
        <Image style={styles.statBackground} src="/reportImages/board.jpg" />
        <View style={styles.statOverlay}>
          <Text style={styles.statHighlight}>83%</Text>
          <Text style={styles.statSubText}>
            of organizations experienced{"\n"}
            more than one <Text style={{ fontWeight: "bold" }}>cyberattack</Text>
            {"\n"}
            in the past year
          </Text>
        </View>
        <Text style={styles.statFooterText}>
          <Text style={{ fontWeight: "bold" }}>Proactive security</Text> prevents{"\n"}
          <Text style={{ fontWeight: "bold" }}>repeated attacks</Text>
        </Text>
        <Text style={styles.statBrandFooter}>CYBERDRAIN SECURITY</Text>
      </Page>

      {/* SECURITY CONTROLS - HIGH PERFORMANCE (RAUCH) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Security Controls Assessment</Text>
          <Text style={styles.pageSubtitle}>
            Detailed evaluation of implemented security measures
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            Your organization's security standards have been meticulously customized by your Managed
            Service Provider to align with internationally recognized frameworks. These
            implementations ensure robust protection against evolving cyber threats while
            maintaining operational efficiency and regulatory compliance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Control Status</Text>

          <View style={styles.controlsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.headerName]}>Control</Text>
              <Text style={[styles.headerCell, styles.headerDesc]}>Implementation</Text>
              <Text style={[styles.headerCell, styles.headerStatus]}>Status</Text>
            </View>

            {securityControls.map((control, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cellName}>{control.name}</Text>
                <Text style={styles.cellDesc}>{control.description}</Text>
                <View style={styles.cellStatus}>
                  <Text style={getBadgeStyle(control.status)}>{control.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Recommendations</Text>

          <View style={styles.recommendationsList}>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Immediate Actions:</Text> Address controls
                marked as "Review" to enhance security posture
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Optimization:</Text> Complete
                implementation of "Partial" controls for comprehensive coverage
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Monitoring:</Text> Establish regular review
                cycles for all security controls
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Training:</Text> Implement security
                awareness programs to reduce human risk factors
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* STATISTIC PAGE 2 - CHAPTER SPLITTER */}
      <Page size="A4" style={styles.statPage}>
        <Image style={styles.statBackground} src="/reportImages/glasses.jpg" />
        <View style={styles.statOverlay}>
          <Text style={styles.statHighlight}>95%</Text>
          <Text style={styles.statSubText}>
            of successful cyber attacks{"\n"}
            could have been prevented with{"\n"}
            <Text style={{ fontWeight: "bold" }}>proactive security measures</Text>
          </Text>
        </View>
        <Text style={styles.statFooterText}>
          Your <Text style={{ fontWeight: "bold" }}>security resilience</Text> is{"\n"}
          our <Text style={{ fontWeight: "bold" }}>primary mission</Text>
        </Text>
        <Text style={styles.statBrandFooter}>CYBERDRAIN SECURITY</Text>
      </Page>

      {/* MICROSOFT SECURE SCORE - DEDICATED PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Microsoft Secure Score</Text>
          <Text style={styles.pageSubtitle}>
            Comprehensive security posture measurement and benchmarking
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            Microsoft Secure Score provides a numerical summary of your security posture based on
            your system configurations, user behavior, and other security-related measurements. The
            score is based on the security controls and features you have enabled and configured in
            your Microsoft 365 environment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Comparison</Text>

          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>{secureScoreData.currentScore}</Text>
              <Text style={styles.scoreLabel}>Current Score</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>{secureScoreData.fourWeeksAgo}</Text>
              <Text style={styles.scoreLabel}>4 Weeks Ago</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>{secureScoreData.similarCompanies}</Text>
              <Text style={styles.scoreLabel}>Similar Orgs</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreNumber}>{secureScoreData.allCompanies}</Text>
              <Text style={styles.scoreLabel}>All Orgs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14-Day Score Trend</Text>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Secure Score Progress Over Time</Text>
            <Text style={styles.chartData}>
              Score progression: 782 → 847 (+65 points){"\n"}
              Consistent daily improvements showing strong security enhancement{"\n"}
              Trend indicates effective security control implementation
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Understanding Score Changes</Text>
          <Text style={styles.infoText}>
            Your Secure Score has increased by {secureScoreData.change} points over the past 4
            weeks, indicating strong security improvements. Score fluctuations are normal and can be
            influenced by various factors including new user additions, license changes, policy
            updates, and the introduction of new security features by Microsoft.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Factors Affecting Your Score</Text>
          <Text style={styles.infoText}>
            • Adding or removing users can temporarily impact scores as new accounts may lack
            certain security configurations{"\n"}• License changes may enable or disable security
            features, affecting available points{"\n"}• Microsoft regularly introduces new security
            controls, which can lower scores until implemented{"\n"}• Policy modifications and
            security control adjustments directly influence score calculations
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by CIPP - {currentDate}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* STATISTIC PAGE 3 - CHAPTER SPLITTER */}
      <Page size="A4" style={styles.statPage}>
        <Image style={styles.statBackground} src="/reportImages/working.jpg" />
        <View style={styles.statOverlay}>
          <Text style={styles.statMainText}>Every</Text>
          <Text style={styles.statHighlight}>39</Text>
          <Text style={styles.statMainText}>seconds</Text>
          <Text style={styles.statSubText}>
            a business falls victim to{"\n"}
            <Text style={{ fontWeight: "bold" }}>ransomware attacks</Text>
          </Text>
        </View>
        <Text style={styles.statFooterText}>
          <Text style={{ fontWeight: "bold" }}>Proactive defense</Text> beats{"\n"}
          <Text style={{ fontWeight: "bold" }}>reactive recovery</Text>
        </Text>
        <Text style={styles.statBrandFooter}>CYBERDRAIN SECURITY</Text>
      </Page>

      {/* LICENSING PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>License Management</Text>
          <Text style={styles.pageSubtitle}>
            Microsoft 365 license allocation and utilization analysis
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            Effective license management ensures optimal resource allocation while maintaining cost
            efficiency. This analysis provides insights into current license utilization patterns,
            helping identify opportunities for optimization and ensuring compliance with Microsoft
            licensing requirements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>License Allocation Summary</Text>

          <View style={styles.controlsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: 200 }]}>License Type</Text>
              <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>Used</Text>
              <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>Available</Text>
              <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>Total</Text>
            </View>

            {licensingData.map((license, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.cellName, { width: 200, fontSize: 7, marginLeft: 0 }]}>
                  {license.license}
                </Text>
                <Text
                  style={[
                    styles.cellName,
                    { width: 60, textAlign: "center", fontSize: 8, fontWeight: "bold" },
                  ]}
                >
                  {license.countUsed}
                </Text>
                <Text style={[styles.cellName, { width: 60, textAlign: "center", fontSize: 8 }]}>
                  {license.countAvailable}
                </Text>
                <Text
                  style={[
                    styles.cellName,
                    { width: 60, textAlign: "center", fontSize: 8, fontWeight: "bold" },
                  ]}
                >
                  {license.totalLicenses}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>License Optimization Recommendations</Text>

          <View style={styles.recommendationsList}>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Over-allocation:</Text> Microsoft Power
                Apps shows significant unused capacity (9,997 available)
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Capacity Planning:</Text> E5 Developer
                licenses are over-allocated (13 used vs 12 available)
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Cost Optimization:</Text> Review unused
                licenses for potential cost savings
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by CIPP - {currentDate}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* STATISTIC PAGE 4 - CHAPTER SPLITTER */}
      <Page size="A4" style={styles.statPage}>
        <Image style={styles.statBackground} src="/reportImages/laptop.jpg" />
        <View style={styles.statOverlay}>
          <Text style={styles.statHighlight}>$4.45M</Text>
          <Text style={styles.statSubText}>
            average cost of a{"\n"}
            <Text style={{ fontWeight: "bold" }}>data breach in 2024</Text>
          </Text>
        </View>
        <Text style={styles.statFooterText}>
          <Text style={{ fontWeight: "bold" }}>Investment in security</Text>
          {"\n"}
          saves <Text style={{ fontWeight: "bold" }}>millions in recovery</Text>
        </Text>
        <Text style={styles.statBrandFooter}>CYBERDRAIN SECURITY</Text>
      </Page>

      {/* DEVICES PAGE - Only show if device data is available */}
      {deviceData && deviceData.totalDevices > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Device Management</Text>
            <Text style={styles.pageSubtitle}>
              Device compliance status and management overview
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              Device management is critical for maintaining security and ensuring compliance across
              your organization. This analysis provides insights into device compliance status,
              identifies devices that may require attention, and highlights potential security risks
              from inactive devices.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Compliance Overview</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{deviceData.totalDevices}</Text>
                <Text style={styles.statLabel}>Total Devices</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{deviceData.compliantDevices}</Text>
                <Text style={styles.statLabel}>Compliant</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{deviceData.nonCompliantDevices}</Text>
                <Text style={styles.statLabel}>Non-Compliant</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {Math.round((deviceData.compliantDevices / deviceData.totalDevices) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Compliance Rate</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Devices Not Seen for 30+ Days</Text>

            <View style={styles.controlsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: 100 }]}>Device Name</Text>
                <Text style={[styles.headerCell, { width: 80 }]}>Last Seen</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>User</Text>
                <Text style={[styles.headerCell, { width: 80 }]}>OS</Text>
              </View>

              {deviceData.devicesNotSeen30Days.map((device, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.cellName, { width: 100, fontSize: 7, marginLeft: 0 }]}>
                    {device.deviceName}
                  </Text>
                  <Text style={[styles.cellName, { width: 80, fontSize: 7 }]}>
                    {device.lastSeen}
                  </Text>
                  <Text style={[styles.cellName, { flex: 1, fontSize: 7 }]}>{device.user}</Text>
                  <Text style={[styles.cellName, { width: 80, fontSize: 7 }]}>{device.os}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Device Security Recommendations</Text>
            <Text style={styles.infoText}>
              Devices not seen for 30+ days may pose security risks. Consider implementing automated
              device cleanup policies and regular device inventory reviews. Ensure all active
              devices meet compliance requirements and have current security updates installed.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Generated by CIPP - {currentDate}</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </Page>
      )}

      {/* STATISTIC PAGE 5 - CHAPTER SPLITTER */}
      <Page size="A4" style={styles.statPage}>
        <Image style={styles.statBackground} src="/reportImages/city.jpg" />
        <View style={styles.statOverlay}>
          <Text style={styles.statHighlight}>277</Text>
          <Text style={styles.statMainText}>days</Text>
          <Text style={styles.statSubText}>
            average time to identify and{"\n"}
            contain a <Text style={{ fontWeight: "bold" }}>data breach</Text>
          </Text>
        </View>
        <Text style={styles.statFooterText}>
          <Text style={{ fontWeight: "bold" }}>Early detection</Text> minimizes{"\n"}
          <Text style={{ fontWeight: "bold" }}>business impact</Text>
        </Text>
        <Text style={styles.statBrandFooter}>CYBERDRAIN SECURITY</Text>
      </Page>

      {/* CONDITIONAL ACCESS POLICIES PAGE - Only show if data is available */}
      {conditionalAccessPolicies && conditionalAccessPolicies.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Conditional Access Policies</Text>
            <Text style={styles.pageSubtitle}>
              Identity and access management security controls
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              Conditional Access policies are a powerful tool for implementing Zero Trust security
              principles. These policies evaluate signals from users, devices, locations, and
              applications to make real-time access decisions, ensuring that only authorized users
              can access your organization's resources under the right conditions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are Conditional Access Policies?</Text>
            <Text style={styles.bodyText}>
              Conditional Access policies act as if-then statements: if a user wants to access a
              resource, then they must complete an action. For example, if a user wants to access
              email, then they must complete multi-factor authentication. These policies help
              organizations balance security and productivity by applying the right access controls
              at the right time.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Policy Configuration</Text>

            <View style={styles.controlsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: 120 }]}>Policy Name</Text>
                <Text style={[styles.headerCell, { width: 60 }]}>State</Text>
                <Text style={[styles.headerCell, { width: 80 }]}>Users</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>Controls</Text>
              </View>

              {conditionalAccessPolicies.map((policy, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.cellName, { width: 120, fontSize: 7, marginLeft: 0 }]}>
                    {policy.name}
                  </Text>
                  <View style={[styles.cellStatus, { width: 60, marginLeft: 0 }]}>
                    <Text
                      style={[
                        styles.statusText,
                        policy.state === "Enabled" ? styles.statusCompliant : styles.statusPartial,
                      ]}
                    >
                      {policy.state}
                    </Text>
                  </View>
                  <Text style={[styles.cellName, { width: 80, fontSize: 7 }]}>{policy.users}</Text>
                  <Text style={[styles.cellName, { flex: 1, fontSize: 7 }]}>{policy.controls}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Policy Effectiveness</Text>

            <View style={styles.recommendationsList}>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>
                  <Text style={styles.recommendationLabel}>Legacy Authentication:</Text>{" "}
                  Successfully blocked across all users
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>
                  <Text style={styles.recommendationLabel}>Administrative Protection:</Text> MFA
                  enforced for all privileged accounts
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>
                  <Text style={styles.recommendationLabel}>Device Compliance:</Text> Compliant
                  devices required for Office 365 access
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>
                  <Text style={styles.recommendationLabel}>Risk-Based Access:</Text> High-risk
                  sign-ins automatically blocked
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Policy Optimization Recommendations</Text>
            <Text style={styles.infoText}>
              Consider enabling the "Require MFA for External Users" policy currently in report-only
              mode. Regularly review policy effectiveness through sign-in logs and consider
              implementing additional location-based restrictions for sensitive applications.
              Monitor policy impact to ensure business continuity while maintaining security
              standards.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Generated by CIPP - {currentDate}</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </Page>
      )}
    </Document>
  );
};

export const ExecutiveReportButton = (props) => {
  const { tenantName, tenantId, userStats, standardsData, organizationData, ...other } = props;

  const settings = useSettings();
  const brandingSettings = settings.customBranding;

  const fileName = `Executive_Report_${tenantName?.replace(/[^a-zA-Z0-9]/g, "_") || "Tenant"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  return (
    <PDFDownloadLink
      document={
        <ExecutiveReportDocument
          tenantName={tenantName}
          tenantId={tenantId}
          userStats={userStats}
          standardsData={standardsData}
          organizationData={organizationData}
          brandingSettings={brandingSettings}
        />
      }
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <Tooltip title="Generate Executive Report">
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            disabled={loading}
            sx={{
              backgroundColor: brandingSettings?.colour || "rgb(247, 127, 0)",
              "&:hover": {
                backgroundColor: brandingSettings?.colour
                  ? `${brandingSettings.colour}dd`
                  : "rgb(227, 107, 0)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                transform: "translateY(-1px)",
              },
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease-in-out",
            }}
            {...other}
          >
            {loading ? "Generating..." : "Executive Report"}
          </Button>
        </Tooltip>
      )}
    </PDFDownloadLink>
  );
};
