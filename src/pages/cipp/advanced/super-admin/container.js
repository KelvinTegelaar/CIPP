import { Container } from "@mui/material";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import tabOptions from "./tabOptions";
import { CippContainerManagement } from "../../../../components/CippSettings/CippContainerManagement";

const Page = () => {
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <CippContainerManagement />
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
