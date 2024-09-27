import { Alert, Card, Stack, Typography } from "@mui/material";
import { PropertyList } from "../property-list";
import { ApiPostCall } from "../../api/ApiCall";
import { ResourceError } from "../resource-error";
import CippWizardStepButtons from "./CippWizardStepButtons";

export const CippWizardConfirmation = (props) => {
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;

  const postRequest = ApiPostCall({ urlFromData: true });

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h6">Step 4. Confirmation</Typography>
      </div>
      <Card variant="outlined">
        <PropertyList>//confirmation list here</PropertyList>
      </Card>
      {postRequest.data?.data && (
        <Alert severity={postRequest.data?.data?.success ? "success" : "warning"}>
          {postRequest.data?.data?.result}
        </Alert>
      )}
      {postRequest.isError && <ResourceError message={postRequest.error.message} />}
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
