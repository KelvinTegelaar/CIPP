import Head from "next/head";
import { Box, Container, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "../../layouts/index.js";
import { CippPropertyListCard } from "../../components/CippCards/CippPropertyListCard";
import CippFormComponent from "../../components/CippComponents/CippFormComponent";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import countryList from "../../data/countryList.json";
import { CippSettingsSideBar } from "../../components/CippComponents/CippSettingsSideBar";
import CippDevOptions from "../../components/CippComponents/CippDevOptions";
import { CippOffboardingDefaultSettings } from "../../components/CippComponents/CippOffboardingDefaultSettings";
import { ApiGetCall } from "../../api/ApiCall";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
import { useEffect, useState } from "react";

const Page = () => {
  const settings = useSettings();
  const [initialUserType, setInitialUserType] = useState(null);

  // Default portal links configuration
  const defaultPortalLinks = {
    M365_Portal: true,
    Exchange_Portal: true,
    Entra_Portal: true,
    Teams_Portal: true,
    Azure_Portal: true,
    Intune_Portal: true,
    SharePoint_Admin: true,
    Security_Portal: true,
    Compliance_Portal: true,
    Power_Platform_Portal: true,
    Power_BI_Portal: true,
  };

  const auth = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const cleanedSettings = { ...settings };

  if (cleanedSettings.offboardingDefaults?.keepCopy) {
    delete cleanedSettings.offboardingDefaults.keepCopy;
    settings.handleUpdate(cleanedSettings);
  }

  // Determine if we have user-specific settings and set initial user type
  useEffect(() => {
    if (cleanedSettings && auth.data?.clientPrincipal?.userDetails && initialUserType === null) {
      const hasUserSpecificSettings =
        cleanedSettings.UserSpecificSettings &&
        Object.keys(cleanedSettings.UserSpecificSettings).length > 0;

      setInitialUserType(hasUserSpecificSettings ? "currentUser" : "allUsers");
    }
  }, [cleanedSettings, auth.data?.clientPrincipal?.userDetails, initialUserType]);

  // Set default portal links if they don't exist at global level
  if (!cleanedSettings.portalLinks) {
    cleanedSettings.portalLinks = defaultPortalLinks;
  }

  // Determine initial portal links based on user type
  const getInitialPortalLinks = () => {
    if (initialUserType === "currentUser" && cleanedSettings.UserSpecificSettings?.portalLinks) {
      // Merge with defaults to ensure all keys exist
      return { ...defaultPortalLinks, ...cleanedSettings.UserSpecificSettings.portalLinks };
    }

    // Use global settings or defaults
    return { ...defaultPortalLinks, ...cleanedSettings.portalLinks };
  };

  // Set up initial form values with proper user selector default
  const initialFormValues = {
    ...cleanedSettings,
    user:
      initialUserType === "currentUser"
        ? {
            label: "Current User",
            value: auth.data?.clientPrincipal?.userDetails || "currentUser",
          }
        : {
            label: "All Users",
            value: "allUsers",
          },
    portalLinks: getInitialPortalLinks(),
  };

  const formcontrol = useForm({
    mode: "onChange",
    defaultValues: initialFormValues,
  });

  // Watch the user selector to determine which settings to show
  const selectedUser = useWatch({
    control: formcontrol.control,
    name: "user",
  });

  // Update form when initial user type is determined
  useEffect(() => {
    if (initialUserType !== null && auth.data?.clientPrincipal?.userDetails) {
      const userValue =
        initialUserType === "currentUser"
          ? {
              label: "Current User",
              value: auth.data.clientPrincipal.userDetails,
            }
          : {
              label: "All Users",
              value: "allUsers",
            };

      const newFormValues = {
        ...cleanedSettings,
        user: userValue,
        portalLinks: getInitialPortalLinks(),
      };

      // Reset the entire form with new values
      formcontrol.reset(newFormValues);
    }
  }, [initialUserType, auth.data?.clientPrincipal?.userDetails]);

  // Handle switching between user types
  useEffect(() => {
    if (selectedUser?.value && initialUserType !== null) {
      const getPortalLinksForUserType = () => {
        if (selectedUser.value === "allUsers") {
          // Show global settings (root level)
          return { ...defaultPortalLinks, ...cleanedSettings.portalLinks };
        } else {
          // Show user-specific settings if they exist, otherwise show global settings
          const userSpecificLinks = cleanedSettings.UserSpecificSettings?.portalLinks;
          const globalLinks = cleanedSettings.portalLinks;
          return { ...defaultPortalLinks, ...globalLinks, ...userSpecificLinks };
        }
      };

      const newPortalLinks = getPortalLinksForUserType();
      const currentPortalLinks = formcontrol.getValues("portalLinks");

      // Only update if the portal links actually changed
      if (JSON.stringify(currentPortalLinks) !== JSON.stringify(newPortalLinks)) {
        // Reset form with updated portal links but preserve other values
        const currentValues = formcontrol.getValues();
        formcontrol.reset({
          ...currentValues,
          portalLinks: newPortalLinks,
        });
      }
    }
  }, [selectedUser?.value, cleanedSettings, initialUserType]);

  const addedAttributes = [
    { value: "consentProvidedForMinor", label: "consentProvidedForMinor" },
    { value: "employeeId", label: "employeeId" },
    { value: "employeeHireDate", label: "employeeHireDate" },
    { value: "employeeLeaveDateTime", label: "employeeLeaveDateTime" },
    { value: "employeeType", label: "employeeType" },
    { value: "faxNumber", label: "faxNumber" },
    { value: "legalAgeGroupClassification", label: "legalAgeGroupClassification" },
    { value: "officeLocation", label: "officeLocation" },
    { value: "otherMails", label: "otherMails" },
    { value: "showInAddressList", label: "showInAddressList" },
    { value: "sponsor", label: "sponsor" },
  ];

  const pageSizes = [
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "250", label: "250" },
  ];

  const languageListOptions = countryList.map((language) => {
    return { value: language.Code, label: language.Name };
  });

  // Portal links configuration
  const portalLinksConfig = [
    {
      name: "portalLinks.M365_Portal",
      label: "M365 Portal",
    },
    {
      name: "portalLinks.Exchange_Portal",
      label: "Exchange Portal",
    },
    {
      name: "portalLinks.Entra_Portal",
      label: "Entra Portal",
    },
    {
      name: "portalLinks.Teams_Portal",
      label: "Teams Portal",
    },
    {
      name: "portalLinks.Azure_Portal",
      label: "Azure Portal",
    },
    {
      name: "portalLinks.Intune_Portal",
      label: "Intune Portal",
    },
    {
      name: "portalLinks.SharePoint_Admin",
      label: "SharePoint Admin",
    },
    {
      name: "portalLinks.Security_Portal",
      label: "Security Portal",
    },
    {
      name: "portalLinks.Compliance_Portal",
      label: "Compliance Portal",
    },
    {
      name: "portalLinks.Power_Platform_Portal",
      label: "Power Platform Portal",
    },
    {
      name: "portalLinks.Power_BI_Portal",
      label: "Power BI Portal",
    },
  ];

  // Don't render until we've determined the initial user type
  if (initialUserType === null || !auth.data?.clientPrincipal?.userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Preferences</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl" sx={{ height: "100%" }}>
          <Stack spacing={4}>
            <div>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <Stack spacing={3}>
                    <CippPropertyListCard
                      showDivider={false}
                      title="General Settings"
                      propertyItems={[
                        {
                          label: "Default usage location for users",
                          value: (
                            <CippFormComponent
                              type="autoComplete"
                              creatable={false}
                              disableClearable={true}
                              name="usageLocation"
                              formControl={formcontrol}
                              multiple={false}
                              options={languageListOptions}
                              validators={{
                                required: { value: true, message: "This field is required" },
                              }}
                            />
                          ),
                        },
                        {
                          label: "Default Page Size",
                          value: (
                            <CippFormComponent
                              type="autoComplete"
                              disableClearable={true}
                              defaultValue={{ value: "25", label: "25" }}
                              name="tablePageSize"
                              formControl={formcontrol}
                              multiple={false}
                              options={pageSizes}
                              validators={{
                                required: { value: true, message: "This field is required" },
                              }}
                            />
                          ),
                        },
                        {
                          label: "Added Attributes when creating a new user",
                          value: (
                            <CippFormComponent
                              type="autoComplete"
                              options={addedAttributes}
                              name="userAttributes"
                              formControl={formcontrol}
                              multiple={true}
                            />
                          ),
                        },
                        {
                          label: "Save last used table filter",
                          value: (
                            <CippFormComponent
                              type="switch"
                              name="persistFilters"
                              formControl={formcontrol}
                            />
                          ),
                        },
                      ]}
                    />
                    <CippOffboardingDefaultSettings formControl={formcontrol} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Stack spacing={3}>
                    <CippPropertyListCard
                      title={`CIPP Roles for ${auth?.data?.clientPrincipal?.userDetails}`}
                      propertyItems={(auth?.data?.clientPrincipal?.userRoles ?? [])
                        .filter((role) => !["anonymous", "authenticated"].includes(role))
                        .map((role) => ({
                          label: "",
                          value: getCippFormatting(role, "role"),
                        }))}
                      showDivider={false}
                    />

                    <CippSettingsSideBar
                      formcontrol={formcontrol}
                      initialUserType={initialUserType}
                    />
                    <CippDevOptions />
                    <CippPropertyListCard
                      layout="two"
                      showDivider={false}
                      title="Portal Links Configuration"
                      propertyItems={portalLinksConfig.map((portal) => ({
                        label: portal.label,
                        value: (
                          <CippFormComponent
                            type="switch"
                            name={portal.name}
                            formControl={formcontrol}
                          />
                        ),
                      }))}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
