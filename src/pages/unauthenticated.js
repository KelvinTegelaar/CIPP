import { Box, Container, Grid, Stack } from "@mui/material";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { ApiGetCall } from "../api/ApiCall";
import { useState, useEffect } from "react";

const Page = () => {
  const orgData = ApiGetCall({
    url: "/.auth/me",
    queryKey: "me",
  });
  const blockedRoles = ["anonymous", "authenticated"];
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    if (orgData.isSuccess) {
      const roles = orgData.data?.clientPrincipal?.userRoles.filter(
        (role) => !blockedRoles.includes(role)
      );
      setUserRoles(roles ?? []);
    }
  }, [orgData, blockedRoles]);
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
                  {orgData.isSuccess && Array.isArray(userRoles) && (
                    <CippImageCard
                      isFetching={false}
                      imageUrl="/assets/illustrations/undraw_online_test_re_kyfx.svg"
                      text="You're not allowed to be here, or are logged in under the wrong account. Hit the button below to return to the homepage."
                      title="Access Denied"
                      linkText={userRoles.length > 0 ? "Return" : "Login"}
                      link={userRoles.length > 0 ? "/" : "/.auth/login/aad"}
                    />
                  )}
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
