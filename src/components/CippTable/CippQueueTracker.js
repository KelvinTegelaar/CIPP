import React, { useState, useEffect } from "react";
import { IconButton, Tooltip, Badge, Typography, LinearProgress, Box, Stack } from "@mui/material";
import { Timeline, Circle } from "@mui/icons-material";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { ApiGetCall } from "../../api/ApiCall";
import { useQueryClient } from "@tanstack/react-query";

export const CippQueueTracker = ({ queueId, queryKey, title, onQueueComplete }) => {
  const queryClient = useQueryClient();
  const [queueCanvasVisible, setQueueCanvasVisible] = useState(false);
  const [persistentQueueData, setPersistentQueueData] = useState(null);
  const [lastProcessedQueueId, setLastProcessedQueueId] = useState(null);
  const [queueQueryKey, setQueueQueryKey] = useState(null);
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false);

  const hasQueueData = !!queueId;
  const currentQueryKey = queryKey || title;

  // Show queue if we have current queue data OR persistent queue data from the same query key
  // If query key changed and we don't have an active queueId, don't show the tracker
  const shouldShowQueue =
    hasQueueData || (!!persistentQueueData && queueQueryKey === currentQueryKey);

  // Check if queue is in a completed state based on persistent data only (to avoid circular dependency)
  const isQueueCompleted =
    persistentQueueData?.Status === "Completed" ||
    persistentQueueData?.Status === "Failed" ||
    persistentQueueData?.Status === "Completed (with errors)";

  const effectiveQueueId = queueId || lastProcessedQueueId;

  const queuePolling = ApiGetCall({
    url: `/api/ListCippQueue`,
    data: { QueueId: effectiveQueueId },
    queryKey: `CippQueue-${effectiveQueueId || "unknown"}`,
    waiting: shouldShowQueue && !!effectiveQueueId && !isQueueCompleted,
    refetchInterval: (data) => {
      // Check if the current data shows completion
      const currentData = data?.[0];
      const isCurrentCompleted =
        currentData?.Status === "Completed" ||
        currentData?.Status === "Failed" ||
        currentData?.Status === "Completed (with errors)";

      // Also check persistent data
      const isPersistentCompleted =
        persistentQueueData?.Status === "Completed" ||
        persistentQueueData?.Status === "Failed" ||
        persistentQueueData?.Status === "Completed (with errors)";

      // Stop polling if either shows completion
      if (isCurrentCompleted || isPersistentCompleted || !shouldShowQueue || !effectiveQueueId) {
        return false;
      }

      return 3000;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const queueData = queuePolling.data?.[0];

  // Handle queue data persistence - only update persistent queue data when we get a new QueueId
  // and ensure it's pinned to the current query key
  useEffect(() => {
    const currentQueryKey = queryKey || title;

    // If query key changed, clear all queue data
    if (queueQueryKey && queueQueryKey !== currentQueryKey) {
      setPersistentQueueData(null);
      setLastProcessedQueueId(null);
      setQueueQueryKey(currentQueryKey);
      setHasAutoRefreshed(false);
      return;
    }

    // Set query key if not set
    if (!queueQueryKey) {
      setQueueQueryKey(currentQueryKey);
    }

    // Only process new QueueId if we actually have one and it's different
    if (queueId && queueId !== lastProcessedQueueId) {
      // New QueueId detected, clear old persistent data and set new QueueId
      setPersistentQueueData(null);
      setLastProcessedQueueId(queueId);
      setHasAutoRefreshed(false); // Reset auto-refresh flag for new queue
    }

    // Don't clear persistent data if queueId is temporarily null (during table refresh)
    // Only clear if we explicitly get a different QueueId or change query/page
  }, [queueId, lastProcessedQueueId, queryKey, title, queueQueryKey]);

  // Update persistent queue data when new queue data is available
  useEffect(() => {
    const currentQueryKey = queryKey || title;

    // Only update if we're on the same query key where the queue was initiated
    if (queueData && queueId === lastProcessedQueueId && queueQueryKey === currentQueryKey) {
      setPersistentQueueData(queueData);
    }
  }, [queueData, queueId, lastProcessedQueueId, queryKey, title, queueQueryKey]);

  // Auto-refresh table when queue reaches 100% completion
  useEffect(() => {
    const currentQueryKey = queryKey || title;

    // Only auto-refresh if we're on the same query key where the queue was initiated
    // and we haven't already auto-refreshed for this queue completion
    if (
      !hasAutoRefreshed &&
      (persistentQueueData?.Status === "Completed" ||
        persistentQueueData?.Status === "Failed" ||
        persistentQueueData?.Status === "Completed (with errors)") &&
      queueQueryKey === currentQueryKey
    ) {
      // Queue is complete, invalidate the table query to refresh data
      if (currentQueryKey) {
        queryClient.invalidateQueries({ queryKey: [currentQueryKey] });
        setHasAutoRefreshed(true); // Mark that we've auto-refreshed
        // Call callback if provided
        if (onQueueComplete) {
          onQueueComplete();
        }
      }
    }
  }, [
    hasAutoRefreshed,
    persistentQueueData?.PercentComplete,
    persistentQueueData?.Status,
    queryKey,
    title,
    queryClient,
    queueQueryKey,
    onQueueComplete,
  ]);

  // Don't render anything if we don't have queue data to show
  // Check for valid queueId or persistent queue data
  if (!shouldShowQueue || (!queueId && !lastProcessedQueueId && !persistentQueueData)) {
    return null;
  }

  return (
    <>
      <Tooltip
        title={
          (persistentQueueData || queueData)?.Status === "Completed"
            ? `Queue Complete - ${(persistentQueueData || queueData)?.PercentComplete?.toFixed(
                1
              )}% (${(persistentQueueData || queueData)?.CompletedTasks}/${
                (persistentQueueData || queueData)?.TotalTasks
              } tasks)`
            : (persistentQueueData || queueData)?.Status === "Completed (with errors)"
            ? `Queue Completed with Errors - ${(
                persistentQueueData || queueData
              )?.PercentFailed?.toFixed(1)}% failed (${
                (persistentQueueData || queueData)?.FailedTasks
              }/${(persistentQueueData || queueData)?.TotalTasks} tasks)`
            : (persistentQueueData || queueData)?.Status === "Failed"
            ? `Queue Failed - ${(persistentQueueData || queueData)?.PercentFailed?.toFixed(
                1
              )}% failed (${(persistentQueueData || queueData)?.FailedTasks}/${
                (persistentQueueData || queueData)?.TotalTasks
              } tasks)`
            : (persistentQueueData || queueData)?.Status
            ? `Queue ${(persistentQueueData || queueData).Status} - ${(
                persistentQueueData || queueData
              )?.PercentComplete?.toFixed(1)}% complete (${
                (persistentQueueData || queueData)?.CompletedTasks
              }/${(persistentQueueData || queueData)?.TotalTasks} tasks)`
            : "View Queue Status"
        }
      >
        <Badge
          badgeContent={
            (persistentQueueData || queueData)?.Status === "Completed" ? (
              <Circle sx={{ fontSize: 8, color: "success.main" }} />
            ) : (persistentQueueData || queueData)?.Status === "Completed (with errors)" ? (
              <Circle sx={{ fontSize: 8, color: "warning.main" }} />
            ) : (persistentQueueData || queueData)?.Status === "Failed" ? (
              <Circle sx={{ fontSize: 8, color: "error.main" }} />
            ) : (persistentQueueData || queueData)?.RunningTasks > 0 ? (
              <Circle sx={{ fontSize: 8, color: "warning.main" }} />
            ) : (
              <Circle sx={{ fontSize: 8, color: "info.main" }} />
            )
          }
          overlap="circular"
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <IconButton
            onClick={() => setQueueCanvasVisible(true)}
            sx={{
              animation:
                (persistentQueueData || queueData)?.Status !== "Completed" &&
                (persistentQueueData || queueData)?.Status !== "Completed (with errors)" &&
                (persistentQueueData || queueData)?.Status !== "Failed"
                  ? "pulse 2s infinite"
                  : "none",
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
                "50%": {
                  transform: "scale(1.1)",
                  opacity: 0.8,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
              color:
                (persistentQueueData || queueData)?.Status === "Completed"
                  ? "success.main"
                  : (persistentQueueData || queueData)?.Status === "Completed (with errors)"
                  ? "warning.main"
                  : (persistentQueueData || queueData)?.Status === "Failed"
                  ? "error.main"
                  : (persistentQueueData || queueData)?.RunningTasks > 0
                  ? "warning.main"
                  : "primary.main",
            }}
          >
            <Timeline />
          </IconButton>
        </Badge>
      </Tooltip>

      {/* Queue Status OffCanvas */}
      <CippOffCanvas
        size="lg"
        title="Queue Status"
        visible={queueCanvasVisible}
        onClose={() => setQueueCanvasVisible(false)}
      >
        <Stack spacing={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {persistentQueueData || queueData ? (
            <>
              <Typography variant="h6">{(persistentQueueData || queueData).Name}</Typography>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress: {(persistentQueueData || queueData).PercentComplete?.toFixed(1)}%
                  complete
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(persistentQueueData || queueData).PercentComplete || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap" }}>
                <Typography variant="body2">
                  <strong>Total Tasks:</strong> {(persistentQueueData || queueData).TotalTasks || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Completed:</strong>{" "}
                  {(persistentQueueData || queueData).CompletedTasks || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Running:</strong> {(persistentQueueData || queueData).RunningTasks || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Failed:</strong> {(persistentQueueData || queueData).FailedTasks || 0}
                </Typography>
              </Stack>

              <Typography variant="body2">
                <strong>Status:</strong> {(persistentQueueData || queueData).Status}
              </Typography>

              {(persistentQueueData || queueData).Tasks &&
                (persistentQueueData || queueData).Tasks.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Task Details
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                      }}
                    >
                      <Stack
                        spacing={1}
                        sx={{
                          flex: 1,
                          overflowY: "auto",
                          pr: 1,
                          "&::-webkit-scrollbar": {
                            width: 8,
                          },
                          "&::-webkit-scrollbar-track": {
                            backgroundColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.1)",
                            borderRadius: 4,
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(0,0,0,0.3)",
                            borderRadius: 4,
                            "&:hover": {
                              backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.5)",
                            },
                          },
                        }}
                      >
                        {(persistentQueueData || queueData).Tasks.map((task, index) => (
                          <Box
                            key={index}
                            sx={(theme) => ({
                              p: 2,
                              border: 1,
                              borderColor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.12)"
                                  : "divider",
                              borderRadius: 1,
                              backgroundColor:
                                task.Status === "Completed"
                                  ? theme.palette.mode === "dark"
                                    ? "rgba(102, 187, 106, 0.15)"
                                    : "success.light"
                                  : task.Status === "Failed"
                                  ? theme.palette.mode === "dark"
                                    ? "rgba(244, 67, 54, 0.15)"
                                    : "error.light"
                                  : task.Status === "Running"
                                  ? theme.palette.mode === "dark"
                                    ? "rgba(255, 152, 0, 0.15)"
                                    : "warning.light"
                                  : theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.05)"
                                  : "grey.100",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                transform: "translateY(-1px)",
                                boxShadow:
                                  theme.palette.mode === "dark"
                                    ? "0 4px 8px rgba(0,0,0,0.3)"
                                    : "0 4px 8px rgba(0,0,0,0.1)",
                              },
                            })}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="body2" fontWeight="medium">
                                {task.Name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={(theme) => ({
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  backgroundColor:
                                    theme.palette.mode === "dark"
                                      ? "rgba(255,255,255,0.1)"
                                      : "background.paper",
                                  border:
                                    theme.palette.mode === "dark"
                                      ? "1px solid rgba(255,255,255,0.2)"
                                      : "none",
                                  fontWeight: "medium",
                                  textTransform: "uppercase",
                                  fontSize: "0.7rem",
                                  letterSpacing: "0.5px",
                                  color:
                                    task.Status === "Completed"
                                      ? "success.main"
                                      : task.Status === "Failed"
                                      ? "error.main"
                                      : task.Status === "Running"
                                      ? "warning.main"
                                      : "text.secondary",
                                })}
                              >
                                {task.Status}
                              </Typography>
                            </Stack>
                            {task.Timestamp && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mt: 0.5,
                                  display: "block",
                                  fontStyle: "italic",
                                }}
                              >
                                {new Date(task.Timestamp).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                {new Date(task.Timestamp).toLocaleTimeString(undefined, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}
            </>
          ) : queuePolling.isLoading ? (
            <Typography>Loading queue data...</Typography>
          ) : queuePolling.isError ? (
            <Typography color="error">
              Error loading queue data: {queuePolling.error?.message}
            </Typography>
          ) : (
            <Typography>No queue data available</Typography>
          )}
        </Stack>
      </CippOffCanvas>
    </>
  );
};
