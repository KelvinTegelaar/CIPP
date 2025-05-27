import { Box, Container, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { ApiGetCall } from "../api/ApiCall";
import { useState, useEffect } from "react";

const Page = () => {
  const [loadingText, setLoadingText] = useState("Please wait while we log you in...");
  const orgData = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const [loadingImage, setLoadingImage] = useState(
    "/assets/illustrations/undraw_analysis_dq08.svg"
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!orgData.isSuccess) {
        setLoadingText(
          "The function app may be experiencing a cold start currently, this can take a little longer than usual..."
        );
        setLoadingImage("/assets/illustrations/undraw-into-the-night-nd84.svg");
      }
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, [orgData.isSuccess]);

  return (
    <>
      <DashboardLayout>
        <Head>
          <title>Loading</title>
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
                  <CippImageCard
                    isFetching={false}
                    imageUrl={loadingImage}
                    text={loadingText}
                    title="Logging into CIPP"
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
