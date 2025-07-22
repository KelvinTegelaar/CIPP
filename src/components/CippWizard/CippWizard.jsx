import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, Container, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { WizardSteps } from "./wizard-steps";
import { useForm, useWatch } from "react-hook-form";

export const CippWizard = (props) => {
  const { postUrl, orientation = "horizontal", steps } = props;

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
    const StepComponent = stepsWithVisibility[activeStep].component;
    return (
      <StepComponent
        onNextStep={handleNext}
        onPreviousStep={handleBack}
        formControl={formControl}
        lastStep={stepsWithVisibility.length - 1}
        currentStep={activeStep}
        postUrl={postUrl}
        options={stepsWithVisibility[activeStep].componentProps?.options}
        title={stepsWithVisibility[activeStep].componentProps?.title}
        subtext={stepsWithVisibility[activeStep].componentProps?.subtext}
        valuesKey={stepsWithVisibility[activeStep].componentProps?.valuesKey}
        {...stepsWithVisibility[activeStep].componentProps}
      />
    );
  }, [activeStep, handleNext, handleBack, stepsWithVisibility, formControl]);

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
              <Container maxWidth="md">{content}</Container>
            </div>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};
