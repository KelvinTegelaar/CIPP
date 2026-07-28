import {
  Close,
  Download,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error as ErrorIcon,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Typography,
  Box,
  SvgIcon,
  Tooltip,
  keyframes,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ApiGetCall } from "../../api/ApiCall";
import { getCippError } from "../../utils/get-cipp-error";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { CippCodeBlock } from "./CippCodeBlock";
import React from "react";
import { CippTableDialog } from "./CippTableDialog";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useDialog } from "../../hooks/use-dialog";

const extractAllResults = (data, extraIgnoreKeys = []) => {
  const results = [];

  const getSeverity = (text) => {
    if (typeof text !== "string") return "success";
    return /error|failed|exception|not found|invalid_grant/i.test(text) ? "error" : "success";
  };

  const processResultItem = (item) => {
    if (typeof item === "string") {
      return {
        text: item,
        copyField: item,
        severity: getSeverity(item),
      };
    }

    if (item && typeof item === "object") {
      const text = item.resultText || "";
      const copyField = item.copyField || "";
      const severity = typeof item.state === "string" ? item.state : getSeverity(text);
      const details = item.details || null;

      if (text) {
        return {
          text,
          copyField,
          severity,
          details,
          ...item,
        };
      }
    }
    return null;
  };

  const extractFrom = (obj) => {
    if (!obj) return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => extractFrom(item));
      return;
    }

    if (typeof obj === "string") {
      results.push({ text: obj, copyField: obj, severity: getSeverity(obj) });
      return;
    }

    if (obj?.resultText) {
      const processed = processResultItem(obj);
      if (processed) {
        results.push(processed);
      }
    } else {
      const ignoreKeys = ["metadata", "Metadata", "severity", ...extraIgnoreKeys];

      if (typeof obj === "object") {
        Object.keys(obj).forEach((key) => {
          const value = obj[key];
          if (ignoreKeys.includes(key)) return;
          if (["Results", "Result", "results", "result"].includes(key)) {
            if (Array.isArray(value)) {
              value.forEach((valItem) => {
                const processed = processResultItem(valItem);
                if (processed) {
                  results.push(processed);
                } else {
                  extractFrom(valItem);
                }
              });
            } else if (typeof value === "object") {
              const processed = processResultItem(value);
              if (processed) {
                results.push(processed);
              } else {
                extractFrom(value);
              }
            } else if (typeof value === "string") {
              results.push({
                text: value,
                copyField: value,
                severity: getSeverity(value),
              });
            }
          } else {
            extractFrom(value);
          }
        });
      }
    }
  };

  extractFrom(data);
  return results;
};

