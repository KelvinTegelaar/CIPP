import NextLink from "next/link";
import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import { Box, Button, LinearProgress, Stack, SvgIcon, Typography } from "@mui/material";
import { paths } from "../../../paths";

export const OverviewAccountSetup = () => (
  <Stack
    alignItems="center"
    direction="row"
    spacing={3}
    sx={{
      backgroundColor: "neutral.900",
      borderRadius: 1,
      color: "common.white",
      height: "100%",
      px: 4,
      py: 2,
    }}
  >
    <div>
      <Typography color="inherit" variant="h4">
        Welcome!
      </Typography>
      <Typography color="inherit" sx={{ mt: 2 }}>
        Lets setup your RMM or something something something?
      </Typography>
      <Stack alignItems="center" direction="row" spacing={2} sx={{ my: 3 }}>
        <Typography color="inherit" variant="subtitle2">
          2/5
        </Typography>
        <LinearProgress
          sx={{
            borderRadius: 1,
            flexGrow: 1,
            height: "8px",
          }}
          value={20}
          variant="determinate"
        />
      </Stack>
      <Button
        component={NextLink}
        endIcon={
          <SvgIcon fontSize="small">
            <ArrowRightIcon />
          </SvgIcon>
        }
        href={paths.onboarding}
        variant="contained"
      >
        Go to account
      </Button>
    </div>
    <Box
      sx={{
        "& img": {
          maxHeight: 350,
          width: "100%",
        },
      }}
    >
      <img src="/assets/illustration-reports.png" />
    </Box>
  </Stack>
);
