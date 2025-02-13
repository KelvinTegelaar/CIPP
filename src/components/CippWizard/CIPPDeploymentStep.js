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
import { CheckCircle, Sync } from "@mui/icons-material";
import CippPermissionCheck from "../CippSettings/CippPermissionCheck";
import { useQueryClient } from "@tanstack/react-query";
import { CippApiResults } from "../CippComponents/CippApiResults";

export const CippDeploymentStep = (props) => {
  const queryClient = useQueryClient();
  const { formControl, onPreviousStep, onNextStep, currentStep } = props;
  const values = formControl.getValues();

  const [currentStepState, setCurrentStepState] = useState(1);
  const [pollingStep, setPollingStep] = useState(1);
  const [approvalUrl, setApprovalUrl] = useState(true);

  const startSetupApi = ApiGetCall({
    url: "/api/ExecSAMSetup?CreateSAM=true&partnersetup=true",
    queryKey: "startSAMSetup",
  });

  const checkSetupStatusApi = ApiGetCall({
    url: `/api/ExecSAMSetup?CheckSetupProcess=true&step=${pollingStep}`,
    queryKey: `checkSetupStep${pollingStep}`,
    waiting: !pollingStep,
  });
  const appId = ApiGetCall({
    url: `/api/ExecListAppId`,
    queryKey: `ExecListAppId`,
    waiting: true,
  });
  useEffect(() => {
    if (
      startSetupApi.data &&
      startSetupApi.data.step === 1 &&
      values.selectedOption === "CreateApp"
    ) {
      formControl.register("wizardStatus", {
        required: true,
      });
      formControl.setValue("noSubmitButton", true);
      setPollingStep(1);
      setCurrentStepState(1);
    }
  }, [startSetupApi.data]);

  useEffect(() => {
    if (pollingStep && values.selectedOption === "CreateApp") {
      const intervalId = setInterval(() => {
        if (!checkSetupStatusApi.isFetching) {
          checkSetupStatusApi.refetch();
        }
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [pollingStep, checkSetupStatusApi]);

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
        setPollingStep(null);
        formControl.setValue(
          "wizardStatus",
          "You've executed the Setup Wizard. You may now navigate away from this wizard."
        );
        formControl.trigger();
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
                  Login using your CIPP Service Account.
                </Typography>
                {startSetupApi.isLoading ? (
                  <Skeleton variant="rectangular" height={60} />
                ) : (
                  <CippCopyToClipBoard text={startSetupApi.data?.code} type="chip" />
                )}
              </CippButtonCard>
            )}
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
                    disabled={
                      currentStepState >= 4 ||
                      !approvalUrl ||
                      !approvalUrl.startsWith("https://login") ||
                      typeof approvalUrl !== "string"
                    }
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
                  specific permissions shown in the next screen. Login using your CIPP Service
                  Account.
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
              <Grid item xs={12}>
                <CippApiResults apiObject={startSetupApi} errorsOnly={true} />
                <CippApiResults apiObject={checkSetupStatusApi} errorsOnly={true} />
              </Grid>
            </Grid>
          </>
        )}

        {values.selectedOption === "UpdateTokens" && (
          <CippButtonCard
            variant="outlined"
            title={
              <Stack direction="row" justifyContent={"space-between"}>
                <Box>Update Tokens</Box>
                <Stack direction="row" spacing={2}>
                  {appId.isLoading ? (
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
              <>
                <Button
                  variant="contained"
                  disabled={
                    appId.isLoading ||
                    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                      appId?.data?.applicationId
                    )
                  }
                  onClick={() => openPopup(appId?.data?.refreshUrl)}
                  color="primary"
                >
                  Refresh Graph Token
                </Button>
                <Button
                  onClick={() => appId.refetch()}
                  variant="contained"
                  color="primary"
                  startIcon={<Sync />}
                  disabled={appId.isFetching}
                >
                  Check Application ID
                </Button>
                {!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                  appId?.data?.applicationId
                ) && (
                  <Alert severity="warning">
                    The Application ID is not valid. Please return to the first page of the SAM
                    wizard and use the Manual .
                  </Alert>
                )}
              </>
            }
          >
            <Typography variant="body2" gutterBottom>
              Click the button below to refresh your token.
            </Typography>
            {formControl.setValue("noSubmitButton", true)}
            <CippApiResults apiObject={appId} errorsOnly />
          </CippButtonCard>
        )}

        {values.selectedOption === "Manual" && (
          <>
            {formControl.setValue("setKeys", true)}
            <Typography variant="body1">
              You may enter your secrets below. Leave fields blank to retain existing values.
            </Typography>
            <CippFormComponent
              formControl={formControl}
              type="textField"
              name="TenantID"
              label="Tenant ID"
              placeholder="Enter the Tenant ID. Leave blank to retain previous key."
              validators={{
                validate: (value) => {
                  const guidRegex =
                    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                  return value === "" || guidRegex.test(value) || "Invalid Tenant ID";
                },
              }}
            />
            <CippFormComponent
              formControl={formControl}
              type="textField"
              name="ApplicationID"
              label="Application ID"
              placeholder="Enter the Application ID. Leave blank to retain previous key."
              validators={{
                validate: (value) => {
                  const guidRegex =
                    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                  return value === "" || guidRegex.test(value) || "Invalid Application ID";
                },
              }}
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="ApplicationSecret"
              label="Application Secret"
              placeholder="Enter the application secret. Leave blank to retain previous key."
              validators={{
                validate: (value) => {
                  const secretRegex =
                    /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)[0-9a-zA-Z]{40}$/;
                  return (
                    value === "" ||
                    secretRegex.test(value) ||
                    "This should be the secret value, not the secret ID"
                  );
                },
              }}
            />
            <CippFormComponent
              formControl={formControl}
              type="password"
              name="RefreshToken"
              label="Refresh Token"
              placeholder="Enter the refresh token. Leave blank to retain previous key."
              validators={{
                validate: (value) => {
                  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
                  return value === "" || jwtRegex.test(value) || "Invalid Refresh Token";
                },
              }}
            />
          </>
        )}
      </Stack>
      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        noNextButton={values.selectedOption === "UpdateTokens"}
        formControl={formControl}
        noSubmitButton={true}
      />
    </Stack>
  );
};
