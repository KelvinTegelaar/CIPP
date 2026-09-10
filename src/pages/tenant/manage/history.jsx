import { useState, useEffect } from "react";
import { CippIcons } from "../../../utils/icon-registry"
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import { Layout as DashboardLayout } from "../../../layouts/index";
import { HeaderedTabbedLayout } from "../../../layouts/HeaderedTabbedLayout";
import { ApiGetCall } from "../../../api/ApiCall";
import { useRouter } from "next/router";
import tabOptions from "./tabOptions.json";
import { useSettings } from "../../../hooks/use-settings";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [daysToLoad, setDaysToLoad] = useState(5);
  const userSettings = useSettings();
  // Prioritize URL query parameter, then fall back to settings
  const tenant = router.query.tenantFilter || userSettings.currentTenant;
  const [expandedMessages, setExpandedMessages] = useState(new Set());

  // Toggle message expansion
  const toggleMessageExpansion = (index) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMessages(newExpanded);
  };

  // Truncate message if too long
  const truncateMessage = (message, maxLength = 256) => {
    if (!message || message.length <= maxLength) {
      return { text: message, isTruncated: false };
    }
    return {
      text: message.substring(0, maxLength) + "...",
      fullText: message,
      isTruncated: true,
    };
  };

  // Calculate date range for API call
  const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return {
      startDate: startDate.toISOString().split("T")[0].replace(/-/g, ""),
      endDate: endDate.toISOString().split("T")[0].replace(/-/g, ""),
    };
  };

  const { startDate, endDate } = getDateRange(daysToLoad);

  // Hoisted so the header actions invalidate the same query this page reads.
  const logsQueryKey = `Listlogs-${tenant}-${startDate}-${endDate}`;
  const logsData = ApiGetCall({
    url: `/api/Listlogs?tenant=${tenant}&StartDate=${startDate}&EndDate=${endDate}&Filter=true`,
    queryKey: logsQueryKey,
  });

  // Get severity icon and color
  const getSeverityConfig = (severity) => {
    const severityLower = severity?.toLowerCase();
    switch (severityLower) {
      case "error":
        return { icon: <CippIcons.Error />, color: "error", chipColor: "error" };
      case "warning":
        return { icon: <CippIcons.Warning />, color: "warning", chipColor: "warning" };
      case "info":
        return { icon: <CippIcons.Info />, color: "info", chipColor: "info" };
      case "success":
        return { icon: <CippIcons.CheckCircle />, color: "success", chipColor: "success" };
      default:
        return { icon: <CippIcons.Info />, color: "grey", chipColor: "default" };
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  // Load more days
  const handleLoadMore = () => {
    setDaysToLoad((prev) => prev + 7);
  };

  // Actions for the ActionsMenu - just refresh for history page
  const actions = [
    {
      label: "Refresh Data",
      icon: <CippIcons.Sync />,
      noConfirm: true,
      customFunction: () => {
        logsData.refetch();
      },
    },
  ];

  const title = "View History";
  // Sort logs by date (newest first)
  const sortedLogs = logsData.data
    ? [...logsData.data].sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime))
    : [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      actions={actions}
      queryKeys={logsQueryKey}
      actionsData={{}}
      isFetching={logsData.isLoading}
    >
      <Box sx={{ py: 2 }}>
        <Stack spacing={4}>
          <Typography variant="h6">Activity Timeline</Typography>
          <Typography variant="body1" sx={{
            color: "text.secondary"
          }}>
            This timeline shows the history of actions taken on this tenant, by CIPP for the last{" "}
            {daysToLoad} days.
          </Typography>

          {logsData.isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4
              }}>
              <CircularProgress />
            </Box>
          )}

          {logsData.isError && (
            <Alert severity="error">Failed to load activity logs. Please try again.</Alert>
          )}

          {logsData.data && sortedLogs.length === 0 && (
            <Alert severity="info">No activity logs found for the selected time period.</Alert>
          )}

          {logsData.data && sortedLogs.length > 0 && (
            <Card sx={{ mr: 2 }}>
              <CardContent>
                <Timeline
                  sx={{
                    [`& .MuiTimelineOppositeContent-root`]: {
                      flex: 0.2,
                      minWidth: 100,
                    },
                    [`& .MuiTimelineContent-root`]: {
                      flex: 0.8,
                    },
                  }}
                >
                  {sortedLogs.map((log, index) => {
                    const { icon, color, chipColor } = getSeverityConfig(log.Severity);
                    const { time, date } = formatDate(log.DateTime);
                    const { text, fullText, isTruncated } = truncateMessage(log.Message);
                    const isExpanded = expandedMessages.has(index);

                    return (
                      <TimelineItem key={index}>
                        <TimelineOppositeContent
                          align="right"
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            m: "auto 0",
                            minWidth: 100,
                            maxWidth: 100
                          }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              fontSize: "0.7rem"
                            }}>
                            {date}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              fontWeight: "bold",
                              fontSize: "0.75rem"
                            }}>
                            {time}
                          </Typography>
                        </TimelineOppositeContent>

                        <TimelineSeparator>
                          <TimelineDot color={color} variant="outlined" size="small">
                            {icon}
                          </TimelineDot>
                          {index < sortedLogs.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>

                        <TimelineContent sx={{ py: "8px", px: 2 }}>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap"
                              }}>
                              <Chip
                                label={log.Severity}
                                color={chipColor}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                              <Chip
                                label={log.API}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                              {log.IP && (
                                <Chip
                                  label={`IP: ${log.IP}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem", height: 20 }}
                                />
                              )}
                            </Box>

                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "medium",
                                  fontSize: "0.875rem"
                                }}>
                                {isExpanded ? fullText : text}
                              </Typography>
                              {isTruncated && (
                                <Link
                                  component="button"
                                  variant="caption"
                                  onClick={() => toggleMessageExpansion(index)}
                                  sx={{
                                    mt: 0.5,
                                    display: "block",
                                    textAlign: "left",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {isExpanded ? "Show less" : "Show more"}
                                </Link>
                              )}
                            </Box>

                            {log.User && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.7rem"
                                }}>
                                User: {log.User}
                              </Typography>
                            )}
                          </Stack>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 3
                  }}>
                  <Button
                    variant="outlined"
                    startIcon={<CippIcons.ExpandMore />}
                    onClick={handleLoadMore}
                    disabled={logsData.isLoading}
                  >
                    Load More (Show {daysToLoad + 7} days)
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Box>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