// Format result messages for readability
const FormattedResultText = ({ text, severity }) => {
  if (typeof text !== "string") {
    return <Typography variant="body2">{String(text)}</Typography>;
  }

  // Pattern: SharePoint token / CPV error — render structured guidance
  const isSharePointTokenError =
    text.includes("Failed to obtain a SharePoint token") ||
    text.includes("SharePoint denied access");
  if (isSharePointTokenError) {
    const colonIdx = text.indexOf(":");
    const preamble =
      colonIdx > 0 && colonIdx < 80 ? text.slice(0, colonIdx) : null;
    const detail = preamble ? text.slice(colonIdx + 1).trim() : text;
    return (
      <Stack spacing={1}>
        {preamble && (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {preamble}
          </Typography>
        )}
        <Typography variant="body2">{detail}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
          Suggested steps:
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: "1.2em" }}>
            <li>
              Run a <strong>CPV Refresh</strong> for this tenant from the tenant overview page
            </li>
            <li>Verify the site does not have restricted or unique permissions in SharePoint</li>
            <li>
              If the issue persists, check that the Manage365 SAM app has the necessary SharePoint
              delegated permissions
            </li>
          </ol>
        </Typography>
      </Stack>
    );
  }

  // Pattern: Litigation Hold license errors from Exchange Online
  const isLitigationHoldLicenseError =
    (text.includes("LitigationHold") ||
      text.includes("litigation hold") ||
      text.includes("Litigation Hold")) &&
    (text.includes("license") ||
      text.includes("License") ||
      text.includes("doesn't permit") ||
      text.includes("does not permit"));
  if (isLitigationHoldLicenseError) {
    const errorSplit = text.match(/^(.+?)\.\s*Error:\s*(.+)$/s);
    const heading = errorSplit ? errorSplit[1] : "Litigation Hold update failed";
    const errorDetail = errorSplit ? errorSplit[2].trim() : text;

    return (
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {heading}
        </Typography>
        <Typography variant="body2">{errorDetail}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
          Eligible licenses for Litigation Hold:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
            <li>Microsoft 365 Business Premium</li>
            <li>Microsoft 365 E3 or E5</li>
            <li>Office 365 E3 or E5</li>
            <li>Exchange Online Plan 2</li>
            <li>Exchange Online Plan 1 plus Exchange Online Archiving add-on</li>
          </ul>
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
          Suggested steps:
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: "1.2em" }}>
            <li>
              Open the user&apos;s <strong>Edit User</strong> page and assign an eligible license
            </li>
            <li>Wait a few minutes for Exchange Online to sync the new license</li>
            <li>Retry enabling Litigation Hold on this mailbox</li>
          </ol>
        </Typography>
      </Stack>
    );
  }

  // Pattern: eDiscovery permission / license errors
  const isEdiscoveryError =
    (text.includes("eDiscovery") || text.includes("ediscovery")) &&
    (text.includes("Authorization_RequestDenied") ||
      text.includes("403") ||
      text.includes("Forbidden") ||
      text.includes("not found") ||
      text.includes("license"));
  if (isEdiscoveryError) {
    const isPermission =
      text.includes("Authorization_RequestDenied") ||
      text.includes("403") ||
      text.includes("Forbidden");
    const isLicense = text.includes("license") || text.includes("SKU");
    return (
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {isPermission
            ? "eDiscovery Permission Error"
            : isLicense
              ? "eDiscovery License Error"
              : "eDiscovery Error"}
        </Typography>
        <Typography variant="body2">{text}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
          Suggested steps:
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: "1.2em" }}>
            {isPermission && (
              <>
                <li>
                  Run a <strong>CPV Refresh</strong> from Manage365 Settings to push eDiscovery
                  permissions to this tenant
                </li>
                <li>
                  Assign the <strong>eDiscovery Administrator</strong> role to the Manage365 service
                  principal in the tenant&apos;s{" "}
                  <strong>Purview portal &gt; Roles &amp; Scopes &gt; Permissions</strong>
                </li>
              </>
            )}
            {isLicense && (
              <li>
                This tenant requires a <strong>Microsoft 365 E3 or E5</strong> license with
                eDiscovery capabilities
              </li>
            )}
            <li>
              If the issue persists, verify the Manage365 SAM app registration includes{" "}
              <strong>eDiscovery.ReadWrite.All</strong> application permission
            </li>
          </ol>
        </Typography>
      </Stack>
    );
  }

  // Pattern: error with Diagnostics section from backend policy checks
  if (text.includes("Diagnostics:")) {
    const [prelude, ...diagParts] = text.split(/Diagnostics:\s*/);
    const diagText = diagParts.join("Diagnostics: ");

    const preludeMatch = prelude.trim().match(/^(.+?)\.\s*Error:\s*(.+)$/s);
    const heading = preludeMatch ? preludeMatch[1] : null;
    const errorDetail = preludeMatch ? preludeMatch[2].trim() : prelude.trim();

    const diagItems = diagText
      .split(/\n\n|\r?\n(?=\[)/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parseDiagItem = (item) => {
      const catMatch = item.match(/^\[([^\]]+)\]\s*/);
      const category = catMatch ? catMatch[1] : null;
      const rest = catMatch ? item.slice(catMatch[0].length) : item;
      const settingsMatch = rest.match(/\s*CIPP Settings:\s*(\S+)\s*$/);
      const message = settingsMatch ? rest.slice(0, settingsMatch.index).trim() : rest.trim();
      const settingsPath = settingsMatch ? settingsMatch[1] : null;
      return { category, message, settingsPath };
    };

    return (
      <Stack spacing={1.5}>
        {heading && (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {heading}
          </Typography>
        )}
        {errorDetail && (
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {errorDetail}
          </Typography>
        )}
        {diagItems.length > 0 && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              Diagnostics:
            </Typography>
            <Stack spacing={1.5}>
              {diagItems.map((item, i) => {
                const { category, message, settingsPath } = parseDiagItem(item);
                return (
                  <Box key={i}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                      {category && (
                        <Chip
                          label={category}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {message}
                    </Typography>
                    {settingsPath && (
                      <Button
                        href={settingsPath}
                        size="small"
                        variant="outlined"
                        startIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          mt: 0.5,
                        }}
                      >
                        Open Manage365 Settings
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
      </Stack>
    );
  }

  // Pattern: UPN/email conflict with identified conflicting object
  const conflictMatch = text.match(
    /^(.+?Another object with the same value for property \S+ already exists\.)\s*Conflict:\s*(.+)$/s
  );
  if (conflictMatch) {
    const errorMsg = conflictMatch[1];
    const conflictDetail = conflictMatch[2];

    const nameMatch = conflictDetail.match(/Conflicting ([^:]+):\s*'([^']+)'/);
    const upnMatch = conflictDetail.match(/\(UPN:\s*([^)]+)\)/);
    const mailMatch = conflictDetail.match(/\(Mail:\s*([^)]+)\)/);
    const idMatch = conflictDetail.match(/\[ID:\s*([^\]]+)\]/);
    const statusMatch = conflictDetail.match(/Account is (enabled|disabled)/);

    return (
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {errorMsg}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
          Conflicting object details:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: "1.2em" }}>
          {nameMatch && (
            <li>
              <Typography variant="body2">
                <strong>Type:</strong> {nameMatch[1]} &mdash; <strong>Name:</strong>{" "}
                {nameMatch[2]}
              </Typography>
            </li>
          )}
          {upnMatch && (
            <li>
              <Typography variant="body2">
                <strong>UPN:</strong> {upnMatch[1]}
              </Typography>
            </li>
          )}
          {mailMatch && (
            <li>
              <Typography variant="body2">
                <strong>Email:</strong> {mailMatch[1]}
              </Typography>
            </li>
          )}
          {idMatch && (
            <li>
              <Typography variant="body2">
                <strong>Object ID:</strong> {idMatch[1]}
              </Typography>
            </li>
          )}
          {statusMatch && (
            <li>
              <Typography variant="body2">
                <strong>Status:</strong> Account is {statusMatch[1]}
              </Typography>
            </li>
          )}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
          To resolve this conflict:
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: "1.2em" }}>
            <li>
              Rename or remove the conflicting object listed above
            </li>
            <li>
              If the conflicting account is disabled or no longer needed, consider deleting it
            </li>
            <li>
              If it is a soft-deleted object, purge it from the Entra ID recycle bin
            </li>
          </ol>
        </Typography>
      </Stack>
    );
  }

  // Pattern: "Failed to X. Error: Y" or "Successfully X. Message: Y"
  const errorSplit = text.match(/^(.+?)\.\s*Error:\s*(.+)$/s);
  if (errorSplit) {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {errorSplit[1]}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, opacity: 0.9, wordBreak: "break-word" }}
        >
          {errorSplit[2]}
        </Typography>
      </Box>
    );
  }

  // Pattern: quoted names like 'SiteName' or "SiteName" — bold them
  const hasQuotedNames = /['"][^'"]+['"]/.test(text);
  if (hasQuotedNames) {
    const parts = text.split(/(['"][^'"]+['"])/g);
    return (
      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
        {parts.map((part, i) =>
          /^['"]/.test(part) ? (
            <strong key={i}>{part}</strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </Typography>
    );
  }

  return (
    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
      {text}
    </Typography>
  );
};

const capitalize = (text) =>
  typeof text === "string" && text.length > 0 ? text.charAt(0).toUpperCase() + text.slice(1) : text;

const JOB_STATUS_CHIP_COLORS = {
  queued: "default",
  running: "info",
  succeeded: "success",
  failed: "error",
};

// Status icon for a single job step.
const JobStepIcon = ({ status }) => {
  if (status === "succeeded") return <CheckCircle fontSize="small" color="success" />;
  if (status === "failed") return <ErrorIcon fontSize="small" color="error" />;
  if (status === "running") return <CircularProgress size={16} />;
  return <RadioButtonUnchecked fontSize="small" color="disabled" />;
};

// Live job progress rows (GDAP-onboarding style): one block per row (usually a tenant) with
// its steps, driven by the jobProgress polling in CippApiResults.
const CippJobProgress = ({ rows }) => (
  <Stack spacing={2}>
    {rows.map((row, rowIndex) => (
      <Box key={row.Tenant ?? row.Name ?? rowIndex}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">{row.Tenant ?? row.Name}</Typography>
          <Chip
            size="small"
            label={capitalize(row.Status)}
            color={JOB_STATUS_CHIP_COLORS[row.Status] || "default"}
            variant={row.Status === "queued" ? "outlined" : "filled"}
          />
        </Stack>
        <Stack spacing={1}>
          {(row.Steps || []).map((step, index) => (
            <Stack direction="row" spacing={1} alignItems="flex-start" key={index}>
              <Box sx={{ pt: 0.25 }}>
                <JobStepIcon status={step.Status} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">{step.Title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.Message}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    ))}
  </Stack>
);

export const CippApiResults = (props) => {
  const { apiObject, errorsOnly = false, alertSx = {}, jobProgress = null } = props;

  const [errorVisible, setErrorVisible] = useState(false);
  const [fetchingVisible, setFetchingVisible] = useState(false);
  const [finalResults, setFinalResults] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [jobId, setJobId] = useState(null);
  const [jobPollActive, setJobPollActive] = useState(false);
  const tableDialog = useDialog();

  // Optional live job progress: when the mutation result carries jobProgress.idField, poll
  // jobProgress.url(id) until every row reaches a terminal state.
  const jobIdField = jobProgress?.idField ?? "JobId";
  useEffect(() => {
    if (!jobProgress) return;
    if (apiObject.isPending) {
      setJobId(null);
      setJobPollActive(false);
      return;
    }
    if (!apiObject.isSuccess) return;
    const raw = apiObject?.data?.data ?? apiObject?.data;
    const item = Array.isArray(raw) ? raw[0] : raw;
    const id = item?.[jobIdField];
    if (id) {
      setJobId(id);
      setJobPollActive(true);
    }
  }, [jobProgress, jobIdField, apiObject.isPending, apiObject.isSuccess, apiObject.data]);

  const jobStatus = ApiGetCall({
    url: jobProgress && jobId ? jobProgress.url(jobId) : null,
    queryKey: `CippJobProgress-${jobId}`,
    waiting: !!(jobProgress && jobId),
    refetchInterval: jobPollActive ? (jobProgress?.interval ?? 5000) : false,
    staleTime: 0,
  });
  const jobRows = Array.isArray(jobStatus.data) ? jobStatus.data : [];
  useEffect(() => {
    if (
      jobPollActive &&
      jobRows.length > 0 &&
      jobRows.every((row) => row.Status === "succeeded" || row.Status === "failed")
    ) {
      setJobPollActive(false);
    }
  }, [jobPollActive, jobRows]);
  const pageTitle = `${document.title} - Results`;
  const correctResultObj = useMemo(() => {
    if (!apiObject.isSuccess) return;

    const data = apiObject?.data;
    const dataData = data?.data;
    if (dataData !== undefined && dataData !== null) {
      if (dataData?.Results) {
        return dataData.Results;
      } else if (typeof dataData === "object" && dataData !== null && !("metadata" in dataData)) {
        return dataData;
      } else if (typeof dataData === "string") {
        return dataData;
      } else {
        return "This API has not sent the correct output format.";
      }
    }
    if (data?.Results) {
      return data.Results;
    } else if (typeof data === "object" && data !== null && !("metadata" in data)) {
      return data;
    } else if (typeof data === "string") {
      return data;
    }

    return "This API has not sent the correct output format.";
  }, [apiObject]);

  const allResults = useMemo(() => {
    // Tag every result with the index of the action (bulk request item) it came from,
    // so multi-action runs can be rolled up into a summary alert.
    const sourceItems = Array.isArray(correctResultObj) ? correctResultObj : [correctResultObj];
    // Don't render the job id (e.g. DeploymentId) as a result alert of its own.
    const jobIgnoreKeys = jobProgress ? [jobIdField] : [];
    const apiResults = sourceItems.flatMap((item, groupIndex) =>
      extractAllResults(item, jobIgnoreKeys).map((r) => ({ ...r, groupIndex })),
    );

    // Also extract error results if there's an error
    if (apiObject.isError && apiObject.error) {
      const errorData = apiObject.error?.response?.data;
      const errorItems = Array.isArray(errorData) ? errorData : [errorData];
      const errorResults = errorItems.flatMap((item, index) =>
        extractAllResults(item).map((r) => ({
          ...r,
          severity: "error",
          groupIndex: sourceItems.length + index,
        })),
      );
      if (errorResults.length > 0) {
        return [...apiResults, ...errorResults];
      }

      // Fallback to getCippError if extraction didn't work
      const processedError = getCippError(apiObject.error);
      if (typeof processedError === "string") {
        return [
          ...apiResults,
          {
            text: processedError,
            copyField: processedError,
            severity: "error",
            groupIndex: sourceItems.length,
          },
        ];
      }
    }

    return apiResults;
  }, [correctResultObj, apiObject.isError, apiObject.error, jobProgress, jobIdField]);

  useEffect(() => {
    setErrorVisible(!!apiObject.isError);

    if (apiObject.isFetching || (apiObject.isIdle === false && apiObject.isPending === true)) {
      setFetchingVisible(true);
    } else {
      setFetchingVisible(false);
    }
    const resultsToShow = errorsOnly
      ? allResults.filter((r) => r.severity === "error")
      : allResults;

    if (resultsToShow.length > 0) {
      setFinalResults(
        resultsToShow.map((res, index) => ({
          id: index,
          text: res.text,
          copyField: res.copyField,
          severity: res.severity,
          visible: true,
          ...res,
        })),
      );
    } else {
      setFinalResults([]);
    }
  }, [
    apiObject.isError,
    apiObject.isFetching,
    apiObject.isPending,
    apiObject.isIdle,
    allResults,
    errorsOnly,
  ]);

  const handleCloseResult = useCallback((id) => {
    setFinalResults((prev) => prev.map((r) => (r.id === id ? { ...r, visible: false } : r)));
  }, []);

  const toggleDetails = useCallback((id) => {
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleDownloadCsv = useCallback(() => {
    if (!finalResults?.length) return;

    const baseName = document.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fileName = `${baseName}-results.csv`;

    const headers = Object.keys(finalResults[0]);
    const rows = finalResults.map((item) =>
      headers.map((header) => `"${item[header] || ""}"`).join(","),
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [finalResults, apiObject]);

  const hasVisibleResults = finalResults.some((r) => r.visible);

  // Roll bulk results up by originating action so the user sees "X of Y actions failed".
  const actionGroups = [...new Set(finalResults.map((r) => r.groupIndex ?? r.id))];
  const actionCount = actionGroups.length;
  const failedActionCount = actionGroups.filter((group) =>
    finalResults.some((r) => (r.groupIndex ?? r.id) === group && r.severity === "error"),
  ).length;
  const successActionCount = actionCount - failedActionCount;

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {/* Loading alert */}
      {!errorsOnly && (
        <Collapse in={fetchingVisible} unmountOnExit>
          <Alert
            sx={alertSx}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setFetchingVisible(false)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
            variant="outlined"
            severity="info"
          >
            <Typography variant="body2">
              <CircularProgress size={20} /> Loading...
            </Typography>
          </Alert>
        </Collapse>
      )}
      {/* Summary rollup for bulk results */}
      {!errorsOnly && hasVisibleResults && actionCount > 1 && (
        <Alert
          sx={alertSx}
          variant="outlined"
          severity={
            failedActionCount === 0 ? "success" : successActionCount === 0 ? "error" : "warning"
          }
        >
          <Typography variant="body2">
            {failedActionCount === 0
              ? `All ${actionCount} actions completed successfully`
              : `${failedActionCount} of ${actionCount} actions failed${
                  successActionCount > 0 ? `, ${successActionCount} succeeded` : ""
                }`}
          </Typography>
        </Alert>
      )}
      {/* Individual result alerts */}
      {hasVisibleResults && (
        <>
          {finalResults.map((resultObj) => (
            <React.Fragment key={resultObj.id}>
              <Collapse in={resultObj.visible} unmountOnExit>
                <Alert
                  sx={{
                    ...alertSx,
                    display: "flex",
                    width: "100%",
                    "& .MuiAlert-message": {
                      width: "100%",
                      flex: "1 1 auto",
                      minWidth: 0, // Allows content to shrink
                    },
                    "& .MuiAlert-action": {
                      flex: "0 0 auto",
                      alignSelf: "flex-start",
                      marginLeft: "auto",
                    },
                  }}
                  variant="filled"
                  severity={resultObj.severity || "success"}
                  action={
                    <>
                      <CippCopyToClipBoard
                        color="inherit"
                        text={resultObj.copyField || resultObj.text}
                      />

                      {resultObj.details && (
                        <Tooltip
                          title={showDetails[resultObj.id] ? "Hide Details" : "Show Details"}
                        >
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={() => toggleDetails(resultObj.id)}
                            aria-label={showDetails[resultObj.id] ? "Hide Details" : "Show Details"}
                          >
                            {showDetails[resultObj.id] ? (
                              <ExpandLess fontSize="inherit" />
                            ) : (
                              <ExpandMore fontSize="inherit" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}

                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => handleCloseResult(resultObj.id)}
                      >
                        <Close fontSize="inherit" />
                      </IconButton>
                    </>
                  }
                >
                  <Box sx={{ width: "100%" }}>
                    <FormattedResultText text={resultObj.text} severity={resultObj.severity} />
                    {resultObj.details && (
                      <Collapse in={showDetails[resultObj.id]}>
                        <Box mt={2} sx={{ width: "100%" }}>
                          <CippCodeBlock
                            code={
                              typeof resultObj.details === "string"
                                ? resultObj.details
                                : JSON.stringify(resultObj.details, null, 2)
                            }
                            language={typeof resultObj.details === "object" ? "json" : "text"}
                            showLineNumbers={false}
                            type="syntax"
                            readOnly={true}
                          />
                        </Box>
                      </Collapse>
                    )}
                  </Box>
                </Alert>
              </Collapse>
            </React.Fragment>
          ))}
        </>
      )}
      {(apiObject.isSuccess || apiObject.isError) &&
      finalResults?.length > 0 &&
      hasVisibleResults ? (
        <Box display="flex" flexDirection="row">
          <Tooltip title="View Results">
            <IconButton onClick={() => tableDialog.handleOpen()}>
              <SvgIcon>
                <EyeIcon />
              </SvgIcon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Results">
            <IconButton aria-label="download-csv" onClick={handleDownloadCsv}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
      {/* Live job progress (opt-in via the jobProgress prop) */}
      {jobProgress && jobId && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6">{jobProgress.title ?? "Progress"}</Typography>
            {jobPollActive && <CircularProgress size={16} />}
          </Stack>
          {jobRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Waiting for the first status update...
            </Typography>
          ) : (
            <CippJobProgress rows={jobRows} />
          )}
        </Box>
      )}
      {tableDialog.open && (
        <CippTableDialog
          createDialog={tableDialog}
          title={pageTitle}
          data={finalResults}
          noCard={true}
          simpleColumns={["severity", "text", "copyField"]}
        />
      )}
    </Stack>
  );
};
