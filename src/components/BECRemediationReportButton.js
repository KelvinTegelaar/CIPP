import { useState } from "react";
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { PictureAsPdf, Download, Close } from "@mui/icons-material";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { useSettings } from "../hooks/use-settings";

// BEC Remediation PDF Document Component
const BECRemediationReportDocument = ({
  userData,
  becData,
  brandingSettings,
  tenantName,
  remediationData,
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const brandColor = brandingSettings?.colour || "#F77F00";

  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.4,
      color: "#2D3748",
      padding: 40,
    },

    // COVER PAGE
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

    dateStamp: {
      fontSize: 9,
      color: "#000000",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

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

    userCard: {
      backgroundColor: "transparent",
      padding: 0,
      maxWidth: 500,
    },

    userName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#000000",
      marginBottom: 8,
    },

    userEmail: {
      fontSize: 12,
      color: "#333333",
      marginBottom: 4,
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

    // CONTENT PAGES
    pageHeader: {
      borderBottom: `1px solid ${brandColor}`,
      paddingBottom: 12,
      marginBottom: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
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
    },

    sectionSubtitle: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#2D3748",
      marginBottom: 8,
      marginTop: 12,
    },

    bodyText: {
      fontSize: 9,
      color: "#2D3748",
      lineHeight: 1.5,
      marginBottom: 12,
      textAlign: "justify",
    },

    bulletList: {
      marginLeft: 12,
      marginBottom: 12,
    },

    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    },

    bulletPoint: {
      fontSize: 8,
      color: brandColor,
      marginRight: 6,
      fontWeight: "bold",
      marginTop: 1,
    },

    bulletText: {
      fontSize: 9,
      color: "#2D3748",
      lineHeight: 1.4,
      flex: 1,
    },

    // ALERT BOXES
    alertBox: {
      backgroundColor: "#FFF5F5",
      border: `2px solid ${brandColor}`,
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
    },

    alertTitle: {
      fontSize: 11,
      fontWeight: "bold",
      color: brandColor,
      marginBottom: 6,
    },

    alertText: {
      fontSize: 9,
      color: "#2D3748",
      lineHeight: 1.4,
    },

    // INFO BOXES
    infoBox: {
      backgroundColor: "#F7FAFC",
      border: `1px solid #E2E8F0`,
      borderLeft: `4px solid ${brandColor}`,
      borderRadius: 4,
      padding: 12,
      marginBottom: 12,
    },

    infoTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#2D3748",
      marginBottom: 6,
    },

    infoText: {
      fontSize: 8,
      color: "#4A5568",
      lineHeight: 1.4,
    },

    // STATS GRID
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
      fontSize: 20,
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

    // TABLES
    table: {
      border: `1px solid #E2E8F0`,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 16,
    },

    tableHeader: {
      flexDirection: "row",
      backgroundColor: brandColor,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    tableHeaderCell: {
      fontSize: 7,
      fontWeight: "bold",
      color: "#FFFFFF",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#F7FAFC",
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: "flex-start",
    },

    tableCell: {
      fontSize: 8,
      color: "#2D3748",
      lineHeight: 1.3,
    },

    // FOOTER
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

    // STATUS INDICATORS
    statusBadge: {
      fontSize: 7,
      fontWeight: "bold",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },

    statusSuccess: {
      backgroundColor: "#C6F6D5",
      color: "#22543D",
    },

    statusWarning: {
      backgroundColor: "#FEEBC8",
      color: "#744210",
    },

    statusDanger: {
      backgroundColor: "#FED7D7",
      color: "#742A2A",
    },

    statusInfo: {
      backgroundColor: "#BEE3F8",
      color: "#2C5282",
    },
  });

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Calculate statistics
  const stats = {
    newRules: becData?.NewRules?.length || 0,
    newUsers: becData?.NewUsers?.length || 0,
    newApps: becData?.AddedApps?.length || 0,
    permissionChanges: becData?.MailboxPermissionChanges?.length || 0,
    mfaDevices: becData?.MFADevices?.length || 0,
    passwordChanges: becData?.ChangedPasswords?.length || 0,
  };

  // Determine threat level
  const calculateThreatLevel = () => {
    let threatScore = 0;
    if (stats.newRules > 0) threatScore += 3;
    if (stats.permissionChanges > 0) threatScore += 2;
    if (stats.newApps > 0) threatScore += 2;
    if (stats.newUsers > 5) threatScore += 1;

    // Check for suspicious rules (RSS folder moves)
    const hasSuspiciousRules = becData?.NewRules?.some((rule) =>
      rule.MoveToFolder?.includes("RSS"),
    );
    if (hasSuspiciousRules) threatScore += 5;

    if (threatScore >= 7) return { level: "High", color: "#742A2A" };
    if (threatScore >= 4) return { level: "Medium", color: "#744210" };
    return { level: "Low", color: "#22543D" };
  };

  const threatLevel = calculateThreatLevel();

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          <View style={styles.logoSection}>
            {brandingSettings?.logo && (
              <Image style={styles.logo} src={brandingSettings.logo} cache={false} />
            )}
          </View>
          <Text style={styles.dateStamp}>{currentDate}</Text>
        </View>

        <View style={styles.coverHero}>
          <Text style={styles.coverLabel}>SECURITY INCIDENT REPORT</Text>

          <Text style={styles.mainTitle}>
            BEC Compromise{"\n"}
            <Text style={styles.titleAccent}>Analysis</Text>
          </Text>

          <Text style={styles.subtitle}>
            Business Email Compromise Investigation Report for {tenantName || "your organization"}
          </Text>

          <View style={styles.userCard}>
            <Text style={styles.userName}>{userData?.displayName || "Unknown User"}</Text>
            <Text style={styles.userEmail}>{userData?.userPrincipalName || "user@domain.com"}</Text>
            <Text style={[styles.dateStamp, { marginTop: 8 }]}>
              Analysis Date: {becData?.ExtractedAt ? formatDate(becData.ExtractedAt) : "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.coverFooter}>
          <Text style={styles.confidential}>
            Confidential & Proprietary - For Internal Use Only
          </Text>
        </View>
      </Page>

      {/* EXECUTIVE SUMMARY PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Executive Summary</Text>
            <Text style={styles.pageSubtitle}>
              Overview of Business Email Compromise investigation findings
            </Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.bodyText}>
            This report documents the findings of a Business Email Compromise (BEC) investigation
            performed for the user account{" "}
            <Text style={{ fontWeight: "bold" }}>{userData?.userPrincipalName}</Text> within{" "}
            <Text style={{ fontWeight: "bold" }}>{tenantName}</Text>. The investigation analyzed
            suspicious activity indicators including mailbox rules, permission changes, new
            applications, and authentication patterns over a 7-day period.
          </Text>

          <Text style={styles.bodyText}>
            Business Email Compromise is a sophisticated scam targeting organizations that regularly
            perform wire transfers or have established relationships with foreign suppliers.
            Attackers compromise legitimate email accounts through social engineering or computer
            intrusion techniques to conduct unauthorized fund transfers, steal sensitive
            information, or impersonate executives.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investigation Overview</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.newRules}</Text>
              <Text style={styles.statLabel}>Mailbox Rules</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.permissionChanges}</Text>
              <Text style={styles.statLabel}>Permission Changes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.newApps}</Text>
              <Text style={styles.statLabel}>New Applications</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.newUsers}</Text>
              <Text style={styles.statLabel}>New Users</Text>
            </View>
          </View>

          <View style={[styles.alertBox, { borderColor: threatLevel.color }]}>
            <Text style={[styles.alertTitle, { color: threatLevel.color }]}>
              Threat Assessment: {threatLevel.level}
            </Text>
            <Text style={styles.alertText}>
              {threatLevel.level === "High" &&
                "HIGH RISK: Multiple indicators of compromise detected. Immediate remediation actions are strongly recommended. This account shows patterns consistent with active Business Email Compromise attacks."}
              {threatLevel.level === "Medium" &&
                "MEDIUM RISK: Suspicious activity patterns detected. Review findings and consider implementing recommended security measures. Some indicators suggest potential unauthorized access."}
              {threatLevel.level === "Low" &&
                "LOW RISK: Minimal suspicious activity detected. The findings show standard user behavior with no significant indicators of compromise. Continue monitoring as a precautionary measure."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Source Information</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Audit Log Status</Text>
            <Text style={styles.infoText}>{becData?.ExtractResult || "Unknown"}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Analysis Period</Text>
            <Text style={styles.infoText}>
              Last 7 days ending {becData?.ExtractedAt ? formatDate(becData.ExtractedAt) : "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {tenantName} - BEC Analysis Report for {userData?.displayName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* UNDERSTANDING BEC PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Understanding Business Email Compromise</Text>
            <Text style={styles.pageSubtitle}>What is BEC and why does it matter?</Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is Business Email Compromise?</Text>
          <Text style={styles.bodyText}>
            Business Email Compromise (BEC) is a type of cyberattack where criminals gain
            unauthorized access to a business email account. Once inside, attackers can:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Monitor communications:</Text> Read sensitive
                emails to learn about business operations, financial processes, and key
                relationships.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Impersonate executives:</Text> Send fraudulent
                emails appearing to come from company leadership requesting wire transfers or
                sensitive data.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Manipulate transactions:</Text> Intercept
                legitimate invoices and alter payment information to redirect funds to
                attacker-controlled accounts.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Hide their tracks:</Text> Create email rules to
                automatically delete or hide messages, preventing detection.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Attack Methods</Text>
          <Text style={styles.bodyText}>
            Attackers typically gain access to email accounts through:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Phishing:</Text> Deceptive emails that trick
                users into providing their login credentials on fake websites.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Password Spraying:</Text> Automated attempts to
                log in using common passwords across many accounts.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Credential Stuffing:</Text> Using usernames and
                passwords leaked from other breached websites.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Malware:</Text> Software that captures
                keystrokes or steals stored passwords from compromised devices.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why This Investigation Was Performed</Text>
          <Text style={styles.bodyText}>
            This analysis was initiated because suspicious activity was detected or reported for
            this user account. The investigation examines multiple indicators that might suggest
            account compromise, including unusual mailbox rules, unexpected permission changes, new
            application authorizations, and abnormal sign-in patterns. Early detection is critical
            to minimize potential damage and prevent financial loss or data theft.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {tenantName} - BEC Analysis Report for {userData?.displayName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* DETAILED FINDINGS PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Detailed Findings</Text>
            <Text style={styles.pageSubtitle}>Investigation results and analysis</Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        {/* Check 1: Mailbox Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check 1: Mailbox Rules</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why We Check This</Text>
            <Text style={styles.infoText}>
              Attackers often create email rules to automatically forward, delete, or hide messages.
              This prevents victims from seeing evidence of fraudulent activity. Suspicious rules
              may move emails to obscure folders like "RSS Subscriptions" or forward them to
              external addresses.
            </Text>
          </View>

          {stats.newRules > 0 ? (
            <>
              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>⚠ {stats.newRules} Mailbox Rule(s) Found</Text>
                <Text style={styles.alertText}>
                  The following mailbox rules were detected. Review each rule carefully to determine
                  if it was created by the user or by an attacker. Rules that forward emails or move
                  them to unusual folders are particularly suspicious.
                </Text>
              </View>

              {becData.NewRules.slice(0, 10).map((rule, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Rule: {rule.Name || "Unnamed Rule"}</Text>
                  <Text style={styles.infoText}>
                    Description: {rule.Description || "No description available"}
                    {"\n"}
                    {rule.MoveToFolder && `Moves to: ${rule.MoveToFolder}`}
                    {rule.ForwardTo && `\nForwards to: ${rule.ForwardTo}`}
                    {rule.DeleteMessage && "\nDeletes messages"}
                  </Text>
                </View>
              ))}
              {becData.NewRules.length > 10 && (
                <Text style={[styles.infoText, { marginLeft: 12, fontStyle: "italic" }]}>
                  ... and {becData.NewRules.length - 10} more rules (see JSON export for full list)
                </Text>
              )}
            </>
          ) : (
            <View style={[styles.infoBox, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[styles.infoTitle, { color: "#22543D" }]}>
                ✓ No Suspicious Rules Found
              </Text>
              <Text style={styles.infoText}>
                No mailbox rules were detected that match suspicious patterns. This is a positive
                indicator.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {tenantName} - BEC Analysis Report for {userData?.displayName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* CHECK 2: NEW USERS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Detailed Findings (Continued)</Text>
            <Text style={styles.pageSubtitle}>Investigation results and analysis</Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check 2: Recently Created Users</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why We Check This</Text>
            <Text style={styles.infoText}>
              Attackers sometimes create new user accounts to maintain persistent access or to use
              as staging accounts for fraudulent activities. Reviewing recently created users helps
              identify unauthorized account creation.
            </Text>
          </View>

          {stats.newUsers > 0 ? (
            <>
              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>ℹ {stats.newUsers} New User(s) Found</Text>
                <Text style={styles.alertText}>
                  The following users were created in the last 7 days. Verify that each account
                  creation was authorized and legitimate.
                </Text>
              </View>

              {becData.NewUsers.slice(0, 8).map((user, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoTitle}>{user.displayName || "Unknown"}</Text>
                  <Text style={styles.infoText}>
                    Email: {user.userPrincipalName || "N/A"}
                    {"\n"}
                    Created: {formatDate(user.createdDateTime)}
                  </Text>
                </View>
              ))}
              {becData.NewUsers.length > 8 && (
                <Text style={[styles.infoText, { marginLeft: 12, fontStyle: "italic" }]}>
                  ... and {becData.NewUsers.length - 8} more users (see JSON export for full list)
                </Text>
              )}
            </>
          ) : (
            <View style={[styles.infoBox, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[styles.infoTitle, { color: "#22543D" }]}>✓ No New Users Found</Text>
              <Text style={styles.infoText}>
                No new user accounts were created during the analysis period.
              </Text>
            </View>
          )}
        </View>

        {/* Check 3: New Applications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check 3: New Applications</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why We Check This</Text>
            <Text style={styles.infoText}>
              Attackers may authorize malicious or suspicious third-party applications to access
              your email and data. These applications can read emails, send messages, and access
              files without the user's explicit knowledge.
            </Text>
          </View>

          {stats.newApps > 0 ? (
            <>
              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>⚠ {stats.newApps} New Application(s) Found</Text>
                <Text style={styles.alertText}>
                  New applications were granted access during the analysis period. Review each
                  application to ensure it was authorized and is from a trusted publisher.
                </Text>
              </View>

              {becData.AddedApps.slice(0, 6).map((app, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoTitle}>
                    {app.displayName || app.appDisplayName || "Unknown"}
                  </Text>
                  <Text style={styles.infoText}>
                    Publisher: {app.publisher || "Unknown"}
                    {"\n"}
                    App ID: {app.appId || "N/A"}
                    {"\n"}
                    Created: {formatDate(app.createdDateTime)}
                  </Text>
                </View>
              ))}
              {becData.AddedApps.length > 6 && (
                <Text style={[styles.infoText, { marginLeft: 12, fontStyle: "italic" }]}>
                  ... and {becData.AddedApps.length - 6} more apps (see JSON export for full list)
                </Text>
              )}
            </>
          ) : (
            <View style={[styles.infoBox, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[styles.infoTitle, { color: "#22543D" }]}>
                ✓ No New Applications Found
              </Text>
              <Text style={styles.infoText}>
                No new applications were authorized during the analysis period.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {tenantName} - BEC Analysis Report for {userData?.displayName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* CHECK 4, 5, 6: PERMISSIONS, MFA, PASSWORDS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Additional Security Checks</Text>
            <Text style={styles.pageSubtitle}>
              Permissions, authentication, and access patterns
            </Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        {/* Check 4: Mailbox Permission Changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check 4: Mailbox Permission Changes</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why We Check This</Text>
            <Text style={styles.infoText}>
              Unauthorized changes to mailbox permissions can allow attackers to grant themselves or
              accomplices access to read, send, or manage emails. This is a common technique to
              maintain persistent access.
            </Text>
          </View>

          {stats.permissionChanges > 0 ? (
            <>
              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>
                  ⚠ {stats.permissionChanges} Permission Change(s) Found
                </Text>
                <Text style={styles.alertText}>
                  Mailbox permission changes were detected. Verify that each change was authorized
                  and necessary for legitimate business purposes.
                </Text>
              </View>

              {becData.MailboxPermissionChanges.slice(0, 5).map((change, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoTitle}>{change.Operation || "Permission Change"}</Text>
                  <Text style={styles.infoText}>
                    User: {change.UserKey || "Unknown"}
                    {"\n"}
                    Target: {change.ObjectId || "N/A"}
                    {"\n"}
                    Permissions: {change.Permissions || "Unknown"}
                  </Text>
                </View>
              ))}
              {becData.MailboxPermissionChanges.length > 5 && (
                <Text style={[styles.infoText, { marginLeft: 12, fontStyle: "italic" }]}>
                  ... and {becData.MailboxPermissionChanges.length - 5} more changes
                </Text>
              )}
            </>
          ) : (
            <View style={[styles.infoBox, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[styles.infoTitle, { color: "#22543D" }]}>
                ✓ No Permission Changes Found
              </Text>
              <Text style={styles.infoText}>
                No mailbox permission changes were detected during the analysis period.
              </Text>
            </View>
          )}
        </View>

        {/* Check 5: MFA Devices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check 5: MFA Devices</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why We Check This</Text>
            <Text style={styles.infoText}>
              Multi-factor authentication (MFA) devices provide an additional layer of security.
              Reviewing registered MFA methods helps identify if attackers have added unauthorized
              devices to bypass security controls.
            </Text>
          </View>

          {stats.mfaDevices > 0 ? (
            <>
              <Text style={[styles.bodyText, { marginLeft: 12, marginTop: 8 }]}>
                ℹ {stats.mfaDevices} MFA device(s) registered. Verify each device belongs to the
                user.
              </Text>

              {becData.MFADevices.slice(0, 5).map((device, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoTitle}>
                    {device["@odata.type"]
                      ?.replace("#microsoft.graph.", "")
                      .replace("AuthenticationMethod", "") || "Unknown"}
                  </Text>
                  <Text style={styles.infoText}>
                    Display Name: {device.displayName || "N/A"}
                    {"\n"}
                    Registered: {formatDate(device.createdDateTime)}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <View style={[styles.infoBox, { backgroundColor: "#FEF5E7" }]}>
              <Text style={[styles.infoTitle, { color: "#744210" }]}>⚠ No MFA Devices Found</Text>
              <Text style={styles.infoText}>
                No multi-factor authentication devices are registered. MFA is highly recommended to
                prevent unauthorized access.
              </Text>
            </View>
          )}
        </View>

        {/* Check 6: Password Changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check 6: Recent Password Changes</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why We Check This</Text>
            <Text style={styles.infoText}>
              Attackers often change passwords to lock out legitimate users. Reviewing recent
              password changes in the tenant helps identify if the compromised account's password
              was changed or if other accounts were affected.
            </Text>
          </View>

          {stats.passwordChanges > 0 ? (
            <>
              <Text style={[styles.bodyText, { marginLeft: 12, marginTop: 8 }]}>
                ℹ {stats.passwordChanges} password change(s) detected in the tenant during the
                analysis period.
              </Text>

              {becData.ChangedPasswords.slice(0, 5).map((user, index) => (
                <View key={index} style={styles.infoBox}>
                  <Text style={styles.infoTitle}>{user.displayName || "Unknown"}</Text>
                  <Text style={styles.infoText}>
                    Email: {user.userPrincipalName || "N/A"}
                    {"\n"}
                    Last Password Change: {formatDate(user.lastPasswordChangeDateTime)}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.bodyText, { marginLeft: 12, marginTop: 8 }]}>
              ℹ No password changes detected during the analysis period.
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {tenantName} - BEC Analysis Report for {userData?.displayName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* RECOMMENDATIONS PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Recommendations</Text>
            <Text style={styles.pageSubtitle}>Actions to take and prevention best practices</Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Immediate Actions Required</Text>
          <Text style={styles.bodyText}>
            Based on the investigation findings, the following actions should be taken immediately:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>1.</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Reset Password:</Text> Change the user's
                password immediately to prevent further unauthorized access.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>2.</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Revoke Sessions:</Text> Sign out the user from
                all active sessions to terminate any attacker access.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>3.</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Remove Suspicious Rules:</Text> Delete any
                mailbox rules that forward, redirect, or hide emails, especially those moving
                messages to unusual folders.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>4.</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Review MFA Devices:</Text> Remove any MFA
                devices that the user doesn't recognize and re-register legitimate devices.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>5.</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Audit Permissions:</Text> Review and revoke any
                unauthorized mailbox permissions or application consents.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>6.</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Monitor Account:</Text> Continue monitoring the
                account for suspicious activity for at least 30 days.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Long-Term Prevention Strategies</Text>
          <Text style={styles.bodyText}>
            To prevent future Business Email Compromise attacks, implement these security best
            practices:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>
                  Enforce Multi-Factor Authentication (MFA):
                </Text>{" "}
                Require MFA for all users, especially those with administrative privileges or access
                to financial systems.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Implement Security Awareness Training:</Text>{" "}
                Educate employees about phishing, social engineering, and how to identify suspicious
                emails. Regular training significantly reduces successful attacks.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Enable Advanced Threat Protection:</Text> Use
                email security solutions that detect and block phishing, malware, and suspicious
                attachments.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Configure Conditional Access Policies:</Text>{" "}
                Restrict access based on location, device compliance, and risk level to prevent
                unauthorized sign-ins.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Monitor Audit Logs:</Text> Regularly review
                audit logs for suspicious activities such as unusual sign-in patterns, rule
                creation, or permission changes.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>Establish Financial Controls:</Text> Implement
                multi-person approval processes for wire transfers and payment changes to prevent
                fraudulent transactions.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Education Points</Text>
          <Text style={styles.bodyText}>
            Share these key points with the affected user to help prevent future compromises:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                Never click on links or open attachments in unexpected emails, even if they appear
                to come from known contacts.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                Always verify unusual requests for money transfers or sensitive information through
                a separate communication channel (phone call, in person).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                Use strong, unique passwords for each account and consider using a password manager.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                Be cautious when authorizing new applications or granting permissions to third-party
                services.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                Report suspicious emails or activities to your IT security team immediately.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {tenantName} - BEC Analysis Report for {userData?.displayName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* COMPLIANCE & DOCUMENTATION PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageTitle}>Compliance & Documentation</Text>
            <Text style={styles.pageSubtitle}>Meeting regulatory and audit requirements</Text>
          </View>
          {brandingSettings?.logo && (
            <Image style={styles.headerLogo} src={brandingSettings.logo} cache={false} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Considerations</Text>
          <Text style={styles.bodyText}>
            This report supports compliance and documentation requirements for various security
            frameworks and regulatory standards:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>ISO 27001:</Text> Demonstrates incident
                detection, analysis, and response procedures (Controls A.16.1.1 - A.16.1.7).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>CMMC Level 2:</Text> Provides evidence of
                security incident monitoring, analysis, and documentation (AC.L2-3.1.12,
                AU.L2-3.3.1).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>SOC 2 Type II:</Text> Documents detective and
                responsive controls for security incidents (CC7.3, CC7.4).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>NIST CSF:</Text> Aligns with Detect (DE.AE,
                DE.CM) and Respond (RS.AN, RS.MI) functions.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: "bold" }}>GDPR:</Text> Demonstrates security breach
                detection and potential data breach assessment (Articles 32, 33).
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Trail</Text>
          <Text style={styles.bodyText}>
            This investigation and resulting documentation provide an audit trail for security
            incident response:
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Investigation Details</Text>
            <Text style={styles.infoText}>
              Investigation Date: {formatDate(becData?.ExtractedAt)}
              {"\n"}
              Analyzed User: {userData?.userPrincipalName}
              {"\n"}
              Organization: {tenantName}
              {"\n"}
              Analysis Period: 7 days
              {"\n"}
              Audit Log Status: {becData?.ExtractResult || "Unknown"}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Findings Summary</Text>
            <Text style={styles.infoText}>
              Threat Level: {threatLevel.level}
              {"\n"}
              Mailbox Rules Found: {stats.newRules}
              {"\n"}
              Permission Changes: {stats.permissionChanges}
              {"\n"}
              New Applications: {stats.newApps}
              {"\n"}
              New Users: {stats.newUsers}
              {"\n"}
              MFA Devices: {stats.mfaDevices}
              {"\n"}
              Password Changes: {stats.passwordChanges}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Retention</Text>
          <Text style={styles.bodyText}>
            This report should be retained according to your organization's document retention
            policy and regulatory requirements. Typical retention periods range from 3-7 years
            depending on applicable compliance frameworks. Store this document securely with
            restricted access as it contains sensitive security information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <Text style={styles.bodyText}>
            For more information about Business Email Compromise and cybersecurity best practices:
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                FBI IC3: Internet Crime Complaint Center (ic3.gov)
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                CISA: Cybersecurity & Infrastructure Security Agency (cisa.gov)
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                Microsoft Security: Business Email Compromise resources
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {tenantName} - BEC Analysis Report for {userData?.displayName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

// Main Button Component
export const BECRemediationReportButton = ({ userData, becData, tenantName }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const userSettings = useSettings();

  // Check if we have the necessary data
  const hasData = userData && becData && !becData.Waiting;

  const brandingSettings = userSettings?.organizationSettings || {
    logo: userSettings?.organizationSettings?.logo,
    colour: userSettings?.organizationSettings?.colour || "#F77F00",
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (!hasData) {
    return null; // Don't show button if data isn't ready
  }

  return (
    <>
      <Tooltip title="Generate BEC Remediation Report PDF">
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={handleOpenDialog}
          disabled={!hasData}
          color="primary"
        >
          Generate PDF Report
        </Button>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">BEC Remediation Report Preview</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {hasData && (
            <PDFViewer width="100%" height="100%">
              <BECRemediationReportDocument
                userData={userData}
                becData={becData}
                brandingSettings={brandingSettings}
                tenantName={tenantName}
              />
            </PDFViewer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <PDFDownloadLink
            document={
              <BECRemediationReportDocument
                userData={userData}
                becData={becData}
                brandingSettings={brandingSettings}
                tenantName={tenantName}
              />
            }
            fileName={`BEC_Report_${userData?.userPrincipalName}_${new Date().toISOString().split("T")[0]}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                disabled={loading}
              >
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </>
  );
};
