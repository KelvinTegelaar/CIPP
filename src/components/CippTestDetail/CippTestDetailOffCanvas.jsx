import React from "react";
import { Card, CardContent, Box, Stack, Chip, Typography } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Grid } from "@mui/system";
import standardsData from "../../data/standards.json";
import { CippCodeBlock } from "../CippComponents/CippCodeBlock";
import { renderCustomScriptMarkdownTemplate } from "../../utils/customScriptTemplate";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "passed":
      return "success";
    case "failed":
      return "error";
    case "investigate":
      return "warning";
    case "skipped":
      return "default";
    default:
      return "default";
  }
};

const getRiskColor = (risk) => {
  switch (risk?.toLowerCase()) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "default";
  }
};

const getImpactColor = (impact) => {
  switch (impact?.toLowerCase()) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "default";
  }
};

// Find every CIPP standard whose appliesToTest array includes this test's RowKey.
// appliesToTest stores TestIds (e.g. "CIS_1_1_1", "ZTNA21772", "SMB1001_2_5"); the
// row's RowKey is the same TestId, so this is an exact lookup.
const getMatchingStandards = (testName) => {
  if (!testName) return [];
  return standardsData.filter(
    (standard) =>
      Array.isArray(standard.appliesToTest) && standard.appliesToTest.includes(testName)
  );
};

// Shared markdown styling for consistent rendering
export const markdownStyles = {
  "& a": {
    color: (theme) => theme.palette.primary.main,
    textDecoration: "underline",
    "&:hover": {
      textDecoration: "none",
    },
  },
  color: "text.secondary",
  fontSize: "0.875rem",
  lineHeight: 1.43,
  "& p": {
    my: 1,
  },
  "& ul": {
    my: 1,
    pl: 2,
  },
  "& li": {
    my: 0.5,
  },
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    mt: 2,
    mb: 1,
    fontWeight: "bold",
  },
  "& table": {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 2,
    marginBottom: 2,
  },
  "& th, & td": {
    border: 1,
    borderColor: "divider",
    padding: 1,
    textAlign: "left",
  },
  "& th": {
    backgroundColor: "action.hover",
    fontWeight: "bold",
  },
  "& code": {
    backgroundColor: "action.hover",
    padding: "2px 6px",
    borderRadius: 1,
    fontSize: "0.85em",
  },
  "& pre": {
    backgroundColor: "action.hover",
    padding: 2,
    borderRadius: 1,
    overflow: "auto",
  },
};

export const CippTestDetailOffCanvas = ({ row }) => {
  const hasRawCustomData = row.TestType === "Custom" && !!row.ResultDataJson;
  let parsedCustomResult = null;
  if (hasRawCustomData) {
    try {
      parsedCustomResult = JSON.parse(row.ResultDataJson);
    } catch {
      parsedCustomResult = null;
    }
  }

  const computedCustomMarkdown =
    hasRawCustomData && parsedCustomResult !== null && !row.ResultMarkdown
      ? renderCustomScriptMarkdownTemplate(parsedCustomResult, row.MarkdownTemplate || "")
      : null;
  const shouldRenderCustomJson = hasRawCustomData && row.ReturnType === "JSON" && !row.ResultMarkdown;
  const shouldRenderCustomMarkdown = hasRawCustomData && !shouldRenderCustomJson && !row.ResultMarkdown;

  const matchingStandards = getMatchingStandards(row.RowKey);

  return (
    <Stack spacing={3}>
      <Card>
        <Grid container>
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              borderBottom: (theme) => ({
                xs: `1px solid ${theme.palette.divider}`,
                md: "none",
              }),
              borderRight: (theme) => ({
                md: `1px solid ${theme.palette.divider}`,
              }),
            }}
          >
            <Stack alignItems="center" direction="row" spacing={1} sx={{ p: 1 }}>
              <Box>
                <Typography color="text.secondary" variant="overline">
                  Risk
                </Typography>
                <Box>
                  <Chip label={row.Risk || "N/A"} color={getRiskColor(row.Risk)} size="small" />
                </Box>
              </Box>
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              borderBottom: (theme) => ({
                xs: `1px solid ${theme.palette.divider}`,
                md: "none",
              }),
              borderRight: (theme) => ({
                md: `1px solid ${theme.palette.divider}`,
              }),
            }}
          >
            <Stack alignItems="center" direction="row" spacing={1} sx={{ p: 1 }}>
              <Box>
                <Typography color="text.secondary" variant="overline">
                  User Impact
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={row.UserImpact || "N/A"}
                    color={getImpactColor(row.UserImpact)}
                    size="small"
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              borderBottom: (theme) => ({
                xs: `1px solid ${theme.palette.divider}`,
                md: "none",
              }),
              borderRight: (theme) => ({
                md: `1px solid ${theme.palette.divider}`,
              }),
            }}
          >
            <Stack alignItems="center" direction="row" spacing={1} sx={{ p: 1 }}>
              <Box>
                <Typography color="text.secondary" variant="overline">
                  Effort
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={row.ImplementationEffort || "N/A"}
                    color={getImpactColor(row.ImplementationEffort)}
                    size="small"
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              borderBottom: "none",
            }}
          >
            <Stack alignItems="center" direction="row" spacing={1} sx={{ p: 1 }}>
              <Box>
                <Typography color="text.secondary" variant="overline">
                  Standard Available
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={matchingStandards.length > 0 ? `Yes (${matchingStandards.length})` : "No"}
                    color={matchingStandards.length > 0 ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {matchingStandards.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              CIPP Standards that satisfy this test
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The following CIPP standards can be deployed to remediate or enforce this test.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {matchingStandards.map((standard) => (
                <Chip
                  key={standard.name}
                  label={standard.label || standard.name}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {(row.ResultMarkdown || shouldRenderCustomJson || shouldRenderCustomMarkdown) && (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6">{row.Name}</Typography> <KeyboardArrowRight />
              <Chip
                label={row.Status || "Unknown"}
                color={getStatusColor(row.Status)}
                size="small"
              />
            </Box>
            {shouldRenderCustomJson && parsedCustomResult !== null ? (
              <CippCodeBlock
                code={JSON.stringify(parsedCustomResult, null, 2)}
                language="json"
                showLineNumbers={false}
              />
            ) : (
              <Box sx={markdownStyles}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children, ...props }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                      </a>
                    ),
                  }}
                >
                  {shouldRenderCustomMarkdown ? computedCustomMarkdown : row.ResultMarkdown}
                </ReactMarkdown>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6">What did we check</Typography>
            </Box>

            {row.Category && (
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Category
                </Typography>
                <Typography variant="body2">{row.Category}</Typography>
              </Box>
            )}

            {row.Description && (
              <Box sx={markdownStyles}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children, ...props }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                      </a>
                    ),
                  }}
                >
                  {row.Description}
                </ReactMarkdown>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
