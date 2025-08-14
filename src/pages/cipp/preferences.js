import Head from "next/head";
import { Box, Container, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippPropertyListCard } from "../../components/CippCards/CippPropertyListCard";
import CippFormComponent from "../../components/CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";
import countryList from "../../data/countryList.json";
import { CippSettingsSideBar } from "../../components/CippComponents/CippSettingsSideBar";
import CippDevOptions from "/src/components/CippComponents/CippDevOptions";
import { CippOffboardingDefaultSettings } from "../../components/CippComponents/CippOffboardingDefaultSettings";
import { ApiGetCall } from "../../api/ApiCall";
import { getCippFormatting } from "../../utils/get-cipp-formatting";

const Page = () => {
  const settings = useSettings();
  const cleanedSettings = { ...settings };

  if (cleanedSettings.offboardingDefaults?.keepCopy) {
    delete cleanedSettings.offboardingDefaults.keepCopy;
    settings.handleUpdate(cleanedSettings);
  }

  const formcontrol = useForm({ mode: "onChange", defaultValues: cleanedSettings });

  const auth = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

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
                          label: "Default new user usage location",
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

                    <CippSettingsSideBar formcontrol={formcontrol} />
                    <CippDevOptions />
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
