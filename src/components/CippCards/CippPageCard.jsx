import { useRouter } from "next/router";
import { Box, Container, Stack, Button, SvgIcon, Typography, Card } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import Head from "next/head";
const CippPageCard = (props) => {
  const {
    title,
    backButtonTitle = "Back",
    children,
    cardSize = "xl",
    hideTitleText = false,
  } = props;
  const router = useRouter();

  const handleBackClick = () => {
    router.back(); // Navigate to the previous page when the button is clicked
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth={cardSize}>
          <Stack spacing={4}>
            <Stack spacing={2}>
              <div>
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
              </div>
              {hideTitleText !== true && (
                <div>
                  <Typography variant="h4">{title}</Typography>
                </div>
              )}
            </Stack>
            <Card>{children}</Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippPageCard;
