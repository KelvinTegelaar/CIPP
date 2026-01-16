import { useState, useMemo } from "react";
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Paper,
  IconButton,
} from "@mui/material";
import { PictureAsPdf, Download, Close, Settings } from "@mui/icons-material";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
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

// PRODUCTION-GRADE PDF SYSTEM WITH CONDITIONAL RENDERING
const ExecutiveReportDocument = ({
  tenantName,
  userStats,
  brandingSettings,
  secureScoreData,
  licensingData,
  deviceData,
  conditionalAccessData,
  standardsCompareData,
  driftComplianceData,
  sectionConfig = {
    executiveSummary: true,
    securityStandards: true,
    driftCompliance: false,
    secureScore: true,
    licenseManagement: true,
    deviceManagement: true,
    conditionalAccess: true,
    infographics: true,
  },
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
      flex: 2,
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
      flex: 1,
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

  // PROCESS DRIFT COMPLIANCE DATA
  const processDriftComplianceData = (driftData, standardsCompareData) => {
    if (!driftData || !Array.isArray(driftData) || driftData.length === 0) {
      return {
        acceptedDeviationsCount: 0,
        currentDeviationsCount: 0,
        deniedDeviationsCount: 0,
        customerSpecificDeviationsCount: 0,
        alignedCount: 0,
        acceptedDeviations: [],
        currentDeviations: [],
        deniedDeviations: [],
        customerSpecificDeviations: [],
        appliedStandards: [],
      };
    }

    // Get standards data for pretty names
    let standardsData = null;
    try {
      standardsData = require("../data/standards.json");
    } catch (error) {}

    // Helper function to get pretty name from standards.json (same as manage-drift)
    const getStandardPrettyName = (standardName) => {
      if (!standardName) return "Unknown Standard";
      const standard = standardsData?.find((s) => s.name === standardName);
      if (standard && standard.label) {
        return standard.label;
      }
      return null;
    };

    // Helper function to process deviations with pretty names
    const processDeviations = (deviations) => {
      return (deviations || []).map((deviation) => ({
        ...deviation,
        prettyName:
          deviation.standardDisplayName ||
          getStandardPrettyName(deviation.standardName) ||
          deviation.standardName ||
          "Unknown Standard",
      }));
    };

    // Aggregate data across all standards for this tenant
    const aggregatedData = driftData.reduce(
      (acc, item) => {
        acc.acceptedDeviationsCount += item.acceptedDeviationsCount || 0;
        acc.currentDeviationsCount += item.currentDeviationsCount || 0;
        acc.alignedCount += item.alignedCount || 0;
        acc.customerSpecificDeviationsCount += item.customerSpecificDeviationsCount || 0;
        acc.deniedDeviationsCount += item.deniedDeviationsCount || 0;

        // Collect deviations with pretty names
        if (item.currentDeviations && Array.isArray(item.currentDeviations)) {
          acc.currentDeviations.push(
            ...processDeviations(item.currentDeviations.filter((dev) => dev !== null))
          );
        }
        if (item.acceptedDeviations && Array.isArray(item.acceptedDeviations)) {
          acc.acceptedDeviations.push(
            ...processDeviations(item.acceptedDeviations.filter((dev) => dev !== null))
          );
        }
        if (item.customerSpecificDeviations && Array.isArray(item.customerSpecificDeviations)) {
          acc.customerSpecificDeviations.push(
            ...processDeviations(item.customerSpecificDeviations.filter((dev) => dev !== null))
          );
        }
        if (item.deniedDeviations && Array.isArray(item.deniedDeviations)) {
          acc.deniedDeviations.push(
            ...processDeviations(item.deniedDeviations.filter((dev) => dev !== null))
          );
        }

        return acc;
      },
      {
        acceptedDeviationsCount: 0,
        currentDeviationsCount: 0,
        alignedCount: 0,
        customerSpecificDeviationsCount: 0,
        deniedDeviationsCount: 0,
        currentDeviations: [],
        acceptedDeviations: [],
        customerSpecificDeviations: [],
        deniedDeviations: [],
        appliedStandards: [],
      }
    );

    // Get complete list of applied standards from standards comparison data (like policies-deployed)
    if (
      standardsData &&
      standardsCompareData &&
      Array.isArray(standardsCompareData) &&
      standardsCompareData.length > 0
    ) {
      const tenantData = standardsCompareData[0];
      const appliedStandards = [];

      // Process each standard from the API response
      Object.keys(tenantData).forEach((key) => {
        if (key.startsWith("standards.") && key !== "tenantFilter") {
          const standardKey = key;
          const standardDef = standardsData.find((std) => std.name === standardKey);

          if (standardDef) {
            appliedStandards.push({
              name: standardDef.label || standardKey,
              executiveDescription:
                standardDef.executiveText || standardDef.helpText || "No description available",
              category: standardDef.cat || "General",
            });
          }
        }
      });

      aggregatedData.appliedStandards = appliedStandards;
    }

    return aggregatedData;
  };

  let securityControls = processStandardsData(standardsCompareData);
  let driftComplianceInfo = processDriftComplianceData(driftComplianceData, standardsCompareData);

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
      {sectionConfig.executiveSummary && (
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
              <Text style={{ fontWeight: "bold" }}>{tenantName || "your organization"}</Text>{" "}
              provides a clear picture of your organization's cybersecurity posture and readiness
              against modern threats. We've evaluated your current security measures against
              industry best practices to identify strengths and opportunities for improvement.
            </Text>

            <Text style={styles.bodyText}>
              Our assessment follows globally recognized security standards to ensure your
              organization meets regulatory requirements and industry benchmarks. This approach
              helps protect your business assets, maintain customer trust, and reduce operational
              risks from cyber threats.
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
      )}

      {/* STATISTIC PAGE 1 - CHAPTER SPLITTER */}
      {sectionConfig.infographics && (
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
      )}

      {/* SECURITY CONTROLS - Only show if standards data is available and enabled and drift compliance is disabled */}
      {sectionConfig.securityStandards &&
        !sectionConfig.driftCompliance &&
        (() => {
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
                Your security standards have been carefully evaluated against industry best
                practices to protect your business from cyber threats while ensuring smooth daily
                operations. These standards help maintain business continuity, protect sensitive
                data, and meet regulatory requirements that are essential for your industry.
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
                  <View key={index + 1} style={styles.tableRow}>
                    <Text style={[styles.cellName, { width: 80, marginLeft: 0 }]}>
                      {control.name.length > 100
                        ? control.name.substring(0, 100) + "..."
                        : control.name}
                    </Text>
                    <Text style={[styles.cellDesc, { flex: 1, marginLeft: 8 }]}>
                      {control.description}
                    </Text>
                    <Text style={[styles.cellDesc, { width: 80, marginLeft: 8 }]}>
                      {control.tags.length > 0 ? control.tags : "No tags"}
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

      {/* DRIFT COMPLIANCE - Only show if drift compliance is enabled and security standards is disabled */}
      {sectionConfig.driftCompliance &&
        !sectionConfig.securityStandards &&
        driftComplianceInfo &&
        (driftComplianceInfo.currentDeviationsCount > 0 ||
          driftComplianceInfo.acceptedDeviationsCount > 0 ||
          driftComplianceInfo.deniedDeviationsCount > 0 ||
          driftComplianceInfo.customerSpecificDeviationsCount > 0 ||
          driftComplianceInfo.appliedStandards.length > 0) && (
          <>
            <Page size="A4" style={styles.page}>
              <View style={styles.pageHeader}>
                <View style={styles.pageHeaderContent}>
                  <Text style={styles.pageTitle}>Drift Compliance Assessment</Text>
                  <Text style={styles.pageSubtitle}>
                    Detailed evaluation of policy drift and compliance deviations
                  </Text>
                </View>
                {brandingSettings?.logo && (
                  <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.bodyText}>
                  Your drift compliance assessment shows how your current security policies compare
                  to your organization's approved standards. This analysis helps identify where
                  configurations have drifted from intended baselines and provides insights into
                  policy compliance across your Microsoft 365 environment.
                </Text>
              </View>

              {/* Drift Overview Chart */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Drift Compliance Overview</Text>

                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Policy Deviation Distribution</Text>
                  <View style={styles.svgChartContainer}>
                    <Svg style={styles.svgChart} viewBox="0 0 400 200">
                      {(() => {
                        const chartData = [
                          driftComplianceInfo.alignedCount,
                          driftComplianceInfo.acceptedDeviationsCount,
                          driftComplianceInfo.customerSpecificDeviationsCount,
                          driftComplianceInfo.currentDeviationsCount,
                          driftComplianceInfo.deniedDeviationsCount,
                        ];
                        const chartLabels = [
                          "Aligned Policies",
                          "Accepted Deviations",
                          "Client Specific Deviations",
                          "Current Deviations",
                          "Denied Deviations",
                        ];
                        const chartColors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

                        const total = chartData.reduce((sum, value) => sum + value, 0);
                        if (total === 0) return null;

                        const centerX = 200;
                        const centerY = 100;
                        const outerRadius = 60;
                        const innerRadius = 25; // For donut effect

                        let currentAngle = 0;

                        return (
                          <>
                            {/* Donut Chart */}
                            {chartData.map((value, index) => {
                              if (value === 0) return null;

                              const angle = (value / total) * 360;
                              const startAngle = currentAngle;
                              const endAngle = currentAngle + angle;

                              // Outer arc points
                              const outerStartX =
                                centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180);
                              const outerStartY =
                                centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180);
                              const outerEndX =
                                centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180);
                              const outerEndY =
                                centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180);

                              // Inner arc points
                              const innerStartX =
                                centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
                              const innerStartY =
                                centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
                              const innerEndX =
                                centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
                              const innerEndY =
                                centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);

                              const largeArcFlag = angle > 180 ? 1 : 0;

                              // Create donut path
                              const pathData = [
                                `M ${outerStartX} ${outerStartY}`,
                                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
                                `L ${innerEndX} ${innerEndY}`,
                                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
                                "Z",
                              ].join(" ");

                              currentAngle += angle;

                              return (
                                <Path
                                  key={index}
                                  d={pathData}
                                  fill={chartColors[index]}
                                  stroke="#FFFFFF"
                                  strokeWidth="1"
                                />
                              );
                            })}

                            {/* Center text */}
                            <Text
                              x={centerX}
                              y={centerY - 5}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#2D3748"
                              fontWeight="bold"
                            >
                              {total}
                            </Text>
                            <Text
                              x={centerX}
                              y={centerY + 8}
                              textAnchor="middle"
                              fontSize="8"
                              fill="#4A5568"
                            >
                              Total Policies
                            </Text>

                            {/* Clean Horizontal Legend at Bottom */}
                            {(() => {
                              const visibleItems = chartData
                                .map((value, index) => ({
                                  value,
                                  index,
                                  label: chartLabels[index]
                                    .replace(" Deviations", "")
                                    .replace(" Policies", ""),
                                  color: chartColors[index],
                                }))
                                .filter((item) => item.value > 0);

                              return visibleItems.map((item, displayIndex) => {
                                const legendX = 30 + displayIndex * 90;
                                const legendY = 175;

                                return (
                                  <g key={`legend-${item.index}`}>
                                    <Rect
                                      x={legendX}
                                      y={legendY - 6}
                                      width="10"
                                      height="10"
                                      fill={item.color}
                                      rx="1"
                                    />
                                    <Text
                                      x={legendX + 15}
                                      y={legendY + 2}
                                      fontSize="8"
                                      fill="#2D3748"
                                    >
                                      {item.label} ({item.value})
                                    </Text>
                                  </g>
                                );
                              });
                            })()}
                          </>
                        );
                      })()}
                    </Svg>
                  </View>
                </View>
              </View>

              {/* Deviation Statistics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Deviation Statistics</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {driftComplianceInfo.acceptedDeviationsCount}
                    </Text>
                    <Text style={styles.statLabel}>Accepted Deviations</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {driftComplianceInfo.customerSpecificDeviationsCount}
                    </Text>
                    <Text style={styles.statLabel}>Client Specific</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {driftComplianceInfo.deniedDeviationsCount}
                    </Text>
                    <Text style={styles.statLabel}>Denied Deviations</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {driftComplianceInfo.currentDeviationsCount}
                    </Text>
                    <Text style={styles.statLabel}>Current Deviations</Text>
                  </View>
                </View>
              </View>

              {/* Chart Legend Explanations */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Deviation Types Explained</Text>

                <View style={styles.recommendationsList}>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Aligned:</Text> Policies that match
                      the approved template exactly with no deviations
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Accepted Deviations:</Text> Policy
                      differences that have been reviewed and approved by administrators
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Client Specific Deviations:</Text>{" "}
                      Policy configurations approved as customer-specific business requirements
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Current Deviations:</Text> Policy
                      differences that require review and administrative action
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>
                      <Text style={styles.recommendationLabel}>Denied Deviations:</Text> Policy
                      differences that have been rejected and require remediation
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

            {/* Deviations Detail Page */}
            {(driftComplianceInfo.currentDeviations.length > 0 ||
              driftComplianceInfo.acceptedDeviations.length > 0 ||
              driftComplianceInfo.deniedDeviations.length > 0 ||
              driftComplianceInfo.customerSpecificDeviations.length > 0) && (
              <Page size="A4" style={styles.page}>
                <View style={styles.pageHeader}>
                  <View style={styles.pageHeaderContent}>
                    <Text style={styles.pageTitle}>Policy Deviations Detail</Text>
                    <Text style={styles.pageSubtitle}>
                      Comprehensive list of all policy deviations and their status
                    </Text>
                  </View>
                  {brandingSettings?.logo && (
                    <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.bodyText}>
                    The following table shows all identified policy deviations, their current
                    status, and executive descriptions of what each deviation means for your
                    organization's security posture and compliance requirements.
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Policy Deviations</Text>

                  <View style={styles.controlsTable}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.headerCell, { width: 120 }]}>Policy</Text>
                      <Text style={[styles.headerCell, { flex: 1, marginLeft: 8 }]}>
                        Description
                      </Text>
                      <Text style={[styles.headerCell, { width: 80, marginLeft: 8 }]}>Status</Text>
                    </View>

                    {/* Current Deviations */}
                    {driftComplianceInfo.currentDeviations.slice(0, 5).map((deviation, index) => {
                      let standardsData = null;
                      try {
                        standardsData = require("../data/standards.json");
                      } catch (error) {}

                      const standardDef = standardsData?.find(
                        (std) => std.name === deviation.standardName
                      );
                      const description =
                        standardDef?.executiveText ||
                        standardDef?.helpText ||
                        "Policy deviation detected";

                      return (
                        <View key={`current-${index}`} style={styles.tableRow}>
                          <Text
                            style={[styles.cellName, { width: 120, fontSize: 7, marginLeft: 0 }]}
                          >
                            {deviation.prettyName || "Unknown Policy"}
                          </Text>
                          <Text style={[styles.cellDesc, { flex: 1, marginLeft: 8 }]}>
                            {description}
                          </Text>
                          <View style={[styles.cellStatus, { width: 80, marginLeft: 8 }]}>
                            <Text style={[styles.statusText, styles.statusReview]}>Current</Text>
                          </View>
                        </View>
                      );
                    })}

                    {/* Accepted Deviations */}
                    {driftComplianceInfo.acceptedDeviations.slice(0, 3).map((deviation, index) => {
                      let standardsData = null;
                      try {
                        standardsData = require("../data/standards.json");
                      } catch (error) {}

                      const standardDef = standardsData?.find(
                        (std) => std.name === deviation.standardName
                      );
                      const description =
                        standardDef?.executiveText ||
                        standardDef?.helpText ||
                        "Accepted policy deviation";

                      return (
                        <View key={`accepted-${index}`} style={styles.tableRow}>
                          <Text
                            style={[styles.cellName, { width: 120, fontSize: 7, marginLeft: 0 }]}
                          >
                            {deviation.prettyName || "Unknown Policy"}
                          </Text>
                          <Text style={[styles.cellDesc, { flex: 1, marginLeft: 8 }]}>
                            {description}
                          </Text>
                          <View style={[styles.cellStatus, { width: 80, marginLeft: 8 }]}>
                            <Text style={[styles.statusText, styles.statusCompliant]}>
                              Accepted
                            </Text>
                          </View>
                        </View>
                      );
                    })}

                    {/* Customer Specific Deviations */}
                    {driftComplianceInfo.customerSpecificDeviations
                      .slice(0, 3)
                      .map((deviation, index) => {
                        let standardsData = null;
                        try {
                          standardsData = require("../data/standards.json");
                        } catch (error) {}

                        const standardDef = standardsData?.find(
                          (std) => std.name === deviation.standardName
                        );
                        const description =
                          standardDef?.executiveText ||
                          standardDef?.helpText ||
                          "Customer-specific policy configuration";

                        return (
                          <View key={`customer-${index}`} style={styles.tableRow}>
                            <Text
                              style={[styles.cellName, { width: 120, fontSize: 7, marginLeft: 0 }]}
                            >
                              {deviation.prettyName || "Unknown Policy"}
                            </Text>
                            <Text style={[styles.cellDesc, { flex: 1, marginLeft: 8 }]}>
                              {description}
                            </Text>
                            <View style={[styles.cellStatus, { width: 80, marginLeft: 8 }]}>
                              <Text style={[styles.statusText, styles.statusPartial]}>
                                Client Specific
                              </Text>
                            </View>
                          </View>
                        );
                      })}

                    {/* Denied Deviations */}
                    {driftComplianceInfo.deniedDeviations.slice(0, 2).map((deviation, index) => {
                      let standardsData = null;
                      try {
                        standardsData = require("../data/standards.json");
                      } catch (error) {}

                      const standardDef = standardsData?.find(
                        (std) => std.name === deviation.standardName
                      );
                      const description =
                        standardDef?.executiveText ||
                        standardDef?.helpText ||
                        "Denied policy deviation";

                      return (
                        <View key={`denied-${index}`} style={styles.tableRow}>
                          <Text
                            style={[styles.cellName, { width: 120, fontSize: 7, marginLeft: 0 }]}
                          >
                            {deviation.prettyName || "Unknown Policy"}
                          </Text>
                          <Text style={[styles.cellDesc, { flex: 1, marginLeft: 8 }]}>
                            {description}
                          </Text>
                          <View style={[styles.cellStatus, { width: 80, marginLeft: 8 }]}>
                            <Text style={[styles.statusText, styles.statusReview]}>Denied</Text>
                          </View>
                        </View>
                      );
                    })}
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

            {/* Applied Standards Page */}
            {driftComplianceInfo.appliedStandards.length > 0 && (
              <Page size="A4" style={styles.page}>
                <View style={styles.pageHeader}>
                  <View style={styles.pageHeaderContent}>
                    <Text style={styles.pageTitle}>Applied Standards</Text>
                    <Text style={styles.pageSubtitle}>
                      Security standards currently implemented in your environment
                    </Text>
                  </View>
                  {brandingSettings?.logo && (
                    <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.bodyText}>
                    These are the security standards that have been applied to your Microsoft 365
                    environment. Each standard represents a specific security control or policy
                    designed to protect your organization's data and systems.
                  </Text>
                </View>

                {/* Group standards by category */}
                {(() => {
                  const groupedStandards = driftComplianceInfo.appliedStandards.reduce(
                    (acc, standard) => {
                      const category = standard.category || "General";
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(standard);
                      return acc;
                    },
                    {}
                  );

                  return Object.entries(groupedStandards).map(([category, standards]) => (
                    <View key={category} style={styles.section}>
                      <Text style={styles.sectionTitle}>{category}</Text>
                      <View style={styles.recommendationsList}>
                        {standards.map((standard, index) => (
                          <View key={index} style={styles.recommendationItem}>
                            <Text style={styles.recommendationBullet}>•</Text>
                            <Text style={styles.recommendationText}>
                              <Text style={styles.recommendationLabel}>{standard.name}:</Text>{" "}
                              {standard.executiveDescription}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ));
                })()}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Compliance Summary</Text>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Overall Compliance Status</Text>
                    <Text style={styles.infoText}>
                      Your organization has {driftComplianceInfo.appliedStandards.length} security
                      standards implemented with {driftComplianceInfo.alignedCount} policies fully
                      aligned,{" "}
                      {driftComplianceInfo.acceptedDeviationsCount +
                        driftComplianceInfo.customerSpecificDeviationsCount}{" "}
                      approved deviations, and {driftComplianceInfo.currentDeviationsCount}{" "}
                      deviations requiring attention.
                    </Text>
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
          </>
        )}

      {/* STATISTIC PAGE 2 - CHAPTER SPLITTER - Only show if secure score data is available and enabled */}
      {sectionConfig.infographics &&
        sectionConfig.secureScore &&
        secureScoreData &&
        secureScoreData?.isSuccess &&
        secureScoreData?.translatedData && (
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

      {/* MICROSOFT SECURE SCORE - DEDICATED PAGE - Only show if secure score data is available and enabled */}
      {sectionConfig.secureScore &&
        secureScoreData &&
        secureScoreData?.isSuccess &&
        secureScoreData?.translatedData && (
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
                Microsoft Secure Score measures how well your organization is protected against
                cyber threats. This score reflects the effectiveness of your current security
                measures and helps identify areas where additional protection could strengthen your
                business resilience.
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
                measures are applied{"\n"}• Changes in software licenses can affect available
                security features{"\n"}• New security threats require updated protections, which may
                impact scores{"\n"}• Regular security improvements help maintain and increase your
                protection level
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
      {sectionConfig.licenseManagement &&
        licensingData &&
        Array.isArray(licensingData) &&
        licensingData.length > 0 && (
          <>
            {/* STATISTIC PAGE 3 - CHAPTER SPLITTER */}
            {sectionConfig.infographics && (
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
            )}
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
                  Smart license management helps control costs while ensuring your team has the
                  tools they need to be productive. This analysis shows how your current licenses
                  are being used and identifies opportunities to optimize spending without
                  compromising business operations.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>License Allocation Summary</Text>

                <View style={styles.controlsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { width: 200 }]}>License Type</Text>
                    <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>
                      Used
                    </Text>
                    <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>
                      Available
                    </Text>
                    <Text style={[styles.headerCell, { width: 60, textAlign: "center" }]}>
                      Total
                    </Text>
                  </View>

                  {licensingData.map((license, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.cellName, { width: 200, fontSize: 7, marginLeft: 0 }]}>
                        {(() => {
                          const licenseValue = license.License || license.license || "N/A";
                          if (typeof licenseValue === "object") {
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
                          const totalLicenses =
                            license.TotalLicenses || license.totalLicenses || "0";
                          if (typeof totalLicenses === "object") {
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
                      <Text style={styles.recommendationLabel}>Growth Planning:</Text> Ensure you
                      have enough licenses for business expansion without overspending
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
      {sectionConfig.deviceManagement &&
        deviceData &&
        Array.isArray(deviceData) &&
        deviceData.length > 0 && (
          <>
            {/* STATISTIC PAGE 4 - CHAPTER SPLITTER */}
            {sectionConfig.infographics && (
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
            )}
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
                            }
                            return deviceName;
                          })()}
                        </Text>
                        <Text style={[styles.cellName, { width: 70, fontSize: 7 }]}>
                          {(() => {
                            const operatingSystem = device.operatingSystem || "N/A";
                            if (typeof operatingSystem === "object") {
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
      {sectionConfig.conditionalAccess &&
        conditionalAccessData &&
        Array.isArray(conditionalAccessData) &&
        conditionalAccessData.length > 0 && (
          <>
            {/* STATISTIC PAGE 5 - CHAPTER SPLITTER */}
            {sectionConfig.infographics && (
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
            )}
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
  const { ...other } = props;
  const settings = useSettings();
  const brandingSettings = settings.customBranding;

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sectionConfig, setSectionConfig] = useState({
    executiveSummary: true,
    securityStandards: true,
    driftCompliance: false,
    secureScore: true,
    licenseManagement: true,
    deviceManagement: true,
    conditionalAccess: true,
    infographics: true,
  });

  // Fetch organization data - only when preview is open
  const organization = ApiGetCall({
    url: "/api/ListOrg",
    queryKey: `${settings.currentTenant}-ListOrg-report`,
    data: { tenantFilter: settings.currentTenant },
    waiting: previewOpen,
  });

  // Fetch user counts - only when preview is open
  const dashboard = ApiGetCall({
    url: "/api/ListuserCounts",
    data: { tenantFilter: settings.currentTenant },
    queryKey: `${settings.currentTenant}-ListuserCounts-report`,
    waiting: previewOpen,
  });

  // Only fetch additional data when preview dialog is opened
  const secureScore = useSecureScore({ waiting: previewOpen });

  // Get real license data - only when preview is open
  const licenseData = ApiGetCall({
    url: "/api/ListLicenses",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `licenses-report-${settings.currentTenant}`,
    waiting: previewOpen,
  });

  // Get real device data - only when preview is open
  const deviceData = ApiGetCall({
    url: "/api/ListDevices",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `devices-report-${settings.currentTenant}`,
    waiting: previewOpen,
  });

  // Get real conditional access policy data - only when preview is open
  const conditionalAccessData = ApiGetCall({
    url: "/api/ListConditionalAccessPolicies",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `ca-policies-report-${settings.currentTenant}`,
    waiting: previewOpen,
  });

  // Get real standards data - only when preview is open
  const standardsCompareData = ApiGetCall({
    url: "/api/ListStandardsCompare",
    data: {
      tenantFilter: settings.currentTenant,
    },
    queryKey: `standards-compare-report-${settings.currentTenant}`,
    waiting: previewOpen,
  });

  // Get drift compliance data - only when preview is open
  const driftComplianceData = ApiGetCall({
    url: "/api/listTenantDrift",
    data: {
      TenantFilter: settings.currentTenant,
    },
    queryKey: `drift-compliance-report-${settings.currentTenant}`,
    waiting: previewOpen,
  });

  // Check if all data is loaded (either successful or failed) - only relevant when preview is open
  const isDataLoading =
    previewOpen &&
    (organization.isFetching ||
      dashboard.isFetching ||
      secureScore.isFetching ||
      licenseData.isFetching ||
      deviceData.isFetching ||
      conditionalAccessData.isFetching ||
      standardsCompareData.isFetching ||
      driftComplianceData.isFetching);

  const hasAllDataFinished =
    !previewOpen ||
    ((organization.isSuccess || organization.isError) &&
      (dashboard.isSuccess || dashboard.isError) &&
      (secureScore.isSuccess || secureScore.isError) &&
      (licenseData.isSuccess || licenseData.isError) &&
      (deviceData.isSuccess || deviceData.isError) &&
      (conditionalAccessData.isSuccess || conditionalAccessData.isError) &&
      (standardsCompareData.isSuccess || standardsCompareData.isError) &&
      (driftComplianceData.isSuccess || driftComplianceData.isError));

  // Button is always available now since we don't need to wait for data
  const shouldShowButton = true;

  const tenantName = organization.data?.displayName || "Tenant";
  const tenantId = organization.data?.id;
  const userStats = {
    licensedUsers: dashboard.data?.LicUsers || 0,
    unlicensedUsers:
      dashboard.data?.Users && dashboard.data?.LicUsers
        ? dashboard.data?.Users - dashboard.data?.LicUsers
        : 0,
    guests: dashboard.data?.Guests || 0,
    globalAdmins: dashboard.data?.Gas || 0,
  };

  const fileName = `Executive_Report_${tenantName?.replace(/[^a-zA-Z0-9]/g, "_") || "Tenant"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Memoize the document to prevent unnecessary re-renders - only when dialog is open
  const reportDocument = useMemo(() => {
    // Don't create document if dialog is closed
    if (!previewOpen) {
      return null;
    }

    // Only create document if preview is open and data is ready
    if (!hasAllDataFinished) {
      return (
        <Document>
          <Page size="A4" style={{ padding: 40, fontFamily: "Helvetica" }}>
            <Text style={{ fontSize: 14, textAlign: "center", marginTop: 100 }}>
              Loading report data...
            </Text>
          </Page>
        </Document>
      );
    }

    try {
      return (
        <ExecutiveReportDocument
          tenantName={tenantName}
          tenantId={tenantId}
          userStats={userStats}
          standardsData={driftComplianceData.data}
          organizationData={organization.data}
          brandingSettings={brandingSettings}
          secureScoreData={secureScore.isSuccess ? secureScore : null}
          licensingData={licenseData.isSuccess ? licenseData?.data : null}
          deviceData={deviceData.isSuccess ? deviceData?.data : null}
          conditionalAccessData={
            conditionalAccessData.isSuccess ? conditionalAccessData?.data?.Results : null
          }
          standardsCompareData={standardsCompareData.isSuccess ? standardsCompareData?.data : null}
          driftComplianceData={driftComplianceData.isSuccess ? driftComplianceData?.data : null}
          sectionConfig={sectionConfig}
        />
      );
    } catch (error) {
      console.error("Error creating ExecutiveReportDocument:", error);
      return (
        <Document>
          <Page size="A4" style={{ padding: 40, fontFamily: "Helvetica" }}>
            <Text style={{ fontSize: 14, color: "red" }}>
              Error creating document: {error.message}
            </Text>
          </Page>
        </Document>
      );
    }
  }, [
    previewOpen, // Most important - prevents creation when dialog is closed
    hasAllDataFinished,
    tenantName,
    tenantId,
    userStats,
    organization.data,
    dashboard.data,
    brandingSettings,
    secureScore?.isSuccess,
    licenseData?.isSuccess,
    deviceData?.isSuccess,
    conditionalAccessData?.isSuccess,
    standardsCompareData?.isSuccess,
    driftComplianceData?.isSuccess,
    JSON.stringify(sectionConfig), // Stringify to prevent reference issues
  ]);

  // Handle section toggle with mutual exclusion logic
  const handleSectionToggle = (sectionKey) => {
    setSectionConfig((prev) => {
      // Count currently enabled sections
      const enabledSections = Object.values(prev).filter(Boolean).length;

      // If trying to disable the last remaining section, prevent it
      if (prev[sectionKey] && enabledSections === 1) {
        return prev; // Don't change state
      }

      // Mutual exclusion logic for Security Standards and Drift Compliance
      if (sectionKey === "securityStandards" && !prev[sectionKey]) {
        // Enabling Security Standards, disable Drift Compliance
        return {
          ...prev,
          securityStandards: true,
          driftCompliance: false,
        };
      }

      if (sectionKey === "driftCompliance" && !prev[sectionKey]) {
        // Enabling Drift Compliance, disable Security Standards
        return {
          ...prev,
          driftCompliance: true,
          securityStandards: false,
        };
      }

      return {
        ...prev,
        [sectionKey]: !prev[sectionKey],
      };
    });
  };

  // Close handler with cleanup
  const handleClose = () => {
    setPreviewOpen(false);
  };

  // Section configuration options
  const sectionOptions = [
    {
      key: "executiveSummary",
      label: "Executive Summary",
      description: "High-level overview and statistics",
    },
    {
      key: "securityStandards",
      label: "Security Standards",
      description: "Compliance assessment and standards evaluation",
    },
    {
      key: "driftCompliance",
      label: "Drift Compliance",
      description: "Policy drift analysis and deviation management",
    },
    {
      key: "secureScore",
      label: "Microsoft Secure Score",
      description: "Security posture measurement and trends",
    },
    {
      key: "licenseManagement",
      label: "License Management",
      description: "License allocation and optimization",
    },
    {
      key: "deviceManagement",
      label: "Device Management",
      description: "Device compliance and insights",
    },
    {
      key: "conditionalAccess",
      label: "Conditional Access",
      description: "Access control policies and analysis",
    },
    {
      key: "infographics",
      label: "Infographic Pages",
      description: "Statistical pages with visual elements between sections",
    },
  ];

  return (
    <>
      {/* Main Executive Summary Button - Always available */}
      <Tooltip title="Generate Executive Report with preview and configuration">
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={() => setPreviewOpen(true)}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease-in-out",
          }}
          {...other}
        >
          Executive Summary
        </Button>
      </Tooltip>

      {/* Combined Preview and Configuration Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            height: "95vh",
            maxHeight: "95vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" component="div">
            Executive Report - {tenantName}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: "100%", display: "flex" }}>
          {/* Left Panel - Section Configuration */}
          <Paper
            sx={{
              width: 320,
              flexShrink: 0,
              borderRadius: 0,
              borderRight: "1px solid",
              borderColor: "divider",
              height: "100%",
              overflow: "auto",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Settings size={20} />
                Report Sections
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure which sections to include in your executive report. Changes are reflected
                in real-time.
              </Typography>

              <Grid container spacing={1.5}>
                {sectionOptions.map((option) => (
                  <Grid item xs={12} key={option.key}>
                    <Paper
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: sectionConfig[option.key] ? "primary.main" : "divider",
                        bgcolor: sectionConfig[option.key] ? "primary.50" : "background.paper",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: sectionConfig[option.key] ? "primary.100" : "primary.25",
                        },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={sectionConfig[option.key]}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleSectionToggle(option.key);
                            }}
                            color="primary"
                            size="small"
                            disabled={
                              // Disable if this is the last enabled section
                              sectionConfig[option.key] &&
                              Object.values(sectionConfig).filter(Boolean).length === 1
                            }
                          />
                        }
                        label={
                          <Box onClick={() => handleSectionToggle(option.key)}>
                            <Typography
                              variant="subtitle2"
                              fontWeight="bold"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {option.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {option.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ margin: 0, width: "100%" }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: "primary.50", borderRadius: 1 }}>
                <Typography variant="caption" color="primary.main" fontWeight="bold">
                  💡 Pro Tip
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Enable only the sections relevant to your audience to create focused, impactful
                  reports. At least one section must be enabled.
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Right Panel - PDF Preview */}
          <Box sx={{ flex: 1, height: "100%" }}>
            {isDataLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 2,
                }}
              >
                <Typography variant="h6">Loading Report Data...</Typography>
                <Typography variant="body2" color="text.secondary">
                  Fetching additional data for comprehensive report generation
                </Typography>
              </Box>
            ) : reportDocument ? (
              <PDFViewer
                key={`pdf-viewer-${Date.now()}`} // Fix for react-pdf "Eo is not a function" error
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                showToolbar={true}
              >
                {reportDocument}
              </PDFViewer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Report preview will appear here
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Sections enabled: {Object.values(sectionConfig).filter(Boolean).length} of{" "}
              {sectionOptions.length}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Download />}
            disabled={isDataLoading}
            sx={{ minWidth: 140 }}
            onClick={() => {
              // Create document dynamically when download is clicked
              const downloadDocument = (
                <ExecutiveReportDocument
                  tenantName={tenantName}
                  tenantId={tenantId}
                  userStats={userStats}
                  standardsData={driftComplianceData.data}
                  organizationData={organization.data}
                  brandingSettings={brandingSettings}
                  secureScoreData={secureScore.isSuccess ? secureScore : null}
                  licensingData={licenseData.isSuccess ? licenseData?.data : null}
                  deviceData={deviceData.isSuccess ? deviceData?.data : null}
                  conditionalAccessData={
                    conditionalAccessData.isSuccess ? conditionalAccessData?.data?.Results : null
                  }
                  standardsCompareData={
                    standardsCompareData.isSuccess ? standardsCompareData?.data : null
                  }
                  driftComplianceData={
                    driftComplianceData.isSuccess ? driftComplianceData?.data : null
                  }
                  sectionConfig={sectionConfig}
                />
              );

              // Use react-pdf's pdf() function to generate and download
              import("@react-pdf/renderer").then(({ pdf }) => {
                pdf(downloadDocument)
                  .toBlob()
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  })
                  .catch((error) => {
                    console.error("Error generating PDF:", error);
                  });
              });
            }}
          >
            {isDataLoading ? "Loading..." : "Download PDF"}
          </Button>

          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
