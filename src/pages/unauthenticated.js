import { Box, Container, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard";
import { ApiGetCall } from "../api/ApiCall";
import { useState, useEffect } from "react";

const Page = () => {
  const orgData = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const swaStatus = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmeswa",
    staleTime: 120000,
    refetchOnWindowFocus: true,
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
              <Grid item size={{ md: 6, xs: 12 }}>
                {(orgData.isSuccess || swaStatus.isSuccess) && Array.isArray(userRoles) && (
                  <CippImageCard
                    isFetching={false}
                    imageUrl="/assets/illustrations/undraw_online_test_re_kyfx.svg"
                    text="You're not allowed to be here, or are logged in under the wrong account."
                    title="Access Denied"
                    linkText={
                      swaStatus?.data?.clientPrincipal !== null && userRoles.length > 0
                        ? "Return to Home"
                        : "Login"
                    }
                    link={
                      swaStatus?.data?.clientPrincipal !== null && userRoles.length > 0
                        ? "/"
                        : `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(
                            window.location.href
                          )}`
                    }
                  />
                )}
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
