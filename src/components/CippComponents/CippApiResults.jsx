import { Close } from "@mui/icons-material";
import { Alert, CircularProgress, Collapse, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getCippError } from "../../utils/get-cipp-error";

export const CippApiResults = (props) => {
  const { apiObject, errorsOnly = false, alertSx = {} } = props;

  const [errorVisible, setErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [fetchingVisible, setFetchingVisible] = useState(false);
  const [partialResults, setPartialResults] = useState([]);

  useEffect(() => {
    if (apiObject.isError) {
      setErrorVisible(true);
    } else {
      setErrorVisible(false);
    }

    if (!errorsOnly) {
      if (apiObject.isFetching || (apiObject.isIdle === false && apiObject.isPending === true)) {
        setFetchingVisible(true);
      } else {
        setFetchingVisible(false);
      }

      if (apiObject.isSuccess || partialResults.length > 0) {
        setSuccessVisible(true);
      } else {
        setSuccessVisible(false);
      }
    }
  }, [
    apiObject.isError,
    apiObject.isSuccess,
    apiObject.isFetching,
    apiObject.isPending,
    partialResults.length,
    errorsOnly,
  ]);

  useEffect(() => {
    if (apiObject.data && Array.isArray(apiObject.data)) {
      setPartialResults(apiObject.data); // Simply set the new array
    }
  }, [apiObject.data]);

  return (
    <>
      {!errorsOnly && (
        <Collapse in={fetchingVisible}>
          <Alert
            sx={alertSx}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setFetchingVisible((prev) => !prev);
                }}
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
                onClick={() => {
                  setErrorVisible((prev) => !prev);
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {getCippError(apiObject.error)}
          </Alert>
        )}
      </Collapse>
      {!errorsOnly && (
        <Collapse in={successVisible}>
          {apiObject.data && (
            <Alert
              sx={alertSx}
              variant="filled"
              severity="success"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setSuccessVisible((prev) => !prev);
                  }}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              }
            >
              <ul>
                {partialResults.map((result, index) => (
                  <li key={index}>
                    {result.Results} THIS API IS CURRENTLY RETURNING A SINGLE OBJECT MESSAGE AND
                    NEEDS TO BE CHANGED TO RETURN AN ARRAY WITH OBJECTS: results, copyInfo
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </Collapse>
      )}
    </>
  );
};
