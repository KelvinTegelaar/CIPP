import { useMemo } from "react";
import { Box, Divider, Tooltip, Typography } from "@mui/material";
import { useSettings } from "../../hooks/use-settings";
import sponsorsData from "../../data/sponsors.json";

// Filter sponsors by date (runs once on module load)
const getActiveSponsors = () => {
  const now = new Date();
  return sponsorsData.filter((sponsor) => {
    if (!sponsor.startDate && !sponsor.endDate) {
      return true;
    }
    const startDate = sponsor.startDate ? new Date(sponsor.startDate) : null;
    const endDate = sponsor.endDate ? new Date(sponsor.endDate) : null;
    const afterStart = !startDate || now >= startDate;
    const beforeEnd = !endDate || now <= endDate;
    return afterStart && beforeEnd;
  });
};

// Select random sponsor based on priority (runs once on module load)
const selectRandomSponsor = (sponsors) => {
  if (sponsors.length === 0) return null;

  let totalPriority = 0;
  for (let i = 0; i < sponsors.length; i++) {
    totalPriority += sponsors[i].priority;
  }
  let random = Math.floor(Math.random() * totalPriority);
  let runningTotal = 0;
  for (let i = 0; i < sponsors.length; i++) {
    runningTotal += sponsors[i].priority;
    if (random < runningTotal) {
      return sponsors[i];
    }
  }
  return null;
};

const activeSponsors = getActiveSponsors();
const selectedSponsor = selectRandomSponsor(activeSponsors);

export const CippSponsor = () => {
  const currentSettings = useSettings();
  const theme = currentSettings?.currentTheme?.value;

  // Get the appropriate image based on current theme
  const randomimg = useMemo(() => {
    if (!selectedSponsor) return null;
    return {
      link: selectedSponsor.link,
      imagesrc: theme === "light" ? selectedSponsor.imagesrcLight : selectedSponsor.imagesrcDark,
      altText: selectedSponsor.altText,
      tooltip: selectedSponsor.tooltip,
    };
  }, [theme]);

  // Don't render if no sponsors are available
  if (!randomimg) {
    return null;
  }

  return (
    <>
      <Divider />
      <Typography
        color="text.secondary"
        variant="caption"
        sx={{ lineHeight: 4, textAlign: "center" }}
      >
        This application is sponsored by
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "55px",
        }}
      >
        <Tooltip title={randomimg.tooltip} arrow>
          <img
            src={randomimg.imagesrc}
            alt={randomimg.altText}
            style={{
              cursor: "pointer",
              maxHeight: "50px",
              width: "auto",
              maxWidth: "100px",
            }}
            onClick={() => window.open(randomimg.link)}
          />
        </Tooltip>
      </Box>
    </>
  );
};
