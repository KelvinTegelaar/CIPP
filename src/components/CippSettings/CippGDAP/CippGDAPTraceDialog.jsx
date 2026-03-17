import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "../../../api/ApiCall";
import CippFormComponent from "../../CippComponents/CippFormComponent";
import { CippGDAPTraceResults } from "./CippGDAPTraceResults";

export const CippGDAPTraceDialog = ({ createDialog, row, title = "Trace GDAP Access", onClose }) => {
  const formHook = useForm({
    defaultValues: {
      UPN: "",
    },
    mode: "onChange",
  });

  const [apiRequest, setApiRequest] = useState({
    url: "",
    waiting: false,
    queryKey: null,
    data: {},
  });

  const tenantFilter = row?.customerId || row?.defaultDomainName || "";

  const apiCall = ApiGetCall({
    url: apiRequest.url,
    queryKey: apiRequest.queryKey,
    enabled: apiRequest.waiting && !!apiRequest.url,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (createDialog.open) {
      formHook.reset({ UPN: "" });
      setApiRequest({
        url: "",
        waiting: false,
        queryKey: null,
        data: {},
      });
    }
  }, [createDialog.open]);

  const onSubmit = (data) => {
    const url = `/api/ExecGDAPTrace?TenantFilter=${encodeURIComponent(tenantFilter)}&UPN=${encodeURIComponent(data.UPN)}`;
    setApiRequest({
      url: url,
      waiting: true,
      queryKey: Date.now(),
      data: data,
    });
  };

  const handleClose = () => {
    createDialog.handleClose();
    formHook.reset();
    setApiRequest({
      url: "",
      waiting: false,
      queryKey: null,
      data: {},
    });
    if (onClose) {
      onClose();
    }
  };

  const isLoading = apiCall.isFetching || apiCall.isPending;
  const error = apiCall.isError ? apiCall.error?.response?.data?.Error || apiCall.error?.message : null;
  const data = apiCall.isSuccess ? (apiCall.data?.data || apiCall.data) : null;

  return (
    <Dialog fullWidth maxWidth="lg" onClose={handleClose} open={createDialog.open}>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>
              <strong>Beta Feature:</strong> This GDAP access tracing feature is currently in beta and may not
              account for all scenarios. Results should be used as a reference and verified through other
              methods when making critical access decisions.
            </Alert>
            <Box>
              <CippFormComponent
                formControl={formHook}
                type="textField"
                name="UPN"
                label="User Principal Name (UPN)"
                placeholder="user@domain.com"
                required={true}
                row={row}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <CippGDAPTraceResults data={data} isLoading={isLoading} error={error} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!formHook.formState.isValid || isLoading}
          >
            {isLoading ? "Tracing..." : "Trace"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
