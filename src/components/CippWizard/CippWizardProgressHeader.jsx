import PropTypes from "prop-types";
import { LinearProgress, Stack, Typography } from "@mui/material";

/**
 * The wizard's step indicator below md.
 *
 * A horizontal MUI Stepper gives every step a 36px icon beside two lines of text; with the
 * 3-7 steps these wizards have, and ~326px of usable width on a phone, the labels collapse
 * into each other. This says the same thing in the space available: where you are, what
 * this step is, and how much is left.
 *
 * Takes the same two props as WizardSteps so the swap needs no new plumbing.
 */
export const CippWizardProgressHeader = (props) => {
  const { activeStep = 0, steps = [] } = props;

  const total = steps.length;
  // Clamped because handleNext currently counts against the unfiltered step list, so
  // activeStep can point past the end of a wizard whose steps are conditionally hidden.
  const index = total > 0 ? Math.min(Math.max(activeStep, 0), total - 1) : 0;
  const current = steps[index];
  const value = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{
        color: "text.secondary"
      }}>
        {total > 0 ? `Step ${index + 1} of ${total}` : "No steps"}
      </Typography>
      <Typography variant="subtitle1">{current?.description ?? current?.title ?? ""}</Typography>
      {/* Carries the same error/loading states the step icons show on desktop, so the
          GDAP-style "this step failed" signal survives the swap. */}
      <LinearProgress
        variant={current?.loading ? "indeterminate" : "determinate"}
        value={value}
        color={current?.error ? "error" : "primary"}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Stack>
  );
};

CippWizardProgressHeader.propTypes = {
  activeStep: PropTypes.number,
  steps: PropTypes.array,
};
