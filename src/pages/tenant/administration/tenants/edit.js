import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Stack, Box, Tab, Tabs, Typography, Button } from "@mui/material";
import { Grid } from "@mui/system";
import { CippCardTabPanel } from "/src/components/CippComponents/CippCardTabPanel";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import CippPageCard from "../../../../components/CippCards/CippPageCard";
import { CippPropertyListCard } from "/src/components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import CippCustomVariables from "/src/components/CippComponents/CippCustomVariables";
import { CippOffboardingDefaultSettings } from "/src/components/CippComponents/CippOffboardingDefaultSettings";

function tabProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const formControl = useForm({
    mode: "onChange",
  });

  const offboardingFormControl = useForm({
    mode: "onChange",
  });
  const [value, setValue] = useState(0);

  const tenantDetails = ApiGetCall({
    url: id ? `/api/ListTenantDetails?tenantFilter=${id}` : null,
    queryKey: id ? `TenantProperties_${id}` : null,
  });

  useEffect(() => {
    if (tenantDetails.isSuccess && tenantDetails.data) {
      formControl.reset({
        customerId: id,
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
        ClearImmutableId: false,
      };
      
      let offboardingDefaults = {};
      
      if (tenantOffboardingDefaults) {
        try {
          const parsed = JSON.parse(tenantOffboardingDefaults);
          // Merge defaults with parsed values to ensure all fields are defined
          offboardingDefaults = { 
            offboardingDefaults: { ...defaultOffboardingValues, ...parsed } 
          };
        } catch {
          offboardingDefaults = { offboardingDefaults: defaultOffboardingValues };
        }
      } else {
        offboardingDefaults = { offboardingDefaults: defaultOffboardingValues };
      }
      
      offboardingFormControl.reset(offboardingDefaults);
    }
  }, [tenantDetails.isSuccess, tenantDetails.data, id]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

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
      ClearImmutableId: false,
    };
    
    offboardingFormControl.reset({ offboardingDefaults: defaultOffboardingValues });
  };

  return (
    <CippPageCard
      title={
        tenantDetails.isSuccess
          ? `Edit Tenant - ${
              tenantDetails?.data?.customProperties?.Alias ?? tenantDetails?.data?.displayName
            }`
          : "Loading..."
      }
      backButtonTitle="Tenants"
      noTenantInHead={true}
    >
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: "24px", m: "auto" }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="Edit Tenant Tabs">
            <Tab label="General" {...tabProps(0)} />
            <Tab label="Custom Variables" {...tabProps(1)} />
            <Tab label="Offboarding Defaults" {...tabProps(2)} />
          </Tabs>
        </Box>
        <CippCardTabPanel value={value} index={0}>
          <Grid container spacing={2} sx={{ my: 2, px: 2 }}>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippPropertyListCard
                variant="outlined"
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
              <CippFormSection
                relatedQueryKeys={[
                  `TenantProperties_${id}`,
                  "ListTenants-notAllTenants",
                  "TenantSelector",
                ]}
                formControl={formControl}
                title="Edit Tenant"
                backButtonTitle="Tenants"
                postUrl="/api/EditTenant"
                customDataformatter={(values) => {
                  const formattedValues = {
                    tenantAlias: values.Alias,
                    tenantGroups: values.Groups.map((group) => ({
                      groupId: group.value,
                      groupName: group.label,
                    })),
                    customerId: id,
                  };
                  return formattedValues;
                }}
              >
                <Typography variant="h6">Properties</Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
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
                </Stack>
              </CippFormSection>
            </Grid>
          </Grid>
        </CippCardTabPanel>
        <CippCardTabPanel value={value} index={1}>
          <CippCustomVariables id={id} />
        </CippCardTabPanel>
        <CippCardTabPanel value={value} index={2}>
          <Grid container spacing={2} sx={{ my: 2, px: 2 }}>
            <Grid size={{ xs: 12 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Tenant-Specific Offboarding Defaults</Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure default offboarding settings specifically for this tenant. These settings will override user defaults when offboarding users in this tenant.
                </Typography>
                
                <CippFormSection
                  relatedQueryKeys={[`TenantProperties_${id}`]}
                  formControl={offboardingFormControl}
                  title="Tenant Offboarding Defaults"
                  postUrl="/api/EditTenantOffboardingDefaults"
                  customDataformatter={(values) => {
                    const offboardingSettings = values.offboardingDefaults || values;
                    return {
                      customerId: id,
                      offboardingDefaults: offboardingSettings,
                    };
                  }}
                  hideTitle={true}
                >
                  <CippOffboardingDefaultSettings 
                    formControl={offboardingFormControl}
                    title="Tenant Offboarding Defaults"
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleResetOffboardingDefaults}
                      sx={{ mr: 2 }}
                    >
                      Reset All to Off
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Reset All to Off" to turn off all options, then click "Save" to clear tenant defaults.
                    </Typography>
                  </Box>
                </CippFormSection>
              </Stack>
            </Grid>
          </Grid>
        </CippCardTabPanel>
      </Box>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
