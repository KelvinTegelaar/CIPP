import { Container, Grid } from "@mui/material";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippPermissionCheck from "/src/components/CippSettings/CippPermissionCheck";
import { CippPermissionReport } from "../../../components/CippSettings/CippPermissionReport";
import { useState } from "react";

const Page = () => {
  const [importReport, setImportReport] = useState(false);

  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CippPermissionReport importReport={importReport} setImportReport={setImportReport} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <CippPermissionCheck type="Permissions" importReport={importReport} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <CippPermissionCheck type="GDAP" importReport={importReport} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <CippPermissionCheck type="Tenants" importReport={importReport} />
        </Grid>
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
