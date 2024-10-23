import { Container, Grid } from "@mui/material";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";

import CippVersionProperties from "/src/components/CippSettings/CippVersionProperties";
import CippPasswordSettings from "/src/components/CippSettings/CippPasswordSettings";
import CippDnsSettings from "/src/components/CippSettings/CippDnsSettings";
import CippCacheSettings from "/src/components/CippSettings/CippCacheSettings";
import CippBackupSettings from "/src/components/CippSettings/CippBackupSettings";
const Page = () => {
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippVersionProperties />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippPasswordSettings />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippDnsSettings />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippCacheSettings />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <CippBackupSettings />
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
