import { Close, ContentCopy } from "@mui/icons-material";
import { Alert, CircularProgress, Collapse, IconButton, Typography } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { getCippError } from "../../utils/get-cipp-error";
import { CippCopyToClipBoard } from "./CippCopyToClipboard";
import { Grid } from "@mui/system";

/**
 * Recursively extract all possible results from an object that might contain:
 * - `Results`, `Result`, `results`, `result`
 * This function traverses all keys in the object to ensure no results are missed.
 */
const extractAllResults = (data) => {
  const results = [];

  const extractFrom = (obj) => {
    if (!obj) return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => extractFrom(item));
      return;
    }

    if (typeof obj === "string") {
      // Optionally, you can decide whether to include standalone strings
      // results.push(obj);
      return;
    }

    if (typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (["Results", "Result", "results", "result"].includes(key)) {
          if (
            typeof value === "string" ||
            (Array.isArray(value) && value.every((v) => typeof v === "string"))
          ) {
            results.push(value);
          } else {
            // If the value is not a string, recursively extract from it
            extractFrom(value);
          }
        } else {
          // Recursively traverse other keys
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

  // Extract results from the entire apiObject
  const allResults = useMemo(() => {
    const apiResults = extractAllResults(apiObject);
    console.log("Extracted Results:", apiResults); // Debugging log
    return [...new Set(apiResults)]; // Deduplicate results
  }, [apiObject]);

  useEffect(() => {
    // Handle error visibility
    setErrorVisible(!!apiObject.isError);

    if (!errorsOnly) {
      // Handle fetching visibility
      if (apiObject.isFetching || (apiObject.isIdle === false && apiObject.isPending === true)) {
        setFetchingVisible(true);
      } else {
        setFetchingVisible(false);
      }

      // Handle success results based on presence of data
      if (allResults.length > 0) {
        setFinalResults(
          allResults.map((res, index) => ({
            id: index, // Unique ID for each result
            text: res,
            visible: true,
          }))
        );
      } else {
        setFinalResults([]); // Clear results if none are present
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
  console.log("API", apiObject); // Debugging log
  return (
    <>
      {/* Loading alert (only one) */}
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
      {!errorsOnly && hasVisibleResults && (
        <Grid container spacing={2}>
          {finalResults.map((resultObj) => (
            <Grid item size={12}>
              <Collapse key={resultObj.id} in={resultObj.visible}>
                <Alert
                  sx={alertSx}
                  variant="filled"
                  severity="success"
                  action={
                    <>
                      <CippCopyToClipBoard text={resultObj.text}>
                        <IconButton aria-label="copy" color="inherit" size="small">
                          <ContentCopy fontSize="inherit" />
                        </IconButton>
                      </CippCopyToClipBoard>
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
