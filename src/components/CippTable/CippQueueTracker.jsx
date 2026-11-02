import React, { useState, useEffect } from "react";
import { CippIcons } from "../../utils/icon-registry";
import {
  IconButton,
  Tooltip,
  Badge,
  Typography,
  LinearProgress,
  Box,
  Stack,
  Button,
} from "@mui/material";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { ApiGetCall } from "../../api/ApiCall";
import { useQueryClient } from "@tanstack/react-query";
import { useCraftJobEvents } from "../../hooks/use-craft-events";
import { fromCraftRun } from "../../utils/craft-run";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useDialog } from "../../hooks/use-dialog";

const isQueueDone = (status) =>
  ["Completed", "Failed", "Completed (with errors)", "Cancelled"].includes(status);

const aheadText = (queue) =>
  queue?.QueuedAhead > 0
    ? `Waiting behind ${queue.QueuedAhead} task${queue.QueuedAhead === 1 ? "" : "s"} from ${
        queue.RunsAhead
      } other queue${queue.RunsAhead === 1 ? "" : "s"}`
    : null;

export const CippQueueTracker = ({ queueId, queryKey, title, onQueueComplete }) => {
  const queryClient = useQueryClient();
  const [queueCanvasVisible, setQueueCanvasVisible] = useState(false);
  const [persistentQueueData, setPersistentQueueData] = useState(null);
  const [lastProcessedQueueId, setLastProcessedQueueId] = useState(null);
  const [queueQueryKey, setQueueQueryKey] = useState(null);
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false);
  const [cancelRow, setCancelRow] = useState(null);
  const cancelDialog = useDialog();

  const hasQueueData = !!queueId;
  const currentQueryKey = queryKey || title;

  // Show queue if we have current queue data OR persistent queue data from the same query key
  // If query key changed and we don't have an active queueId, don't show the tracker
  const shouldShowQueue =
    hasQueueData || (!!persistentQueueData && queueQueryKey === currentQueryKey);

  // Check if queue is in a completed state based on persistent data only (to avoid circular dependency)
  const isQueueCompleted = isQueueDone(persistentQueueData?.Status);

  const effectiveQueueId = queueId || lastProcessedQueueId;

  // Craft pushes the whole queue entry while the stream is up; the endpoint is only polled when it is not.
  const queueConnected = useCraftJobEvents(effectiveQueueId, (frame) => {
    if (!frame.data) {
      queuePolling.refetch();
      return;
    }
    queryClient.setQueryData([`CippQueue-${effectiveQueueId}`], (old) => {
      const entry = Array.isArray(old) ? old[0] : old;
      // Craft does not know a run was cancelled; the status set by the cancel stands.
      return entry?.Status === "Cancelled" ? old : [{ ...entry, ...fromCraftRun(frame.data) }];
    });
  });

  const queuePolling = ApiGetCall({
    url: `/api/ListCippQueue`,
    data: { QueueId: effectiveQueueId },
    queryKey: `CippQueue-${effectiveQueueId || "unknown"}`,
    waiting: shouldShowQueue && !!effectiveQueueId && !isQueueCompleted,
    refetchInterval: (query) => {
      // TanStack Query v5 hands this callback the Query object, not the data - the response
      // has to be read off query.state or the completion check below never matches.
      const currentData = query?.state?.data?.[0];

      // Stop polling if either shows completion
      if (
        isQueueDone(currentData?.Status) ||
        isQueueCompleted ||
        !shouldShowQueue ||
        !effectiveQueueId
      ) {
        return false;
      }

      // A tenant-restricted caller gets no live events for the run, so it polls the narrowed status.
      return queueConnected && !currentData?.Polled ? false : 3000;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const queueData = queuePolling.data?.[0];
  const current = persistentQueueData || queueData;

  const ownQueues = ApiGetCall({
    url: "/api/ListCippQueue",
    queryKey: "CippQueue-own",
    waiting: queueCanvasVisible,
    // These runs have no live events here, so the open panel polls them.
    staleTime: 0,
    refetchInterval: 5000,
  });
  const otherOwnQueues = (Array.isArray(ownQueues.data) ? ownQueues.data : []).filter(
    (queue) => queue.Cancellable && queue.QueueId !== effectiveQueueId,
  );

  const openCancel = (queue) => {
    setCancelRow(queue);
    cancelDialog.handleOpen();
  };

  const markCancelled = (cancelledId) => {
    queryClient.setQueryData([`CippQueue-${cancelledId}`], (old) =>
      Array.isArray(old) ? [{ ...old[0], Status: "Cancelled", Cancellable: false }] : old,
    );
    if (cancelledId === effectiveQueueId) {
      setPersistentQueueData((data) => data && { ...data, Status: "Cancelled", Cancellable: false });
    }
  };

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
    // A cancelled queue with no tenant done has nothing cached: reloading would only start it again.
    if (
      !hasAutoRefreshed &&
      isQueueDone(persistentQueueData?.Status) &&
      (persistentQueueData.Status !== "Cancelled" || persistentQueueData.CompletedTasks > 0) &&
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
    persistentQueueData?.CompletedTasks,
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
          current?.Status === "Completed"
            ? `Queue Complete - ${current?.PercentComplete?.toFixed(
                1,
              )}% (${current?.CompletedTasks}/${
                current?.TotalTasks
              } tasks)`
            : current?.Status === "Completed (with errors)"
              ? `Queue Completed with Errors - ${(
                  persistentQueueData || queueData
                )?.PercentFailed?.toFixed(1)}% failed (${
                  current?.FailedTasks
                }/${current?.TotalTasks} tasks)`
              : current?.Status === "Failed"
                ? `Queue Failed - ${current?.PercentFailed?.toFixed(
                    1,
                  )}% failed (${current?.FailedTasks}/${
                    current?.TotalTasks
                  } tasks)`
                : current?.Status === "Cancelled"
                  ? `Queue Cancelled - ${current?.CompletedTasks}/${current?.TotalTasks} tasks done`
                  : aheadText(current)
                    ? aheadText(current)
                    : current?.Status
                  ? `Queue ${current.Status} - ${(
                      persistentQueueData || queueData
                    )?.PercentComplete?.toFixed(1)}% complete (${
                      current?.CompletedTasks
                    }/${current?.TotalTasks} tasks)`
                  : "View Queue Status"
        }
      >
        <Badge
          badgeContent={
            current?.Status === "Completed" ? (
              <CippIcons.Circle sx={{ fontSize: 8, color: "success.main" }} />
            ) : current?.Status === "Completed (with errors)" ? (
              <CippIcons.Circle sx={{ fontSize: 8, color: "warning.main" }} />
            ) : current?.Status === "Failed" ? (
              <CippIcons.Circle sx={{ fontSize: 8, color: "error.main" }} />
            ) : current?.RunningTasks > 0 ? (
              <CippIcons.Circle sx={{ fontSize: 8, color: "warning.main" }} />
            ) : (
              <CippIcons.Circle sx={{ fontSize: 8, color: "info.main" }} />
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
                !isQueueDone(current?.Status)
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
                current?.Status === "Completed"
                  ? "success.main"
                  : current?.Status === "Completed (with errors)"
                    ? "warning.main"
                    : current?.Status === "Failed"
                      ? "error.main"
                      : current?.RunningTasks > 0
                        ? "warning.main"
                        : "primary.main",
            }}
          >
            <CippIcons.Timeline />
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
              <Typography variant="h6">{current.Name}</Typography>

              <Box>
                <Typography variant="body2" gutterBottom sx={{
                  color: "text.secondary"
                }}>
                  Progress: {current.PercentComplete?.toFixed(1)}%
                  complete
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={current.PercentComplete || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Stack
                useFlexGap
                direction="row"
                sx={{
                  columnGap: 4,
                  rowGap: 1,
                  flexWrap: "wrap"
                }}>
                <Typography variant="body2">
                  <strong>Total Tasks:</strong> {current.TotalTasks || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Completed:</strong>{" "}
                  {current.CompletedTasks || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Running:</strong> {current.RunningTasks || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Failed:</strong> {current.FailedTasks || 0}
                </Typography>
              </Stack>

              <Typography variant="body2">
                <strong>Status:</strong> {current.Status}
              </Typography>

              {!isQueueDone(current.Status) && aheadText(current) && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {aheadText(current)}
                </Typography>
              )}

              {current.Cancellable && !isQueueDone(current.Status) && (
                <Box>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<CippIcons.XMarkIcon />}
                    onClick={() => openCancel(current)}
                  >
                    Cancel queue
                  </Button>
                </Box>
              )}

              {otherOwnQueues.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Your other running queues
                  </Typography>
                  <Stack spacing={1}>
                    {otherOwnQueues.map((queue) => (
                      <Stack
                        key={queue.QueueId}
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", justifyContent: "space-between" }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                            {queue.Name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {aheadText(queue) ??
                              `${queue.Status} - ${queue.CompletedTasks ?? 0} of ${
                                queue.TotalTasks ?? 0
                              } tasks done`}
                          </Typography>
                        </Box>
                        <Button size="small" color="error" onClick={() => openCancel(queue)}>
                          Cancel
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

              {current.Tasks &&
                current.Tasks.length > 0 && (
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
                        {current.Tasks.map((task, index) => (
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
                              spacing={1}
                              sx={{
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}>
                              {/* Task names are tenant domains — one unbreakable token — so
                                  without minWidth: 0 the row's min-content width exceeds a
                                  phone-width card and shoves the status pill off its edge. */}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "medium",
                                  minWidth: 0,
                                  overflowWrap: "anywhere"
                                }}>
                                {task.Name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={(theme) => ({
                                  flexShrink: 0,
                                  whiteSpace: "nowrap",
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
                                sx={{
                                  color: "text.secondary",
                                  mt: 0.5,
                                  display: "block",
                                  fontStyle: "italic"
                                }}>
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
      <CippApiDialog
        title="Cancel Queue"
        createDialog={cancelDialog}
        row={cancelRow ?? {}}
        relatedQueryKeys={["CippQueue-own"]}
        api={{
          url: "/api/ExecCancelCippQueue",
          type: "POST",
          data: { QueueId: "QueueId" },
          confirmText:
            "Cancel [Name]? Tenants that have not started are skipped; tenants already running finish.",
          onSuccess: () => markCancelled(cancelRow?.QueueId),
        }}
      />
    </>
  );
};
