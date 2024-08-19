import NextLink from "next/link";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { paths } from "../../paths";

const features = ["Customers", "Products", "Orders", "Invoices", "Organization"];

export const HomeUserFlows = () => (
  <Box
    sx={{
      backgroundColor: (theme) => (theme.palette.mode === "dark" ? "neutral.900" : "neutral.50"),
      py: "64px",
    }}
  >
    <Container maxWidth="lg">
      <Stack direction="row" flexWrap="wrap" spacing={3}>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexBasis: "auto",
            flexGrow: 0,
            maxWidth: "100%",
            width: 500,
          }}
        >
          <div>
            <Typography sx={{ mb: 2 }} variant="h2">
              Management User Flows
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Rather than a generic template, we focused on management-specific screens to enable
              developers focus on the important part of the development process.
            </Typography>
            <Stack alignItems="center" direction="row" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
              {features.map((feature) => (
                <Chip key={feature} label={feature} />
              ))}
            </Stack>
            <Stack alignItems="center" direction="row" spacing={2}>
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
          </div>
        </Box>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexBasis: "auto",
            flexGrow: 0,
            maxWidth: "100%",
            width: 500,
            "& img": {
              width: "100%",
            },
          }}
        >
          <img src="/assets/home-flows.png" />
        </Box>
      </Stack>
    </Container>
  </Box>
);
