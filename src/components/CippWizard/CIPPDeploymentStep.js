import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Grid,
  Link,
  Stack,
  Typography,
  Skeleton,
  Box,
  CircularProgress,
  SvgIcon,
} from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { ApiGetCall } from "../../api/ApiCall";
import CippButtonCard from "../CippCards/CippButtonCard";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import { CheckCircle } from "@mui/icons-material";
import CippPermissionCheck from "../CippSettings/CippPermissionCheck";
import { useQueryClient } from "@tanstack/react-query";

export const CippDeploymentStep = (props) => {
  const queryClient = useQueryClient();
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();

  const [currentStepState, setCurrentStepState] = useState(1); // Start at Step 1
  const [pollingStep, setPollingStep] = useState(1); // Control polling by step
  const [approvalUrl, setApprovalUrl] = useState(true);

  // Initial setup API call
  const startSetupApi = ApiGetCall({
    url: "/api/ExecSAMSetup?CreateSAM=true&partnersetup=true",
    queryKey: "startSAMSetup",
  });

  // Polling for setup status based on current step
  const checkSetupStatusApi = ApiGetCall({
    url: `/api/ExecSAMSetup?CheckSetupProcess=true&step=${pollingStep}`,
    queryKey: `checkSetupStep${pollingStep}`,
    waiting: !pollingStep,
  });

  // Start polling Step 1 upon successful setup creation
  useEffect(() => {
    if (startSetupApi.data && startSetupApi.data.step === 1) {
      setPollingStep(1);
      setCurrentStepState(1);
    }
  }, [startSetupApi.data]);

  // Polling logic - check for updates every 5 seconds
  useEffect(() => {
    if (pollingStep) {
      const intervalId = setInterval(() => {
        if (!checkSetupStatusApi.isFetching) {
          checkSetupStatusApi.refetch();
        }
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [pollingStep, checkSetupStatusApi]);

  // Manage API responses to advance steps based on returned step value
  useEffect(() => {
    if (checkSetupStatusApi.data) {
      const { step, message, url, code } = checkSetupStatusApi.data;
      if (url) {
        setApprovalUrl(url);
      }
      if (step === 2) {
        setCurrentStepState(2);
        setPollingStep(2);
      } else if (step >= 3) {
        setCurrentStepState(4);
        setPollingStep(null); // Stop polling as we’re at the final step
      }
    }
  }, [checkSetupStatusApi.data, currentStepState]);

  const openPopup = (url) => {
    const width = 500;
    const height = 500;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(url, "_blank", `width=${width},height=${height},left=${left},top=${top}`);
  };
  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        {values.selectedOption === "CreateApp" && (
          <>
            <Alert severity="info">
              To run this setup you will need the following prerequisites:
              <li>
                A CIPP Service Account. For more information on how to create a service account,
                click{" "}
                <Link
                  href="https://docs.cipp.app/setup/installation/samwizard"
                  rel="noreferrer"
                  target="_blank"
                >
                  here
                </Link>
              </li>
              <li>(Temporary) Global Administrator permissions for the CIPP Service Account</li>
              <li>
                Multi-factor authentication enabled for the CIPP Service Account, with no trusted
                locations or other exclusions.
              </li>
            </Alert>
            {/* Step 1 Card */}
            {currentStepState >= 1 && (
              <CippButtonCard
                title={
                  <Stack direction="row" justifyContent={"space-between"}>
                    <Box>Step 1: Create Application</Box>
                    <Stack direction="row" spacing={2}>
                      {currentStepState <= 1 ? (
                        <CircularProgress size="1rem" />
                      ) : (
                        <SvgIcon>
                          <CheckCircle />
                        </SvgIcon>
                      )}
                    </Stack>
                  </Stack>
                }
                variant="outlined"
                isFetching={startSetupApi.isLoading}
                CardButton={
                  <Button
                    disabled={currentStepState >= 2}
                    variant="contained"
                    color="primary"
                    onClick={() => openPopup("https://microsoft.com/devicelogin")}
                  >
                    Login to Microsoft
                  </Button>
                }
              >
                <Typography variant="body2" gutterBottom>
                  Click the button below and enter the provided code. This creates the CIPP
                  Application Registration in your tenant that allows you to access the Graph API.
                </Typography>
                {startSetupApi.isLoading ? (
                  <Skeleton variant="rectangular" height={60} />
                ) : (
                  <CippCopyToClipBoard text={startSetupApi.data?.code} type="chip" />
                )}
              </CippButtonCard>
            )}
            {/* Step 2 Card */}
            {currentStepState >= 2 && (
              <CippButtonCard
                variant="outlined"
                isFetching={checkSetupStatusApi.isLoading && pollingStep === 2}
                title={
                  <Stack direction="row" justifyContent={"space-between"}>
                    <Box>Step 2: Approve Permissions</Box>
                    <Stack direction="row" spacing={2}>
                      {currentStepState <= 2 ? (
                        <CircularProgress size="1rem" />
                      ) : (
                        <SvgIcon>
                          <CheckCircle />
                        </SvgIcon>
                      )}
                    </Stack>
                  </Stack>
                }
                CardButton={
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={currentStepState >= 4}
                    onClick={() => openPopup(approvalUrl)}
                  >
                    Open Approval Link
                  </Button>
                }
              >
                <Typography variant="h6" gutterBottom>
                  Step 2: Approvals Required
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Please open the link below and provide the required approval, this allows the app
                  specific permissions shown in the next screen.
                </Typography>
              </CippButtonCard>
            )}

            {/* Final Step 4 Card */}
            {currentStepState >= 4 && <CippPermissionCheck variant="outlined" type="Permissions" />}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setPollingStep(1);
                  setCurrentStepState(1);
                  setApprovalUrl(null);
                  queryClient.removeQueries("startSAMSetup");
                  queryClient.removeQueries("checkSetupStep1");
                  setTimeout(() => {
                    startSetupApi.refetch();
                  }, 200);
                }}
              >
                Start Over
              </Button>
            </Grid>
          </>
        )}

        {values.selectedOption === "UpdateTokens" && (
          <>
            <Typography variant="body1" gutterBottom>
              Click the button below to refresh your token.
            </Typography>
            <Grid item xs={12}>
              <Button variant="contained" color="primary">
                Refresh Graph Token.
              </Button>
            </Grid>
          </>
        )}

        {values.selectedOption === "Manual" && (
          <>
            <Typography variant="body1">
              You may enter your secrets below. Leave fields blank to retain existing values.
            </Typography>
            <CippFormComponent
              formControl={formControl}
              type="textField"
              name="TenantID"
              label="Tenant ID"
              placeholder="Enter the Tenant ID. Leave blank to retain previous key."
            />
            <CippFormComponent
              formControl={formControl}
              type="textField"
              name="ApplicationID"
              label="Application ID"
              placeholder="Enter the Application ID. Leave blank to retain previous key."
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="ApplicationSecret"
              label="Application Secret"
              placeholder="Enter the application secret. Leave blank to retain previous key."
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="RefreshToken"
              label="Refresh Token"
              placeholder="Enter the refresh token. Leave blank to retain previous key."
            />
          </>
        )}
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
