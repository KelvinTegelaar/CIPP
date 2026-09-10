import { Box, SwipeableDrawer, Typography } from "@mui/material";
import { useSwipeCloseTransition } from "../../hooks/use-swipe-close-transition";

// SwipeableDrawer requires onOpen; these sheets are only ever opened programmatically.
const noop = () => {};

// Mobile bottom sheet — the house rule for the mobile surface is that anything rendered
// as a Menu on desktop becomes one of these: predictable position, 44px+ rows, thumb reach.
export const CippBottomSheet = (props) => {
  const { open, onClose, title, children, footer, onExited, SlideProps, ModalProps, ...other } =
    props;
  const swipeClose = useSwipeCloseTransition(open, onClose);
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={swipeClose.onClose}
      onOpen={noop}
      disableSwipeToOpen
      ModalProps={{
        keepMounted: false,
        ...ModalProps,
      }}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      {...other}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            maxHeight: "85dvh",
            display: "flex",
            flexDirection: "column",
          },
        },

        transition: { ...SlideProps, ...swipeClose.transitionProps, onExited }
      }}>
      <Box
        sx={{
          width: 36,
          height: 4,
          borderRadius: 2,
          bgcolor: "divider",
          mx: "auto",
          mt: 1,
          flexShrink: 0,
        }}
      />
      {title && (
        <Typography
          variant="subtitle2"
          noWrap
          sx={{
            color: "text.secondary",
            px: 2.25,
            pt: 1,
            flexShrink: 0
          }}>
          {title}
        </Typography>
      )}
      <Box
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          pb: footer ? 1 : "calc(env(safe-area-inset-bottom) + 8px)",
        }}
      >
        {children}
      </Box>
      {footer && (
        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            px: 2,
            pt: 1.5,
            pb: "calc(env(safe-area-inset-bottom) + 12px)",
            flexShrink: 0,
          }}
        >
          {footer}
        </Box>
      )}
    </SwipeableDrawer>
  );
};
