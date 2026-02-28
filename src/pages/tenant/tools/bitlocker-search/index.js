import { Box, Container } from "@mui/material";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippBitlockerKeySearch from "../../../../components/CippComponents/CippBitlockerKeySearch";

const Page = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth={false}>
        <CippBitlockerKeySearch />
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
