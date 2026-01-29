import { Box, Container } from "@mui/material";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippDomainCards } from "../../../../components/CippCards/CippDomainCards";

const Page = () => {
  const pageTitle = "Deploy Named Locations";

  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth={false}>
        <CippDomainCards />
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
