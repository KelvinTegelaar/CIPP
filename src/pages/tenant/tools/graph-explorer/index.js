import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import CippGraphExplorerFilter from "../../../../components/CippTable/CippGraphExplorerFilter";
import { useState } from "react";
import { Grid } from "@mui/system";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const [apiFilter, setApiFilter] = useState([]);
  const [pageTitle, setPageTitle] = useState("Graph Explorer");
  const tenantFilter = useSettings().currentTenant;
  const queryKey = JSON.stringify({ apiFilter, tenantFilter });

  return (
    <CippTablePage
      tableFilter={
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippGraphExplorerFilter onSubmitFilter={setApiFilter} onPresetChange={setPageTitle} />
          </Grid>
        </Grid>
      }
      title={pageTitle}
      apiDataKey="Results"
      apiUrl={apiFilter.endpoint ? "/api/ListGraphRequest" : "/api/ListEmptyResults"}
      apiData={apiFilter}
      queryKey={queryKey}
      /*Key={`${apiFilter.endpoint}-${apiFilter.$select}`}*/
      simpleColumns={apiFilter?.$select != "" ? apiFilter?.$select?.split(",") : []}
      clearOnError={true}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
