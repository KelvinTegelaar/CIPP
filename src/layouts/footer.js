import { Box, Container, Divider, Typography } from "@mui/material";
import { useSettings } from "../hooks/use-settings";

export const Footer = () => {
  const currentSettings = useSettings();
  const theme = currentSettings?.currentTheme?.value;
  const sponsorimages = [
    {
      link: "https://rewst.com",
      imagesrc: theme === "light" ? "/sponsors/rewst.png" : "/sponsors/rewst_dark.png",
    },
    {
      link: "https://rightofboom.com",
      imagesrc: theme === "light" ? "/sponsors/RoB-light.svg" : "/sponsors/RoB.png",
    },
    {
      link: "https://ninjaone.com",
      imagesrc: theme === "light" ? "/sponsors/ninjaone.png" : "/sponsors/ninjaone_white.png",
    },
    {
      link: "https://augmentt.com",
      imagesrc: theme === "light" ? "/sponsors/augmentt-light.png" : "/sponsors/augmentt-dark.png",
    },
    {
      link: "https://huntress.com",
      imagesrc: "/sponsors/huntress_teal.png",
    },
  ];
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
      >
        <Typography color="text.secondary" variant="caption" sx={{ lineHeight: 4 }}>
          This application is sponsored by
        </Typography>
        {sponsorimages.map((sponsor) => (
          <a href={sponsor.link} target="_blank" rel="noopener noreferrer">
            <img src={sponsor.imagesrc} alt="sponsor" style={{ width: "100px" }} />
          </a>
        ))}
      </Container>
    </div>
  );
};
