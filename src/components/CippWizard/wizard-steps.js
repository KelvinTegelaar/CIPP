import PropTypes from "prop-types";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import {
  Box,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  SvgIcon,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ClearIcon } from "@mui/x-date-pickers";

const WizardStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.vertical}`]: {
    marginLeft: 16,
  },
  [`& .${stepConnectorClasses.lineVertical}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.neutral[800] : theme.palette.neutral[200],
    borderLeftWidth: 2,
  },
  [`& .${stepConnectorClasses.lineHorizontal}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.neutral[800] : theme.palette.neutral[200],
    borderTopWidth: 2,
  },
}));

const WizardStepIcon = (props) => {
  const { active, completed, error } = props;

  if (error) {
    return (
      <Box
        sx={{
          alignItems: "center",
          backgroundColor: "error.main",
          borderRadius: "50%",
          color: "primary.contrastText",
          display: "flex",
          height: 36,
          justifyContent: "center",
          width: 36,
        }}
      >
        <SvgIcon fontSize="small">
          <ClearIcon />
        </SvgIcon>
      </Box>
    );
  }
  if (active) {
    return (
      <Box
        sx={{
          alignItems: "center",
          borderColor: "primary.main",
          borderRadius: "50%",
          borderStyle: "solid",
          borderWidth: 2,
          color: "primary.main",
          display: "flex",
          height: 36,
          justifyContent: "center",
          width: 36,
        }}
      >
        <Box
          sx={{
            backgroundColor: "primary.main",
            borderRadius: "50%",
            height: 12,
            width: 12,
          }}
        />
      </Box>
    );
  }
  if (completed) {
    return (
      <Box
        sx={{
          alignItems: "center",
          backgroundColor: "primary.main",
          borderRadius: "50%",
          color: "primary.contrastText",
          display: "flex",
          height: 36,
          justifyContent: "center",
          width: 36,
        }}
      >
        <SvgIcon fontSize="small">
          <CheckIcon />
        </SvgIcon>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderColor: (theme) => (theme.palette.mode === "dark" ? "neutral.700" : "neutral.300"),
        borderRadius: "50%",
        borderStyle: "solid",
        borderWidth: 2,
        height: 36,
        width: 36,
      }}
    />
  );
};

export const WizardSteps = (props) => {
  const { activeStep = 1, orientation = "vertical", steps = [] } = props;

  return (
    <div>
      <Stepper
        orientation={orientation}
        activeStep={activeStep}
        connector={<WizardStepConnector />}
      >
        {steps.map((step) => (
          <Step key={step.title}>
            <StepLabel error={step.error ?? false} slots={{ stepIcon: WizardStepIcon }}>
              <Typography variant="subtitle2">
                {`Step ${steps.indexOf(step) ? steps.indexOf(step) + 1 : 1}`}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {step.description}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

WizardSteps.propTypes = {
  activeStep: PropTypes.number,
  orientation: PropTypes.oneOf(["vertical", "horizontal"]),
  steps: PropTypes.array,
};
