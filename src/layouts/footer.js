import { Box, Container, Divider, Typography } from "@mui/material";

export const Footer = () => {

  //randomize the order of the sponsor images

  return (
    <div>
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          py: 1,
          "& a": {
            mt: {
              xs: 1,
              sm: 0,
            },
            "&:not(:last-child)": {
              mr: {
                xs: 0,
                sm: 2,
              },
            },
          },
        }}
      ></Container>
    </div>
  );
};
