import { useRouter } from "next/router";
import {
  Box,
  Container,
  Stack,
  Button,
  SvgIcon,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import Head from "next/head";

const CippFormPage = (props) => {
  const { title, backButtonTitle, formPageType = "Add", children, formControl, ...other } = props;
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
        <Container maxWidth="lg">
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
              <div>
                <Typography variant="h4">
                  {formPageType} - {title}
                </Typography>
              </div>
            </Stack>
            <Card>
              <CardContent>{children}</CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </CardActions>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippFormPage;
