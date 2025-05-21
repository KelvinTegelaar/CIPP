import { useState } from "react";
import { Alert, Stack, Typography, FormControl, FormLabel, Box } from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippFormCondition } from "../CippComponents/CippFormCondition";
import { ApiGetCall } from "../../api/ApiCall";

export const CippBaselinesStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();

  // Fetch available baselines from API
  const baselinesApi = ApiGetCall({
    url: "/api/ListCommunityRepos",
    queryKey: "CommunityRepos",
  });

  // Create baseline options from the API response
  const baselineOptions = baselinesApi.isSuccess
    ? baselinesApi.data?.Results?.map((repo) => ({
        label: `${repo.Name} (${repo.Owner})`,
        value: repo.Id,
        description: repo.Description || "No description available",
      })) || []
    : [];

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Alert severity="info">
          <Typography variant="body1" gutterBottom>
            Baselines are template configurations that can be used as examples for setting up your
            environment.
          </Typography>
          <Typography variant="body2">
            Downloading these baselines will create templates in your CIPP instance. These templates
            won't make any changes to your environment, but can be used as examples on how to setup
            environments. Each template library contains multiple templates,
            <ul>
              <li>
                CIPP Templates by CyberDrain contain several example standards, including low,
                medium, and high priority standards
              </li>
              <li>
                JoeyV's Conditional Access Baseline contains a Microsoft approved baseline for
                Conditional Access, following the Microsoft best practices.
              </li>
              <li>
                OpenIntuneBaseline contains Intune templates, the baseline is a community driven
                baseline for Intune, based on CIS, NIST, and more benchmarks. It's considered the
                leading baseline for Intune.
              </li>
            </ul>
          </Typography>
        </Alert>

        <FormControl component="fieldset">
          <FormLabel component="legend">Baseline Configuration</FormLabel>
          <Box sx={{ mt: 2 }}>
            <CippFormComponent
              type="radio"
              name="baselineOption"
              label="Choose an option"
              formControl={formControl}
              options={[
                {
                  label: "No Baselines - I want to create my own templates",
                  value: "noBaselines",
                },
                {
                  label: "Download Baselines",
                  value: "downloadBaselines",
                },
              ]}
              defaultValue="noBaselines"
            />
          </Box>
        </FormControl>

        <CippFormCondition
          field="baselineOption"
          compareType="is"
          compareValue="downloadBaselines"
          formControl={formControl}
        >
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select baselines to download:
            </Typography>
            {baselinesApi.isLoading ? (
              <Typography variant="body2">Loading available baselines...</Typography>
            ) : baselinesApi.isError ? (
              <Alert severity="error">Failed to load baselines. Please try again later.</Alert>
            ) : (
              <CippFormComponent
                type="autoComplete"
                name="selectedBaselines"
                label="Select Baselines"
                formControl={formControl}
                options={baselineOptions}
                multiple={true}
                placeholder="Select one or more baselines"
              />
            )}
          </Box>
        </CippFormCondition>
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

export default CippBaselinesStep;
