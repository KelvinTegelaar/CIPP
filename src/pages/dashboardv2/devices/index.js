import React from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall.jsx";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { KeyboardArrowRight } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Grid } from "@mui/system";

const Page = () => {
  const settings = useSettings();
  const { currentTenant } = settings;

  const testsApi = ApiGetCall({
    url: "/api/ListTests",
    data: { tenantFilter: currentTenant, reportId: "d5d1e123-bce0-482d-971f-be6ed820dd92" },
    queryKey: `${currentTenant}-ListTests-d5d1e123-bce0-482d-971f-be6ed820dd92`,
  });

  const deviceTests =
    testsApi.data?.TestResults?.filter((test) => test.TestType === "Devices") || [];

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

  const offCanvas = {
    size: "lg",
    children: (row) => {
      return (
        <Stack spacing={3}>
          <Card>
            <Grid container>
              <Grid
                size={{ xs: 12, md: 4 }}
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
                      Risk Level
                    </Typography>
                    <Box>
                      <Chip label={row.Risk || "N/A"} color={getRiskColor(row.Risk)} size="small" />
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              <Grid
                size={{ xs: 12, md: 4 }}
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
                size={{ xs: 12, md: 4 }}
                sx={{
                  borderBottom: "none",
                }}
              >
                <Stack alignItems="center" direction="row" spacing={1} sx={{ p: 1 }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Implementation Effort
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
                <Box
                  sx={{
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
                  }}
                >
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

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    This test verifies that device compliance policies are properly configured in
                    Microsoft Intune. Compliance policies define the requirements that devices must
                    meet to access corporate resources, such as encryption, password requirements,
                    and operating system versions.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Why this matters:</strong> Non-compliant devices pose significant
                    security risks to your organization. They may lack critical security updates,
                    have weak authentication, or be missing essential security features like
                    encryption. Properly configured compliance policies ensure only secure devices
                    can access sensitive data.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Recommendation:</strong> Create comprehensive compliance policies that
                    cover all device platforms (Windows, iOS, Android, macOS). Configure Conditional
                    Access to block non-compliant devices and set up automated remediation actions
                    to help users bring their devices back into compliance.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      );
    },
  };

  const filters = [
    {
      filterName: "Passed",
      value: [{ id: "Status", value: "Passed" }],
      type: "column",
    },
    {
      filterName: "Failed",
      value: [{ id: "Status", value: "Failed" }],
      type: "column",
    },
    {
      filterName: "Investigate",
      value: [{ id: "Status", value: "Investigate" }],
      type: "column",
    },
    {
      filterName: "Skipped",
      value: [{ id: "Status", value: "Skipped" }],
      type: "column",
    },
    {
      filterName: "High Risk",
      value: [{ id: "Risk", value: "High" }],
      type: "column",
    },
    {
      filterName: "Medium Risk",
      value: [{ id: "Risk", value: "Medium" }],
      type: "column",
    },
    {
      filterName: "Low Risk",
      value: [{ id: "Risk", value: "Low" }],
      type: "column",
    },
  ];

  return (
    <Container maxWidth={false} sx={{ pt: 3 }}>
      <CippDataTable
        title="Device Tests"
        data={deviceTests}
        simpleColumns={["Name", "Risk", "Status"]}
        isFetching={testsApi.isFetching}
        offCanvas={offCanvas}
        offCanvasOnRowClick={true}
        filters={filters}
        actions={[]}
      />
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
