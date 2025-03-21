import { useState, useEffect } from "react";
import { Grid, Typography, CircularProgress } from "@mui/material";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { Stack } from "@mui/system";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../utils/get-cipp-translation";

export const CippAddTenantConfirmation = ({
  postUrl,
  formControl,
  onSubmit,
  onPreviousStep,
  currentStep,
}) => {
  const values = formControl.getValues();
  console.log("values", values);
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Confirmation</Typography>
      <CippPropertyListCard
        title="Tenant Information"
        variant="outlined"
        layout="dual"
        showDivider={false}
        propertyItems={Object.keys(values)?.map((item) => {
          return { label: getCippTranslation(item), value: values[item] };
        })}
      />
      <CippWizardStepButtons
        postUrl={postUrl}
        formControl={formControl}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onSubmit}
      />
    </Stack>
  );
};
