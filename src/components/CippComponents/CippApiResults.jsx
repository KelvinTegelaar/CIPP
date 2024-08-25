import { Close } from "@mui/icons-material";
import { Alert, CircularProgress, Collapse, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export const CippApiResults = (props) => {
  const { apiObject } = props;

  const [errorVisible, setErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [fetchingVisible, setFetchingVisible] = useState(false);

  useEffect(() => {
    if (apiObject.isError) {
      setErrorVisible(true);
    }
    if (apiObject.isSuccess) {
      setSuccessVisible(true);
    }
    if (apiObject.isFetching || (apiObject.isIdle === false && apiObject.isPending === true)) {
      setFetchingVisible(true);
    } else {
      setFetchingVisible(false);
    }
  }, [apiObject.isError, apiObject.isSuccess, apiObject.isFetching, apiObject.isPending]);

  return (
    <>
      <Collapse in={fetchingVisible}>
        <Alert
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
          severity="success"
        >
          <Typography variant="body2">
            <CircularProgress size={20} /> Loading...
          </Typography>
        </Alert>
      </Collapse>
      <Collapse in={errorVisible}>
        {apiObject.isError && (
          <Alert
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
            {apiObject.error.response?.data?.result
              ? apiObject.error.response?.data.result
              : apiObject.error.message}
          </Alert>
        )}
      </Collapse>
      <Collapse in={successVisible}>
        {apiObject.isSuccess && (
          <Alert
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
            {apiObject.data?.data?.result}
          </Alert>
        )}
      </Collapse>
    </>
  );
};
