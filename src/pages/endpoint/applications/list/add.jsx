import React, { useEffect } from "react";
import { Grid, Divider, Button } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import languageList from "/src/data/languageList.json";
import { ApiPostCall } from "../../../../api/ApiCall";
const ApplicationDeploymentForm = () => {
  const formControl = useForm({
    mode: "onChange",
  });

  const selectedTenants = useWatch({
    control: formControl.control,
    name: "selectedTenants",
  });

  const applicationType = useWatch({
    control: formControl.control,
    name: "appType",
  });

  const searchQuerySelection = useWatch({
    control: formControl.control,
    name: "packageSearch",
  });

  useEffect(() => {
    //if the searchQuerySelection was succesful, fill in the fields.
    if (searchQuerySelection) {
      formControl.setValue("packagename", searchQuerySelection.value.packagename);
      formControl.setValue("applicationName", searchQuerySelection.value.applicationName);
      formControl.setValue("description", searchQuerySelection.value.description);
      searchQuerySelection.value.customRepo
        ? formControl.setValue("customRepo", searchQuerySelection.value.customRepo)
        : null;
    }
  }, [searchQuerySelection]);

  const postUrl = {
    mspApp: "/api/AddMSPApp",
    StoreApp: "/api/AddStoreApp",
    winGetApp: "/api/AddwinGetApp",
    chocolateyApp: "/api/AddChocoApp",
    officeApp: "/api/AddOfficeApp",
  };

  const ChocosearchResults = ApiPostCall({
    urlfromData: true,
  });

  const winGetSearchResults = ApiPostCall({
    urlfromData: true,
  });

  const searchApp = (searchText, type) => {
    if (type === "choco") {
      ChocosearchResults.mutate({
        url: `/api/ListAppsRepository`,
        data: { search: searchText },
        queryKey: `SearchApp-${searchText}-${type}`,
      });
    }

    if (type === "StoreApp") {
      winGetSearchResults.mutate({
        url: `/api/ListPotentialApps`,
        data: { searchString: searchText, type: "WinGet" },
        queryKey: `SearchApp-${searchText}-${type}`,
      });
    }
  };

  return (
    <CippFormPage
      resetForm={false}
      queryKey="Queued Applications"
      title="Application Deployment"
      formControl={formControl}
      postUrl={postUrl[applicationType?.value]}
      backButtonTitle="Applications"
      customDataformatter={(data) => {
        const formattedData = { ...data };
        formattedData.selectedTenants = selectedTenants.map((tenant) => ({
          defaultDomainName: tenant.value,
        }));
        return formattedData;
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CippFormComponent
            type="autoComplete"
            label="Select Application Type"
            name="appType"
            options={[
              { label: "MSP Vendor App", value: "mspApp" },
              { label: "Store App", value: "StoreApp" },
              // uncomment after release { label: "WinGet App", value: "winGetApp" },
              { label: "Chocolatey App", value: "chocolateyApp" },
              { label: "Microsoft Office", value: "officeApp" },
            ]}
            multiple={false}
            formControl={formControl}
            validators={{ required: "Please select an application type" }}
          />
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Tenant Selector */}
        <Grid item xs={12}>
          <CippFormTenantSelector
            label="Select Tenants"
            formControl={formControl}
            name="selectedTenants"
            type="multiple"
            allTenants={true}
            validators={{ required: "At least one tenant must be selected" }}
          />
        </Grid>

        <Divider sx={{ my: 2 }} />
        <CippFormCondition
          formControl={formControl}
          field="appType.value"
          compareType="is"
          compareValue="mspApp"
        >
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="autoComplete"
              label="Select MSP Tool"
              name="rmmname"
              options={[
                { value: "datto", label: "Datto RMM" },
                { value: "syncro", label: "Syncro RMM" },
                { value: "immy", label: "ImmyBot" },
                { value: "huntress", label: "Huntress" },
                { value: "automate", label: "CW Automate" },
                { value: "cwcommand", label: "CW Command" },
              ]}
              formControl={formControl}
              multiple={false}
              validators={{ required: "Please select an MSP Tool" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="textField"
              label="Intune Application Display Name"
              name="displayName"
              formControl={formControl}
              validators={{ required: "Display name is required" }}
            />
          </Grid>

          <CippFormCondition
            formControl={formControl}
            field="rmmname.value"
            compareType="is"
            compareValue="datto"
          >
            <Grid item xs={12} md={6}>
              <CippFormComponent
                type="textField"
                label="Server URL (e.g., https://pinotage.centrastage.net)"
                name="params.dattoUrl"
                formControl={formControl}
                validators={{ required: "Server URL is required" }}
              />
            </Grid>
            {selectedTenants?.map((tenant, index) => (
              <Grid item xs={12} md={6} key={tenant.value || index}>
                <CippFormComponent
                  type="textField"
                  label={`Datto ID for ${tenant.label}`}
                  name={`params.dattoGuid.${tenant.value}`}
                  formControl={formControl}
                  validators={{ required: `Datto ID for ${tenant.label} is required` }}
                />
              </Grid>
            ))}
          </CippFormCondition>

          {/* For "syncro" */}
          <CippFormCondition
            formControl={formControl}
            field="rmmname.value"
            compareType="is"
            compareValue="syncro"
          >
            {selectedTenants?.map((tenant, index) => (
              <Grid item xs={12} md={6} key={tenant.value || index}>
                <CippFormComponent
                  type="textField"
                  label={`Client URL for ${tenant.label}`}
                  name={`params.ClientURL.${tenant.value}`}
                  formControl={formControl}
                  validators={{ required: `Client URL for ${tenant.label} is required` }}
                />
              </Grid>
            ))}
          </CippFormCondition>

          {/* Similar blocks for other rmmname values */}
          {/* For "immy" */}
          <CippFormCondition
            formControl={formControl}
            field="rmmname.value"
            compareType="is"
            compareValue="immy"
          >
            {selectedTenants?.map((tenant, index) => (
              <Grid item xs={12} md={6} key={tenant.value || index}>
                <CippFormComponent
                  type="textField"
                  label={`Client URL for ${tenant.label}`}
                  name={`params.ClientURL.${tenant.value}`}
                  formControl={formControl}
                  validators={{ required: `Client URL for ${tenant.label} is required` }}
                />
              </Grid>
            ))}
          </CippFormCondition>

          {/* For "huntress" */}
          <CippFormCondition
            formControl={formControl}
            field="rmmname.value"
            compareType="is"
            compareValue="huntress"
          >
            <Grid item xs={12} md={6}>
              <CippFormComponent
                type="textField"
                label="Account Key"
                name="params.AccountKey"
                formControl={formControl}
                validators={{ required: "Account Key is required" }}
              />
            </Grid>
            {selectedTenants?.map((tenant, index) => (
              <Grid item xs={12} md={6} key={tenant.value || index}>
                <CippFormComponent
                  type="textField"
                  label={`Organization Key for ${tenant.label}`}
                  name={`params.Orgkey.${tenant.value}`}
                  formControl={formControl}
                  validators={{ required: `Organization Key for ${tenant.label} is required` }}
                />
              </Grid>
            ))}
          </CippFormCondition>

          {/* For "automate" */}
          <CippFormCondition
            formControl={formControl}
            field="rmmname.value"
            compareType="is"
            compareValue="automate"
          >
            <Grid item xs={12} md={6}>
              <CippFormComponent
                type="textField"
                label="Automate Server (including HTTPS)"
                name="params.Server"
                formControl={formControl}
                validators={{ required: "Automate Server is required" }}
              />
            </Grid>
            {selectedTenants?.map((tenant, index) => (
              <Grid item xs={12} md={6} key={tenant.value || index}>
                <CippFormComponent
                  type="textField"
                  label={`Installer Token for ${tenant.label}`}
                  name={`params.InstallerToken.${tenant.value}`}
                  formControl={formControl}
                  validators={{ required: `Installer Token for ${tenant.label} is required` }}
                />
              </Grid>
            ))}
            {selectedTenants?.map((tenant, index) => (
              <Grid item xs={12} md={6} key={`${tenant.value}_location_${index}`}>
                <CippFormComponent
                  type="textField"
                  label={`Location ID for ${tenant.label}`}
                  name={`params.LocationID.${tenant.value}`}
                  formControl={formControl}
                  validators={{ required: `Location ID for ${tenant.label} is required` }}
                />
              </Grid>
            ))}
          </CippFormCondition>

          {/* For "cwcommand" */}
          <CippFormCondition
            formControl={formControl}
            field="rmmname.value"
            compareType="is"
            compareValue="cwcommand"
          >
            {selectedTenants?.map((tenant, index) => (
              <Grid item xs={12} md={6} key={tenant.value || index}>
                <CippFormComponent
                  type="textField"
                  label={`Client URL for ${tenant.label}`}
                  name={`params.ClientURL.${tenant.value}`}
                  formControl={formControl}
                  validators={{ required: `Client URL for ${tenant.label} is required` }}
                />
              </Grid>
            ))}
          </CippFormCondition>

          {/* Assign To Options */}
          <Grid item xs={12}>
            <CippFormComponent
              type="radio"
              name="AssignTo"
              options={[
                { label: "Do not assign", value: "On" },
                { label: "Assign to all users", value: "allLicensedUsers" },
                { label: "Assign to all devices", value: "AllDevices" },
                { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
                { label: "Assign to Custom Group", value: "customGroup" },
              ]}
              formControl={formControl}
              row
            />
          </Grid>
          <CippFormCondition
            formControl={formControl}
            field="AssignTo"
            compareType="is"
            compareValue="customGroup"
          >
            <Grid item xs={12}>
              <CippFormComponent
                type="textField"
                label="Custom Group Names separated by comma. Wildcards (*) are allowed"
                name="customGroup"
                formControl={formControl}
                validators={{ required: "Please specify custom group names" }}
              />
            </Grid>
          </CippFormCondition>
        </CippFormCondition>

        {/* WinGet App Section */}
        <CippFormCondition
          formControl={formControl}
          field="appType.value"
          compareType="is"
          compareValue="StoreApp"
        >
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="textField"
              label="Search Packages"
              name="searchQuery"
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={() => {
                searchApp(formControl.getValues("searchQuery"), "StoreApp");
              }}
            >
              Search
            </Button>
          </Grid>

          <Grid item xs={12}>
            <CippFormComponent
              type="autoComplete"
              label="Select Package"
              name="packageSearch"
              options={winGetSearchResults.data?.data?.map((item) => ({
                value: item,
                label: `${item.applicationName} - ${item.packagename}`,
              }))}
              multiple={false}
              formControl={formControl}
              isFetching={winGetSearchResults.isLoading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="textField"
              label="WinGet Package Identifier"
              name="packagename"
              formControl={formControl}
              validators={{ required: "Package Identifier is required" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="textField"
              label="Application Name"
              name="applicationName"
              formControl={formControl}
              validators={{ required: "Application Name is required" }}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="textField"
              label="Description"
              name="description"
              formControl={formControl}
            />
          </Grid>

          {/* Install Options */}
          <Grid item xs={12}>
            <CippFormComponent
              type="switch"
              label="Mark for Uninstallation"
              name="InstallationIntent"
              formControl={formControl}
            />
          </Grid>

          {/* Assign To Options */}
          <Grid item xs={12}>
            <CippFormComponent
              type="radio"
              name="AssignTo"
              options={[
                { label: "Do not assign", value: "On" },
                { label: "Assign to all users", value: "allLicensedUsers" },
                { label: "Assign to all devices", value: "AllDevices" },
                { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
                { label: "Assign to Custom Group", value: "customGroup" },
              ]}
              formControl={formControl}
              row
            />
          </Grid>
          <CippFormCondition
            formControl={formControl}
            field="AssignTo"
            compareType="is"
            compareValue="customGroup"
          >
            <Grid item xs={12}>
              <CippFormComponent
                type="textField"
                label="Custom Group Names separated by comma. Wildcards (*) are allowed"
                name="customGroup"
                formControl={formControl}
                validators={{ required: "Please specify custom group names" }}
              />
            </Grid>
          </CippFormCondition>
        </CippFormCondition>

        {/* Chocolatey App Section */}
        <CippFormCondition
          formControl={formControl}
          field="appType.value"
          compareType="is"
          compareValue="chocolateyApp"
        >
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="textField"
              label="Search Packages"
              name="searchQuery"
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={() => {
                searchApp(formControl.getValues("searchQuery"), "choco");
              }}
            >
              Search
            </Button>
          </Grid>

          <Grid item xs={12}>
            <CippFormComponent
              type="autoComplete"
              label="Select Package"
              name="packageSearch"
              options={
                ChocosearchResults.isSuccess &&
                ChocosearchResults.data?.data?.Results?.map((item) => ({
                  value: item,
                  label: `${item.applicationName} - ${item.packagename}`,
                }))
              }
              multiple={false}
              formControl={formControl}
              isFetching={ChocosearchResults.isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="textField"
              label="Chocolatey Package Name"
              name="packagename"
              formControl={formControl}
              validators={{ required: "Package Name is required" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="textField"
              label="Application Name"
              name="applicationName"
              formControl={formControl}
              validators={{ required: "Application Name is required" }}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="textField"
              label="Description"
              name="description"
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="textField"
              label="Custom Repository URL"
              name="customRepo"
              formControl={formControl}
            />
          </Grid>

          {/* Install Options */}
          <Grid item xs={12}>
            <CippFormComponent
              type="switch"
              label="Install as system"
              name="InstallAsSystem"
              formControl={formControl}
              defaultValue={true}
            />
            <CippFormComponent
              type="switch"
              label="Disable Restart"
              name="DisableRestart"
              formControl={formControl}
              defaultValue={true}
            />
            <CippFormComponent
              type="switch"
              label="Mark for Uninstallation"
              name="InstallationIntent"
              formControl={formControl}
            />
          </Grid>

          {/* Assign To Options */}
          <Grid item xs={12}>
            <CippFormComponent
              type="radio"
              name="AssignTo"
              options={[
                { label: "Do not assign", value: "On" },
                { label: "Assign to all users", value: "allLicensedUsers" },
                { label: "Assign to all devices", value: "AllDevices" },
                { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
                { label: "Assign to Custom Group", value: "customGroup" },
              ]}
              formControl={formControl}
              row
            />
          </Grid>
          <CippFormCondition
            formControl={formControl}
            field="AssignTo"
            compareType="is"
            compareValue="customGroup"
          >
            <Grid item xs={12}>
              <CippFormComponent
                type="textField"
                label="Custom Group Names separated by comma. Wildcards (*) are allowed"
                name="customGroup"
                formControl={formControl}
                validators={{ required: "Please specify custom group names" }}
              />
            </Grid>
          </CippFormCondition>
        </CippFormCondition>

        {/* Office App Section */}
        <CippFormCondition
          formControl={formControl}
          field="appType.value"
          compareType="is"
          compareValue="officeApp"
        >
          {/* Office App Fields */}

          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="autoComplete"
              label="Excluded Apps"
              name="excludedApps"
              options={[
                { value: "access", label: "Access" },
                { value: "excel", label: "Excel" },
                { value: "oneNote", label: "OneNote" },
                { value: "outlook", label: "Outlook" },
                { value: "powerPoint", label: "PowerPoint" },
                { value: "teams", label: "Teams" },
                { value: "word", label: "Word" },
                { value: "lync", label: "Skype For Business" },
                { value: "bing", label: "Bing" },
              ]}
              multiple={true}
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CippFormComponent
              type="autoComplete"
              label="Update Channel"
              name="updateChannel"
              options={[
                { value: "current", label: "Current Channel" },
                { value: "firstReleaseCurrent", label: "Current (Preview)" },
                { value: "monthlyEnterprise", label: "Monthly Enterprise" },
                { value: "deferred", label: "Semi-Annual Enterprise" },
                { value: "firstReleaseDeferred", label: "Semi-Annual Enterprise (Preview)" },
              ]}
              multiple={false}
              formControl={formControl}
              validators={{ required: "Please select an update channel" }}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="autoComplete"
              label="Languages"
              name="languages"
              options={languageList.map(({ language, tag }) => ({
                value: tag,
                label: language,
              }))}
              multiple={true}
              formControl={formControl}
              validators={{ required: "Please select at least one language" }}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="switch"
              label="Use Shared Computer Activation"
              name="SharedComputerActivation"
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="switch"
              label="64 Bit (Recommended)"
              name="arch"
              formControl={formControl}
              defaultValue={true}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="switch"
              label="Remove other versions"
              name="RemoveVersions"
              formControl={formControl}
              defaultValue={true}
            />
          </Grid>
          <Grid item xs={12}>
            <CippFormComponent
              type="switch"
              label="Accept License"
              name="AcceptLicense"
              formControl={formControl}
              defaultValue={true}
            />
          </Grid>

          {/* Assign To Options */}
          <Grid item xs={12}>
            <CippFormComponent
              type="radio"
              name="AssignTo"
              options={[
                { label: "Do not assign", value: "On" },
                { label: "Assign to all users", value: "allLicensedUsers" },
                { label: "Assign to all devices", value: "AllDevices" },
                { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
              ]}
              formControl={formControl}
              row
            />
          </Grid>
        </CippFormCondition>
      </Grid>
    </CippFormPage>
  );
};

ApplicationDeploymentForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ApplicationDeploymentForm;
