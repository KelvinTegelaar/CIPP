import { useState, useEffect } from "react";
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
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import {
  Policy,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  ExpandMore,
} from "@mui/icons-material";
import tabOptions from "./tabOptions.json";
import { useSettings } from "../../../../hooks/use-settings";
import { createDriftManagementActions } from "./driftManagementActions";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [daysToLoad, setDaysToLoad] = useState(5);
  const tenant = useSettings().currentTenant;
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

  const logsData = ApiGetCall({
    url: `/api/Listlogs?tenant=${tenant}&StartDate=${startDate}&EndDate=${endDate}&Filter=true`,
    queryKey: `Listlogs-${tenant}-${startDate}-${endDate}`,
  });

  // Get severity icon and color
  const getSeverityConfig = (severity) => {
    const severityLower = severity?.toLowerCase();
    switch (severityLower) {
      case "error":
        return { icon: <ErrorIcon />, color: "error", chipColor: "error" };
      case "warning":
        return { icon: <WarningIcon />, color: "warning", chipColor: "warning" };
      case "info":
        return { icon: <InfoIcon />, color: "info", chipColor: "info" };
      case "success":
        return { icon: <SuccessIcon />, color: "success", chipColor: "success" };
      default:
        return { icon: <InfoIcon />, color: "grey", chipColor: "default" };
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

  // Actions for the ActionsMenu
  const actions = createDriftManagementActions({
    templateId,
    onRefresh: () => {
      logsData.refetch();
    },
    currentTenant: tenant,
  });

  const title = "View History";
  // Sort logs by date (newest first)
  const sortedLogs = logsData.data
    ? [...logsData.data].sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime))
    : [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      backUrl="/tenant/standards/list-standards"
      actions={actions}
      actionsData={{}}
      isFetching={logsData.isLoading}
    >
      <Box sx={{ py: 2 }}>
        <Stack spacing={4}>
          <Typography variant="h6">Activity Timeline</Typography>
          <Typography variant="body1" color="text.secondary">
            This timeline shows the history of actions taken on this tenant, by CIPP for the last{" "}
            {daysToLoad} days.
          </Typography>

          {logsData.isLoading && (
            <Box display="flex" justifyContent="center" py={4}>
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
                          sx={{ m: "auto 0", minWidth: 100, maxWidth: 100 }}
                          align="right"
                          variant="body2"
                          color="text.secondary"
                        >
                          <Typography variant="caption" display="block" fontSize="0.7rem">
                            {date}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            fontWeight="bold"
                            fontSize="0.75rem"
                          >
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
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
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
                                fontWeight="medium"
                                sx={{ fontSize: "0.875rem" }}
                              >
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
                                color="text.secondary"
                                sx={{ fontSize: "0.7rem" }}
                              >
                                User: {log.User}
                              </Typography>
                            )}
                          </Stack>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>

                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="outlined"
                    startIcon={<ExpandMore />}
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
