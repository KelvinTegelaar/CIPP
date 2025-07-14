import { Close, Download, Help, ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Typography,
  Box,
  SvgIcon,
  Tooltip,
  Button,
  keyframes,
} from "@mui/material";
import { useEffect, useState, useMemo, useCallback } from "react";
import { getCippError } from "../../utils/get-cipp-error";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { CippDocsLookup } from "./CippDocsLookup";
import { CippCodeBlock } from "./CippCodeBlock";
import React from "react";
import { CippTableDialog } from "./CippTableDialog";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useDialog } from "../../hooks/use-dialog";

const extractAllResults = (data) => {
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
      const severity =
        typeof item.state === "string" ? item.state : getSeverity(item) ? "error" : "success";
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
      const ignoreKeys = ["metadata", "Metadata", "severity"];

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

export const CippApiResults = (props) => {
  const { apiObject, errorsOnly = false, alertSx = {} } = props;

  const [errorVisible, setErrorVisible] = useState(false);
  const [fetchingVisible, setFetchingVisible] = useState(false);
  const [finalResults, setFinalResults] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const tableDialog = useDialog();
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
    const apiResults = extractAllResults(correctResultObj);
    return apiResults;
  }, [correctResultObj]);

  useEffect(() => {
    setErrorVisible(!!apiObject.isError);

    if (apiObject.isFetching || (apiObject.isIdle === false && apiObject.isPending === true)) {
      setFetchingVisible(true);
    } else {
      setFetchingVisible(false);
    }
    if (!errorsOnly) {
      if (allResults.length > 0) {
        setFinalResults(
          allResults.map((res, index) => ({
            id: index,
            text: res.text,
            copyField: res.copyField,
            severity: res.severity,
            visible: true,
            ...res,
          }))
        );
      } else {
        setFinalResults([]);
      }
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
      headers.map((header) => `"${item[header] || ""}"`).join(",")
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
  return (
    <Stack spacing={2}>
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
      {/* Error alert */}
      <Collapse in={errorVisible} unmountOnExit>
        {apiObject.isError && (
          <Alert
            sx={alertSx}
            variant="filled"
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setErrorVisible(false)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {getCippError(apiObject.error)}
          </Alert>
        )}
      </Collapse>

      {/* Individual result alerts */}
      {apiObject.isSuccess && !errorsOnly && hasVisibleResults && (
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
                      {resultObj.severity === "error" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          startIcon={<Help />}
                          onClick={() => {
                            const searchUrl = `https://docs.cipp.app/?q=Help+with:+${encodeURIComponent(
                              resultObj.copyField || resultObj.text
                            )}&ask=true`;
                            window.open(searchUrl, "_blank");
                          }}
                          sx={{
                            ml: 1,
                            mr: 1,
                            backgroundColor: "white",
                            color: "error.main",
                            "&:hover": {
                              backgroundColor: "grey.100",
                            },
                            py: 0.5,
                            px: 1,
                            minWidth: "auto",
                            fontSize: "0.875rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Get Help
                        </Button>
                      )}
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
                    <Typography variant="body2">{resultObj.text}</Typography>
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
