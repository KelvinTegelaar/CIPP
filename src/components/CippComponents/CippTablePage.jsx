import { Card, Divider } from "@mui/material";
import { Box, Container, Stack } from "@mui/system";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Head from "next/head";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useSettings } from "../../hooks/use-settings";

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
    ...other
  } = props;
  const tenant = useSettings().currentTenant;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <ReactQueryDevtools />
        <Container maxWidth={false} sx={{ height: "100%" }}>
          <Stack spacing={4} sx={{ height: "100%" }}>
            {tableFilter}

            <Card
              sx={{
                display: "flex",
              }}
            >
              <Divider />
              <CippDataTable
                queryKey={queryKey}
                cardButton={cardButton}
                title={tenantInTitle ? `${title} - ${tenant}` : title}
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
