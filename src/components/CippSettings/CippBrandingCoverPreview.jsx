import { Box, Typography } from "@mui/material";
import { resolveCoverImage } from "../CippPdf/resolveCoverImage";
import { createReportStyles } from "../CippPdf/reportPdfStyles";
import { createReportTheme } from "../CippPdf/reportTheme";
import {
  SAMPLE_BEC,
  SAMPLE_PERMISSIONS,
  SAMPLE_SHARING,
  SAMPLE_TENANT_NAME,
} from "../CippPdf/previewSampleData";

// The people and figures shown on the mock come from the same sample data the full-report preview
// renders, not from a second set invented here. They used to disagree — the mock named "Jane Doe"
// while the real preview of the same report named "Sample User" — which makes the two previews look
// like different reports rather than two views of one.
const SAMPLE_ANALYSIS_DATE = new Date(SAMPLE_BEC.becData.ExtractedAt).toLocaleString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Every report CIPP can produce, in the order they are offered everywhere: the built-in reports
 * first, and the report builder — which renders whatever an operator assembles — last.
 *
 * This is the single list. The preview picker, the per-report default presets and the sample data
 * are all keyed off it, so a report added here appears in all three rather than in whichever one
 * someone remembered to update.
 *
 * There is no `uppercaseTitle` flag any more: every PDF cover uppercases its title, and the mock
 * reads that off the shared stylesheet. The flag was a second copy of that decision and had already
 * gone stale, showing three covers in sentence case that the PDF sets in caps.
 */
export const REPORT_COVER_PRESETS = [
  {
    id: "executive",
    label: "Executive Report",
    coverLabel: "Security Assessment",
    title: "Executive",
    accent: "Summary",
    subtitle: `Security & Compliance Assessment for ${SAMPLE_TENANT_NAME}`,
    metaPrimary: SAMPLE_TENANT_NAME,
    metaSecondary: null,
    footer: "Confidential & Proprietary",
  },
  {
    id: "shadowAI",
    label: "Shadow AI Report",
    coverLabel: "AI Risk Assessment",
    title: "Shadow AI",
    accent: "Report",
    subtitle:
      "Discovery and risk assessment of AI tools in use across managed devices and cloud applications",
    metaPrimary: SAMPLE_TENANT_NAME,
    metaSecondary: null,
    footer: "Confidential & Proprietary",
  },
  {
    id: "bec",
    label: "BEC Remediation",
    coverLabel: "Security Incident Report",
    title: "BEC Compromise",
    accent: "Analysis",
    subtitle: `Business Email Compromise Investigation Report for ${SAMPLE_TENANT_NAME}`,
    // This cover names the compromised user rather than the tenant, and carries a third line the
    // others do not.
    metaPrimary: SAMPLE_BEC.userData.displayName,
    metaSecondary: SAMPLE_BEC.userData.userPrincipalName,
    metaTertiary: `Analysis Date: ${SAMPLE_ANALYSIS_DATE}`,
    footer: "Confidential & Proprietary - For Internal Use Only",
  },
  {
    id: "sharing",
    label: "Sharing Report",
    coverLabel: "Data Sharing Review",
    title: "Sharing",
    accent: "Report",
    subtitle:
      "What has been shared out of SharePoint and OneDrive, who it reaches, and which shares are worth acting on.",
    metaPrimary: SAMPLE_TENANT_NAME,
    // Counted from the sample data rather than written out, so the mock cannot quote figures the
    // full preview of the same report contradicts.
    metaSecondary: `${SAMPLE_SHARING.summary.totalLinks} sharing links · ${SAMPLE_SHARING.summary.itemsShared} items · ${SAMPLE_SHARING.summary.externalRecipients} external recipients`,
    footer: "Confidential — For Internal Use Only",
  },
  {
    id: "permissions",
    label: "Permissions Report",
    coverLabel: "Access Review",
    title: "Permissions",
    accent: "Report",
    subtitle:
      "Who is structurally allowed into SharePoint sites and document libraries, and where that access reaches further than intended.",
    metaPrimary: SAMPLE_TENANT_NAME,
    metaSecondary: `${SAMPLE_PERMISSIONS.summary.sitesScanned} sites · ${SAMPLE_PERMISSIONS.summary.librariesScanned} libraries · ${SAMPLE_PERMISSIONS.summary.totalAssignments} permission assignments`,
    footer: "Confidential — For Internal Use Only",
  },
  {
    // Last: this one has no fixed content of its own — it renders whatever an operator assembles in
    // the report builder, so it belongs after the reports that are the same every time.
    id: "reportBuilder",
    label: "Report Builder",
    coverLabel: "Assessment Report",
    title: "Custom",
    accent: "Report",
    subtitle: `Generated assessment report for ${SAMPLE_TENANT_NAME}`,
    metaPrimary: SAMPLE_TENANT_NAME,
    metaSecondary: null,
    footer: "Confidential & Proprietary",
  },
];

