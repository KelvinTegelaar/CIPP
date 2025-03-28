import { Box, Container, Grid } from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippDomainCards } from "../../../../components/CippCards/CippDomainCards";

const Page = () => {
  const pageTitle = "Deploy Named Locations";

  return (
    <Box
      sx={{
        flexGrow: 1,
        py: 4,
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
