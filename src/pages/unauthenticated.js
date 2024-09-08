import { Grid } from "@mui/material";
import { Layout as DashboardLayout } from "../layouts/index.js";
import Head from "next/head.js";
import { Box, Container, Stack } from "@mui/system";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";

const UnauthenticatedPage = () => {
  return (
    <DashboardLayout>
      <Head>
        <title>Devices</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={6}>
            <Grid container spacing={3}>
              <Grid item style={{ display: "flex" }} xs={12} md={6}>
                <CippImageCard
                  isFetching={false}
                  imageUrl="/assets/illustrations/undraw_writer_q06d.svg"
                  text="You are not authenticated, how did you end up here? Press the button belong to get back to our home page."
                  title="Unauthenticated"
                  linkText={"Return"}
                  link={"/"}
                />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default UnauthenticatedPage;
