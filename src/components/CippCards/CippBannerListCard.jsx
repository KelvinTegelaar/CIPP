import PropTypes from "prop-types";
import { CippIcons } from "../../utils/icon-registry";
import { useState, useCallback } from "react";
import {
  Box,
  Card,
  Checkbox,
  Collapse,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { CippPropertyListCard } from "./CippPropertyListCard";
import { CippDataTable } from "../CippTable/CippDataTable";

export const CippBannerListCard = (props) => {
  const {
    items = [],
    isCollapsible = false,
    isFetching = false,
    children,
    onSelectionChange,
    selectedItems = [],
    ...other
  } = props;
  const [expanded, setExpanded] = useState(null);

  const handleExpand = useCallback((itemId) => {
    setExpanded((prevState) => (prevState === itemId ? null : itemId));
  }, []);

  const handleCheckboxChange = useCallback(
    (itemId, checked) => {
      if (onSelectionChange) {
        if (checked) {
          onSelectionChange([...selectedItems, itemId]);
        } else {
          onSelectionChange(selectedItems.filter((id) => id !== itemId));
        }
      }
    },
    [onSelectionChange, selectedItems]
  );

  const hasItems = items.length > 0;

  if (isFetching) {
    // Render skeletons during loading
    return (
      <Stack spacing={3} {...other}>
        {[...Array(1)].map((_, index) => (
          <Card key={index}>
            <Stack
              useFlexGap
              direction="row"
              sx={{
                flexWrap: "wrap",
                justifyContent: "space-between",
                p: 3
              }}>
              <Stack direction="row" spacing={2} sx={{
                alignItems: "center"
              }}>
                <Box>
                  <Skeleton variant="text" width={80} />
                  <Skeleton variant="text" width={120} />
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} sx={{
                alignItems: "center"
              }}>
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
                    // Status, actions and the expander take their own row below md: sharing
                    // one line with them squeezed the text column to about 90px, which broke
                    // the subtext one word per line and ellipsed every title.
                    useFlexGap
                    onClick={isCollapsible ? () => handleExpand(item.id) : undefined}
                    sx={{
                      justifyContent: "space-between",
                      flexWrap: { xs: "wrap", md: "nowrap" },
                      rowGap: 1.5,
                      p: { xs: 2, md: 3 },

                      ...(isCollapsible && {
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      })
                    }}>
                    {/* Left Side: cardLabelBox */}
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        alignItems: "center",
                        flex: { xs: "1 1 100%", md: "1 1 auto" },
                        minWidth: 0
                      }}>
                      {onSelectionChange && (
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(item.id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          flexDirection: "column",
                          flexShrink: 0,
                        }}
                      >
                        {typeof item.cardLabelBox === "object" ? (
                          <>
                            <Typography variant="h5" sx={{
                              color: "text.secondary"
                            }}>
                              {item.cardLabelBox.cardLabelBoxHeader}
                            </Typography>
                            <Typography variant="caption" sx={{
                              color: "text.secondary"
                            }}>
                              {item.cardLabelBox.cardLabelBoxText}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="h5" sx={{
                            color: "text.secondary"
                          }}>
                            {item.cardLabelBox}
                          </Typography>
                        )}
                      </Box>

                      {/* Main Text and Subtext */}
                      <Box sx={{ flex: 1, minWidth: 0, pr: { xs: 0, md: 2 } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "text.primary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                          {item.text}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: "text.secondary"
                        }}>
                          {item.subtext}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Right Side: Status and Expand Icon */}
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        alignItems: "center",
                        flexShrink: 0,
                        ml: { xs: "auto", md: 0 }
                      }}>
                      {item?.statusText && (
                        <Stack direction="row" spacing={1} sx={{
                          alignItems: "center"
                        }}>
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
                            <CippIcons.ChevronDownIcon />
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
                            layout={other.layout || "dual"}
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
  onSelectionChange: PropTypes.func,
  selectedItems: PropTypes.array,
};
