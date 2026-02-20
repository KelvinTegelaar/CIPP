import { useEffect, useState } from "react";
import {
  Stack,
  Box,
  Typography,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from "@mui/material";
import { ApiPostCall, ApiGetCallWithPagination, ApiGetCall } from "../../api/ApiCall";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { useWatch } from "react-hook-form";
import { WizardSteps } from "./wizard-steps";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import CippDataTableButton from "../CippTable/CippDataTableButton";
import { PlayArrow, Replay } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CippPropertyList } from "../CippComponents/CippPropertyList";
import CippFormComponent from "../CippComponents/CippFormComponent";

export const CippGDAPTenantOnboarding = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props;
  const [currentOnboarding, setCurrentOnboarding] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [pollOnboarding, setPollOnboarding] = useState(false);
  const [currentRelationship, setCurrentRelationship] = useState(null);
  const [currentInvite, setCurrentInvite] = useState(null);

  formControl.register("GDAPOnboardingComplete", {
    required: false,
  });

  const relationshipId = useWatch({
    control: formControl.control,
    name: "GDAPRelationshipId",
  });

  const currentInvites = ApiGetCallWithPagination({
    url: "/api/ListGDAPInvite",
    queryKey: "ListGDAPInvite-wizard",
  });

  const relationshipList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      TenantFilter: "",
      Endpoint: "tenantRelationships/delegatedAdminRelationships",
    },
    queryKey: "GDAPRelationshipOnboarding-wizard",
  });

  const onboardingList = ApiGetCallWithPagination({
    url: "/api/ListTenantOnboarding",
    queryKey: "ListTenantOnboarding-wizard",
  });

  const startOnboarding = ApiPostCall({
    urlFromData: true,
    onResult: (data) => {
      setCurrentOnboarding(data);
      var stepCount = 0;
      data.OnboardingSteps.map((step) => {
        if (step.Status !== "pending" && step.Status !== "running" && step.Status !== "failed") {
          stepCount++;
        }
      });
      setActiveStep(stepCount);

      if (data?.Status === "succeeded" || data?.Status === "failed") {
        var runningSteps = data.OnboardingSteps?.find((step) => step.Status === "running");
        if (!runningSteps) {
          setPollOnboarding(false);
          if (data?.Status === "succeeded") {
            formControl.setValue("GDAPOnboardingComplete", true);
            formControl.trigger("GDAPOnboardingComplete");
          }
        }
      }
    },
  });

  // Load relationship and invite data
  useEffect(() => {
    if (
      relationshipList.isSuccess &&
      currentInvites.isSuccess &&
      onboardingList.isSuccess &&
      relationshipId
    ) {
      const relationship = relationshipList?.data?.Results?.find(
        (rel) => rel?.id === relationshipId,
      );

      if (relationship) {
        const relationshipData = {
          label:
            (relationship?.customer?.displayName ?? "Pending Invite") +
            " - (" +
            relationship?.id +
            ")",
          value: relationship?.id,
          addedFields: {
            customer: relationship?.customer,
            id: relationship?.id,
            createdDateTime: relationship?.createdDateTime,
            accessDetails: relationship?.accessDetails,
            status: relationship?.status,
            autoExtendDuration: relationship?.autoExtendDuration,
            lastModifiedDateTime: relationship?.lastModifiedDateTime,
          },
        };
        setCurrentRelationship(relationshipData);
      }

      const invite =
        currentInvites?.data?.pages?.[0] && Array.isArray(currentInvites.data.pages[0])
          ? currentInvites.data.pages[0].find((invite) => invite?.RowKey === relationshipId)
          : null;
      setCurrentInvite(invite ?? null);

      const onboarding =
        onboardingList.data?.pages?.[0] && Array.isArray(onboardingList.data.pages[0])
          ? onboardingList.data.pages[0].find((onboarding) => onboarding?.RowKey === relationshipId)
          : null;

      if (onboarding) {
        setCurrentOnboarding(onboarding);
        var stepCount = 0;
        onboarding?.OnboardingSteps?.map((step) => {
          if (
            step?.Status !== "pending" &&
            step?.Status !== "running" &&
            step?.Status !== "failed"
          ) {
            stepCount++;
          }
        });
        setActiveStep(stepCount);
      }
    }
  }, [
    relationshipList.isSuccess,
    currentInvites.isSuccess,
    onboardingList.isSuccess,
    relationshipId,
  ]);

  // Poll onboarding status
  useEffect(() => {
    if (pollOnboarding && startOnboarding.isSuccess) {
      const interval = setInterval(() => {
        startOnboarding.mutate({
          url: "/api/ExecOnboardTenant",
          data: {
            id: relationshipId,
          },
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [pollOnboarding, startOnboarding.isSuccess, relationshipId]);

  const handleStartOnboarding = () => {
    var data = {
      id: relationshipId,
    };

    if (formControl.getValues("ignoreMissingRoles")) {
      data.ignoreMissingRoles = Boolean(formControl.getValues("ignoreMissingRoles"));
    }

    if (formControl.getValues("standardsExcludeAllTenants")) {
      data.standardsExcludeAllTenants = Boolean(
        formControl.getValues("standardsExcludeAllTenants"),
      );
    }

    startOnboarding.mutate({
      url: "/api/ExecOnboardTenant",
      data: data,
    });
    setPollOnboarding(true);
  };

  const handleRetryOnboarding = () => {
    var data = {
      id: relationshipId,
      retry: true,
    };

    if (formControl.getValues("ignoreMissingRoles")) {
      data.IgnoreMissingRoles = Boolean(formControl.getValues("ignoreMissingRoles"));
    }

    if (formControl.getValues("standardsExcludeAllTenants")) {
      data.standardsExcludeAllTenants = Boolean(
        formControl.getValues("standardsExcludeAllTenants"),
      );
    }

    startOnboarding.mutate({
      url: "/api/ExecOnboardTenant",
      data: data,
    });
    setPollOnboarding(true);
  };

  const isLoading =
    relationshipList.isLoading || currentInvites.isLoading || onboardingList.isLoading;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>
          GDAP Tenant Onboarding
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Now that the invite has been accepted, you can start the onboarding process. This will map
          the GDAP roles to security groups and validate access.
        </Typography>
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2">
            The onboarding process can take up to 5 minutes to complete.
          </Typography>
        </Alert>
      </Box>

      {isLoading && (
        <Box>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={100} />
          </Stack>
        </Box>
      )}

      {!isLoading && !relationshipId && (
        <Alert severity="error">
          No relationship ID found. Please go back and complete the previous step.
        </Alert>
      )}

      {!isLoading && relationshipId && currentRelationship && (
        <Accordion variant="outlined" defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Relationship Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CippPropertyList
              layout="double"
              showDivider={false}
              propertyItems={[
                {
                  label: "Customer",
                  value:
                    currentRelationship?.addedFields?.customer?.displayName ?? "Pending Invite",
                },
                {
                  label: "Status",
                  value: getCippFormatting(
                    currentRelationship?.addedFields?.status,
                    "status",
                    "text",
                  ),
                },
                {
                  label: "Relationship ID",
                  value: currentRelationship?.value,
                },
              ]}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {!isLoading && (
        <>
          <Box>
            <CippFormComponent
              formControl={formControl}
              name="standardsExcludeAllTenants"
              label="Exclude onboarded tenant from All Tenant standards"
              type="switch"
              value={false}
            />
          </Box>

          {!currentOnboarding && relationshipId && (
            <Box>
              <Button
                variant="contained"
                onClick={handleStartOnboarding}
                startIcon={<PlayArrow />}
                disabled={startOnboarding.isLoading}
              >
                Start Onboarding
              </Button>
            </Box>
          )}

          {currentOnboarding && (
            <Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">
                    Onboarding Status: {getCippTranslation(currentOnboarding?.Status)}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Updated {getCippFormatting(currentOnboarding?.Timestamp, "Timestamp", "date")}
                  </Typography>
                </Box>
                {currentOnboarding?.Logs && currentOnboarding.Logs.length > 0 && (
                  <Box>
                    <CippDataTableButton data={currentOnboarding?.Logs} title="Logs:" />
                  </Box>
                )}
                <WizardSteps
                  activeStep={activeStep}
                  orientation="vertical"
                  steps={
                    currentOnboarding?.OnboardingSteps?.map((step) => ({
                      title: step.Title,
                      description: step.Message,
                      error: step.Status === "failed",
                      loading: step.Status === "running",
                    })) ?? []
                  }
                />
                {(currentOnboarding?.Status === "failed" ||
                  currentOnboarding?.Status === "succeeded") && (
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={handleRetryOnboarding}
                      startIcon={<Replay />}
                      disabled={currentOnboarding?.Status === "running"}
                      sx={{ mr: 2 }}
                    >
                      Retry
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </>
      )}

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        noSubmitButton={true}
        nextButtonDisabled={currentOnboarding?.Status !== "succeeded"}
      />
    </Stack>
  );
};

export default CippGDAPTenantOnboarding;
