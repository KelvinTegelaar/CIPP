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
  Svg,
  Path,
  Circle,
  Line,
  Rect,
} from "@react-pdf/renderer";
import { useSettings } from "../hooks/use-settings";
import { useSecureScore } from "../hooks/use-securescore";
import { ApiGetCall } from "../api/ApiCall";

// PRODUCTION-GRADE PDF SYSTEM
const ExecutiveReportDocument = ({
  tenantName,
  userStats,
  brandingSettings,
  secureScoreData,
  licensingData,
  deviceData,
  conditionalAccessData,
  standardsCompareData,
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
      height: 100,
      marginRight: 12,
    },

    headerLogo: {
      height: 30,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      pageBreakAfter: "avoid",
      breakAfter: "avoid",
    },

    pageHeaderContent: {
      flex: 1,
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
      pageBreakInside: "avoid",
      breakInside: "avoid",
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: brandColor,
      marginBottom: 12,
      pageBreakAfter: "avoid",
      breakAfter: "avoid",
      orphans: 3,
      widows: 3,
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
      pageBreakInside: "avoid",
      breakInside: "avoid",
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
      pageBreakInside: "avoid",
      breakInside: "avoid",
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
      pageBreakInside: "avoid",
      breakInside: "avoid",
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
      pageBreakInside: "avoid",
      breakInside: "avoid",
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
      pageBreakInside: "avoid",
      breakInside: "avoid",
      orphans: 3,
      widows: 3,
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
      pageBreakInside: "avoid",
      breakInside: "avoid",
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

    // SVG CHART STYLES
    svgChartContainer: {
      alignItems: "center",
      marginVertical: 12,
    },

    svgChart: {
      width: 400,
      height: 200,
      marginBottom: 8,
    },

    chartSummaryText: {
      fontSize: 8,
      fontWeight: "bold",
      color: brandColor,
      textAlign: "center",
      marginTop: 8,
    },
  });

  // PROCESS REAL STANDARDS DATA
  const processStandardsData = (apiData) => {
    // Try to fetch standards data dynamically
    let standardsData = null;
    try {
      standardsData = require("../data/standards.json");
    } catch (error) {}

    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    const processedStandards = [];
    const tenantData = apiData[0]; // Get the first tenant's data

    // Process each standard from the API response
    Object.keys(tenantData).forEach((key) => {
      if (key.startsWith("standards.") && key !== "tenantFilter") {
        const standardKey = key;
        const standardValue = tenantData[key];
        const standardDef = standardsData?.find((std) => std.name === standardKey);

        if (standardDef) {
          // Determine compliance status
          let status = "Review";
          if (standardValue && typeof standardValue === "object" && standardValue.Value === true) {
            status = "Compliant";
          } else if (standardValue && standardValue.Value === true) {
            status = "Compliant";
          }
          // Get tags for display - fix the tags access
          const tags =
            standardDef.tag && Array.isArray(standardDef.tag) && standardDef.tag.length > 0
              ? standardDef.tag.slice(0, 2).join(", ") // Show first 2 tags
              : "No tags";
          processedStandards.push({
            name: standardDef.label,
            description:
              standardDef.executiveText || standardDef.helpText || "No description available",
            status: status,
            tags: tags,
          });
        } else {
          // If no definition found, still add it with basic info
          let status = "Review";
          if (standardValue && typeof standardValue === "object" && standardValue.Value === true) {
            status = "Compliant";
          } else if (standardValue && standardValue.Value === true) {
            status = "Compliant";
          }

          // Create a proper name from the key
          const displayName = standardKey
            .replace("standards.", "")
            .replace(/([A-Z])/g, " $1") // Add space before capital letters
            .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
            .trim();

          processedStandards.push({
            name: displayName,
            description: "Security standard implementation",
            status: status,
            tags: "No tags",
          });
        }
      }
    });

    return processedStandards;
  };

  let securityControls = processStandardsData(standardsCompareData);

  const getBadgeStyle = (status) => {
    switch (status) {
      case "Compliant":
        return [styles.statusText, styles.statusCompliant];
      case "Partial":
        return [styles.statusText, styles.statusPartial];
      case "Review":
      case "Review Required":
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
            {brandingSettings?.logo && (
              <Image style={styles.logo} src={brandingSettings.logo} cache={false} />
            )}
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
          </View>
        </View>

        <View style={styles.coverFooter}>
          <Text style={styles.confidential}>Confidential & Proprietary</Text>
        </View>
      </Page>

      {/* EXECUTIVE SUMMARY - MODULAR COMPOSITION (FROST) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Executive Summary</Text>
            <Text style={styles.pageSubtitle}>
              Strategic overview of your Microsoft 365 security posture
            </Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            This security assessment for{" "}
            <Text style={{ fontWeight: "bold" }}>{tenantName || "your organization"}</Text> provides
            a clear picture of your organization's cybersecurity posture and readiness against
            modern threats. We've evaluated your current security measures against industry best
            practices to identify strengths and opportunities for improvement.
          </Text>

          <Text style={styles.bodyText}>
            Our assessment follows globally recognized security standards to ensure your
            organization meets regulatory requirements and industry benchmarks. This approach helps
            protect your business assets, maintain customer trust, and reduce operational risks from
            cyber threats.
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
      </Page>

      {/* SECURITY CONTROLS - Only show if standards data is available */}
      {(() => {
        return securityControls && securityControls.length > 0;
      })() && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderContent}>
              <Text style={styles.pageTitle}>Security Standards Assessment</Text>
              <Text style={styles.pageSubtitle}>
                Detailed evaluation of implemented security standards
              </Text>
            </View>
            {brandingSettings?.logo && (
              <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              Your security standards have been carefully evaluated against industry best practices
              to protect your business from cyber threats while ensuring smooth daily operations.
              These standards help maintain business continuity, protect sensitive data, and meet
              regulatory requirements that are essential for your industry.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Standards Status</Text>

            <View style={styles.controlsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: 80 }]}>Standard</Text>
                <Text style={[styles.headerCell, { flex: 1, marginLeft: 8 }]}>Description</Text>
                <Text style={[styles.headerCell, { width: 80, marginLeft: 8 }]}>Tags</Text>
                <Text
                  style={[styles.headerCell, { width: 60, textAlign: "center", marginLeft: 8 }]}
                >
                  Status
                </Text>
              </View>

              {securityControls.map((control, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.cellName, { width: 80, marginLeft: 0 }]}>
                    {control.name}
                  </Text>
                  <Text style={[styles.cellDesc, { flex: 1, marginLeft: 8 }]}>
                    {control.description}
                  </Text>
                  <Text style={[styles.cellDesc, { width: 80, marginLeft: 8, fontSize: 6 }]}>
                    {(() => {
                      if (typeof control.tags === "object") {
                        console.log(
                          "DEBUG: control.tags is an object:",
                          control.tags,
                          "for control:",
                          control.name
                        );
                      }
                      return control.tags;
                    })()}
                  </Text>
                  <View style={[styles.cellStatus, { width: 60, marginLeft: 8 }]}>
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
                  <Text style={styles.recommendationLabel}>Immediate Actions:</Text> Address
                  standards marked as "Review" to enhance security posture
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>
                  <Text style={styles.recommendationLabel}>Compliance:</Text> Ensure all security
                  standards are properly implemented and maintained
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>
                  <Text style={styles.recommendationLabel}>Monitoring:</Text> Establish regular
                  review cycles for all security standards
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
      )}

      {/* STATISTIC PAGE 2 - CHAPTER SPLITTER - Only show if secure score data is available */}
      {secureScoreData && secureScoreData?.isSuccess && secureScoreData?.translatedData && (
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
        </Page>
      )}

      {/* MICROSOFT SECURE SCORE - DEDICATED PAGE - Only show if secure score data is available */}
      {secureScoreData && secureScoreData?.isSuccess && secureScoreData?.translatedData && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderContent}>
              <Text style={styles.pageTitle}>Microsoft Secure Score</Text>
              <Text style={styles.pageSubtitle}>
                Comprehensive security posture measurement and benchmarking
              </Text>
            </View>
            {brandingSettings?.logo && (
              <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              Microsoft Secure Score measures how well your organization is protected against cyber
              threats. This score reflects the effectiveness of your current security measures and
              helps identify areas where additional protection could strengthen your business
              resilience.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Comparison</Text>

            <View style={styles.scoreGrid}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreNumber}>
                  {secureScoreData?.translatedData?.currentScore || "N/A"}
                </Text>
                <Text style={styles.scoreLabel}>Current Score</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreNumber}>
                  {secureScoreData?.translatedData?.maxScore || "N/A"}
                </Text>
                <Text style={styles.scoreLabel}>Max Score</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreNumber}>
                  {secureScoreData?.translatedData?.percentageVsSimilar || "N/A"}%
                </Text>
                <Text style={styles.scoreLabel}>vs Similar Orgs</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreNumber}>
                  {secureScoreData?.translatedData?.percentageVsAllTenants || "N/A"}%
                </Text>
                <Text style={styles.scoreLabel}>vs All Orgs</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7-Day Score Trend</Text>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Secure Score Progress</Text>
              {secureScoreData?.secureScore?.data?.Results &&
              secureScoreData.secureScore.data.Results.length > 0 ? (
                <View style={styles.svgChartContainer}>
                  <Svg style={styles.svgChart} viewBox="0 0 400 200">
                    {/* Chart Background */}
                    <Rect
                      x="40"
                      y="20"
                      width="320"
                      height="140"
                      fill="#F7FAFC"
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />

                    {/* Chart Grid Lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Line
                        key={`grid-${i}`}
                        x1="40"
                        y1={20 + i * 35}
                        x2="360"
                        y2={20 + i * 35}
                        stroke="#E2E8F0"
                        strokeWidth="0.5"
                      />
                    ))}

                    {/* Chart Data Points and Area */}
                    {(() => {
                      const data = secureScoreData.secureScore.data.Results.slice().reverse();
                      const maxScore = secureScoreData?.translatedData?.maxScore || 100;
                      const minScore = 0; // Always start from 0
                      const scoreRange = maxScore; // Full range from 0 to max
                      const chartWidth = 320;
                      const chartHeight = 140;
                      const pointSpacing = chartWidth / Math.max(data.length - 1, 1);

                      // Generate path for area chart
                      let pathData = `M 40 ${
                        160 - (data[0].currentScore / scoreRange) * chartHeight
                      }`;
                      data.forEach((point, index) => {
                        if (index > 0) {
                          const x = 40 + index * pointSpacing;
                          const y = 160 - (point.currentScore / scoreRange) * chartHeight;
                          pathData += ` L ${x} ${y}`;
                        }
                      });
                      pathData += ` L ${40 + (data.length - 1) * pointSpacing} 160 L 40 160 Z`;

                      // Generate line path (without area fill)
                      let lineData = `M 40 ${
                        160 - (data[0].currentScore / scoreRange) * chartHeight
                      }`;
                      data.forEach((point, index) => {
                        if (index > 0) {
                          const x = 40 + index * pointSpacing;
                          const y = 160 - (point.currentScore / scoreRange) * chartHeight;
                          lineData += ` L ${x} ${y}`;
                        }
                      });

                      return (
                        <>
                          {/* Area Fill */}
                          <Path d={pathData} fill={brandColor} fillOpacity="0.3" />

                          {/* Line */}
                          <Path d={lineData} fill="none" stroke={brandColor} strokeWidth="2" />

                          {/* Data Points */}
                          {data.map((point, index) => {
                            const x = 40 + index * pointSpacing;
                            const y = 160 - (point.currentScore / scoreRange) * chartHeight;
                            return <Circle key={index} cx={x} cy={y} r="3" fill={brandColor} />;
                          })}

                          {/* X-axis Labels */}
                          {data.map((point, index) => {
                            const x = 40 + index * pointSpacing;
                            const date = new Date(point.createdDateTime);
                            const label = date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                            return (
                              <Text
                                key={`label-${index}`}
                                x={x}
                                y="180"
                                textAnchor="middle"
                                fontSize="8"
                                fill="#4A5568"
                              >
                                {label}
                              </Text>
                            );
                          })}

                          {/* Y-axis Labels */}
                          {[
                            0,
                            Math.round(maxScore * 0.25),
                            Math.round(maxScore * 0.5),
                            Math.round(maxScore * 0.75),
                            maxScore,
                          ].map((score, index) => (
                            <Text
                              key={`y-label-${index}`}
                              x="35"
                              y={165 - index * 35}
                              textAnchor="end"
                              fontSize="8"
                              fill="#4A5568"
                            >
                              {score}
                            </Text>
                          ))}
                        </>
                      );
                    })()}
                  </Svg>

                  <Text style={styles.chartSummaryText}>
                    Current: {secureScoreData?.translatedData?.currentScore || "N/A"} /{" "}
                    {secureScoreData?.translatedData?.maxScore || "N/A"}(
                    {secureScoreData?.translatedData?.percentageCurrent || "N/A"}%)
                  </Text>
                </View>
              ) : (
                <Text style={styles.chartData}>
                  Current Score: {secureScoreData?.translatedData?.currentScore || "N/A"} /{" "}
                  {secureScoreData?.translatedData?.maxScore || "N/A"}
                  {"\n"}
                  Achievement Rate: {secureScoreData?.translatedData?.percentageCurrent || "N/A"}%
                  {"\n"}
                  Historical data not available
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What Your Score Means</Text>
            <Text style={styles.infoText}>
              Your current score of {secureScoreData?.translatedData?.currentScore || "N/A"}{" "}
              represents {secureScoreData?.translatedData?.percentageCurrent || "N/A"}% of the
              maximum protection level available. This indicates how well your organization is
              currently defended against common cyber threats and data breaches.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why Scores Change</Text>
            <Text style={styles.infoText}>
              • Business growth and new employees may temporarily lower scores until security
              measures are applied{"\n"}• Changes in software licenses can affect available security
              features{"\n"}• New security threats require updated protections, which may impact
              scores{"\n"}• Regular security improvements help maintain and increase your protection
              level
            </Text>
          </View>

          <View style={styles.footer}>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </Page>
      )}

      {/* LICENSING PAGE - Only show if license data is available */}
      {licensingData && Array.isArray(licensingData) && licensingData.length > 0 && (
        <>
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
          </Page>
          <Page size="A4" style={styles.page}>
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderContent}>
                <Text style={styles.pageTitle}>License Management</Text>
                <Text style={styles.pageSubtitle}>
                  Microsoft 365 license allocation and utilization analysis
                </Text>
              </View>
              {brandingSettings?.logo && (
                <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.bodyText}>
                Smart license management helps control costs while ensuring your team has the tools
                they need to be productive. This analysis shows how your current licenses are being
                used and identifies opportunities to optimize spending without compromising business
                operations.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>License Allocation Summary</Text>

              <View style={styles.controlsTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { width: 200 }]}>License Type</Text>
                  <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>Used</Text>
                  <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>
                    Available
                  </Text>
                  <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>Total</Text>
                </View>

                {licensingData.map((license, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.cellName, { width: 200, fontSize: 7, marginLeft: 0 }]}>
                      {(() => {
                        const licenseValue = license.License || license.license || "N/A";
                        if (typeof licenseValue === "object") {
                          console.log(
                            "DEBUG: license name is an object:",
                            licenseValue,
                            "full license:",
                            license
                          );
                        }
                        return licenseValue;
                      })()}
                    </Text>
                    <Text
                      style={[
                        styles.cellName,
                        { width: 60, textAlign: "center", fontSize: 8, fontWeight: "bold" },
                      ]}
                    >
                      {(() => {
                        const countUsed = license.CountUsed || license.countUsed || "0";
                        if (typeof countUsed === "object") {
                          console.log(
                            "DEBUG: license.CountUsed is an object:",
                            countUsed,
                            "full license:",
                            license
                          );
                        }
                        return countUsed;
                      })()}
                    </Text>
                    <Text
                      style={[styles.cellName, { width: 60, textAlign: "center", fontSize: 8 }]}
                    >
                      {(() => {
                        const countAvailable =
                          license.CountAvailable || license.countAvailable || "0";
                        if (typeof countAvailable === "object") {
                          console.log(
                            "DEBUG: license.CountAvailable is an object:",
                            countAvailable,
                            "full license:",
                            license
                          );
                        }
                        return countAvailable;
                      })()}
                    </Text>
                    <Text
                      style={[
                        styles.cellName,
                        { width: 60, textAlign: "center", fontSize: 8, fontWeight: "bold" },
                      ]}
                    >
                      {(() => {
                        const totalLicenses = license.TotalLicenses || license.totalLicenses || "0";
                        if (typeof totalLicenses === "object") {
                          console.log(
                            "DEBUG: license.TotalLicenses is an object:",
                            totalLicenses,
                            "full license:",
                            license
                          );
                        }
                        return totalLicenses;
                      })()}
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
                    <Text style={styles.recommendationLabel}>Usage Monitoring:</Text> Track how
                    licenses are being used to identify cost-saving opportunities
                  </Text>
                </View>
                <View style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>
                    <Text style={styles.recommendationLabel}>Cost Control:</Text> Review unused
                    licenses to reduce unnecessary spending
                  </Text>
                </View>
                <View style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>
                    <Text style={styles.recommendationLabel}>Growth Planning:</Text> Ensure you have
                    enough licenses for business expansion without overspending
                  </Text>
                </View>
                <View style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>
                    <Text style={styles.recommendationLabel}>Regular Reviews:</Text> Conduct
                    quarterly reviews to maintain cost-effective license allocation
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
        </>
      )}

      {/* DEVICES PAGE - Only show if device data is available */}
      {deviceData && Array.isArray(deviceData) && deviceData.length > 0 && (
        <>
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
          </Page>
          <Page size="A4" style={styles.page}>
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderContent}>
                <Text style={styles.pageTitle}>Device Management</Text>
                <Text style={styles.pageSubtitle}>
                  Device compliance status and management overview
                </Text>
              </View>
              {brandingSettings?.logo && (
                <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.bodyText}>
                Managing employee devices is essential for protecting your business data and
                maintaining productivity. This analysis shows which devices meet your security
                standards and identifies any that may need attention to prevent data breaches or
                operational disruptions.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Compliance Overview</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{deviceData.length}</Text>
                  <Text style={styles.statLabel}>Total Devices</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {
                      deviceData.filter(
                        (device) =>
                          device.complianceState === "compliant" ||
                          device.ComplianceState === "compliant"
                      ).length
                    }
                  </Text>
                  <Text style={styles.statLabel}>Compliant</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {
                      deviceData.filter(
                        (device) =>
                          device.complianceState !== "compliant" &&
                          device.ComplianceState !== "compliant"
                      ).length
                    }
                  </Text>
                  <Text style={styles.statLabel}>Non-Compliant</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {Math.round(
                      (deviceData.filter(
                        (device) =>
                          device.complianceState === "Compliant" ||
                          device.ComplianceState === "Compliant"
                      ).length /
                        deviceData.length) *
                        100
                    )}
                    %
                  </Text>
                  <Text style={styles.statLabel}>Compliance Rate</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Management Summary</Text>

              <View style={styles.controlsTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { width: 120 }]}>Device Name</Text>
                  <Text style={[styles.headerCell, { width: 70 }]}>OS</Text>
                  <Text style={[styles.headerCell, { width: 70 }]}>Compliance</Text>
                  <Text style={[styles.headerCell, { flex: 1 }]}>Last Sync</Text>
                </View>

                {deviceData.slice(0, 8).map((device, index) => {
                  const lastSync = device.lastSyncDateTime
                    ? new Date(device.lastSyncDateTime).toLocaleDateString()
                    : "N/A";
                  return (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.cellName, { width: 120, fontSize: 7, marginLeft: 0 }]}>
                        {(() => {
                          const deviceName = device.deviceName || "N/A";
                          if (typeof deviceName === "object") {
                            console.log(
                              "DEBUG: device.deviceName is an object:",
                              deviceName,
                              "full device:",
                              device
                            );
                          }
                          return deviceName;
                        })()}
                      </Text>
                      <Text style={[styles.cellName, { width: 70, fontSize: 7 }]}>
                        {(() => {
                          const operatingSystem = device.operatingSystem || "N/A";
                          if (typeof operatingSystem === "object") {
                            console.log(
                              "DEBUG: device.operatingSystem is an object:",
                              operatingSystem,
                              "full device:",
                              device
                            );
                          }
                          return operatingSystem;
                        })()}
                      </Text>
                      <View style={[styles.cellStatus, { width: 70, marginLeft: 0 }]}>
                        <Text
                          style={[
                            styles.statusText,
                            device.complianceState === "compliant"
                              ? styles.statusCompliant
                              : styles.statusReview,
                          ]}
                        >
                          {(() => {
                            const complianceState = device.complianceState || "Unknown";
                            if (typeof complianceState === "object") {
                              console.log(
                                "DEBUG: device.complianceState is an object:",
                                complianceState,
                                "full device:",
                                device
                              );
                            }
                            return complianceState;
                          })()}
                        </Text>
                      </View>
                      <Text style={[styles.cellName, { flex: 1, fontSize: 7 }]}>{lastSync}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Insights</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {deviceData.filter((device) => device.operatingSystem === "Windows").length}
                  </Text>
                  <Text style={styles.statLabel}>Windows Devices</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {deviceData.filter((device) => device.operatingSystem === "iOS").length}
                  </Text>
                  <Text style={styles.statLabel}>iOS Devices</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {deviceData.filter((device) => device.operatingSystem === "Android").length}
                  </Text>
                  <Text style={styles.statLabel}>Android Devices</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {deviceData.filter((device) => device.isEncrypted === true).length}
                  </Text>
                  <Text style={styles.statLabel}>Encrypted</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Device Management Recommendations</Text>
              <Text style={styles.infoText}>
                Keep devices updated and secure to protect business data. Regularly check that all
                employee devices meet security standards and address any issues promptly. Consider
                automated policies to maintain consistent security across all devices and conduct
                regular reviews to identify potential risks.
              </Text>
            </View>

            <View style={styles.footer}>
              <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
              />
            </View>
          </Page>
        </>
      )}

      {/* CONDITIONAL ACCESS POLICIES PAGE - Only show if data is available */}
      {conditionalAccessData &&
        Array.isArray(conditionalAccessData) &&
        conditionalAccessData.length > 0 && (
          <>
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
            </Page>
            <Page size="A4" style={styles.page}>
              <View style={styles.pageHeader}>
                <View style={styles.pageHeaderContent}>
                  <Text style={styles.pageTitle}>Conditional Access Policies</Text>
                  <Text style={styles.pageSubtitle}>
                    Identity and access management security controls
                  </Text>
                </View>
                {brandingSettings?.logo && (
                  <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.bodyText}>
                  Access control policies help protect your business by ensuring only the right
                  people can access sensitive information under appropriate circumstances. These
                  smart security measures automatically evaluate each access request and apply
                  additional verification when needed, balancing security with employee
                  productivity.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How Access Controls Protect Your Business</Text>
                <Text style={styles.bodyText}>
                  These policies work like intelligent security guards, making decisions based on
                  who is trying to access what, from where, and when. For example, accessing email
                  from the office might be seamless, but accessing it from an unusual location might
                  require additional verification. This approach protects your data while minimizing
                  disruption to daily work.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Policy Configuration</Text>

                <View style={styles.controlsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { width: 140 }]}>Policy Name</Text>
                    <Text style={[styles.headerCell, { width: 80 }]}>State</Text>
                    <Text style={[styles.headerCell, { width: 80 }]}>Applications</Text>
                    <Text style={[styles.headerCell, { flex: 1 }]}>Controls</Text>
                  </View>

                  {conditionalAccessData.slice(0, 8).map((policy, index) => {
                    const getStateStyle = (state) => {
                      switch (state) {
                        case "enabled":
                          return styles.statusCompliant;
                        case "enabledForReportingButNotEnforced":
                          return styles.statusPartial;
                        case "disabled":
                          return styles.statusReview;
                        default:
                          return styles.statusText;
                      }
                    };

                    const getStateDisplay = (state) => {
                      switch (state) {
                        case "enabled":
                          return "Enabled";
                        case "enabledForReportingButNotEnforced":
                          return "Report Only";
                        case "disabled":
                          return "Disabled";
                        default:
                          return state || "Unknown";
                      }
                    };

                    const getControlsText = (policy) => {
                      const controls = [];
                      if (policy.builtInControls) {
                        if (policy.builtInControls.includes("mfa")) controls.push("MFA");
                        if (policy.builtInControls.includes("block")) controls.push("Block");
                        if (policy.builtInControls.includes("compliantDevice"))
                          controls.push("Compliant Device");
                      }
                      return controls.length > 0 ? controls.join(", ") : "Custom";
                    };

                    return (
                      <View key={index} style={styles.tableRow}>
                        <Text style={[styles.cellName, { width: 140, fontSize: 7, marginLeft: 0 }]}>
                          {(() => {
                            const displayName = policy.displayName || "N/A";
                            if (typeof displayName === "object") {
                              console.log(
                                "DEBUG: policy.displayName is an object:",
                                displayName,
                                "full policy:",
                                policy
                              );
                            }
                            return displayName;
                          })()}
                        </Text>
                        <View style={[styles.cellStatus, { width: 80, marginLeft: 0 }]}>
                          <Text style={[styles.statusText, getStateStyle(policy.state)]}>
                            {getStateDisplay(policy.state)}
                          </Text>
                        </View>
                        <Text style={[styles.cellName, { width: 80, fontSize: 7 }]}>
                          {(() => {
                            const includeApplications = policy.includeApplications || "All";
                            if (typeof includeApplications === "object") {
                              console.log(
                                "DEBUG: policy.includeApplications is an object:",
                                includeApplications,
                                "full policy:",
                                policy
                              );
                            }
                            return includeApplications;
                          })()}
                        </Text>
                        <Text style={[styles.cellName, { flex: 1, fontSize: 7 }]}>
                          {getControlsText(policy)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Policy Overview</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{conditionalAccessData.length}</Text>
                    <Text style={styles.statLabel}>Total Policies</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {conditionalAccessData.filter((policy) => policy.state === "enabled").length}
                    </Text>
                    <Text style={styles.statLabel}>Enabled</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {
                        conditionalAccessData.filter(
                          (policy) => policy.state === "enabledForReportingButNotEnforced"
                        ).length
                      }
                    </Text>
                    <Text style={styles.statLabel}>Report Only</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {
                        conditionalAccessData.filter(
                          (policy) =>
                            policy.builtInControls && policy.builtInControls.includes("mfa")
                        ).length
                      }
                    </Text>
                    <Text style={styles.statLabel}>MFA Policies</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Policy Analysis</Text>

                <View style={styles.recommendationsList}>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Policy Coverage:</Text>{" "}
                      {conditionalAccessData.length} conditional access policies configured
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Enforcement Status:</Text>{" "}
                      {conditionalAccessData.filter((policy) => policy.state === "enabled").length}{" "}
                      policies actively enforced
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Testing Phase:</Text>{" "}
                      {
                        conditionalAccessData.filter(
                          (policy) => policy.state === "enabledForReportingButNotEnforced"
                        ).length
                      }{" "}
                      policies in report-only mode
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Security Controls:</Text>{" "}
                      Multi-factor authentication and access blocking implemented
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Access Control Recommendations</Text>
                <Text style={styles.infoText}>
                  {conditionalAccessData.filter(
                    (policy) => policy.state === "enabledForReportingButNotEnforced"
                  ).length > 0
                    ? `Consider activating ${
                        conditionalAccessData.filter(
                          (policy) => policy.state === "enabledForReportingButNotEnforced"
                        ).length
                      } policies currently in testing mode after ensuring they don't disrupt business operations. `
                    : "Your access controls are properly configured. "}
                  Regularly review how these policies affect employee productivity and adjust as
                  needed. Consider additional location-based protections for enhanced security
                  without impacting daily operations.
                </Text>
              </View>

              <View style={styles.footer}>
                <Text
                  style={styles.pageNumber}
                  render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                />
              </View>
            </Page>
          </>
        )}
    </Document>
  );
};

export const ExecutiveReportButton = (props) => {
  const { tenantName, tenantId, userStats, standardsData, organizationData, ...other } = props;
  console.log(props);
  const settings = useSettings();
  const brandingSettings = settings.customBranding;

  // Get real secure score data
  const secureScore = useSecureScore();

  // Get real license data
  const licenseData = ApiGetCall({
    url: "/api/ListLicenses",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `licenses-report-${settings.currentTenant}`,
  });
  // Get real device data
  const deviceData = ApiGetCall({
    url: "/api/ListDevices",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `devices-report-${settings.currentTenant}`,
  });

  // Get real conditional access policy data
  const conditionalAccessData = ApiGetCall({
    url: "/api/ListConditionalAccessPolicies",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `ca-policies-report-${settings.currentTenant}`,
  });

  // Get real standards data
  const standardsCompareData = ApiGetCall({
    url: "/api/ListStandardsCompare",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `standards-compare-report-${settings.currentTenant}`,
  });

  // Check if all data is loaded (either successful or failed)
  const isDataLoading =
    secureScore.isFetching ||
    licenseData.isFetching ||
    deviceData.isFetching ||
    conditionalAccessData.isFetching ||
    standardsCompareData.isFetching;

  const hasAllDataFinished =
    (secureScore.isSuccess || secureScore.isError) &&
    (licenseData.isSuccess || licenseData.isError) &&
    (deviceData.isSuccess || deviceData.isError) &&
    (conditionalAccessData.isSuccess || conditionalAccessData.isError) &&
    (standardsCompareData.isSuccess || standardsCompareData.isError);

  // Show button when all data is finished loading (regardless of success/failure)
  const shouldShowButton = hasAllDataFinished && !isDataLoading;

  const fileName = `Executive_Report_${tenantName?.replace(/[^a-zA-Z0-9]/g, "_") || "Tenant"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Don't render the button if data is not ready
  if (!shouldShowButton) {
    return (
      <Tooltip title="Loading report data...">
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          disabled={true}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease-in-out",
          }}
          {...other}
        >
          Loading Data...
        </Button>
      </Tooltip>
    );
  }

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
          secureScoreData={secureScore.isSuccess ? secureScore : null}
          licensingData={licenseData.isSuccess ? licenseData?.data : null}
          deviceData={deviceData.isSuccess ? deviceData?.data : null}
          conditionalAccessData={
            conditionalAccessData.isSuccess ? conditionalAccessData?.data : null
          }
          standardsCompareData={standardsCompareData.isSuccess ? standardsCompareData?.data : null}
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
