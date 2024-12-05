import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import GDAPRoles from "/src/data/GDAPRoles";
import { Box, Stack } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import { ApiGetCall, ApiGetCallWithPagination, ApiPostCall } from "/src/api/ApiCall";
import { useEffect, useState } from "react";
import { getCippFormatting } from "/src/utils/get-cipp-formatting";
import { router } from "next/router";
import cippDefaults from "/src/data/CIPPDefaultGDAPRoles";
import { WizardSteps } from "/src/components/CippWizard/wizard-steps";
import { ExpandMore, PlayArrow, Replay } from "@mui/icons-material";
import CippPageCard from "/src/components/CippCards/CippPageCard";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import CippDataTableButton from "../../../../components/CippTable/CippDataTableButton";

const Page = () => {
  const [currentRelationship, setCurrentRelationship] = useState(null);
  const [currentInvite, setCurrentInvite] = useState(null);
  const [rolesMissingFromMapping, setRolesMissingFromMapping] = useState([]);
  const [rolesMissingFromRelationship, setRolesMissingFromRelationship] = useState([]);
  const [missingDefaults, setMissingDefaults] = useState(false);
  const [currentOnboarding, setCurrentOnboarding] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [pollOnboarding, setPollOnboarding] = useState(false);

  const queryId = router.query.id;
  const formControl = useForm({
    mode: "onChange",
  });

  const currentInvites = ApiGetCallWithPagination({
    url: "/api/ListGDAPInvite",
    queryKey: "ListGDAPInvite",
  });

  const relationshipList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      TenantFilter: "",
      Endpoint: "tenantRelationships/delegatedAdminRelationships",
      $filter:
        "(status eq 'active' or status eq 'approvalPending') and not startsWith(displayName,'MLT_')",
    },
    queryKey: "GDAPRelationships",
  });

  const onboardingList = ApiGetCallWithPagination({
    url: "/api/ListTenantOnboarding",
    queryKey: "ListTenantOnboarding",
  });

  const startOnboarding = ApiPostCall({
    urlFromData: true,
    onResult: (data) => {
      setCurrentOnboarding(data);
      var currentStep = {};
      var stepCount = 0;
      data.OnboardingSteps.map((step) => {
        if (step.Status !== "pending") {
          currentStep = step;
          stepCount++;
        }
      });
      setActiveStep(stepCount);
    },
  });

  const selectedRelationship = useWatch({
    control: formControl.control,
    name: "id",
  });

  const selectedRole = useWatch({
    control: formControl.control,
    name: "gdapRoles",
  });

  useEffect(() => {
    if (
      relationshipList.isSuccess &&
      currentInvites.isSuccess &&
      onboardingList.isSuccess &&
      selectedRelationship !== currentRelationship
    ) {
      var formValue = selectedRelationship;
      if (!selectedRelationship?.value) {
        var relationship = relationshipList.data?.Results?.find(
          (relationship) => relationship.id === selectedRelationship
        );
        if (relationship) {
          formValue = {
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
          formControl.setValue("id", formValue);
        }
      }
      const invite = currentInvites?.data?.pages?.[0]?.find(
        (invite) => invite.RowKey === formValue?.value
      );

      const onboarding = onboardingList.data?.pages?.[0]?.find(
        (onboarding) => onboarding.RowKey === formValue?.value
      );
      if (onboarding) {
        setCurrentOnboarding(onboarding);
        var currentStep = {};
        var stepCount = 0;
        onboarding.OnboardingSteps.map((step) => {
          if (step.Status !== "pending") {
            currentStep = step;
            stepCount++;
          }
        });
        setActiveStep(stepCount);
      } else {
        setCurrentOnboarding(null);
        setActiveStep(0);
      }
      setCurrentRelationship(formValue);
      setCurrentInvite(invite ?? null);
    }
  }, [
    relationshipList.isSuccess,
    currentInvites.isSuccess,
    onboardingList.isSuccess,
    selectedRelationship,
  ]);

  useEffect(() => {
    if (currentRelationship?.value) {
      console.log("useEffect");
      var currentRoles = [];
      if (currentInvite?.RoleMappings) {
        currentRoles = currentInvite?.RoleMappings;
      } else {
        currentRoles = selectedRole?.value;
      }
      var relationshipRoles = currentRelationship.addedFields.accessDetails.unifiedRoles;
      var missingRoles = [];
      var missingRolesRelationship = [];

      currentRoles?.forEach((role) => {
        if (
          !relationshipRoles.find(
            (relationshipRole) => relationshipRole.roleDefinitionId === role.roleDefinitionId
          )
        ) {
          missingRoles.push(role);
        }
      });

      relationshipRoles?.forEach((role) => {
        if (
          !currentRoles?.find(
            (currentRole) => currentRole.roleDefinitionId === role.roleDefinitionId
          )
        ) {
          // lookup role from GDAPRoles
          var role = GDAPRoles.find((gdapRole) => gdapRole.ObjectId === role.roleDefinitionId);
          missingRolesRelationship.push(role);
        }
      });

      var missingDefaults = [];
      relationshipRoles.forEach((role) => {
        if (!cippDefaults.find((defaultRole) => defaultRole.value === role.roleDefinitionId)) {
          missingDefaults.push(role);
        }
      });
      setMissingDefaults(missingDefaults.length > 0);
      setRolesMissingFromMapping(missingRoles);
      setRolesMissingFromRelationship(missingRolesRelationship);
    }
  }, [selectedRole, currentInvite, currentRelationship]);

  useEffect(() => {
    // poll onboarding status
    if (
      pollOnboarding &&
      startOnboarding.isSuccess &&
      startOnboarding?.data?.data?.Status !== "succeeded" &&
      startOnboarding?.data?.data?.Status !== "failed"
    ) {
      console.log(startOnboarding?.data?.data?.Status);
      const interval = setInterval(() => {
        startOnboarding.mutate({
          url: "/api/ExecOnboardTenant",
          data: {
            id: currentRelationship?.value,
          },
        });
      }, 5000);
      return () => clearInterval(interval);
    }
    if (
      startOnboarding?.data?.data?.Status === "succeeded" ||
      startOnboarding?.data?.data?.Status === "failed"
    ) {
      setPollOnboarding(false);
    }
  }, [pollOnboarding, startOnboarding.isSuccess, startOnboarding?.data?.data]);

  const handleSubmit = () => {
    var data = {
      id: currentRelationship?.value,
    };
    if (!currentInvite) {
      data.autoMapRoles = true;
      data.gdapRoles = selectedRole?.value;
    }
    if (formControl.getValues("ignoreMissingRoles")) {
      data.IgnoreMissingRoles = formControl.getValues("ignoreMissingRoles");
    }

    startOnboarding.mutate({
      url: "/api/ExecOnboardTenant",
      data: data,
    });
    setPollOnboarding(true);
  };

  const handleRetry = () => {
    var data = {
      id: currentRelationship?.value,
      retry: true,
    };
    if (!currentInvite) {
      data.autoMapRoles = true;
      data.gdapRoles = selectedRole?.value;
    }
    if (formControl.getValues("ignoreMissingRoles")) {
      data.IgnoreMissingRoles = formControl.getValues("ignoreMissingRoles");
    }

    startOnboarding.mutate({
      url: "/api/ExecOnboardTenant",
      data: data,
    });
    setPollOnboarding(true);
  };

  return (
    <>
      <CippPageCard
        formControl={formControl}
        title="Start Tenant Onboarding"
        backButtonTitle="Tenant Onboarding"
        postUrl="/api/ExecOnboardTenant"
      >
        <CardContent>
          <Grid container spacing={4}>
            <Grid size={{ sm: 12, md: 6 }}>
              <Stack spacing={2}>
                <CippFormComponent
                  formControl={formControl}
                  name="id"
                  label="Select GDAP Relationship"
                  type="autoComplete"
                  api={{
                    url: "/api/ListGraphRequest",
                    data: {
                      TenantFilter: "",
                      Endpoint: "tenantRelationships/delegatedAdminRelationships",
                      $filter:
                        "(status eq 'active' or status eq 'approvalPending') and not startsWith(displayName,'MLT_')",
                    },
                    queryKey: "GDAPRelationships",
                    dataKey: "Results",
                    labelField: (option) =>
                      (option?.customer?.displayName ?? "Pending Invite") +
                      " - (" +
                      option?.id +
                      ")",
                    valueField: "id",
                    addedField: {
                      customer: "customer",
                      id: "id",
                      createdDateTime: "createdDateTime",
                      accessDetails: "accessDetails",
                      status: "status",
                      autoExtendDuration: "autoExtendDuration",
                      lastModifiedDateTime: "lastModifiedDateTime",
                    },
                  }}
                  multiple={false}
                  creatable={false}
                  required={true}
                />
                {currentRelationship?.value && !currentInvite && (
                  <>
                    <CippFormComponent
                      formControl={formControl}
                      name="remapRoles"
                      value={true}
                      type="hidden"
                    />
                    <CippFormComponent
                      formControl={formControl}
                      name="gdapRoles"
                      label="Assign a GDAP Role Template"
                      type="autoComplete"
                      api={{
                        url: "/api/ExecGDAPRoleTemplate",
                        queryKey: "GDAPTemplates",
                        dataKey: "Results",
                        labelField: (option) => option.TemplateId,
                        valueField: "RoleMappings",
                      }}
                      required={true}
                      multiple={false}
                    />
                  </>
                )}
                {missingDefaults && (
                  <>
                    <Alert severity="warning">
                      The selected relationship does not contain all the default roles. CIPP may not
                      function correctly if this is the only relationship with the tenant.
                      Onboarding will fail unless you ignore the missing default roles.
                    </Alert>
                    <CippFormComponent
                      formControl={formControl}
                      name="ignoreMissingRoles"
                      label="Ignore Missing Default Roles"
                      type="switch"
                      value={false}
                    />
                  </>
                )}
                {currentRelationship?.value && (
                  <>
                    {currentRelationship?.addedFields?.accessDetails?.unifiedRoles.some(
                      (role) => role.roleDefinitionId === "62e90394-69f5-4237-9190-012177145e10"
                    ) && (
                      <Alert severity="warning">
                        The Company Administrator role is a highly privileged role that should be
                        used with caution. GDAP Relationships with this role will not be eligible
                        for auto-extend.
                      </Alert>
                    )}
                    {(currentInvite || selectedRole) && rolesMissingFromMapping.length > 0 && (
                      <Alert severity="warning">
                        The following roles are not available in the selected relationship and will
                        not be mapped:{" "}
                        {rolesMissingFromMapping.map((role) => role.RoleName).join(", ")}
                      </Alert>
                    )}
                    {(currentInvite || selectedRole) && rolesMissingFromRelationship.length > 0 && (
                      <Alert severity="warning">
                        The following roles are not mapped with the current template:{" "}
                        {rolesMissingFromRelationship.map((role) => role.Name).join(", ")}
                      </Alert>
                    )}
                    {(currentInvite || selectedRole) &&
                      rolesMissingFromMapping.length === 0 &&
                      rolesMissingFromRelationship.length === 0 && (
                        <Alert severity="success">All roles are mapped correctly</Alert>
                      )}
                    <Accordion variant="outlined" defaultExpanded={true}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">Current Relationship Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <CippPropertyList
                          layout="double"
                          showDivider={false}
                          propertyItems={[
                            {
                              label: "Customer",
                              value:
                                currentRelationship?.addedFields?.customer?.displayName ??
                                "Pending Invite",
                            },
                            {
                              label: "Status",
                              value: getCippFormatting(
                                currentRelationship?.addedFields?.status,
                                "status",
                                "text"
                              ),
                            },
                            {
                              label: "Auto Extend Duration",
                              value:
                                currentRelationship?.addedFields?.autoExtendDuration == "PT0S"
                                  ? "Not eligible for auto-extend"
                                  : getCippFormatting(
                                      currentRelationship?.addedFields?.autoExtendDuration,
                                      "autoExtendDuration",
                                      "text"
                                    ),
                            },
                            {
                              label: "Pending Invite",
                              value: currentInvite?.RowKey ? "Yes" : "No",
                            },
                            {
                              label: "Created Date",
                              value: getCippFormatting(
                                currentRelationship?.addedFields?.createdDateTime,
                                "createdDateTime",
                                "date"
                              ),
                            },
                            {
                              label: "Last Modified Date",
                              value: getCippFormatting(
                                currentRelationship?.addedFields?.lastModifiedDateTime,
                                "lastModifiedDateTime",
                                "date"
                              ),
                            },
                            {
                              label: "Invite URL",
                              value: getCippFormatting(
                                "https://admin.microsoft.com/AdminPortal/Home#/partners/invitation/granularAdminRelationships/" +
                                  currentRelationship.value,
                                "InviteUrl",
                                "url"
                              ),
                            },
                            {
                              label: "Access Details",
                              value: getCippFormatting(
                                currentInvite
                                  ? currentInvite.RoleMappings
                                  : currentRelationship?.addedFields?.accessDetails.unifiedRoles,
                                "unifiedRoles",
                                "object"
                              ),
                            },
                          ]}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}
              </Stack>
            </Grid>
            {currentOnboarding && (
              <Grid size={{ sm: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h4">
                      Onboarding Status: {getCippTranslation(currentOnboarding.Status)}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      Updated {getCippFormatting(currentOnboarding.Timestamp, "Timestamp", "date")}
                    </Typography>
                  </Box>
                  <Box>
                    <CippDataTableButton data={currentOnboarding?.Logs} title="Logs:" />
                  </Box>
                  <WizardSteps
                    activeStep={activeStep}
                    orientation="vertical"
                    steps={
                      currentOnboarding?.OnboardingSteps.map((step) => ({
                        title: step.Title,
                        description: step.Message,
                      })) ?? []
                    }
                  />
                </Stack>
              </Grid>
            )}
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Stack spacing={1} direction="row">
            {currentOnboarding && (
              <Button variant="outlined" onClick={() => handleRetry()} startIcon={<Replay />}>
                Retry
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              startIcon={<PlayArrow />}
              disabled={
                currentOnboarding?.Status === "succeeded" ||
                currentOnboarding?.Status === "failed" ||
                currentOnboarding?.Status === "queued" ||
                currentOnboarding?.Status === "running"
              }
            >
              Start
            </Button>
          </Stack>
        </CardActions>
      </CippPageCard>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
