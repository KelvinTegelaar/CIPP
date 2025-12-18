import React, { useState } from "react";
import { Box, Card, Stack, SvgIcon, Typography, Skeleton, Tooltip } from "@mui/material";
import { Grid } from "@mui/system";
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
              size={{ md: 3, sm: 6, xs: 12 }}
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
              <Stack alignItems="center" direction="row" spacing={2} sx={{ p: 2, minWidth: 0 }}>
                {item?.icon && (
                  <SvgIcon
                    color={item.color ? item.color : "primary"}
                    fontSize="small"
                    sx={{ flexShrink: 0 }}
                  >
                    {item.icon}
                  </SvgIcon>
                )}
                {item?.toolTip ? (
                  <Tooltip title={item.toolTip}>
                    <Box
                      sx={() => {
                        if (!item?.icon) {
                          return { pl: 2, minWidth: 0, flex: 1 };
                        }
                        return { minWidth: 0, flex: 1 };
                      }}
                    >
                      <Typography
                        color="text.secondary"
                        variant="overline"
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {isFetching ? <Skeleton width={"100%"} /> : item.data}
                      </Typography>
                    </Box>
                  </Tooltip>
                ) : (
                  <Box
                    sx={() => {
                      if (!item?.icon) {
                        return { pl: 2, minWidth: 0, flex: 1 };
                      }
                      return { minWidth: 0, flex: 1 };
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      variant="overline"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {isFetching ? <Skeleton width={"100%"} /> : item.data}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
            {item.offcanvas && (
              <>
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
                      <Grid size={{ xs: 12 }}>
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
