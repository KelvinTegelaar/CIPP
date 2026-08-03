import { Box, Typography } from "@mui/material";
import { resolveCoverImage } from "../CippPdf/resolveCoverImage";

export const REPORT_COVER_PRESETS = [
  {
    id: "executive",
    label: "Executive Report",
    coverLabel: "Security Assessment",
    title: "Executive",
    accent: "Summary",
    subtitle: "Security & Compliance Assessment for your organization",
    metaPrimary: "Your Organization",
    metaSecondary: "Sample Tenant",
    footer: "Confidential & Proprietary",
  },
  {
    id: "reportBuilder",
    label: "Report Builder",
    coverLabel: "Assessment Report",
    title: "Custom",
    accent: "Report",
    subtitle: "Generated assessment report for your organization",
    metaPrimary: "Your Organization",
    metaSecondary: "Sample Tenant",
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
    metaPrimary: "Your Organization",
    metaSecondary: null,
    footer: "Confidential & Proprietary",
  },
  {
    id: "bec",
    label: "BEC Remediation",
    coverLabel: "Security Incident Report",
    title: "BEC Compromise",
    accent: "Analysis",
    subtitle: "Business Email Compromise Investigation Report for your organization",
    metaPrimary: "Jane Doe",
    metaSecondary: "jane.doe@contoso.com",
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
    metaPrimary: "Your Organization",
    metaSecondary: "24 sharing links · 18 items · 6 external recipients",
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
    metaPrimary: "Your Organization",
    metaSecondary: "12 sites · 34 libraries · 156 permission assignments",
    footer: "Confidential — For Internal Use Only",
  },
];

/**
 * Live DOM mock of a report cover page (not a PDF render).
 */
const CippBrandingCoverPreview = ({
  colour,
  logo,
  coverImage,
  coverImageId,
  coverStock,
  reportType = "executive",
}) => {
  const brandColor = colour || "#F77F00";
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
            color: "#000000",
            fontSize: 11,
          }}
        >
          {currentDate}
        </Typography>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, flex: 1, pt: 6 }}>
        <Box
          sx={{
            display: "inline-block",
            bgcolor: brandColor,
            color: "#FFFFFF",
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
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: "bold",
            color: "#1A202C",
            lineHeight: 1.1,
            letterSpacing: -0.5,
            mb: 2,
            whiteSpace: "pre-line",
          }}
        >
          {preset.title}
          {"\n"}
          <Box component="span" sx={{ color: brandColor }}>
            {preset.accent}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#000000", mb: 4, maxWidth: 280, lineHeight: 1.5 }}>
          {preset.subtitle}
        </Typography>
        <Typography sx={{ fontSize: 16, fontWeight: "bold", color: "#000000", mb: 0.5 }}>
          {preset.metaPrimary}
        </Typography>
        {preset.metaSecondary && (
          <Typography sx={{ fontSize: 12, color: "#333333" }}>{preset.metaSecondary}</Typography>
        )}
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", mt: 2 }}>
        <Typography
          sx={{
            fontSize: 10,
            color: "#A0AEC0",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {preset.footer}
        </Typography>
      </Box>
    </Box>
  );
};

export default CippBrandingCoverPreview;
