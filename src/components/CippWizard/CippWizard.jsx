import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, Container, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { WizardSteps } from "./wizard-steps";
import { useForm, useWatch } from "react-hook-form";

export const CippWizard = (props) => {
  const { 
    postUrl, 
    orientation = "horizontal", 
    steps,
    contentMaxWidth = "md",
  } = props;
  
  const formControl = useForm({ mode: "onChange", defaultValues: props.initialState });
  const formWatcher = useWatch({
    control: formControl.control,
  });

  const stepsWithVisibility = useMemo(() => {
    return steps.filter((step) => {
      if (step.hideStepWhen) {
        return !step.hideStepWhen(formWatcher);
      }
      if (step.showStepWhen) {
        return step.showStepWhen(formWatcher);
      }
      return true;
    });
  }, [steps, formWatcher]);

  const [activeStep, setActiveStep] = useState(0);
  const handleBack = useCallback(() => {
    setActiveStep((prevState) => (prevState > 0 ? prevState - 1 : prevState));
  }, []);

  const handleNext = useCallback(() => {
    setActiveStep((prevState) => (prevState < steps.length - 1 ? prevState + 1 : prevState));
  }, []);

  const content = useMemo(() => {
    const currentStep = stepsWithVisibility[activeStep];
    const StepComponent = currentStep.component;

    return (
      <StepComponent
        onNextStep={handleNext}
        onPreviousStep={handleBack}
        formControl={formControl}
        lastStep={stepsWithVisibility.length - 1}
        currentStep={activeStep}
        postUrl={postUrl}
        options={currentStep.componentProps?.options}
        title={currentStep.componentProps?.title}
        subtext={currentStep.componentProps?.subtext}
        valuesKey={currentStep.componentProps?.valuesKey}
        {...currentStep.componentProps}
      />
    );
  }, [activeStep, handleNext, handleBack, stepsWithVisibility, formControl]);

  // Get the maxWidth for the current step, fallback to global setting
  const currentStepMaxWidth = useMemo(() => {
    const currentStep = stepsWithVisibility[activeStep];
    return currentStep.maxWidth ?? contentMaxWidth;
  }, [activeStep, stepsWithVisibility, contentMaxWidth]);

  return (
    <Card>
      {orientation === "vertical" ? (
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ md: 4, xs: 12 }}>
              <WizardSteps
                postUrl={postUrl}
                activeStep={activeStep}
                orientation={orientation}
                steps={stepsWithVisibility}
              />
            </Grid>
            <Grid size={{ md: 8, xs: 12 }}>
              {content}
            </Grid>
          </Grid>
        </CardContent>
      ) : (
        <CardContent>
          <Stack spacing={6}>
            <WizardSteps
              postUrl={postUrl}
              activeStep={activeStep}
              orientation={orientation}
              steps={stepsWithVisibility}
            />
            <div>
              <Container maxWidth={currentStepMaxWidth}>{content}</Container>
            </div>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};
