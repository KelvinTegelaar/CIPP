import { Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import tabOptions from "./tabOptions";
import { CippSSOSettings } from "../../../../components/CippSettings/CippSSOSettings";

const Page = () => {
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <Grid container spacing={2}>
        <Grid size={{ lg: 6, md: 8, sm: 12, xs: 12 }}>
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
