import { Box, Container, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";
import { Layout as DashboardLayout } from "../layouts/index.js";

const Page = () => (
  <>
    <DashboardLayout>
      <Head>
        <title>Authentication complete</title>
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
              <Grid size={{ md: 6, xs: 12 }}>
                <CippImageCard
                  isFetching={false}
                  imageUrl="/assets/illustrations/undraw_articles_wbpb.svg"
                  text="Authentication complete! you may close this window"
                  title="Authentication Complete"
                  linkText={"Return"}
                  link={"/"}
                />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </DashboardLayout>
  </>
);

export default Page;
