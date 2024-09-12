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
                  imageUrl="/assets/illustrations/undraw_bug_fixing_oc-7-a.svg"
                  text="Oh no! It seems something went wrong, The error is <error>"
                  title="Error 500 - Something broke"
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
