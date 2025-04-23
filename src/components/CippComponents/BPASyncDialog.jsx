import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Error, Sync } from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippApiResults } from "./CippApiResults";

export const BPASyncDialog = ({ createDialog }) => {
  const methods = useForm({
    defaultValues: {
      tenantFilter: {
        value: "AllTenants",
        label: "*All Tenants",
      },
    },
  });

  // Use methods for form handling and control
  const { handleSubmit, control } = methods;

  const [isSyncing, setIsSyncing] = useState(false);
  const bpaSyncResults = ApiPostCall({
    urlfromdata: true,
  });

  const handleForm = (values) => {
    bpaSyncResults.mutate({
      url: "/api/ExecBPA",
      queryKey: `bpa-sync-${values.tenantFilter}`,
      data: values.tenantFilter ? { TenantFilter: values.tenantFilter } : {},
    });
  };

  // Reset syncing state when dialog is closed
  const handleClose = () => {
    setIsSyncing(false);
    createDialog.handleClose();
  };

  return (
    <Dialog open={createDialog.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleForm)}>
          <DialogTitle>Force BPA Sync</DialogTitle>
          <DialogContent>
            <div className="mb-3">
              <p>
                This will force a Best Practice Analyzer (BPA) sync. Select a tenant (or all
                tenants) below.
              </p>
              <CippFormTenantSelector
                formControl={control}
                name="tenantFilter"
                required={false}
                disableClearable={false}
                allTenants={true}
                type="single"
              />
            </div>
            <CippApiResults apiObject={bpaSyncResults} alertSx={{ mt: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSyncing && bpaSyncResults.isLoading}
              startIcon={<Sync />}
            >
              Sync BPA
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
