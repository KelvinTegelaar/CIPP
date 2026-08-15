import { useEffect, useRef, useState } from "react";
import { Alert, Box, Link } from "@mui/material";
import { useIsMobileLayout } from "../../hooks/use-breakpoint";

/**
 * An Alert that earns its screen space on a phone: below the mobile breakpoint the message
 * clamps to a few lines with a Show more toggle, instead of pushing the page's actual
 * content under the fold (the CIPP Roles intro alert filled most of the first screen).
 * Desktop always shows the full message — the width absorbs it.
 *
 * Whether the toggle appears is measured, not assumed: a message short enough to fit its
 * clamp renders exactly like a plain Alert.
 */
export const CippExpandableAlert = ({ children, collapsedLines = 3, ...alertProps }) => {
  const isMobile = useIsMobileLayout();
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);
  const messageRef = useRef(null);

  useEffect(() => {
    // Measure only while clamped: expanding removes the overflow, and remeasuring then
    // would drop the Show less control with no way back.
    if (!isMobile || expanded) return;
    const el = messageRef.current;
    if (el) setClipped(el.scrollHeight > el.clientHeight + 1);
  }, [isMobile, expanded, children]);

  const clamped = isMobile && !expanded;

  return (
    <Alert {...alertProps}>
      <Box
        ref={messageRef}
        sx={
          clamped
            ? {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: collapsedLines,
                overflow: "hidden",
              }
            : undefined
        }
      >
        {children}
      </Box>
      {isMobile && clipped && (
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ mt: 0.5, fontWeight: 600 }}
        >
          {expanded ? "Show less" : "Show more"}
        </Link>
      )}
    </Alert>
  );
};
