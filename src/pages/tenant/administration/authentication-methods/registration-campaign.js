import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import tabOptions from "./tabOptions.json";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings.js";

const stateOptions = [
  { label: "Microsoft managed", value: "default" },
  { label: "Enabled", value: "enabled" },
  { label: "Disabled", value: "disabled" },
];

const methodOptions = [
  { label: "Microsoft Authenticator", value: "microsoftAuthenticator" },
  { label: "Passkey (FIDO2)", value: "fido2" },
];

// Map campaign targets of one type to autocomplete options (all_users is handled by its own switch)
const targetsToOptions = (targets, targetType) =>
  (Array.isArray(targets) ? targets : [])
    .filter((target) => target?.targetType === targetType && target?.id !== "all_users")
    .map((target) => ({ label: target.id, value: target.id }));

const toIdArray = (value) =>
  Array.isArray(value) ? value.map((item) => item.value).filter(Boolean) : [];

const Page = () => {
  const tenant = useSettings().currentTenant;
  const queryKey = `RegistrationCampaign-${tenant}`;

  const formControl = useForm({
    mode: "onChange",
  });

  const campaignRequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "authenticationMethodsPolicy",
      tenantFilter: tenant,
    },
    queryKey: queryKey,
  });

  const campaign =
    campaignRequest.data?.Results?.[0]?.registrationEnforcement
      ?.authenticationMethodsRegistrationCampaign;

  useEffect(() => {
    if (campaignRequest.isSuccess && campaign) {
      formControl.reset({
        state: stateOptions.find((option) => option.value === campaign.state) ?? stateOptions[0],
        targetedAuthenticationMethod:
          methodOptions.find(
            (option) => option.value === campaign.includeTargets?.[0]?.targetedAuthenticationMethod,
          ) ?? methodOptions[0],
        snoozeDurationInDays: campaign.snoozeDurationInDays,
        enforceRegistrationAfterAllowedSnoozes: !!campaign.enforceRegistrationAfterAllowedSnoozes,
        includeAllUsers: (Array.isArray(campaign.includeTargets)
          ? campaign.includeTargets
          : []
        ).some((target) => target?.id === "all_users"),
        includeGroups: targetsToOptions(campaign.includeTargets, "group"),
        includeUsers: targetsToOptions(campaign.includeTargets, "user"),
        excludeGroups: targetsToOptions(campaign.excludeTargets, "group"),
        excludeUsers: targetsToOptions(campaign.excludeTargets, "user"),
      });
    }
  }, [campaignRequest.isSuccess, campaign]);

  const groupFieldApi = {
    url: "/api/ListGraphRequest",
    dataKey: "Results",
    queryKey: `RegistrationCampaignGroups-${tenant}`,
    labelField: (group) => (group.id ? `${group.displayName} (${group.id})` : group.displayName),
    valueField: "id",
    data: {
      Endpoint: "groups",
      manualPagination: true,
      $select: "id,displayName",
      $orderby: "displayName",
      $top: 999,
      $count: true,
    },
  };

  const userFieldApi = {
    url: "/api/ListGraphRequest",
    dataKey: "Results",
    queryKey: `RegistrationCampaignUsers-${tenant}`,
    labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
    valueField: "id",
    data: {
      Endpoint: "users",
      manualPagination: true,
      $select: "id,displayName,userPrincipalName",
      $orderby: "displayName",
      $top: 999,
      $count: true,
    },
  };

  return (
    <CippFormPage
      title="Registration Campaign"
      hidePageType={true}
      hideBackButton={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecRegistrationCampaign"
      queryKey={queryKey}
      customDataformatter={(values) => ({
        tenantFilter: tenant,
        state: values?.state?.value ?? values?.state,
        targetedAuthenticationMethod:
          values?.targetedAuthenticationMethod?.value ?? values?.targetedAuthenticationMethod,
        snoozeDurationInDays:
          values?.snoozeDurationInDays === "" || values?.snoozeDurationInDays === undefined
            ? undefined
            : Number(values?.snoozeDurationInDays),
        enforceRegistrationAfterAllowedSnoozes: !!values?.enforceRegistrationAfterAllowedSnoozes,
        includeAllUsers: !!values?.includeAllUsers,
        includeGroups: toIdArray(values?.includeGroups),
        includeUsers: toIdArray(values?.includeUsers),
        excludeGroups: toIdArray(values?.excludeGroups),
        excludeUsers: toIdArray(values?.excludeUsers),
      })}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Nudge users to set up Microsoft Authenticator or a passkey during sign-in. Users are
            prompted after completing MFA and can snooze the prompt for the configured number of
            days.
          </Typography>
        </Grid>
        {campaignRequest.isError && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">
              Failed to load the current registration campaign settings for this tenant.
            </Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="select"
            name="state"
            label="Campaign state"
            creatable={false}
            options={stateOptions}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="select"
            name="targetedAuthenticationMethod"
            label="Authentication method to nudge users to register"
            creatable={false}
            options={methodOptions}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="number"
            name="snoozeDurationInDays"
            label="Days allowed to snooze (0-14)"
            validators={{
              min: { value: 0, message: "Minimum value is 0" },
              max: { value: 14, message: "Maximum value is 14" },
            }}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="switch"
            name="enforceRegistrationAfterAllowedSnoozes"
            label="Limited number of snoozes (require registration after 3 snoozes)"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="switch"
            name="includeAllUsers"
            label="Include all users"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name="includeGroups"
            label="Include group(s)"
            multiple={true}
            creatable={false}
            api={groupFieldApi}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name="includeUsers"
            label="Include user(s)"
            multiple={true}
            creatable={false}
            api={userFieldApi}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name="excludeGroups"
            label="Exclude group(s)"
            multiple={true}
            creatable={false}
            api={groupFieldApi}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name="excludeUsers"
            label="Exclude user(s)"
            multiple={true}
            creatable={false}
            api={userFieldApi}
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
