import { Box, Container, Grid, Stack } from "@mui/material";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { ApiGetCall } from "../api/ApiCall";

const Page = () => {
  const orgData = ApiGetCall({
    url: "/.auth/me",
    queryKey: "me",
  });
  return (
    <>
      <DashboardLayout>
        <Head>
          <title>401 - Access Denied</title>
        </Head>
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
            height: "100vh", // Full height of the viewport
          }}
        >
          <Container maxWidth={false}>
            <Stack spacing={6} sx={{ height: "100%" }}>
              <Grid
                container
                spacing={3}
                justifyContent="center" // Center horizontally
                alignItems="center" // Center vertically
                sx={{ height: "100%" }} // Ensure the container takes full height
              >
                <Grid item xs={12} md={6}>
                  <CippImageCard
                    isFetching={false}
                    imageUrl="/assets/illustrations/undraw_online_test_re_kyfx.svg"
                    text="You're not allowed to be here, or are logged in under the wrong account. Hit the button below to return to the homepage."
                    title="Access Denied"
                    linkText={orgData.data?.clientPrincipal?.userDetails ? "Return" : "Login"}
                    link={orgData.data?.clientPrincipal?.userDetails ? "/" : "/.auth/login/aad"}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
};

export default Page;
