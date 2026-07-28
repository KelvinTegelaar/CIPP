import { Container } from "@mui/material";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import tabOptions from "./tabOptions";
import { CippAppServiceDomains } from "../../../../components/CippSettings/CippAppServiceDomains";

const Page = () => {
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
      <CippAppServiceDomains />
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
