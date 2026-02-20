import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { BuildingOfficeIcon, CloudIcon } from "@heroicons/react/24/outline";

export const CippAddTenantTypeSelection = (props) => {
  const { onNextStep, formControl, currentStep, onPreviousStep } = props;

  const [selectedOption, setSelectedOption] = useState(null);

  // Register the tenantType field in react-hook-form
  formControl.register("tenantType", {
    required: true,
  });

  // Restore selection if already set (when navigating back)
  useEffect(() => {
    const currentValue = formControl.getValues("tenantType");
    if (currentValue) {
      setSelectedOption(currentValue);
    }
    // Restore the form's selectedOption state if navigating back
    const selectedOptionValue = formControl.getValues("selectedOption");
    if (selectedOptionValue) {
      formControl.setValue("selectedOption", selectedOptionValue);
    }
  }, [formControl]);

  const handleOptionClick = (value) => {
    setSelectedOption(value);
    formControl.setValue("tenantType", value);

    // Clear validation fields from other paths when changing selection
    // This ensures going back and choosing a different option doesn't keep old validations
    if (value === "GDAP") {
      // Clear Direct tenant fields
      formControl.unregister("DirectTenantAuth");
    } else if (value === "Direct") {
      // Clear GDAP fields
      formControl.unregister("GDAPTemplate");
      formControl.unregister("GDAPInviteAccepted");
      formControl.unregister("GDAPRelationshipId");
      formControl.unregister("GDAPOnboardingComplete");
    }

    // Trigger validation only for the tenantType field
    formControl.trigger("tenantType");
  };

  const options = [
    {
      value: "GDAP",
      label: "Add GDAP Tenant",
      description:
        "Select this option to add a new tenant to your Microsoft Partner center environment. We'll walk you through the steps of setting up GDAP.",
      icon: <CloudIcon />,
    },
    {
      value: "Direct",
      label: "Add Direct Tenant",
      description:
        "Select this option if you are not a Microsoft partner, or want to add a tenant outside of the scope of your partner center.",
      icon: <BuildingOfficeIcon />,
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">Select Tenant Type</Typography>
        <Typography color="text.secondary" variant="body2">
          Choose how you want to add the tenant to your CIPP environment.
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {options.map((option) => {
          const isSelected = selectedOption === option.value;

          return (
            <Card
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              variant="outlined"
              sx={{
                cursor: "pointer",
                ...(isSelected && {
                  boxShadow: (theme) => `0px 0px 0px 2px ${theme.palette.primary.main}`,
                }),
                "&:hover": {
                  ...(isSelected ? {} : { boxShadow: 8 }),
                },
              }}
            >
              <CardContent>
                <Stack alignItems="center" direction="row" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      backgroundColor: "background.default",
                      borderColor: "divider",
                      borderStyle: "solid",
                      borderWidth: 1,
                    }}
                  >
                    <SvgIcon fontSize="small">{option.icon}</SvgIcon>
                  </Avatar>
                  <Stack spacing={1}>
                    <Typography variant="h6">{option.label}</Typography>
                    <Typography color="text.secondary">{option.description}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};

export default CippAddTenantTypeSelection;
