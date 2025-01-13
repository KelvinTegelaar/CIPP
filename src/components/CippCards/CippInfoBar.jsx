import { Box, Card, Stack, SvgIcon, Typography, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid";

export const CippInfoBar = ({ data, isFetching }) => (
  <Card>
    <Grid container>
      {data.map((item) => (
        <Grid
          xs={12}
          sm={6}
          md={3}
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
              borderRight: "none",
            },
          }}
        >
          <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 2 }}>
            {item?.icon && (
              <SvgIcon color={item.color ? item.color : "primary"} fontSize="small">
                {item.icon}
              </SvgIcon>
            )}
            <Box
              sx={() => {
                if (!item?.icon) {
                  return { pl: 2 };
                }
              }}
            >
              <Typography color="text.secondary" variant="overline">
                {item.name}
              </Typography>
              <Typography variant="h6">
                {isFetching ? <Skeleton width={"100%"} /> : item.data}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      ))}
    </Grid>
  </Card>
);
