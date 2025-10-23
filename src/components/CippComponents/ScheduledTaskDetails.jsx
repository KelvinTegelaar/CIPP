import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Stack,
  Skeleton,
} from "@mui/material";
import { ApiGetCall } from "../../api/ApiCall";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { ExpandMore, Sync, Search, Close } from "@mui/icons-material";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippTimeAgo } from "/src/components/CippComponents/CippTimeAgo";
import { ActionsMenu } from "/src/components/actions-menu";
import { CippScheduledTaskActions } from "./CippScheduledTaskActions";

const ScheduledTaskDetails = ({ data, showActions = true }) => {
  const [taskDetails, setTaskDetails] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const taskDetailResults = ApiGetCall({
    url: `/api/ListScheduledItemDetails`,
    data: {
      RowKey: data.RowKey,
    },
    queryKey: `ListScheduledItemDetails-${data.RowKey}`,
  });

  const taskProperties = [
    "TaskState",
    "Command",
    "Tenant",
    "Recurrence",
    "ScheduledTime",
    "ExecutedTime",
    "PostExecution",
  ];

  useEffect(() => {
    if (taskDetailResults.isSuccess && taskDetailResults?.data) {
      setTaskDetails(taskDetailResults.data);

      // Auto-expand the only result if there's just one
      if (taskDetailResults.data.Details?.length === 1) {
        setExpanded(`execution-results-0`);
      }
    }
  }, [data.RowKey, taskDetailResults.isSuccess, taskDetailResults.data]);

  const filteredDetails = taskDetails?.Details?.filter((result) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    const tenantMatches = (result.TenantName || result.Tenant || "")
      .toLowerCase()
      .includes(searchLower);

    let resultsMatches = false;
    if (typeof result.Results === "object" && result.Results !== null) {
      const resultsStr = JSON.stringify(result.Results).toLowerCase();
      resultsMatches = resultsStr.includes(searchLower);
    }

    return tenantMatches || resultsMatches;
  });

  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            {taskDetailResults.isLoading ? <Skeleton width="250px" /> : taskDetails?.Task?.Name}
          </Typography>
          {showActions && (
            <Box>
              <ActionsMenu
                actions={CippScheduledTaskActions()}
                data={taskDetails?.Task}
                disabled={taskDetailResults.isLoading}
              />
            </Box>
          )}
        </Stack>
        <CippPropertyListCard
          actionButton={
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => taskDetailResults.refetch()}>
                <Sync />
              </IconButton>
            </Tooltip>
          }
          layout="dual"
          title="Details"
          variant="outlined"
          showDivider={false}
          propertyItems={taskProperties
            .filter((prop) => taskDetails?.Task?.[prop] != null && taskDetails?.Task?.[prop] !== "")
            .map((prop) => {
              return {
                label: getCippTranslation(prop),
                value: getCippFormatting(taskDetails?.Task?.[prop], prop),
              };
            })}
          isFetching={taskDetailResults.isFetching}
        />

        {taskDetails?.Task?.Trigger && (
          <Accordion
            variant="outlined"
            expanded={expanded === "task-trigger"}
            onChange={handleChange("task-trigger")}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Trigger Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CippPropertyListCard
                showDivider={false}
                layout="dual"
                propertyItems={Object.entries(taskDetails.Task.Trigger).map(([key, value]) => {
                  return {
                    label: key,
                    value: getCippFormatting(value, key),
                  };
                })}
                isFetching={taskDetailResults.isFetching}
              />
            </AccordionDetails>
          </Accordion>
        )}

        {taskDetailResults.isFetching ? (
          <Skeleton variant="rectangular" width="100%" height={200} />
        ) : (
          <>
            {taskDetails?.Task?.Parameters && (
              <Accordion
                variant="outlined"
                expanded={expanded === "task-parameters"}
                onChange={handleChange("task-parameters")}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Task Parameters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <CippPropertyListCard
                    showDivider={false}
                    layout="dual"
                    propertyItems={Object.entries(taskDetails.Task.Parameters).map(
                      ([key, value]) => {
                        return {
                          label: key,
                          value: getCippFormatting(value, key),
                        };
                      }
                    )}
                    isFetching={taskDetailResults.isFetching}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </>
        )}

        {taskDetailResults.isFetching ? (
          <Skeleton variant="rectangular" width="100%" height={400} />
        ) : (
          <>
            {taskDetails?.Details?.length > 0 && (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 4, mb: 2 }}
                >
                  <Typography variant="h6">
                    Execution Results{" "}
                    {filteredDetails && (
                      <Typography component="span" variant="body2" color="text.secondary">
                        ({filteredDetails.length} of {taskDetails.Details.length})
                      </Typography>
                    )}
                  </Typography>
                  <TextField
                    size="small"
                    variant="outlined"
                    sx={{ width: 250 }}
                    placeholder="Search results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <Tooltip title="Clear search">
                            <IconButton
                              size="small"
                              onClick={() => setSearchQuery("")}
                              aria-label="Clear search"
                            >
                              <Close />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
                <Stack>
                  {filteredDetails &&
                    filteredDetails.map((result, index) => (
                      <Accordion
                        key={`result-${index}`}
                        variant="outlined"
                        expanded={expanded === `execution-results-${index}`}
                        onChange={handleChange(`execution-results-${index}`)}
                        sx={{ mb: 2 }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{
                            "& .MuiAccordionSummary-content": {
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {getCippFormatting(result.TenantName || result.Tenant, "Tenant")}
                          </Box>
                          <Chip
                            size="small"
                            color="info"
                            variant="outlined"
                            label={<CippTimeAgo data={result.Timestamp} />}
                            sx={{ mx: 1 }}
                          />
                        </AccordionSummary>
                        <AccordionDetails>
                          {result.Results === "null" || !result.Results ? (
                            <Typography color="text.secondary">No data available</Typography>
                          ) : Array.isArray(result.Results) ? (
                            <CippDataTable
                              noCard
                              data={result.Results}
                              disablePagination={result.Results.length <= 10}
                            />
                          ) : typeof result.Results === "object" ? (
                            <CippPropertyListCard
                              propertyItems={Object.entries(result.Results).map(([key, value]) => ({
                                label: key,
                                value: typeof value === "object" ? JSON.stringify(value) : value,
                              }))}
                            />
                          ) : (
                            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
                              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {result.Results}
                              </pre>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  {filteredDetails && filteredDetails.length === 0 && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No results match your search criteria
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>
    </>
  );
};

export default ScheduledTaskDetails;
