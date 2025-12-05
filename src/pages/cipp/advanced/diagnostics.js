import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import CippDiagnosticsFilter from "/src/components/CippTable/CippDiagnosticsFilter";
import { useState } from "react";
import { Grid } from "@mui/system";
import { Box, Typography, Chip, Stack, Divider } from "@mui/material";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  BugReport as DebugIcon,
} from "@mui/icons-material";

const Page = () => {
  const [apiFilter, setApiFilter] = useState({ query: "", presetDisplayName: null });
  const queryKey = JSON.stringify(apiFilter);

  const pageTitle = apiFilter.presetDisplayName
    ? `Diagnostics - ${apiFilter.presetDisplayName}`
    : "Diagnostics - Application Insights Query";

  return (
    <CippTablePage
      tableFilter={
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippDiagnosticsFilter onSubmitFilter={setApiFilter} />
          </Grid>
        </Grid>
      }
      clearOnError={true}
      offCanvas={{
        size: "lg",
        children: (row) => {
          const getSeverityConfig = (level) => {
            const levelStr = String(level || "").toLowerCase();
            switch (levelStr) {
              case "error":
              case "4":
                return { icon: <ErrorIcon />, color: "error", label: "Error" };
              case "warning":
              case "3":
                return { icon: <WarningIcon />, color: "warning", label: "Warning" };
              case "debug":
              case "0":
                return { icon: <DebugIcon />, color: "default", label: "Debug" };
              case "verbose":
              case "1":
                return { icon: <InfoIcon />, color: "info", label: "Verbose" };
              default:
                return { icon: <InfoIcon />, color: "info", label: "Information" };
            }
          };

          const message = row.customDimensions?.Message || row.message || "No message";
          const level = row.customDimensions?.Level || row.severityLevel;
          const timestamp =
            row.customDimensions?.Timestamp || row.timestamp || new Date().toISOString();
          const severityConfig = getSeverityConfig(level);

          // Try to extract and parse JSON from message
          let parsedMessage = null;
          let isJson = false;
          let preJsonText = "";
          let postJsonText = "";

          if (typeof message === "string") {
            // Try to find JSON object or array in the message
            const jsonObjectMatch = message.match(/(\{[\s\S]*\})/);
            const jsonArrayMatch = message.match(/(\[[\s\S]*\])/);
            const jsonMatch = jsonObjectMatch || jsonArrayMatch;

            if (jsonMatch) {
              try {
                parsedMessage = JSON.parse(jsonMatch[1]);
                isJson = true;
                const jsonStart = jsonMatch.index;
                const jsonEnd = jsonStart + jsonMatch[1].length;
                preJsonText = message.substring(0, jsonStart).trim();
                postJsonText = message.substring(jsonEnd).trim();
              } catch (e) {
                // Not valid JSON, treat as regular text
              }
            }
          }

          return (
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Header with severity and timestamp */}
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      icon={severityConfig.icon}
                      label={severityConfig.label}
                      color={severityConfig.color}
                      size="medium"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Divider />
                </Box>

                {/* Message */}
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">Message</Typography>
                    {isJson && (
                      <Chip label="JSON" size="small" color="primary" variant="outlined" />
                    )}
                  </Stack>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {isJson ? (
                      <Stack spacing={1}>
                        {preJsonText && (
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: "0.875rem",
                              wordBreak: "break-word",
                            }}
                          >
                            {preJsonText}
                          </Typography>
                        )}
                        <Typography
                          variant="body1"
                          component="pre"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            m: 0,
                          }}
                        >
                          {JSON.stringify(parsedMessage, null, 2)}
                        </Typography>
                        {postJsonText && (
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: "0.875rem",
                              wordBreak: "break-word",
                            }}
                          >
                            {postJsonText}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body1"
                        component="pre"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          m: 0,
                        }}
                      >
                        {message}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Full Details */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Full Details
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      maxHeight: "400px",
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      component="pre"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        m: 0,
                      }}
                    >
                      {JSON.stringify(row, null, 2)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          );
        },
      }}
      title={pageTitle}
      tenantInTitle={false}
      apiDataKey="Results"
      apiUrl={apiFilter.query ? "/api/ExecAppInsightsQuery" : "/api/ListEmptyResults"}
      apiData={apiFilter}
      queryKey={queryKey}
      simpleColumns={[]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
