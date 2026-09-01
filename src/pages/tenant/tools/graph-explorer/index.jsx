import { Layout as DashboardLayout } from "../../../../layouts/index";
import CippGraphExplorerSimpleFilter from "../../../../components/CippTable/CippGraphExplorerSimpleFilter";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { useState } from "react";
import { Grid, Stack, Box, Container } from "@mui/system";
import { useSettings } from "../../../../hooks/use-settings";
import { CippCodeBlock } from "../../../../components/CippComponents/CippCodeBlock";
import { ApiGetCallWithPagination } from "../../../../api/ApiCall";
import { Alert, CircularProgress, Divider, Typography, Card } from "@mui/material";
import { CippHead } from "../../../../components/CippComponents/CippHead";

const Page = () => {
  const [apiFilter, setApiFilter] = useState([]);
  const [pageTitle, setPageTitle] = useState("Graph Explorer");
  const [viewMode, setViewMode] = useState("table");
  const tenantFilter = useSettings().currentTenant;
  const queryKey = JSON.stringify({ apiFilter, tenantFilter });
  const apiUrl = apiFilter.endpoint ? "/api/ListGraphRequest" : "/api/ListEmptyResults";

  const apiData = ApiGetCallWithPagination({
    url: apiUrl,
    data: { tenantFilter, ...apiFilter },
    queryKey: queryKey,
    waiting: !!apiFilter.endpoint && viewMode === "json",
  });

  const jsonData = apiData?.data?.pages?.[0]?.Results || apiData?.data || {};

  // the filter bar (and its edit drawer) mounts once, view toggles only swap the content below
  return (
    <>
      <CippHead title={pageTitle} />
      <Box>
        <Container maxWidth={false} sx={{ height: "100%" }}>
          <Stack
            spacing={2}
            sx={{ height: viewMode === "json" ? "calc(100vh - 200px)" : "100%" }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <CippGraphExplorerSimpleFilter
                  onSubmitFilter={setApiFilter}
                  onPresetChange={setPageTitle}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </Grid>
            </Grid>
            {viewMode === "json" ? (
              <>
                <Typography variant="h6" component="h1">
                  {pageTitle}
                </Typography>
                <Card sx={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
                  {apiData.isLoading || apiData.isFetching ? (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        zIndex: 10,
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={60} />
                      <Typography variant="body1" sx={{
                        color: "text.secondary"
                      }}>
                        Loading data...
                      </Typography>
                    </Box>
                  ) : null}
                  <CippCodeBlock
                    type="editor"
                    key={queryKey}
                    code={JSON.stringify(jsonData, null, 2)}
                    editorHeight="calc(100vh - 260px)"
                    showLineNumbers={true}
                    readOnly={true}
                  />
                </Card>
              </>
            ) : (
              <>
                {!tenantFilter && (
                  <Alert severity="warning">
                    No tenant selected. Please select a tenant from the dropdown above.
                  </Alert>
                )}
                <Card sx={{ display: "flex" }}>
                  <Divider />
                  <CippDataTable
                    queryKey={queryKey}
                    title={tenantFilter ? `${pageTitle} - ${tenantFilter}` : pageTitle}
                    simple={false}
                    api={{
                      url: apiUrl,
                      data: { tenantFilter, ...apiFilter },
                      dataKey: "Results",
                    }}
                    simpleColumns={apiFilter?.$select != "" ? apiFilter?.$select?.split(",") : []}
                    clearOnError={true}
                  />
                </Card>
              </>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
