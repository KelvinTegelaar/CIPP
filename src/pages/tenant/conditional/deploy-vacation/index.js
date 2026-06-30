import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { Alert, Box, Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Vacation Mode has moved to{" "}
        <strong>Identity Management &rarr; Administration &rarr; Vacation Mode</strong>.
      </Alert>
      <Button
        variant="contained"
        component={Link}
        href="/identity/administration/vacation-mode"
      >
        Go to Vacation Mode
      </Button>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
