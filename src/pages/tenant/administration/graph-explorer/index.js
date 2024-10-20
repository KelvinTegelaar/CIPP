import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import CippGraphExplorerFilter from "../../../../components/CippTable/CippGraphExplorerFilter";
import { useState } from "react";
import { Grid } from "@mui/material";

const Page = () => {
  const pageTitle = "Graph Explorer";
  const [apiFilter, setApiFilter] = useState([]);
  const queryKey = JSON.stringify(apiFilter);
  return (
    <CippTablePage
      tableFilter={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CippGraphExplorerFilter onSubmitFilter={setApiFilter} />
          </Grid>
        </Grid>
      }
      title={pageTitle}
      apiDataKey="Results"
      apiUrl={apiFilter.endpoint ? "/api/ListGraphRequest" : null}
      apiData={apiFilter}
      queryKey={queryKey}
      Key={`${apiFilter.endpoint}-${apiFilter.$select}`}
      simpleColumns={apiFilter.$select ? apiFilter.$select.split(",") : []}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
