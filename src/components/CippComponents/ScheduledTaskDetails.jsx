import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import { CippCodeBlock } from "./CippCodeBlock";
import { ApiGetCall } from "../../api/ApiCall";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { Close, ExpandMore, Sync } from "@mui/icons-material";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippTimeAgo } from "/src/components/CippComponents/CippTimeAgo";

const ScheduledTaskDetails = ({ data }) => {
  const [taskDetails, setTaskDetails] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

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
    "Name",
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
    }
  }, [data.RowKey, taskDetailResults.isSuccess, taskDetailResults.data]);

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setDialogOpen(true);
  };

  return (
    <>
      <Dialog fullWidth maxWidth="xl" open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle sx={{ py: 2 }}>
          Task Result Details
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CippCodeBlock
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            code={selectedResult?.Results}
          />
        </DialogContent>
      </Dialog>

      <Box>
        <Typography variant="h6">Task Details</Typography>
        <CippPropertyListCard
          title={
            <Button onClick={() => taskDetailResults.refetch()} startIcon={<Sync />}>
              Refresh
            </Button>
          }
          layout="dual"
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

        {taskDetails?.Task?.Parameters && (
          <Accordion
            variant="outlined"
            expanded={expanded === "task-parameters"}
            onChange={handleChange("task-parameters")}
            sx={{ mt: 4 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Task Parameters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CippPropertyListCard
                showDivider={false}
                layout="dual"
                propertyItems={Object.entries(taskDetails.Task.Parameters).map(([key, value]) => {
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

        {taskDetails?.Details?.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Execution Results
            </Typography>
            <Stack>
              {taskDetails.Details.map((result, index) => (
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
                    <Typography>{result.TenantName || result.Tenant}</Typography>
                    <Chip
                      size="small"
                      color="info"
                      variant="outlined"
                      label={<CippTimeAgo data={result.Timestamp} />}
                      sx={{ mx: 1 }}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    {result.Results === "null" ? (
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
            </Stack>
          </>
        )}
      </Box>
    </>
  );
};

export default ScheduledTaskDetails;
