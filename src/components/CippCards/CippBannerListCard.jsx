import PropTypes from "prop-types";
import { useState, useCallback } from "react";
import {
  Box,
  Card,
  Collapse,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { CippPropertyListCard } from "./CippPropertyListCard";
import { CippDataTable } from "../CippTable/CippDataTable";

export const CippBannerListCard = (props) => {
  const { items = [], isCollapsible = false, isFetching = false, children, ...other } = props;
  const [expanded, setExpanded] = useState(null);

  const handleExpand = useCallback((itemId) => {
    setExpanded((prevState) => (prevState === itemId ? null : itemId));
  }, []);

  const hasItems = items.length > 0;

  if (isFetching) {
    // Render skeletons during loading
    return (
      <Stack spacing={3} {...other}>
        {[...Array(1)].map((_, index) => (
          <Card key={index}>
            <Stack direction="row" flexWrap="wrap" justifyContent="space-between" sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Skeleton variant="text" width={80} />
                  <Skeleton variant="text" width={120} />
                </Box>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={2}>
                <Skeleton variant="text" width={60} />
                <Skeleton variant="circular" width={24} height={24} />
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={3} {...other}>
      {!hasItems ? (
        <Typography variant="body2">No items available.</Typography>
      ) : (
        <Card>
          <Stack
            component="ul"
            divider={<Divider />}
            sx={{
              listStyle: "none",
              m: 0,
              p: 0,
            }}
          >
            {items.map((item) => {
              const isExpanded = expanded === item.id;
              const statusColor = item.statusColor || "neutral.500"; // Default color

              return (
                <li key={item.id}>
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    sx={{
                      p: 3,
                      ...(isCollapsible && {
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }),
                    }}
                    onClick={isCollapsible ? () => handleExpand(item.id) : undefined}
                  >
                    {/* Left Side: cardLabelBox */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {typeof item.cardLabelBox === "object" ? (
                          <>
                            <Typography color="text.secondary" variant="h5">
                              {item.cardLabelBox.cardLabelBoxHeader}
                            </Typography>
                            <Typography color="text.secondary" variant="caption">
                              {item.cardLabelBox.cardLabelBoxText}
                            </Typography>
                          </>
                        ) : (
                          <Typography color="text.secondary" variant="h5">
                            {item.cardLabelBox}
                          </Typography>
                        )}
                      </Box>

                      {/* Main Text and Subtext */}
                      <Box>
                        <Typography color="text.primary" variant="h6">
                          {item.text}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {item.subtext}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Right Side: Status and Expand Icon */}
                    <Stack alignItems="center" direction="row" spacing={2}>
                      {item?.statusText && (
                        <Stack alignItems="center" direction="row" spacing={1}>
                          <Box
                            sx={{
                              backgroundColor: statusColor,
                              borderRadius: "50%",
                              height: 8,
                              width: 8,
                            }}
                          />
                          <Typography variant="body2">{item.statusText}</Typography>
                        </Stack>
                      )}
                      {item?.cardLabelBoxActions && (
                        <Box onClick={(e) => e.stopPropagation()}>{item.cardLabelBoxActions}</Box>
                      )}
                      {isCollapsible && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpand(item.id);
                          }}
                        >
                          <SvgIcon
                            fontSize="small"
                            sx={{
                              transition: "transform 150ms",
                              transform: isExpanded ? "rotate(180deg)" : "none",
                            }}
                          >
                            <ChevronDownIcon />
                          </SvgIcon>
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>
                  {isCollapsible && (
                    <Collapse in={isExpanded} unmountOnExit>
                      <Divider />
                      <Stack spacing={1}>
                        {item?.propertyItems?.length > 0 && (
                          <CippPropertyListCard
                            propertyItems={item.propertyItems || []}
                            layout="dual"
                            isFetching={item.isFetching || false}
                          />
                        )}
                        {item?.table && <CippDataTable {...item.table} />}
                        {item?.children && <Box sx={{ pl: 3 }}>{item.children}</Box>}
                        {item?.actionButton && <Box sx={{ pl: 3, pb: 2 }}>{item.actionButton}</Box>}
                      </Stack>
                    </Collapse>
                  )}
                </li>
              );
            })}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

CippBannerListCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      cardLabelBox: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          cardLabelBoxHeader: PropTypes.string,
          cardLabelBoxText: PropTypes.string,
        }),
      ]).isRequired,
      text: PropTypes.string.isRequired,
      subtext: PropTypes.string,
      statusColor: PropTypes.string,
      statusText: PropTypes.string,
      actionButton: PropTypes.element,
      propertyItems: PropTypes.array,
      table: PropTypes.object,
      isFetching: PropTypes.bool,
      children: PropTypes.node,
      cardLabelBoxActions: PropTypes.element,
    })
  ).isRequired,
  isCollapsible: PropTypes.bool,
  isFetching: PropTypes.bool,
};
