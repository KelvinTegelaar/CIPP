import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";

export const BreachSearchDialog = ({ createDialog }) => {
  const tenantFilter = useSettings()?.currentTenant;
  const methods = useForm({
    defaultValues: {},
  });

  // Use methods for form handling and control
  const { handleSubmit } = methods;

  const [isRunning, setIsRunning] = useState(false);
  const breachSearchResults = ApiPostCall({
    urlFromData: true,
  });

  const handleForm = () => {
    setIsRunning(true);
    breachSearchResults.mutate({
      url: "/api/ExecBreachSearch",
      queryKey: `breach-search-${tenantFilter}`,
      data: { tenantFilter: tenantFilter },
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
          <DialogTitle>Run Breach Search</DialogTitle>
          <DialogContent>
            <div className="mb-3">
              <p>
                This will run a breach search to check for potentially compromised passwords and information
                for the current tenant: <strong>{tenantFilter?.displayName || tenantFilter}</strong>
              </p>
            </div>
            <CippApiResults apiObject={breachSearchResults} alertSx={{ mt: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isRunning || breachSearchResults.isLoading}
              startIcon={<Search />}
            >
              Run Breach Search
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};