import { Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";

import CippVersionProperties from "/src/components/CippSettings/CippVersionProperties";
import CippPasswordSettings from "/src/components/CippSettings/CippPasswordSettings";
import CippDnsSettings from "/src/components/CippSettings/CippDnsSettings";
import CippCacheSettings from "/src/components/CippSettings/CippCacheSettings";
import CippBackupSettings from "/src/components/CippSettings/CippBackupSettings";
import CippBrandingSettings from "/src/components/CippSettings/CippBrandingSettings";
import CippBackupRetentionSettings from "/src/components/CippSettings/CippBackupRetentionSettings";
import CippJitAdminSettings from "/src/components/CippSettings/CippJitAdminSettings";
const Page = () => {
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippVersionProperties />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippPasswordSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippDnsSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippCacheSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippBackupSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippBackupRetentionSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippBrandingSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippJitAdminSettings />
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
