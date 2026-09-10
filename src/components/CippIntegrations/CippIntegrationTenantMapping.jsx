import {
  Box,
  Button,
  CardActions,
  CardContent,
  IconButton,
  Stack,
  Skeleton,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { CippIcons } from "../../utils/icon-registry"
import { Grid } from "@mui/system";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useRouter } from "next/router";
import extensions from "../../data/Extensions.json";
import { useEffect } from "react";
import { CippDataTable } from "../CippTable/CippDataTable";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { CippFormComponent } from "../CippComponents/CippFormComponent";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiGetCallWithPagination } from "../../api/ApiCall";

const CippIntegrationSettings = ({ children }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  // Server-side automap writes the mappings itself, so the list has to be refetched or the
  // table keeps showing the pre-automap rows and the new mappings look like they failed.
  const automapPostCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: [`IntegrationTenantMapping-${router.query.id}`],
  });

  const postCall = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: [`IntegrationTenantMapping-${router.query.id}`],
  });

  const [syncTenantQuery, setSyncTenantQuery] = useState({ url: "", waiting: false, queryKey: "" });
  const syncTenantResults = ApiGetCall({
    ...syncTenantQuery,
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

    // Clear the form fields after successfully adding the mapping
    formControl.setValue("tenantFilter", null);
    formControl.setValue("integrationCompany", null);
  };

  // Companies often differ from the GDAP tenant name only by case or legal suffix
  // ("Company A LTD" vs "Company a Ltd" vs "Company A Limited"), so compare on a
  // normalized form: lowercased, punctuation stripped, trailing legal suffixes removed.
  const normalizeCompanyName = (name) => {
    if (!name) return "";
    let normalized = name
      .toLowerCase()
      .replace(/[.,'()&]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const legalSuffixes = /\s(ltd|limited|llc|llp|inc|incorporated|plc|pty|corp|corporation|gmbh|bv|co)$/;
    while (legalSuffixes.test(normalized)) {
      normalized = normalized.replace(legalSuffixes, "").trim();
    }
    return normalized;
  };

  const handleAutoMap = () => {
    const newTableData = [];
    tenantList.data?.pages[0]?.forEach((tenant) => {
      const normalizedTenant = normalizeCompanyName(tenant.displayName);
      const matchingCompanies = mappings.data.Companies.filter(
        (company) => normalizeCompanyName(company.name) === normalizedTenant
      );
      // More than one company collapsing to the same name is ambiguous - leave it manual.
      const matchingCompany = matchingCompanies.length === 1 ? matchingCompanies[0] : null;
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

  // Sync a single mapped tenant on demand. The backend already supports this via the TenantID
  // query param; we also pass the domain so the queued run is tagged to the tenant in the logbook.
  const handleSyncTenant = (row) => {
    const target = Array.isArray(row) ? row[0] : row;
    if (!target?.TenantId) return;
    // Re-clicking the same tenant reuses the query key, so trigger a refetch instead.
    if (syncTenantQuery.waiting && syncTenantQuery.data?.TenantID === target.TenantId) {
      syncTenantResults.refetch();
      return;
    }
    setSyncTenantQuery({
      url: "/api/ExecExtensionSync",
      data: {
        Extension: router.query.id,
        TenantID: target.TenantId,
        TenantFilter: target.TenantDomain,
      },
      waiting: true,
      queryKey: `ExecExtensionSync-${router.query.id}-${target.TenantId}`,
    });
  };

  const actions = [
    {
      label: "Sync Now",
      icon: (
        <SvgIcon>
          <CippIcons.Sync />
        </SvgIcon>
      ),
      confirmText: "Queue a NinjaOne sync for [Tenant]?",
      customFunction: handleSyncTenant,
    },
    {
      label: "Delete Mapping",
      icon: <CippIcons.Delete />,
      confirmText: "Are you sure you want to delete this mapping?",
      customFunction: handleRemoveItem,
    },
  ];

  const extension = extensions.find((extension) => extension.id === router.query.id);

  // Memoize the removeOptions array to ensure it updates when tableData changes
  const removedTenantIds = useMemo(() => {
    return Array.isArray(tableData) ? tableData.map((item) => item.TenantId) : [];
  }, [tableData]);

  // isSuccess only goes false -> true once, so depending on it alone meant a refetch never
  // reached the table and server-side automap results stayed hidden until a page reload.
  useEffect(() => {
    if (mappings.isSuccess) {
      setTableData(mappings.data.Mappings ?? []);
    }
  }, [mappings.isSuccess, mappings.data]);

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
              <Grid size={{ md: 4, xs: 12 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1, my: "auto" }}>
                    <CippFormTenantSelector
                      formControl={formControl}
                      multiple={false}
                      required={false}
                      disableClearable={false}
                      removeOptions={removedTenantIds}
                      valueField="customerId"
                    />
                  </Box>
                  <Tooltip title="Refresh tenant list">
                    <IconButton
                      size="small"
                      onClick={() =>
                        queryClient.invalidateQueries({ queryKey: ["ListTenants-FormnotAllTenants"] })
                      }
                    >
                      <SvgIcon>
                        <CippIcons.Sync />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
              <Grid>
                <Box sx={{ my: "auto" }}>
                  <SvgIcon>
                    <CippIcons.SyncAlt />
                  </SvgIcon>
                </Box>
              </Grid>
              <Grid size={{ md: 4, xs: 12 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <CippFormComponent
                      type="autoComplete"
                      fullWidth
                      name="integrationCompany"
                      formControl={formControl}
                      label={`Select ${extension.name} Company`}
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
                  </Box>
                  <Tooltip title={`Refresh ${extension.name} companies`}>
                    <IconButton size="small" onClick={() => mappings.refetch()}>
                      <SvgIcon>
                        <CippIcons.Sync />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
              <Grid>
                <Stack direction={"row"} spacing={1}>
                  <Tooltip title="Add Mapping">
                    <Button size="small" onClick={() => handleAddItem()} variant="contained">
                      <SvgIcon>
                        <CippIcons.PlusSmallIcon />
                      </SvgIcon>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Automap Companies">
                    <Button size="small" onClick={() => handleAutoMap()} variant="contained">
                      <SvgIcon>
                        <CippIcons.SparklesIcon />
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
                        <CippIcons.Sync />
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
                simpleColumns={["IntegrationName", "Tenant", "TenantDomain", "TenantId"]}
                isFetching={mappings.isFetching}
                refreshFunction={() => mappings.refetch()}
              />
            </Box>
            <CippApiResults apiObject={syncTenantResults} />
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
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Skeleton variant="rectangular" height={60} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Skeleton variant="rectangular" height={60} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Skeleton variant="rectangular" height={300} />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {mappings.isSuccess && !extension && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
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
