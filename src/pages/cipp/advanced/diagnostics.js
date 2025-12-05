import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import CippDiagnosticsFilter from "/src/components/CippTable/CippDiagnosticsFilter";
import { useState } from "react";
import { Grid } from "@mui/system";

const Page = () => {
  const [apiFilter, setApiFilter] = useState({ query: "" });
  const queryKey = JSON.stringify(apiFilter);

  return (
    <CippTablePage
      tableFilter={
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippDiagnosticsFilter onSubmitFilter={setApiFilter} />
          </Grid>
        </Grid>
      }
      title="Diagnostics - Application Insights Query"
      tenantInTitle={false}
      apiDataKey="Results"
      apiUrl={apiFilter.query ? "/api/ExecAppInsightsQuery" : "/api/ListEmptyResults"}
      apiData={apiFilter}
      queryKey={queryKey}
      simpleColumns={[]}
      clearOnError={true}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
