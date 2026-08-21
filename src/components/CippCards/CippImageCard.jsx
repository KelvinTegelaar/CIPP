import NextLink from "next/link";
import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import { Box, Button, LinearProgress, Skeleton, Stack, SvgIcon, Typography } from "@mui/material";

export const CippImageCard = ({
  isFetching,
  imageUrl = "/assets/illustration-reports.png",
  title,
  text,
  step,
  maxstep,
  linkText,
  link,
  onButtonClick,
}) => (
  <Stack
    alignItems="center"
    // Text beside the illustration only where both fit — a phone stacks them, and the text
    // column keeps minWidth: 0 so a headline can't force the pair wider than the card.
    direction={{ xs: "column", md: "row" }}
    spacing={3}
    sx={{
      backgroundColor: "neutral.900",
      borderRadius: 1,
      color: "common.white",
      px: { xs: 2, md: 4 },
      py: 2,
    }}
  >
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Typography color="inherit" variant="h4">
        {title}
      </Typography>
      <Typography color="inherit" sx={{ mt: 2 }}>
        {isFetching ? <Skeleton width="500px" sx={{ height: 80, maxWidth: "100%" }} /> : text}
      </Typography>
      <Stack alignItems="center" direction="row" spacing={2} sx={{ my: 3 }}>
        {step && maxstep && (
          <>
            <Typography color="inherit" variant="subtitle2">
              {step}/{maxstep}
            </Typography>
            <LinearProgress
              sx={{
                borderRadius: 1,
                flexGrow: 1,
                height: "8px",
              }}
              value={(step / maxstep) * 100}
              variant="determinate"
            />
          </>
        )}
      </Stack>
      {link && (
        <Button
          component={NextLink}
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          }
          href={link}
          variant="contained"
        >
          {linkText}
        </Button>
      )}
      {onButtonClick && (
        <Button
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          }
          onClick={onButtonClick}
          variant="contained"
        >
          {linkText}
        </Button>
      )}
    </Box>
    <Box
      sx={{
        minWidth: 0,
        maxWidth: "100%",
        "& img": {
          maxHeight: 350,
          maxWidth: "100%",
          width: "100%",
        },
      }}
    >
      <img src={imageUrl} />
    </Box>
  </Stack>
);
