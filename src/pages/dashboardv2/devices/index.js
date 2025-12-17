import { Container, Typography, Card, CardContent, CardHeader, Box } from "@mui/material";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";

const Page = () => {
  return (
    <Container maxWidth={false} sx={{ pt: 3 }}>
      <Card>
        <CardHeader title="Devices Assessment" />
        <CardContent>
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" gutterBottom>
              Device Test Results
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This tab will display detailed device test results and recommendations.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review device compliance policies, enrollment restrictions, and management
              configurations to enhance your device security posture.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
