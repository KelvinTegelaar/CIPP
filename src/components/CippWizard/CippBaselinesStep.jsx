import { Alert, Stack, Typography, FormControl, FormLabel, Box } from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippFormCondition } from "../CippComponents/CippFormCondition";

export const CippBaselinesStep = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Alert severity="info">
          <Typography variant="body1" gutterBottom>
            Baselines are template configurations that can be used as examples for setting up your
            environment. Don't want to configure these yet? No problem! You can find the templates
            at Tools - Community Repositories
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
            <CippFormComponent
              type="autoComplete"
              name="selectedBaselines"
              label="Select Baselines"
              formControl={formControl}
              api={{
                dataKey: "Results",
                queryKey: `ListBaselines`,
                url: "/api/ListCommunityRepos",
                labelField: (option) => `${option.Name} (${option.Owner})`,
                valueField: "FullName",
                addedFields: {
                  templateRepoBranch: "main",
                },
              }}
              multiple={true}
              placeholder="Select one or more baselines"
            />
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
