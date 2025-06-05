import { Box, Container, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { useEffect } from "react";
import { useRouter } from "next/router.js";

const Error500 = (props) => {
  //when we browse away from the page we want to reset the error boundary
  //this will prevent the error from showing on other pages
  const router = useRouter();
  useEffect(() => {
    return () => {
      props.resetErrorBoundary();
    };
  }, [router]);

  return (
    <>
      <DashboardLayout>
        <Head>
          <title>500 - Error</title>
        </Head>
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
            height: "80vh",
          }}
        >
          <Container maxWidth={false}>
            <Stack spacing={6} sx={{ height: "100%" }}>
              <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="center"
                sx={{ height: "100%" }}
              >
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippImageCard
                    isFetching={false}
                    imageUrl="/assets/illustrations/undraw_bug_fixing_oc-7-a.svg"
                    text={
                      <>
                        <Typography>Oh no! It seems something went wrong.</Typography>
                        <pre>{props.error.message}</pre>
                        <Typography>You can use the button below to try again.</Typography>
                      </>
                    }
                    title="Error 500 - Something went wrong"
                    linkText={"Try again"}
                    onButtonClick={() => props.resetErrorBoundary()}
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

export default Error500;
