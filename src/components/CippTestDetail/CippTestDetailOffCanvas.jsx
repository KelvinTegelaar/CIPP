import React from "react";
import { Card, CardContent, Box, Stack, Chip, Typography } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Grid } from "@mui/system";
import standardsData from "../../data/standards.json";

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

const checkCIPPStandardAvailable = (testName) => {
  if (!testName) return "No";
  console.log(testName);
  // Check if any standard's tag array contains a reference to this test
  const hasStandard = standardsData.some((standard) => {
    if (!standard.tag || !Array.isArray(standard.tag)) return false;
    // Check if any tag matches the test name or contains it
    return standard.tag.some((tag) => {
      const tagLower = tag.toLowerCase();
      const testLower = testName.toLowerCase();
      return tagLower.includes(testLower) || testLower.includes(tagLower);
    });
  });

  return hasStandard ? "Yes" : "No";
};

// Shared markdown styling for consistent rendering
const markdownStyles = {
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
                    label={checkCIPPStandardAvailable(row.RowKey)}
                    color={checkCIPPStandardAvailable(row.RowKey) === "Yes" ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {row.ResultMarkdown && (
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
                {row.ResultMarkdown}
              </ReactMarkdown>
            </Box>
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
