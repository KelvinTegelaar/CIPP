import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Container, Stack } from "@mui/material";
import { WizardBusinessStep } from "../../../../components/CippWizard/CippWizardOptionsList";
import { WizardConfirmationStep } from "../../../../components/CippWizard/CippWizardConfirmation";
import { WizardNotificationsStep } from "../../../../components/CippWizard/CippPSASyncOptions";
import { WizardProfileStep } from "../../../../components/CippWizard/CippPSACredentialsStep";
import { WizardSteps } from "../../../../components/CippWizard/wizard-steps";
import Grid from "@mui/material/Grid2";

const steps = [
  {
    title: "Step 1",
    description: "Select your source",
  },
  {
    title: "Step 2",
    description: "Enter your credentials",
  },
  {
    title: "Step 3",
    description: "Select your Sync Options",
  },
  {
    title: "Step 4",
    description: "Confirmation",
  },
];

export const Wizard = (props) => {
  const { orientation = "horizontal" } = props;
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState({
    businessType: "saas",
    name: "",
    website: "",
    companyName: "",
    notifications: ["productUpdate", "weeklyNews"],
  });

  const handleBack = useCallback(() => {
    setActiveStep((prevState) => {
      if (prevState > 0) {
        return prevState - 1;
      }

      return prevState;
    });
  }, []);

  const handleNext = useCallback((values) => {
    setValues((prevState) => ({
      ...prevState,
      ...values,
    }));

    setActiveStep((prevState) => {
      if (prevState < steps.length - 1) {
        return prevState + 1;
      }

      return prevState;
    });
  }, []);

  const content = useMemo(() => {
    switch (activeStep) {
      case 0:
        return (
          <WizardBusinessStep
            onNextStep={handleNext}
            values={{
              businessType: values.businessType,
            }}
          />
        );

      case 1:
        return (
          <WizardProfileStep
            onNextStep={handleNext}
            onPreviousStep={handleBack}
            values={{
              companyName: values.companyName,
              name: values.name,
              website: values.website,
            }}
          />
        );

      case 2:
        return (
          <WizardNotificationsStep
            onNextStep={handleNext}
            onPreviousStep={handleBack}
            values={{
              notifications: values.notifications,
            }}
          />
        );

      case 3:
        return <WizardConfirmationStep onPreviousStep={handleBack} values={values} />;

      default:
        return null;
    }
  }, [activeStep, handleNext, handleBack, values]);

  return (
    <Card>
      {orientation === "vertical" ? (
        <CardContent>
          <Grid container spacing={3}>
            <Grid xs={12} md={4}>
              <WizardSteps activeStep={activeStep} orientation={orientation} steps={steps} />
            </Grid>
            <Grid xs={12} md={8}>
              {content}
            </Grid>
          </Grid>
        </CardContent>
      ) : (
        <CardContent>
          <Stack spacing={6}>
            <WizardSteps activeStep={activeStep} orientation={orientation} steps={steps} />
            <div>
              <Container maxWidth="sm">{content}</Container>
            </div>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};
