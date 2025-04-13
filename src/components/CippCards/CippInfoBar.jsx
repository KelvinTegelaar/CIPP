import React, { useState } from "react";
import { Box, Card, Stack, SvgIcon, Typography, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import { CippPropertyListCard } from "./CippPropertyListCard";

export const CippInfoBar = ({ data, isFetching }) => {
  const [visibleIndex, setVisibleIndex] = useState(null);

  return (
    <Card>
      <Grid container>
        {data.map((item, index) => (
          <>
            <Grid
              xs={12}
              sm={6}
              md={3}
              key={item.name}
              onClick={item.offcanvas ? () => setVisibleIndex(index) : undefined}
              sx={{
                cursor: item.offcanvas ? "pointer" : "default",
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
            {item.offcanvas && (
              <>
                {console.log("item.offcanvas", item.offcanvas)}
                <CippOffCanvas
                  title={item?.offcanvas?.title || "Details"}
                  size="md"
                  visible={visibleIndex === index}
                  onClose={() => setVisibleIndex(null)}
                >
                  <Box
                    sx={{
                      overflowY: "auto",
                      maxHeight: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        {item?.offcanvas?.propertyItems?.length > 0 && (
                          <CippPropertyListCard
                            isFetching={isFetching}
                            align="vertical"
                            title={item?.offcanvas?.title}
                            propertyItems={item.offcanvas.propertyItems ?? []}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </CippOffCanvas>
              </>
            )}
          </>
        ))}
      </Grid>
    </Card>
  );
};
