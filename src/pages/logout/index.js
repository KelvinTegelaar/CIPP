
import { useCallback } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography
} from "@mui/material";

const Page = () => {
  const handleSignOut = useCallback(() => {
    window.location.href =
      "https://login.microsoftonline.com/5197ded8-c845-4a45-8c20-09122ae12852/oauth2/v2.0/logout?post_logout_redirect_uri=https://cipp.cloudvanguard-it.com/login";
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card sx={{ p: 3, textAlign: "center" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Sign out
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You are about to sign out of your Microsoft account.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
