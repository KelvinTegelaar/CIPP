import { Box, Container } from "@mui/material";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippTenantLookup from "../../../../components/CippComponents/CippTenantLookup";

const Page = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth={false}>
        <CippTenantLookup />
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
