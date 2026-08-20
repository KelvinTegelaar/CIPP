import { Drawer, Box, Button, IconButton, Typography, Divider } from "@mui/material";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { useMediaQuery, Grid } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { renderUrlValue } from "../../utils/render-url-value";
import { useHistoryDismiss } from "../../hooks/use-history-dismiss";

export const CippOffCanvas = (props) => {
  const {
    title = "Extended Info",
    visible,
    extendedInfoFields = [],
    extendedData,
    actions,
    onClose,
    isFetching,
    children,
    size = "sm",
    footer,
    onNavigateUp,
    onNavigateDown,
    canNavigateUp = false,
    canNavigateDown = false,
    navigationPosition,
    contentPadding = 2,
    keepMounted = false,
    actionsPosition = "top",
    richFormatting = false,
    aboveModal = false,
  } = props;

  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  // Pages that hand-pick extendedInfoFields expect the flat text rendering. richFormatting
  // asks for the same nodes the table cells use — copy chips, links, status icons — which
  // is what the card view's generated fallback needs, since its fields ARE table columns.
  const formatField = (value, field, isArray) => {
    if (!richFormatting) {
      return getCippFormatting(value, field, isArray ? "array" : "text", "both");
    }
    return renderUrlValue(value, field) ?? getCippFormatting(value, field, undefined, "both");
  };

  const extendedInfo = extendedInfoFields.map((field) => {
    const value = field.split(".").reduce((acc, part) => acc && acc[part], extendedData);
    if (value === undefined || value === null) {
      if (extendedData?.[field] !== undefined && extendedData?.[field] !== null) {
        return {
          label: getCippTranslation(field),
          value: formatField(extendedData[field], field, false),
        };
      } else {
        return {
          label: getCippTranslation(field),
          value: "N/A",
        };
      }
    } else if (Array.isArray(value)) {
      return {
        label: getCippTranslation(field),
        value: formatField(value, field, true),
      };
    } else {
      return {
        label: getCippTranslation(field),
        value: formatField(value, field, false),
      };
    }
  });

  const infoCard = (extendedInfo.length > 0 || actions?.length > 0) && (
    <Grid size={{ xs: 12 }}>
      <CippPropertyListCard
        isFetching={isFetching}
        align="vertical"
        propertyItems={extendedInfo}
        copyItems={true}
        actionItems={actions}
        data={extendedData}
      />
    </Grid>
  );

  const SIZE_WIDTHS = { sm: 400, md: 600, lg: 800, xl: 1000 };
  const drawerWidth = mdDown ? "100%" : (SIZE_WIDTHS[size] ?? 400);
  // Prev/next navigation exists on this drawer (row detail view); on phones the 24px
  // header arrows move to a 44px bottom bar in thumb reach.
  const hasRowNavigation = canNavigateUp || canNavigateDown;
  const showBottomNav = mdDown && hasRowNavigation;

  // Below md this drawer reads as a detail page, so the back gesture has to behave like the
  // header's back chevron. Without a history entry of its own, swiping back from a row's
  // details leaves the list page entirely — and takes the table's loaded state with it.
  useHistoryDismiss(visible, onClose, mdDown);

  return (
    <>
      <Drawer
        PaperProps={{
          sx: { width: drawerWidth },
        }}
        ModalProps={{
          keepMounted: keepMounted,
        }}
        // A stock Drawer sits at 1200 and a Dialog at 1300, so a drawer opened from inside a
        // dialog renders behind it. Same lift CippBottomSheet takes, for the same reason.
        sx={aboveModal ? { zIndex: (theme) => theme.zIndex.modal + 1 } : undefined}
        anchor={"right"}
        open={visible}
        onClose={onClose}
      >
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5 }}
        >
          {/* Phone convention: back chevron on the left — the drawer reads as a detail page */}
          {mdDown ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
              <IconButton onClick={onClose} aria-label="Back" sx={{ ml: -0.5 }}>
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Typography variant="h6" noWrap>
                {title}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h5">{title}</Typography>
          )}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {hasRowNavigation && !mdDown && (
              <>
                <IconButton
                  onClick={onNavigateUp}
                  disabled={!canNavigateUp}
                  size="small"
                  title="Previous row"
                >
                  <KeyboardArrowUpIcon />
                </IconButton>
                <IconButton
                  onClick={onNavigateDown}
                  disabled={!canNavigateDown}
                  size="small"
                  title="Next row"
                >
                  <KeyboardArrowDownIcon />
                </IconButton>
              </>
            )}
            {!mdDown && (
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 73px)", // Account for header + divider
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Grid container spacing={1} sx={{ flexGrow: 1 }}>
              {actionsPosition !== "bottom" && infoCard}
              <Grid
                size={{ xs: 12 }}
                sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    minHeight: 0,
                    p: contentPadding,
                  }}
                >
                  {/* Render children if provided, otherwise render default content */}
                  {typeof children === "function" ? children(extendedData) : children}
                </Box>
              </Grid>
              {actionsPosition === "bottom" && infoCard}
            </Grid>
          </Box>

          {/* Footer section */}
          {footer && (
            <Box
              sx={{
                borderTop: 1,
                borderColor: "divider",
                p: 2,
                flexShrink: 0,
                mt: "auto",
              }}
            >
              {footer}
            </Box>
          )}

          {/* Mobile prev/next bar — 44px targets in thumb reach */}
          {showBottomNav && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderTop: 1,
                borderColor: "divider",
                px: 1.5,
                pt: 1.25,
                pb: "calc(env(safe-area-inset-bottom) + 12px)",
                flexShrink: 0,
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<KeyboardArrowUpIcon />}
                onClick={onNavigateUp}
                disabled={!canNavigateUp}
                sx={{ flex: 1, minHeight: 44, borderColor: "divider" }}
              >
                Prev
              </Button>
              {navigationPosition?.total > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  {navigationPosition.index} of {navigationPosition.total}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="inherit"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={onNavigateDown}
                disabled={!canNavigateDown}
                sx={{ flex: 1, minHeight: 44, borderColor: "divider" }}
              >
                Next
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};
