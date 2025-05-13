import { Alert, Card, Divider } from "@mui/material";
import { Box, Container, Stack } from "@mui/system";
import Head from "next/head";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useSettings } from "../../hooks/use-settings";
import { CippHead } from "./CippHead";

export const CippTablePage = (props) => {
  const {
    title,
    cardButton,
    noDataButton,
    actions,
    apiUrl,
    apiData,
    apiDataKey,
    columns,
    columnsFromApi,
    name,
    options,
    onChange,
    offCanvas,
    queryKey,
    tableFilter,
    tenantInTitle = true,
    sx = { flexGrow: 1, py: 4 },
    ...other
  } = props;
  const tenant = useSettings().currentTenant;
  return (
    <>
      <CippHead title={title} />
      <Box sx={sx}>
        <Container maxWidth={false} sx={{ height: "100%" }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            {tableFilter}
            {tenantInTitle && (!tenant || tenant === null) && (
              <Alert severity="warning">
                No tenant selected. Please select a tenant from the dropdown above.
              </Alert>
            )}
            <Card
              sx={{
                display: "flex",
              }}
            >
              <Divider />

              <CippDataTable
                queryKey={queryKey}
                cardButton={cardButton}
                title={tenantInTitle && tenant !== null ? `${title} - ${tenant}` : title}
                noDataButton={noDataButton}
                actions={actions}
                simple={false}
                api={{
                  url: apiUrl,
                  data: { tenantFilter: tenant, ...apiData },
                  dataKey: apiDataKey,
                }}
                columns={columns}
                columnsFromApi={columnsFromApi}
                offCanvas={offCanvas}
                {...other}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippTablePage;
