import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { CippImageCard } from "../components/CippCards/CippImageCard.jsx";
import { Layout as DashboardLayout } from "../layouts/index.js";
import { Editor } from "@monaco-editor/react";

const Error500 = (props) => {
  console.log(props);
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
            height: "100vh",
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
                <Grid item xs={12} md={6}>
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
