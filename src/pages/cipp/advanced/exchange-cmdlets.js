import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Button,
  Container,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiPostCall } from "/src/api/ApiCall";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { useState, useEffect } from "react";
import { Search, Close } from "@mui/icons-material";
import { CippFormTenantSelector } from "../../../components/CippComponents/CippFormTenantSelector";

const simpleColumns = ["Cmdlet"];
const roleColumns = ["Error", "Name", "Description"];
const apiUrl = "/api/ListExoRequest";
const pageTitle = "Available Exchange Cmdlets";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  const [searchResults, setSearchResults] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleDetails, setRoleDetails] = useState([]);
  const [selectedCmdlet, setSelectedCmdlet] = useState(null);

  const exchangeCmdlets = ApiPostCall({
    urlFromData: true,
    queryKey: "ExchangeCmdlets",
    onResult: (result) => {
      setSearchResults(result);
    },
  });

  const managementRole = ApiPostCall({
    urlFromData: true,
    queryKey: "ManagementRole",
    onResult: (result) => {
      setRoleDetails(result);
    },
  });

  const onSubmit = () => {
    const formData = formControl.getValues();
    exchangeCmdlets.mutate({
      url: apiUrl,
      data: {
        availableCmdlets: true,
        tenantFilter: formData.tenant.value,
        compliance: formData.compliance,
        asApp: formData.asApp,
      },
    });
  };

  const checkCmdletRoles = (row) => {
    setSelectedCmdlet(row.Cmdlet);
    managementRole.mutate({
      url: "/api/ListExoRequest",
      data: {
        cmdlet: "Get-ManagementRole",
        cmdParams: {
          cmdlet: row.Cmdlet,
        },
        compliance: formControl.getValues().compliance,
        tenantFilter: formControl.getValues().tenant.value,
      },
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    if (managementRole.isSuccess) {
      setRoleDetails(managementRole.data);
    }
  }, [managementRole.isSuccess]);

  const actions = [
    {
      label: "Check Roles",
      noConfirm: true,
      customFunction: checkCmdletRoles,
    },
  ];

  return (
    <Container>
      <Stack spacing={2} sx={{ p: 3, mt: 1 }}>
        <CippButtonCard component="accordion" title="Cmdlet Search" accordionExpanded={true}>
          <Grid container spacing={2}>
            {/* Tenant Filter */}
            <Grid size={{ md: 4, xs: 12 }}>
              <CippFormTenantSelector formControl={formControl} name="tenant" multiple={false} />
            </Grid>
            {/* Compliance Filter */}
            <Grid size={{ md: 4, xs: 12 }}>
              <CippFormComponent
                type="switch"
                name="compliance"
                label="Compliance"
                formControl={formControl}
              />
            </Grid>
            {/* AsApp Filter */}
            <Grid size={{ md: 4, xs: 12 }}>
              <CippFormComponent
                type="switch"
                name="asApp"
                label="As App"
                formControl={formControl}
              />
            </Grid>
            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Button onClick={onSubmit} variant="contained" color="primary" startIcon={<Search />}>
                Search
              </Button>
            </Grid>
          </Grid>
        </CippButtonCard>
        <CippDataTable
          title={pageTitle}
          simpleColumns={simpleColumns}
          data={searchResults?.Results ?? []}
          isFetching={exchangeCmdlets.isPending}
          refreshFunction={onSubmit}
          actions={actions}
        />
      </Stack>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2 }}>
          Permitted Roles for {selectedCmdlet}
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {roleDetails.isPending ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <CippDataTable
              noCard={true}
              title="Permitted Roles"
              simpleColumns={roleColumns}
              data={roleDetails?.data?.Results ?? []}
              isFetching={managementRole.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
