import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import CurrencyDollarIcon from "@heroicons/react/24/outline/CurrencyDollarIcon";
import ShoppingCartIcon from "@heroicons/react/24/outline/ShoppingCartIcon";
import XCircleIcon from "@heroicons/react/24/outline/XCircleIcon";
import { Card, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";

const stats = [
  {
    icon: <CheckCircleIcon />,
    data: "5,000",
    name: "Total Devices",
  },
  {
    icon: <XCircleIcon />,
    data: "15",
    name: "Total Clients",
  },
  {
    icon: <CurrencyDollarIcon />,
    data: "2345",
    name: "Active Devices",
  },
  {
    icon: <ShoppingCartIcon />,
    data: "300",
    name: "Expired Devices",
  },
];

export const ProductsStats = () => (
  <Card>
    <Grid container>
      {stats.map((item) => (
        <Grid
          size={{ md: 3, sm: 6, xs: 12 }}
          key={item.name}
          sx={{
            borderBottom: (theme) => ({
              xs: `1px solid ${theme.palette.divider}`,
              md: "none",
            }),
            borderRight: (theme) => ({
              md: `1px solid ${theme.palette.divider}`,
            }),
            "&:nth-of-type(3)": {
              borderBottom: (theme) => ({
                xs: `1px solid ${theme.palette.divider}`,
                sm: "none",
              }),
            },
            "&:nth-of-type(4)": {
              borderBottom: "none",
            },
          }}
        >
          <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 2 }}>
            {item.icon}
            <div>
              <Typography color="text.secondary" variant="overline">
                {item.name}
              </Typography>
              <Typography variant="h6">{item.data}</Typography>
            </div>
          </Stack>
        </Grid>
      ))}
    </Grid>
  </Card>
);
