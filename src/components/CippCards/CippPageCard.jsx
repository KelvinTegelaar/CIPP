import { useRouter } from "next/router";
import { Box, Container, Stack, Button, SvgIcon, Typography, Card } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import Head from "next/head";
import { CippHead } from "../CippComponents/CippHead";
const CippPageCard = (props) => {
  const {
    title,
    backButtonTitle = "Back",
    children,
    cardSize = "xl",
    hideTitleText = false,
    hideBackButton = false,
    noTenantInHead = false,
    infoBar,
  } = props;
  const router = useRouter();

  const handleBackClick = () => {
    router.back(); // Navigate to the previous page when the button is clicked
  };

  return (
    <>
      <CippHead title={title} noTenant={noTenantInHead} />
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth={cardSize}>
          <Stack spacing={2}>
            <Stack spacing={2}>
              <div>
                {!hideBackButton && (
                  <Button
                    color="inherit"
                    onClick={handleBackClick} // Go back to the previous page
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowLeftIcon />
                      </SvgIcon>
                    }
                  >
                    {backButtonTitle}
                  </Button>
                )}
              </div>
              {hideTitleText !== true && (
                <div>
                  <Typography variant="h4">{title}</Typography>
                </div>
              )}
            </Stack>
            {infoBar}
            <Card>{children}</Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippPageCard;
