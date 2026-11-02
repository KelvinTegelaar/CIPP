import NextLink from "next/link";
import { CippIcons } from "../../utils/icon-registry";
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
    // Text beside the illustration only where both fit — a phone stacks them, and the text
    // column keeps minWidth: 0 so a headline can't force the pair wider than the card.
    direction={{ xs: "column", md: "row" }}
    spacing={3}
    sx={{
      alignItems: "center",
      backgroundColor: "neutral.900",
      borderRadius: 1,
      color: "common.white",
      px: { xs: 2, md: 4 },
      py: 2
    }}>
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Typography variant="h4" sx={{
        color: "inherit"
      }}>
        {title}
      </Typography>
      <Typography
        sx={{
          color: "inherit",
          mt: 2
        }}>
        {isFetching ? <Skeleton width="500px" sx={{ height: 80, maxWidth: "100%" }} /> : text}
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          my: 3
        }}>
        {step && maxstep && (
          <>
            <Typography variant="subtitle2" sx={{
              color: "inherit"
            }}>
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
              <CippIcons.ArrowRightIcon />
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
              <CippIcons.ArrowRightIcon />
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
