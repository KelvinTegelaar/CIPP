import {
  Box,
  Button,
  CardActions,
  CardContent,
  Stack,
  Skeleton,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";
import { CippDataTable } from "../CippTable/CippDataTable";
import { PlusSmallIcon, SparklesIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { Sync, SyncAlt } from "@mui/icons-material";
import { CippFormComponent } from "../CippComponents/CippFormComponent";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiGetCallWithPagination } from "../../api/ApiCall";

const CippIntegrationSettings = ({ children }) => {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);

  const mappings = ApiGetCall({
    url: "/api/ExecExtensionMapping",
    data: {
      List: router.query.id,
    },
    queryKey: `IntegrationTenantMapping-${router.query.id}`,
  });

  const tenantList = ApiGetCallWithPagination({
    url: "/api/ListTenants",
    data: { AllTenantSelector: false },
    queryKey: "ListTenants-notAllTenants",
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: mappings?.data,
  });

  const automapPostCall = ApiPostCall({
    datafromUrl: true,
  });

  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: [`IntegrationTenantMapping-${router.query.id}`],
  });

  const handleSubmit = () => {
    postCall.mutate({
      url: `/api/ExecExtensionMapping?AddMapping=${router.query.id}`,
      data: tableData,
    });
  };

  const handleRemoveItem = (rows) => {
    if (rows === undefined) return false;
    const newTableData = [...tableData];
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        const index = newTableData.findIndex((item) => item === row);
        if (index !== -1) newTableData.splice(index, 1);
      });
    } else {
      const index = newTableData.findIndex((item) => item === rows);
      if (index !== -1) newTableData.splice(index, 1);
    }
    setTableData(newTableData);
  };

  const handleAddItem = () => {
    const selectedTenant = formControl.getValues("tenantFilter");
    const selectedCompany = formControl.getValues("integrationCompany");
    if (!selectedTenant || !selectedCompany) return;
    if (tableData?.find((item) => item.TenantId === selectedTenant.addedFields.customerId)) return;

    const newRowData = {
      TenantId: selectedTenant.value,
      Tenant: selectedTenant.label,
      IntegrationName: selectedCompany.label,
      IntegrationId: selectedCompany.value,
      TenantDomain: selectedTenant.addedFields.defaultDomainName,
    };

    setTableData([...tableData, newRowData]);
  };

  const handleAutoMap = () => {
    const newTableData = [];
    tenantList.data?.pages[0]?.forEach((tenant) => {
      const matchingCompany = mappings.data.Companies.find(
        (company) => company.name === tenant.displayName
      );
      if (
        Array.isArray(tableData) &&
        tableData?.find((item) => item.TenantId === tenant.customerId)
      )
        return;
      if (matchingCompany) {
        newTableData.push({
          TenantId: tenant.customerId,
          Tenant: tenant.displayName,
          TenantDomain: tenant.defaultDomainName,
          IntegrationName: matchingCompany.name,
          IntegrationId: matchingCompany.value,
        });
      }
    });
    if (Array.isArray(tableData)) {
      setTableData([...tableData, ...newTableData]);
    } else {
      setTableData(newTableData);
    }
    if (extension.autoMapSyncApi) {
      automapPostCall.mutate({
        url: `/api/ExecExtensionMapping?AutoMapping=${router.query.id}`,
        queryKey: `IntegrationTenantMapping-${router.query.id}`,
      });
    }
  };

  const actions = [
    {
      label: "Delete Mapping",
      icon: <TrashIcon />,
      confirmText: "Are you sure you want to delete this mapping?",
      customFunction: handleRemoveItem,
    },
  ];

  const extension = extensions.find((extension) => extension.id === router.query.id);

  useEffect(() => {
    if (mappings.isSuccess) {
      setTableData(mappings.data.Mappings ?? []);
    }
  }, [mappings.isSuccess]);

  return (
    <>
      {mappings.isSuccess && extension ? (
        <>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Add a Tenant Mapping
            </Typography>
            <Grid
              container
              spacing={2}
              sx={{
                alignItems: "center",
                mb: 3,
              }}
            >
              <Grid item size={{ md: 4, xs: 12 }}>
                <Box sx={{ my: "auto" }}>
                  <CippFormTenantSelector
                    formControl={formControl}
                    multiple={false}
                    required={false}
                    disableClearable={false}
                    removeOptions={tableData.map((item) => item.TenantId)}
                    valueField="customerId"
                  />
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ my: "auto" }}>
                  <SvgIcon>
                    <SyncAlt />
                  </SvgIcon>
                </Box>
              </Grid>
              <Grid item size={{ md: 4, xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  fullWidth
                  name="integrationCompany"
                  formControl={formControl}
                  placeholder={`Select ${extension.name} Company`}
                  options={mappings?.data?.Companies?.map((company) => {
                    return {
                      label: company.name,
                      value: company.value,
                    };
                  })}
                  creatable={false}
                  multiple={false}
                  isFetching={mappings.isFetching}
                  sortOptions={true}
                />
              </Grid>
              <Grid item>
                <Stack direction={"row"} spacing={1}>
                  <Tooltip title="Add Mapping">
                    <Button size="small" onClick={() => handleAddItem()} variant="contained">
                      <SvgIcon>
                        <PlusSmallIcon />
                      </SvgIcon>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Automap Companies">
                    <Button size="small" onClick={() => handleAutoMap()} variant="contained">
                      <SvgIcon>
                        <SparklesIcon />
                      </SvgIcon>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Refresh Integration Mapping">
                    <Button
                      size="small"
                      onClick={() => {
                        mappings.refetch();
                      }}
                      variant="contained"
                    >
                      <SvgIcon>
                        <Sync />
                      </SvgIcon>
                    </Button>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
            <CippApiResults apiObject={automapPostCall} />
            <Box sx={{ borderTop: 1, borderColor: "divider" }}>
              <CippDataTable
                actions={actions}
                noCard={true}
                reportTitle={`${extension.id}-tenant-map`}
                data={tableData}
                simple={false}
                simpleColumns={["IntegrationName", "Tenant", "TenantDomain"]}
                isFetching={mappings.isFetching}
                refreshFunction={() => mappings.refetch()}
              />
            </Box>
            <CippApiResults apiObject={postCall} />
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              disabled={postCall.isPending}
              onClick={formControl.handleSubmit(handleSubmit)}
              type="submit"
              variant="contained"
            >
              Submit
            </Button>
          </CardActions>
        </>
      ) : (
        <CardContent>
          {mappings.isLoading && (
            <Box>
              <Grid container spacing={3}>
                <Grid item size={{ xs: 12 }}>
                  <Box>
                    <Skeleton variant="rectangular" height={60} />
                  </Box>
                </Grid>
                <Grid item size={{ xs: 12 }}>
                  <Box>
                    <Skeleton variant="rectangular" height={60} />
                  </Box>
                </Grid>
                <Grid item size={{ xs: 12 }}>
                  <Box>
                    <Skeleton variant="rectangular" height={300} />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {mappings.isSuccess && !extension && (
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12 }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ textAlign: "center" }}>Extension not found</Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      )}
    </>
  );
};

export default CippIntegrationSettings;
