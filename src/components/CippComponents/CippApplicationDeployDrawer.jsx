import React, { useEffect, useCallback, useState } from "react";
import { Divider, Button, Alert } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Add } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { CippFormCondition } from "./CippFormCondition";
import { CippApiResults } from "./CippApiResults";
import languageList from "/src/data/languageList.json";
import { ApiPostCall } from "../../api/ApiCall";

export const CippApplicationDeployDrawer = ({
  buttonText = "Add Application",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
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

  const updateSearchSelection = useCallback(
    (searchQuerySelection) => {
      if (searchQuerySelection) {
        formControl.setValue("packagename", searchQuerySelection.value.packagename);
        formControl.setValue("applicationName", searchQuerySelection.value.applicationName);
        formControl.setValue("description", searchQuerySelection.value.description);
        searchQuerySelection.value.customRepo
          ? formControl.setValue("customRepo", searchQuerySelection.value.customRepo)
          : null;
      }
    },
    [formControl.setValue]
  );

  useEffect(() => {
    updateSearchSelection(searchQuerySelection);
  }, [updateSearchSelection, searchQuerySelection]);

  const postUrl = {
    mspApp: "/api/AddMSPApp",
    StoreApp: "/api/AddStoreApp",
    winGetApp: "/api/AddwinGetApp",
    chocolateyApp: "/api/AddChocoApp",
    officeApp: "/api/AddOfficeApp",
  };

  const ChocosearchResults = ApiPostCall({
    urlFromData: true,
  });

  const winGetSearchResults = ApiPostCall({
    urlFromData: true,
  });

  const deployApplication = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["Queued Applications"],
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

  const handleSubmit = () => {
    const formData = formControl.getValues();
    const formattedData = { ...formData };
    formattedData.selectedTenants = selectedTenants.map((tenant) => ({
      defaultDomainName: tenant.value,
      customerId: tenant.addedFields.customerId,
    }));

    deployApplication.mutate({
      url: postUrl[applicationType?.value],
      data: formattedData,
      relatedQueryKeys: ["Queued Applications"],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset();
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<Add />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Application Deployment"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={deployApplication.isLoading}
            >
              {deployApplication.isLoading
                ? "Deploying..."
                : deployApplication.isSuccess
                ? "Deploy Another"
                : "Deploy Application"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
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
          {/* Tenant Selector */}
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              label="Select Tenants"
              formControl={formControl}
              name="selectedTenants"
              type="multiple"
              allTenants={true}
              preselectedEnabled={true}
              validators={{ required: "At least one tenant must be selected" }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <CippFormCondition
            formControl={formControl}
            field="appType.value"
            compareType="is"
            compareValue="mspApp"
          >
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Select MSP Tool"
                name="rmmname"
                options={[
                  { value: "datto", label: "Datto RMM", isSponsor: false },
                  { value: "syncro", label: "Syncro RMM", isSponsor: true },
                  { value: "huntress", label: "Huntress", isSponsor: true },
                  {
                    value: "automate",
                    label: "CW Automate",
                    isSponsor: false,
                  },
                  {
                    value: "cwcommand",
                    label: "CW Command",
                    isSponsor: false,
                  },
                ]}
                formControl={formControl}
                multiple={false}
                validators={{ required: "Please select an MSP Tool" }}
              />
            </Grid>
            <CippFormCondition
              field="rmmname.isSponsor"
              compareType="is"
              compareValue={false}
              formControl={formControl}
            >
              <Alert severity="info" sx={{ mb: 2 }}>
                This is a community contribution and is not covered under a vendor sponsorship.
                Please join our Discord community for assistance with this MSP App.
              </Alert>
            </CippFormCondition>
            <Grid size={{ md: 6, xs: 12 }}>
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
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Server URL (e.g., https://pinotage.centrastage.net)"
                  name="params.dattoUrl"
                  formControl={formControl}
                  validators={{ required: "Server URL is required" }}
                />
              </Grid>
              {selectedTenants?.map((tenant, index) => (
                <Grid size={{ md: 6, xs: 12 }} key={tenant.addedFields.customerId || index}>
                  <CippFormComponent
                    type="textField"
                    label={`Datto ID for ${tenant.label}`}
                    name={`params.dattoGuid.${tenant.addedFields.customerId}`}
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
                <Grid size={{ md: 6, xs: 12 }} key={tenant.addedFields.customerId || index}>
                  <CippFormComponent
                    type="textField"
                    label={`Client URL for ${tenant.label}`}
                    name={`params.ClientURL.${tenant.addedFields.customerId}`}
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
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Account Key"
                  name="params.AccountKey"
                  formControl={formControl}
                  validators={{ required: "Account Key is required" }}
                />
              </Grid>
              {selectedTenants?.map((tenant, index) => (
                <Grid size={{ md: 6, xs: 12 }} key={tenant.addedFields.customerId || index}>
                  <CippFormComponent
                    type="textField"
                    label={`Organization Key for ${tenant.label}`}
                    name={`params.Orgkey.${tenant.addedFields.customerId}`}
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
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Automate Server (including HTTPS)"
                  name="params.Server"
                  formControl={formControl}
                  validators={{ required: "Automate Server is required" }}
                />
              </Grid>
              {selectedTenants?.map((tenant, index) => (
                <Grid size={{ md: 6, xs: 12 }} key={tenant.addedFields.customerId || index}>
                  <CippFormComponent
                    type="textField"
                    label={`Installer Token for ${tenant.label}`}
                    name={`params.InstallerToken.${tenant.addedFields.customerId}`}
                    formControl={formControl}
                    validators={{ required: `Installer Token for ${tenant.label} is required` }}
                  />
                </Grid>
              ))}
              {selectedTenants?.map((tenant, index) => (
                <Grid
                  size={{ md: 6, xs: 12 }}
                  key={`${tenant.addedFields.customerId}_location_${index}`}
                >
                  <CippFormComponent
                    type="textField"
                    label={`Location ID for ${tenant.label}`}
                    name={`params.LocationID.${tenant.addedFields.customerId}`}
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
                <Grid size={{ md: 6, xs: 12 }} key={tenant.addedFields.customerId || index}>
                  <CippFormComponent
                    type="textField"
                    label={`Client URL for ${tenant.label}`}
                    name={`params.ClientURL.${tenant.addedFields.customerId}`}
                    formControl={formControl}
                    validators={{ required: `Client URL for ${tenant.label} is required` }}
                  />
                </Grid>
              ))}
            </CippFormCondition>

            {/* Assign To Options */}
            <Grid size={{ xs: 12 }}>
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
              <Grid size={{ xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Search Packages"
                name="searchQuery"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <Button
                onClick={() => {
                  searchApp(formControl.getValues("searchQuery"), "StoreApp");
                }}
              >
                Search
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Select Package"
                name="packageSearch"
                options={
                  winGetSearchResults.data?.data
                    ? winGetSearchResults.data?.data?.map((item) => ({
                        value: item,
                        label: `${item.applicationName} - ${item.packagename}`,
                      }))
                    : []
                }
                multiple={false}
                formControl={formControl}
                disabled={winGetSearchResults.isLoading}
                isFetching={winGetSearchResults.isLoading}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="WinGet Package Identifier"
                name="packagename"
                formControl={formControl}
                validators={{ required: "Package Identifier is required" }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Application Name"
                name="applicationName"
                formControl={formControl}
                validators={{ required: "Application Name is required" }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Description"
                name="description"
                formControl={formControl}
              />
            </Grid>

            {/* Install Options */}
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Mark for Uninstallation"
                name="InstallationIntent"
                formControl={formControl}
              />
            </Grid>

            {/* Assign To Options */}
            <Grid size={{ xs: 12 }}>
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
              <Grid size={{ xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Search Packages"
                name="searchQuery"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <Button
                onClick={() => {
                  searchApp(formControl.getValues("searchQuery"), "choco");
                }}
              >
                Search
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Select Package"
                name="packageSearch"
                options={
                  ChocosearchResults.isSuccess && ChocosearchResults.data?.data
                    ? ChocosearchResults.data?.data?.Results?.map((item) => ({
                        value: item,
                        label: `${item.applicationName} - ${item.packagename}`,
                      }))
                    : []
                }
                multiple={false}
                formControl={formControl}
                isFetching={ChocosearchResults.isLoading}
              />
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Chocolatey Package Name"
                name="packagename"
                formControl={formControl}
                validators={{ required: "Package Name is required" }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Application Name"
                name="applicationName"
                formControl={formControl}
                validators={{ required: "Application Name is required" }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Description"
                name="description"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Custom Repository URL"
                name="customRepo"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Custom Chocolatey Arguments (include full syntax with flags, supports variables). e.g., --params '/quiet' or --install-arguments '/S /KEY=%customlicensekey%'"
                name="customArguments"
                formControl={formControl}
              />
            </Grid>

            {/* Install Options */}
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
              <Grid size={{ xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="Languages"
                name="languages"
                options={languageList.map(({ language, tag }) => ({
                  value: tag,
                  label: `${language} (${tag})`,
                }))}
                multiple={true}
                formControl={formControl}
                validators={{ required: "Please select at least one language" }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Use Shared Computer Activation"
                name="SharedComputerActivation"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="64 Bit (Recommended)"
                name="arch"
                formControl={formControl}
                defaultValue={true}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Remove other versions"
                name="RemoveVersions"
                formControl={formControl}
                defaultValue={true}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Accept License"
                name="AcceptLicense"
                formControl={formControl}
                defaultValue={true}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Use Custom XML Configuration"
                name="useCustomXml"
                formControl={formControl}
              />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="useCustomXml"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  label="Custom Office Configuration XML"
                  name="customXml"
                  formControl={formControl}
                  multiline
                  rows={10}
                  validators={{ required: "Please provide custom XML configuration" }}
                />
                <Alert severity="info" sx={{ mt: 1 }}>
                  Provide a custom Office Configuration XML. When using custom XML, all other
                  Office configuration options above will be ignored. See{" "}
                  <a
                    href="https://config.office.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Office Customization Tool
                  </a>{" "}
                  to generate XML.
                </Alert>
              </Grid>
            </CippFormCondition>

            {/* Assign To Options */}
            <Grid size={{ xs: 12 }}>
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

          <CippApiResults apiObject={deployApplication} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
