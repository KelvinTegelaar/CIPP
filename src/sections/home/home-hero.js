import NextLink from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { paths } from "../../paths";

export const HomeHero = () => (
  <Box
    sx={{
      backgroundColor: "background.paper",
      pt: "64px",
    }}
  >
    <Container maxWidth={false} sx={{ maxWidth: 700 }}>
      <Typography
        align="center"
        sx={{
          fontSize: {
            xs: 38,
            md: 64,
          },
          lineHeight: 1.2,
          fontWeight: 800,
          mb: 3,
        }}
      >
        Meet Carpatin -
        <br />
        Admin Dashboard
      </Typography>
      <Typography
        align="center"
        color="text.secondary"
        sx={{
          fontSize: {
            xs: 20,
            md: 24,
          },
          lineHeight: 1.5,
          mb: 3,
        }}
      >
        Carpatin is a professionally crafted admin dashboard for everyday product development with
        MUI components.
      </Typography>
      <Stack alignItems="center" direction="row" justifyContent="center" spacing={2}>
        <Button
          color="inherit"
          component={NextLink}
          href={paths.index}
          size="large"
          variant="outlined"
        >
          Live Preview
        </Button>
        <Button
          component="a"
          href="https://mui.com/store/items/carpatin-dashboard"
          size="large"
          target="_blank"
          variant="contained"
        >
          Purchase
        </Button>
      </Stack>
      <Box
        sx={{
          fontSize: 0,
          "& img": {
            width: "100%",
          },
        }}
      >
        <img src="/assets/home-hero.png" />
      </Box>
    </Container>
  </Box>
);
