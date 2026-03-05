import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "./CippApiResults";

export const DomainAnalyserDialog = ({ createDialog }) => {
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

  const [isRunning, setIsRunning] = useState(false);
  const domainAnalyserResults = ApiPostCall({
    urlFromData: true,
  });

  const handleForm = (values) => {
    setIsRunning(true);
    domainAnalyserResults.mutate({
      url: "/api/ExecDomainAnalyser",
      queryKey: `domain-analyser-${values.tenantFilter}`,
      data: values.tenantFilter ? { TenantFilter: values.tenantFilter } : {},
    });
  };

  // Reset running state when dialog is closed
  const handleClose = () => {
    setIsRunning(false);
    createDialog.handleClose();
  };

  return (
    <Dialog open={createDialog.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleForm)}>
          <DialogTitle>Run Domain Analysis</DialogTitle>
          <DialogContent>
            <div className="mb-3">
              <p>
                This will run a Domain Analysis to check for DNS configuration issues. Select a
                tenant (or all tenants) below.
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
            <CippApiResults apiObject={domainAnalyserResults} alertSx={{ mt: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isRunning || domainAnalyserResults.isLoading}
              startIcon={<Refresh />}
            >
              Run Analysis
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
