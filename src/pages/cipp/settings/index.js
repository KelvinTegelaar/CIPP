import { Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "./tabOptions";

import CippVersionProperties from "../../../components/CippSettings/CippVersionProperties";
import CippPasswordSettings from "../../../components/CippSettings/CippPasswordSettings";
import CippDnsSettings from "../../../components/CippSettings/CippDnsSettings";
import CippCacheSettings from "../../../components/CippSettings/CippCacheSettings";
import CippBackupSettings from "../../../components/CippSettings/CippBackupSettings";
import CippBrandingSettings from "../../../components/CippSettings/CippBrandingSettings";
import CippBackupRetentionSettings from "../../../components/CippSettings/CippBackupRetentionSettings";
import CippJitAdminSettings from "../../../components/CippSettings/CippJitAdminSettings";
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
