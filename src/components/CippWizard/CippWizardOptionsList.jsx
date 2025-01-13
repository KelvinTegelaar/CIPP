import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { CippWizardStepButtons } from "./CippWizardStepButtons";

export const CippWizardOptionsList = (props) => {
  const { onNextStep, options, title, subtext, formControl, currentStep, onPreviousStep } = props;
  const [selectedOption, setSelectedOption] = useState(null);
  // Register the "selectedOption" field in react-hook-form
  formControl.register("selectedOption", {
    required: true,
  });

  //only perform a reset if the form has more options than 'selectedOption'
  useEffect(() => {
    //find if we have more properties than just 'selectedOption'
    const formValues = formControl.getValues();
    const formEntries = Object.entries(formValues);
    const formKeys = formEntries.map(([key]) => key);
    const hasMoreThanSelectedOption = formKeys.length > 1;
    if (hasMoreThanSelectedOption) {
      formControl.reset({ selectedOption: "" });
    }
  }, [formControl]);

  const handleOptionClick = (value) => {
    setSelectedOption(value); // Visually select the option
    formControl.setValue("selectedOption", value); // Update form value in React Hook Form
    formControl.trigger();
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary" variant="body2">
          {subtext}
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {options.map((option) => {
          const isSelected = selectedOption === option.value; // Check if the option is selected

          return (
            <Card
              key={option.value}
              onClick={() => handleOptionClick(option.value)} // Handle option click
              variant="outlined"
              sx={{
                cursor: "pointer",
                ...(isSelected && {
                  boxShadow: (theme) => `0px 0px 0px 2px ${theme.palette.primary.main}`,
                }),
                "&:hover": {
                  ...(isSelected ? {} : { boxShadow: 8 }), // Hover effect
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
