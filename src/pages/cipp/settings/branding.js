import { Container } from "@mui/material";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "./tabOptions";
import CippBrandingSettings from "../../../components/CippSettings/CippBrandingSettings";

const Page = () => {
  return (
    <Container sx={{ pt: { xs: 0, md: 3 }, px: { xs: 1.5, md: 3 } }} maxWidth="xl">
      <CippBrandingSettings />
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
