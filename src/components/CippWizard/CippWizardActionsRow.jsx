import PropTypes from "prop-types";
import { Stack } from "@mui/material";

/**
 * The Back / Next / Submit row shared by the wizard step buttons and the three steps that
 * roll their own.
 *
 * Presentational only — no behaviour, because the four call sites disagree about what the
 * buttons DO (some gate Next on form validity, some own their submit) and only agree about
 * how the row should sit.
 *
 * Below md the row stacks in `column-reverse`, which puts the primary action at the top and
 * Close at the bottom. Two details are load-bearing:
 *  - `alignItems: stretch`, or a column would shrink every child to its content width.
 *  - the descendant selector rather than per-button `fullWidth`: the Submit button is
 *    wrapped in its own <form>, so the form is the flex item and the button inside it is
 *    what needs the width.
 */
export const CippWizardActionsRow = (props) => {
  const { sx, children } = props;

  return (
    <Stack
      spacing={2}
      direction={{ xs: "column-reverse", md: "row" }}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="flex-end"
      sx={{
        // In dialog mode this row is portalled into DialogActions, which is a flex
        // container that would otherwise size it to its widest label.
        width: { xs: "100%", md: "auto" },
        "& .MuiButton-root": {
          width: { xs: "100%", md: "auto" },
          minHeight: { xs: 44, md: "auto" },
        },
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
};

CippWizardActionsRow.propTypes = {
  sx: PropTypes.object,
  children: PropTypes.node,
};
