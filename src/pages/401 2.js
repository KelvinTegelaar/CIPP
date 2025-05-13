import { Box, Container, Grid, Stack } from "@mui/material";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";
import { Layout as DashboardLayout } from "../layouts/index.js";

const Page = () => (
  <>
    <DashboardLayout>
      <Head>
        <title>404 - Not Found</title>
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
                  imageUrl="/assets/illustrations/undraw_articles_wbpb.svg"
                  text="It seems like you're not allowed to be here. Let's go to the homepage to see if we know where we need to go next."
                  title="Error 401 - Not allowed"
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
