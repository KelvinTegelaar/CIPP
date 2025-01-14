import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import LockClosedIcon from "@heroicons/react/24/outline/LockClosedIcon";
import ReceiptPercentIcon from "@heroicons/react/24/outline/ReceiptPercentIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  Divider,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
const data = [
  {
    icon: (
      <SvgIcon fontSize="small">
        <UsersIcon />
      </SvgIcon>
    ),
    label: "Users",
    linkLabel: "Reports",
    value: 3450,
  },
  {
    icon: (
      <SvgIcon fontSize="small">
        <LockClosedIcon />
      </SvgIcon>
    ),
    label: "Logins",
    linkLabel: "Analytics",
    value: 68,
  },
  {
    icon: (
      <SvgIcon fontSize="small">
        <ReceiptPercentIcon />
      </SvgIcon>
    ),
    label: "Invoices",
    linkLabel: "Transactions",
    value: 3120,
  },
];

export const Stats1 = () => (
  <Box sx={{ p: 3 }}>
    <Grid container spacing={3}>
      {data.map((item) => {
        return (
          <Grid xs={12} md={4} key={item.label}>
            <Card sx={{ height: "100%" }}>
              <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    height: 56,
                    width: 56,
                  }}
                >
                  {item.icon}
                </Avatar>
                <div>
                  <Typography color="text.secondary" variant="overline">
                    {item.label}
                  </Typography>
                  <Typography variant="h6">{item.value}</Typography>
                </div>
              </Stack>
              <Divider />
              <CardActions
                sx={{
                  px: 3,
                  py: 1,
                }}
              >
                <Button
                  endIcon={
                    <SvgIcon fontSize="small">
                      <ArrowRightIcon />
                    </SvgIcon>
                  }
                  size="small"
                >
                  {item.linkLabel}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);
