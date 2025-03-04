import Head from "next/head";
import { Box, Button, Container, Stack, SvgIcon } from "@mui/material";
import { CippWizard } from "./CippWizard";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { CippHead } from "../CippComponents/CippHead";

const CippWizardPage = (props) => {
  const router = useRouter();
  const {
    postUrl,
    initialState,
    steps,
    wizardTitle,
    backButton = true,
    wizardOrientation = "horizontal",
    ...other
  } = props;
  return (
    <>
      <CippHead title={wizardTitle} />
      <Box
        sx={{
          backgroundColor: "background.default",
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          {backButton && (
            <Button
              color="inherit"
              onClick={() => router.back()}
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowLeftIcon />
                </SvgIcon>
              }
            >
              Back
            </Button>
          )}
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
