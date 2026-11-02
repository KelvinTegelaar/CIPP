import { Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import tabOptions from "./tabOptions";
import { CippSSOSettings } from "../../../../components/CippSettings/CippSSOSettings";
import { CippSAMCredentials } from "../../../../components/CippSettings/CippSAMCredentials";

const Page = () => {
  return (
    <Container sx={{ pt: { xs: 0, md: 1 } }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CippSAMCredentials />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CippSSOSettings />
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
