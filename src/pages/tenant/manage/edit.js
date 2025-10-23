import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import { useForm, useFormState } from "react-hook-form";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useEffect } from "react";
import { useRouter } from "next/router";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Stack, Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Grid } from "@mui/system";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { getCippFormatting } from "/src/utils/get-cipp-formatting";
import CippCustomVariables from "/src/components/CippComponents/CippCustomVariables";
import { CippOffboardingDefaultSettings } from "/src/components/CippComponents/CippOffboardingDefaultSettings";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import { useSettings } from "/src/hooks/use-settings";
import { Business, Save } from "@mui/icons-material";
import tabOptions from "./tabOptions.json";
import { CippHead } from "/src/components/CippComponents/CippHead";

const Page = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const settings = useSettings();
  const currentTenant = settings.currentTenant;

  const formControl = useForm({
    mode: "onChange",
  });

  const offboardingFormControl = useForm({
    mode: "onChange",
  });

  // API call for updating tenant properties
  const updateTenant = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [
      `TenantProperties_${currentTenant}`,
      "ListTenants-notAllTenants",
      "TenantSelector",
    ],
  });

  // API call for updating offboarding defaults
  const updateOffboardingDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`TenantProperties_${currentTenant}`, "CustomVariables*"],
  });

  const { isValid: isFormValid } = useFormState({ control: formControl.control });
  const { isValid: isOffboardingFormValid } = useFormState({
    control: offboardingFormControl.control,
  });

  const tenantDetails = ApiGetCall({
    url:
      currentTenant && currentTenant !== "AllTenants"
        ? `/api/ListTenantDetails?tenantFilter=${currentTenant}`
        : null,
    queryKey:
      currentTenant && currentTenant !== "AllTenants" ? `TenantProperties_${currentTenant}` : null,
  });

  useEffect(() => {
    if (tenantDetails.isSuccess && tenantDetails.data && currentTenant !== "AllTenants") {
      formControl.reset({
        customerId: currentTenant,
        Alias: tenantDetails?.data?.customProperties?.Alias ?? "",
        Groups:
          tenantDetails.data.Groups?.map((group) => ({
            label: group.Name,
            value: group.Id,
          })) || [],
      });

      // Set up offboarding defaults with default values
      const tenantOffboardingDefaults = tenantDetails.data?.customProperties?.OffboardingDefaults;
      const defaultOffboardingValues = {
        ConvertToShared: false,
        RemoveGroups: false,
        HideFromGAL: false,
        RemoveLicenses: false,
        removeCalendarInvites: false,
        RevokeSessions: false,
        removePermissions: false,
        RemoveRules: false,
        ResetPass: false,
        KeepCopy: false,
        DeleteUser: false,
        RemoveMobile: false,
        DisableSignIn: false,
        RemoveMFADevices: false,
        RemoveTeamsPhoneDID: false,
        ClearImmutableId: false,
      };

      let offboardingDefaults = {};

      if (tenantOffboardingDefaults) {
        try {
          const parsed = JSON.parse(tenantOffboardingDefaults);
          offboardingDefaults = {
            offboardingDefaults: { ...defaultOffboardingValues, ...parsed },
          };
        } catch {
          offboardingDefaults = { offboardingDefaults: defaultOffboardingValues };
        }
      } else {
        offboardingDefaults = { offboardingDefaults: defaultOffboardingValues };
      }

      offboardingFormControl.reset(offboardingDefaults);
    }
  }, [tenantDetails.isSuccess, tenantDetails.data, currentTenant]);

  const handleResetOffboardingDefaults = () => {
    const defaultOffboardingValues = {
      ConvertToShared: false,
      RemoveGroups: false,
      HideFromGAL: false,
      RemoveLicenses: false,
      removeCalendarInvites: false,
      RevokeSessions: false,
      removePermissions: false,
      RemoveRules: false,
      ResetPass: false,
      KeepCopy: false,
      DeleteUser: false,
      RemoveMobile: false,
      DisableSignIn: false,
      RemoveMFADevices: false,
      RemoveTeamsPhoneDID: false,
      ClearImmutableId: false,
    };

    offboardingFormControl.reset({ offboardingDefaults: defaultOffboardingValues });
  };

  const title = "Manage Tenant";

  // Show message for AllTenants
  if (currentTenant === "AllTenants") {
    return (
      <HeaderedTabbedLayout
        tabOptions={tabOptions}
        title={title}
        actions={[]}
        actionsData={{}}
        isFetching={false}
      >
        <CippHead title="Edit Tenant" />
        <Box sx={{ py: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Business sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Select a Specific Tenant
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tenant editing is not available when "All Tenants" is selected. Please select a
                  specific tenant to edit its configuration.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </HeaderedTabbedLayout>
    );
  }

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      actions={[]}
      actionsData={{}}
      isFetching={tenantDetails.isFetching}
    >
      <CippHead title="Edit Tenant" />
      <Box sx={{ p: 1 }}>
        <Grid container spacing={3}>
          {/* First Row - Tenant Details and Edit Form */}
          <Grid size={{ md: 4, xs: 12 }}>
            <CippPropertyListCard
              title="Tenant Details"
              propertyItems={[
                { label: "Display Name", value: tenantDetails.data?.displayName },
                {
                  label: "Tenant ID",
                  value: getCippFormatting(tenantDetails.data?.id, "Tenant"),
                },
              ]}
              showDivider={false}
              isFetching={tenantDetails.isFetching}
            />
          </Grid>

          <Grid size={{ md: 8, xs: 12 }}>
            <CippButtonCard
              title="Edit Tenant Properties"
              CardButton={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={formControl.handleSubmit((values) => {
                    const formattedValues = {
                      tenantAlias: values.Alias,
                      tenantGroups: values.Groups.map((group) => ({
                        groupId: group.value,
                        groupName: group.label,
                      })),
                      customerId: tenantDetails.data?.id,
                    };
                    updateTenant.mutate({
                      url: "/api/EditTenant",
                      data: formattedValues,
                    });
                  })}
                  disabled={updateTenant.isPending || !isFormValid || tenantDetails.isFetching}
                >
                  {updateTenant.isPending ? "Saving..." : "Save Changes"}
                </Button>
              }
              isFetching={tenantDetails.isFetching}
            >
              <Stack spacing={2}>
                <CippFormComponent
                  type="textField"
                  name="Alias"
                  label="Tenant Alias"
                  placeholder="Enter a custom alias for this tenant to be displayed in CIPP."
                  formControl={formControl}
                  isFetching={tenantDetails.isFetching}
                  disabled={tenantDetails.isFetching}
                />
                <CippFormComponent
                  creatable={false}
                  type="autoComplete"
                  name="Groups"
                  label="Tenant Groups"
                  placeholder="Select the groups this tenant belongs to."
                  formControl={formControl}
                  multiple
                  api={{
                    url: "/api/ListTenantGroups",
                    queryKey: "AllTenantGroups",
                    dataKey: "Results",
                    labelField: "Name",
                    valueField: "Id",
                  }}
                  disabled={tenantDetails.isFetching}
                />
                <CippApiResults apiObject={updateTenant} />
              </Stack>
            </CippButtonCard>
          </Grid>

          {/* Second Row - Offboarding Defaults and Custom Variables */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippButtonCard
              title="Tenant Offboarding Defaults"
              CardButton={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={offboardingFormControl.handleSubmit((values) => {
                    const offboardingSettings = values.offboardingDefaults || values;
                    const formattedValues = {
                      customerId: currentTenant,
                      offboardingDefaults: offboardingSettings,
                    };
                    updateOffboardingDefaults.mutate({
                      url: "/api/EditTenantOffboardingDefaults",
                      data: formattedValues,
                    });
                  })}
                  disabled={
                    updateOffboardingDefaults.isPending ||
                    !isOffboardingFormValid ||
                    tenantDetails.isFetching
                  }
                >
                  {updateOffboardingDefaults.isPending ? "Saving..." : "Save Changes"}
                </Button>
              }
              isFetching={tenantDetails.isFetching}
            >
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Configure default offboarding settings specifically for this tenant. These
                  settings will override user defaults when offboarding users in this tenant.
                </Typography>

                <CippOffboardingDefaultSettings
                  formControl={offboardingFormControl}
                  title="Tenant Offboarding Defaults"
                />

                <Box>
                  <Button
                    variant="outlined"
                    onClick={handleResetOffboardingDefaults}
                    sx={{ mr: 2 }}
                  >
                    Reset All to Off
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click "Reset All to Off" to turn off all options, then click "Save" to clear
                    tenant defaults.
                  </Typography>
                </Box>

                <CippApiResults apiObject={updateOffboardingDefaults} />
              </Stack>
            </CippButtonCard>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Custom Variables
                </Typography>
              </CardContent>
              <CippCustomVariables id={currentTenant} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
