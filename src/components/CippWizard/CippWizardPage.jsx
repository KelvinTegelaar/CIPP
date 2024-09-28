import Head from "next/head";
import { Box, Container, Stack } from "@mui/material";
import { CippWizard } from "./CippWizard";

const CippWizardPage = (props) => {
  const {
    postUrl,
    initialState,
    steps,
    wizardTitle,
    wizardOrientation = "horizontal",
    ...other
  } = props;
  return (
    <>
      <Head>
        <title>{wizardTitle}</title>
      </Head>
      <Box
        sx={{
          backgroundColor: "background.default",
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={6}>
            <Stack spacing={5}>
              <Stack spacing={1}>
                <CippWizard
                  postUrl={postUrl}
                  initialState={initialState}
                  orientation={wizardOrientation}
                  steps={steps}
                />
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};
export default CippWizardPage;
