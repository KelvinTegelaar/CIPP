import { Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index";
import tabOptions from "./tabOptions";

import CippVersionProperties from "../../../components/CippSettings/CippVersionProperties";
import CippPasswordSettings from "../../../components/CippSettings/CippPasswordSettings";
import CippDnsSettings from "../../../components/CippSettings/CippDnsSettings";
import CippCacheSettings from "../../../components/CippSettings/CippCacheSettings";
import CippBackupSettings from "../../../components/CippSettings/CippBackupSettings";
import CippBackupRetentionSettings from "../../../components/CippSettings/CippBackupRetentionSettings";
import CippLogRetentionSettings from "../../../components/CippSettings/CippLogRetentionSettings";
import CippJitAdminSettings from "../../../components/CippSettings/CippJitAdminSettings";
import CippBecRemediationSettings from "../../../components/CippSettings/CippBecRemediationSettings";
const Page = () => {
  return (
    <Container sx={{ pt: { xs: 0, md: 3 }, px: { xs: 1.5, md: 3 } }} maxWidth="xl">
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
          <CippLogRetentionSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippLogRetentionSettings
            title="Report Attachment Retention"
            endpoint="ExecReportAttachmentRetentionConfig"
            defaultDays={360}
            description="Scheduled report attachments too large to email (over 4MB) are uploaded to storage and linked from the email instead. Configure how long those files and their download links are kept."
          />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippJitAdminSettings />
        </Grid>
        <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }}>
          <CippBecRemediationSettings />
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
