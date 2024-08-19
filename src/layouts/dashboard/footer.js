import { Box, Container, Link, Typography } from "@mui/material";

const items = [
  {
    label: "About Us",
    href: "https://devias.io/about-us",
  },
  {
    label: "Terms",
    href: "https://devias.io/legal/tos",
  },
];

export const Footer = () => (
  <div>
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        py: 3,
        "& a": {
          mt: {
            xs: 1,
            sm: 0,
          },
          "&:not(:last-child)": {
            mr: {
              xs: 0,
              sm: 5,
            },
          },
        },
      }}
    >
      <Typography color="text.secondary" variant="caption"></Typography>
      <Box sx={{ flexGrow: 1 }} />
    </Container>
  </div>
);
