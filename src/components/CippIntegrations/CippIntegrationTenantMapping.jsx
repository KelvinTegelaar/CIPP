import {
  Box,
  Button,
  CardContent,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";
import { CippDataTable } from "../CippTable/CippDataTable";
import { PlusSmallIcon, SparklesIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { SyncAlt } from "@mui/icons-material";
import { CippFormComponent } from "../CippComponents/CippFormComponent";

const CippIntegrationSettings = ({ children }) => {
  const router = useRouter();

  const mappings = ApiGetCall({
    url: "/api/ExecExtensionMapping",
    data: {
      List: router.query.id,
    },
    queryKey: `IntegrationTenantMapping-${router.query.id}`,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: mappings?.data,
  });

  const [tableData, setTableData] = useState([]);
  const handleRemoveItem = (row) => {
    console.log(row);
    if (row === undefined) return false;
    console.log(tableData);
    const index = tableData.findIndex((item) => item === row);
    const newTableData = [...tableData];
    newTableData.splice(index, 1);
    setTableData(newTableData);
  };

  const handleAddItem = () => {
    const selectedTenant = formControl.getValues("tenantFilter");
    const selectedCompany = formControl.getValues("integrationCompany");
    if (!selectedTenant || !selectedCompany) return;

    const newRowData = {
      TenantId: selectedTenant.value,
      Tenant: selectedTenant.label,
      IntegrationName: selectedCompany.label,
      IntegrationId: selectedCompany.value,
    };

    setTableData([...tableData, newRowData]);
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
      setTableData(mappings.data.Mappings);
    }
  }, [mappings.isSuccess]);

  return (
    <>
      {mappings.isSuccess && extension ? (
        <CippFormSection
          queryKey={`IntegrationTenantMapping-${router.query.id}`}
          formControl={formControl}
          postUrl={`/api/ExecExtensionsConfig?AddMapping=${router.query.id}`}
        >
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
            <Grid item xs={12} md={4}>
              <Box sx={{ my: "auto" }}>
                <CippFormTenantSelector formControl={formControl} multiple={false} />
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ my: "auto" }}>
                <SvgIcon>
                  <SyncAlt />
                </SvgIcon>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
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
                multiple={false}
              />
            </Grid>
            <Grid item>
              <Stack direction={"row"} spacing={1}>
                <Button size="small" onClick={() => handleAddItem()} variant="contained">
                  <SvgIcon>
                    <PlusSmallIcon />
                  </SvgIcon>
                </Button>
                <Button size="small" onClick={() => handleAutoMap()} variant="contained">
                  <SvgIcon>
                    <SparklesIcon />
                  </SvgIcon>
                </Button>
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ borderTop: 1, borderColor: "divider" }}>
            <CippDataTable
              actions={actions}
              noCard={true}
              reportTitle={`${extension.id}-tenant-map`}
              data={tableData}
              simple={false}
              simpleColumns={["Tenant", "IntegrationName"]}
            />
          </Box>
        </CippFormSection>
      ) : (
        <CardContent>
          {mappings.isLoading && <Box>Loading...</Box>}
          {mappings.isSuccess && !extension && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
