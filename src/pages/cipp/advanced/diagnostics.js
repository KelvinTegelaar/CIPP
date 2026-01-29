import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import CippDiagnosticsFilter from "../../../components/CippTable/CippDiagnosticsFilter";
import { CippPropertyListCard } from "../../../components/CippCards/CippPropertyListCard";
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
  const [apiFilter, setApiFilter] = useState({ query: "", presetDisplayName: null, columns: null });
  const queryKey = JSON.stringify(apiFilter);

  const pageTitle = apiFilter.presetDisplayName
    ? `Diagnostics - ${apiFilter.presetDisplayName}`
    : "Diagnostics - Application Insights Query";

  // Determine simpleColumns based on preset columns
  const simpleColumns = apiFilter.columns || [];

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
          // Detect event type
          const eventName = row.name || "";
          const isConsoleLog = eventName === "CIPP.ConsoleLog";
          const isTaskCompleted = eventName === "CIPP.TaskCompleted";
          const isStandardCompleted = eventName === "CIPP.StandardCompleted";

          // Console Log Renderer
          if (isConsoleLog) {
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

            const message =
              row.Message || row.customDimensions?.Message || row.message || "No message";
            const level = row.Level || row.customDimensions?.Level || row.severityLevel;
            const timestamp =
              row.Timestamp ||
              row.customDimensions?.Timestamp ||
              row.timestamp ||
              new Date().toISOString();
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
                </Stack>
              </Box>
            );
          }

          // Task/Standard Completed Renderer
          if (isTaskCompleted || isStandardCompleted) {
            const taskName = row.TaskName || row.customDimensions?.TaskName || "Unknown Task";
            const command =
              row.Command ||
              row.customDimensions?.Command ||
              row.customDimensions?.Standard ||
              "N/A";
            const tenant = row.Tenant || row.customDimensions?.Tenant || "N/A";
            const count = row.Count || row.customDimensions?.Count;
            const totalDuration = row.TotalDurationMs || row.customDimensions?.TotalDurationMs;
            const avgDuration = row.AvgDurationMs || row.customDimensions?.AvgDurationMs;
            const maxDuration = row.MaxDurationMs || row.customDimensions?.MaxDurationMs;
            const timestamp = row.timestamp || new Date().toISOString();
            const status = row.Status || row.customDimensions?.Status || "Completed";

            return (
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Header */}
                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Chip
                        label={isTaskCompleted ? "Task" : "Standard"}
                        color="success"
                        size="medium"
                      />
                      <Chip label={status} color="default" size="small" variant="outlined" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(timestamp).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Divider />
                  </Box>

                  {/* Summary */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {isTaskCompleted ? "Task Name" : "Standard"}
                        </Typography>
                        <Typography variant="body1">{taskName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Command
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                          {command}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tenant
                        </Typography>
                        <Typography variant="body1">{tenant}</Typography>
                      </Box>
                      {count && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Count
                          </Typography>
                          <Typography variant="body1">{count}</Typography>
                        </Box>
                      )}
                      {totalDuration && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Total Duration (ms)
                          </Typography>
                          <Typography variant="body1">{totalDuration.toFixed(2)}</Typography>
                        </Box>
                      )}
                      {avgDuration && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Average Duration (ms)
                          </Typography>
                          <Typography variant="body1">{avgDuration.toFixed(2)}</Typography>
                        </Box>
                      )}
                      {maxDuration && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Max Duration (ms)
                          </Typography>
                          <Typography variant="body1">{maxDuration.toFixed(2)}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          }

          // Default/Generic Renderer for other event types
          const renderValue = (value) => {
            if (value === null || value === undefined) {
              return (
                <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
                  {String(value)}
                </Typography>
              );
            }
            if (typeof value === "boolean") {
              return (
                <Chip label={value.toString()} size="small" color={value ? "success" : "default"} />
              );
            }
            if (typeof value === "object") {
              return (
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
                  {JSON.stringify(value, null, 2)}
                </Typography>
              );
            }
            return String(value);
          };

          // Build property items for CippPropertyListCard
          const propertyItems = [];

          // Add timestamp first
          propertyItems.push({
            label: "timestamp",
            value: new Date(row.timestamp || new Date().toISOString()).toLocaleString(),
          });

          // Add all other properties
          Object.entries(row)
            .filter(([key]) => key !== "timestamp" && key !== "customDimensions")
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([key, value]) => {
              propertyItems.push({
                label: key,
                value: renderValue(value),
              });
            });

          // Add customDimensions properties
          if (row.customDimensions) {
            Object.entries(row.customDimensions)
              .sort(([a], [b]) => a.localeCompare(b))
              .forEach(([key, value]) => {
                propertyItems.push({
                  label: `customDimensions.${key}`,
                  value: renderValue(value),
                });
              });
          }

          return (
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Chip label={eventName || "Event"} color="default" size="medium" />
                  </Stack>
                </Box>

                <CippPropertyListCard
                  title="Properties"
                  propertyItems={propertyItems}
                  layout="single"
                  copyItems={true}
                  cardSx={{ boxShadow: "none" }}
                />
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
      simpleColumns={simpleColumns}
      actions={[]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
