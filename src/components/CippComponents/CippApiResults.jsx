import { Close, ContentCopy } from "@mui/icons-material";
import { Alert, CircularProgress, Collapse, IconButton, Typography } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { getCippError } from "../../utils/get-cipp-error";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { Grid } from "@mui/system";

const extractAllResults = (data) => {
  const results = [];

  const getSeverity = (text) => {
    if (typeof text !== "string") return "success";
    return /error|failed|exception|not found/i.test(text) ? "error" : "success";
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
      const copyField = item.copyField || text;
      const severity =
        typeof item.state === "string" ? item.state : getSeverity(item) ? "error" : "success";

      if (text) {
        return {
          text,
          copyField,
          severity,
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

    const ignoreKeys = ["metadata", "Metadata"];

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
  };

  extractFrom(data);
  return results;
};

export const CippApiResults = (props) => {
  const { apiObject, errorsOnly = false, alertSx = {} } = props;

  const [errorVisible, setErrorVisible] = useState(false);
  const [fetchingVisible, setFetchingVisible] = useState(false);
  const [finalResults, setFinalResults] = useState([]);
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
  }, [apiObject]);

  useEffect(() => {
    setErrorVisible(!!apiObject.isError);

    if (!errorsOnly) {
      if (apiObject.isFetching || (apiObject.isIdle === false && apiObject.isPending === true)) {
        setFetchingVisible(true);
      } else {
        setFetchingVisible(false);
      }
      if (allResults.length > 0) {
        setFinalResults(
          allResults.map((res, index) => ({
            id: index,
            text: res.text,
            copyField: res.copyField,
            severity: res.severity,
            visible: true,
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

  const handleCloseResult = (id) => {
    setFinalResults((prev) => prev.map((r) => (r.id === id ? { ...r, visible: false } : r)));
  };

  const hasVisibleResults = finalResults.some((r) => r.visible);
  return (
    <>
      {/* Loading alert */}
      {!errorsOnly && (
        <Collapse in={fetchingVisible}>
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
      <Collapse in={errorVisible}>
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
        <Grid container spacing={2}>
          {finalResults.map((resultObj) => (
            <Grid item size={12} key={resultObj.id}>
              <Collapse in={resultObj.visible}>
                <Alert
                  sx={alertSx}
                  variant="filled"
                  severity={resultObj.severity || "success"}
                  action={
                    <>
                      <CippCopyToClipBoard text={resultObj.copyField || resultObj.text} />
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
                  {resultObj.text}
                </Alert>
              </Collapse>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};