/**
 * Live DOM mock of a report cover page (not a PDF render).
 *
 * It is a mock for speed — it updates as you drag a colour picker, where a PDF relayout cannot — so
 * it will never be pixel-identical to the real thing. What it must not do is disagree about a
 * *branding decision*, because that is the one thing it exists to show. So every such decision is
 * read from the same theme and stylesheet the PDF uses rather than restated here: the colours, the
 * text colour placed on the brand colour, and how the cover image resolves.
 *
 * `CippBrandingCoverPreview.test.jsx` compares the two and fails if they drift.
 */
const CippBrandingCoverPreview = ({
  colour,
  secondaryColour,
  coverFooterText,
  watermarkText,
  watermarkEnabled,
  logo,
  coverImage,
  coverImageId,
  coverStock,
  reportType = "executive",
}) => {
  const theme = createReportTheme({
    colour,
    secondaryColour,
    coverFooterText,
    watermarkText,
    watermarkEnabled,
  });
  const styles = createReportStyles(theme);
  const preset =
    REPORT_COVER_PRESETS.find((item) => item.id === reportType) || REPORT_COVER_PRESETS[0];
  const coverSrc = resolveCoverImage({ coverImage, coverImageId, coverStock });
  const showCoverImage = Boolean(coverSrc);
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box
      sx={{
        width: "100%",
        // Cap width so height never exceeds maxHeight while keeping A4 (210×297).
        maxWidth: "min(100%, calc(min(70vh, 820px) * 210 / 297))",
        aspectRatio: "210 / 297",
        maxHeight: "min(70vh, 820px)",
        mx: "auto",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: 3,
        overflow: "hidden",
        position: "relative",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: { xs: 3, md: 4 },
      }}
    >
      {showCoverImage && (
        <Box
          component="img"
          src={coverSrc}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
      )}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ minHeight: 48, display: "flex", alignItems: "center" }}>
          {logo ? (
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ maxHeight: 56, maxWidth: 140, objectFit: "contain" }}
            />
          ) : null}
        </Box>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: styles.dateStamp.color,
            fontSize: 11,
          }}
        >
          {currentDate}
        </Typography>
      </Box>

      {/* Same rule as the PDF: over the artwork and the text, at the same low opacity. */}
      {theme.watermark.enabled && (
        <Box
          data-testid="cover-watermark"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: { xs: 44, md: 64 },
              fontWeight: "bold",
              color: theme.primary,
              opacity: 0.08,
              textTransform: "uppercase",
              letterSpacing: 4,
              transform: "rotate(-45deg)",
              whiteSpace: "nowrap",
            }}
          >
            {theme.watermark.text}
          </Box>
        </Box>
      )}

      <Box sx={{ position: "relative", zIndex: 1, flex: 1, pt: 6 }}>
        <Box
          data-testid="cover-label"
          sx={{
            display: "inline-block",
            bgcolor: styles.coverLabel.backgroundColor,
            // Not hardcoded white: the PDF picks this by contrast, so a pale brand colour gets dark
            // text there. Hardcoding it here showed an unreadable cover the report never produces.
            color: styles.coverLabel.color,
            px: 2,
            py: 0.75,
            borderRadius: 5,
            mb: 3,
            fontSize: 11,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {preset.coverLabel}
        </Box>
        <Typography
          data-testid="cover-title"
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: "bold",
            color: styles.mainTitle.color,
            lineHeight: 1.1,
            letterSpacing: -0.5,
            mb: 2,
            whiteSpace: "pre-line",
            // Read off the shared sheet rather than a per-report flag. Every PDF cover uppercases
            // its title now, and a flag repeating that decision is a copy that can go stale — it
            // already had, showing three covers in sentence case that the PDF sets in caps.
            textTransform: styles.mainTitle.textTransform,
          }}
        >
          {preset.title}
          {"\n"}
          <Box component="span" sx={{ color: styles.titleAccent.color }}>
            {preset.accent}
          </Box>
        </Typography>
        <Typography
          sx={{ fontSize: 13, color: styles.subtitle.color, mb: 4, maxWidth: 280, lineHeight: 1.5 }}
        >
          {preset.subtitle}
        </Typography>
        <Typography
          sx={{ fontSize: 16, fontWeight: "bold", color: styles.coverMetaLabel.color, mb: 0.5 }}
        >
          {preset.metaPrimary}
        </Typography>
        {preset.metaSecondary && (
          <Typography sx={{ fontSize: 12, color: styles.coverMetavalue.color }}>
          {preset.metaSecondary}
        </Typography>
        )}
        {preset.metaTertiary && (
          <Typography
            sx={{
              fontSize: 11,
              color: styles.coverMetaNote.color,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mt: 1,
            }}
          >
            {preset.metaTertiary}
          </Typography>
        )}
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", mt: 2 }}>
        <Typography
          sx={{
            fontSize: 10,
            color: styles.confidential.color,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {/* A configured cover note replaces the report's own wording, exactly as the PDF does. */}
          {theme.coverFooterText || preset.footer}
        </Typography>
      </Box>
    </Box>
  );
};

export default CippBrandingCoverPreview;
