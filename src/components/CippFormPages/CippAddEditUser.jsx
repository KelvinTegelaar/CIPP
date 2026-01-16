import { Alert, Divider, InputAdornment, Typography } from "@mui/material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { CippFormDomainSelector } from "/src/components/CippComponents/CippFormDomainSelector";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import countryList from "/src/data/countryList.json";
import { CippFormLicenseSelector } from "/src/components/CippComponents/CippFormLicenseSelector";
import { Grid } from "@mui/system";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

const CippAddEditUser = (props) => {
  const { formControl, userSettingsDefaults, formType = "add" } = props;
  const tenantDomain = useSettings().currentTenant;
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [displayNameManuallySet, setDisplayNameManuallySet] = useState(false);
  const [usernameManuallySet, setUsernameManuallySet] = useState(false);
  const router = useRouter();
  const { userId } = router.query;

  // Get user default templates (only in add mode)
  const userTemplates = ApiGetCall({
    url: `/api/ListNewUserDefaults?TenantFilter=${tenantDomain}`,
    queryKey: `UserDefaults-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: formType === "add",
  });
  const integrationSettings = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "ListExtensionsConfig",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Get all groups the is the user is a member of
  const userGroups = ApiGetCall({
    url: `/api/ListUserGroups?userId=${userId}&tenantFilter=${tenantDomain}`,
    queryKey: `User-${userId}-Groups-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
    waiting: !!userId,
  });

  // Get all groups for the tenant
  const tenantGroups = ApiGetCall({
    url: `/api/ListGroups?tenantFilter=${tenantDomain}`,
    queryKey: `ListGroups-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
    waiting: !!userId,
  });

  // Get manual entry custom data mappings for current tenant
  const manualEntryMappings = ApiGetCall({
    url: `/api/ListCustomDataMappings?sourceType=Manual Entry&directoryObject=User&tenantFilter=${tenantDomain}`,
    queryKey: `ManualEntryMappings-${tenantDomain}`,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Use mappings directly since they're already filtered by the API
  const currentTenantManualMappings = useMemo(() => {
    if (manualEntryMappings.isSuccess) {
      return manualEntryMappings.data?.Results || [];
    }
    return [];
  }, [manualEntryMappings.isSuccess, manualEntryMappings.data]);

  // Make new list of groups by removing userGroups from tenantGroups
  const filteredTenantGroups = useMemo(() => {
    if (tenantGroups.isSuccess && userGroups.isSuccess) {
      const tenantGroupsList = tenantGroups?.data || [];

      return tenantGroupsList.filter(
        (tenantGroup) => !userGroups?.data?.some((userGroup) => userGroup.id === tenantGroup.id)
      );
    }
    return [];
  }, [tenantGroups.isSuccess, userGroups.isSuccess, tenantGroups.data, userGroups.data]);

  const watcher = useWatch({ control: formControl.control });

  // Helper function to generate username from template format
  const generateUsername = (format, firstName, lastName) => {
    if (!format || !firstName || !lastName) return "";

    // Ensure format is a string
    const formatString = typeof format === "string" ? format : String(format);

    let username = formatString;

    // Replace %FirstName[n]% patterns (extract first n characters)
    username = username.replace(/%FirstName\[(\d+)\]%/gi, (match, num) => {
      return firstName.substring(0, parseInt(num));
    });

    // Replace %LastName[n]% patterns (extract first n characters)
    username = username.replace(/%LastName\[(\d+)\]%/gi, (match, num) => {
      return lastName.substring(0, parseInt(num));
    });

    // Replace %FirstName% and %LastName%
    username = username.replace(/%FirstName%/gi, firstName);
    username = username.replace(/%LastName%/gi, lastName);

    // Convert to lowercase
    return username.toLowerCase();
  };

  useEffect(() => {
    //if watch.firstname changes, and watch.lastname changes, set displayname to firstname + lastname
    if (watcher.givenName && watcher.surname && formType === "add") {
      // Only auto-set display name if user hasn't manually changed it
      if (!displayNameManuallySet) {
        // Build base display name from first and last name
        let displayName = `${watcher.givenName} ${watcher.surname}`;

        // Add template displayName as suffix if it exists
        if (selectedTemplate?.displayName) {
          displayName += selectedTemplate.displayName;
        }

        formControl.setValue("displayName", displayName);
      }

      // Auto-generate username if template has usernameFormat
      if (selectedTemplate?.usernameFormat && !usernameManuallySet) {
        // Extract the actual format string - it might be an object {label, value} or a string
        const formatString =
          typeof selectedTemplate.usernameFormat === "string"
            ? selectedTemplate.usernameFormat
            : selectedTemplate.usernameFormat?.value || selectedTemplate.usernameFormat?.label;

        if (formatString) {
          const generatedUsername = generateUsername(
            formatString,
            watcher.givenName,
            watcher.surname
          );
          if (generatedUsername) {
            formControl.setValue("username", generatedUsername);
          }
        }
      }
    }
  }, [watcher.givenName, watcher.surname, selectedTemplate]);

  // Auto-select default template for tenant
  useEffect(() => {
    if (formType === "add" && userTemplates.isSuccess && !watcher.userTemplate) {
      const defaultTemplate = userTemplates.data?.find(
        (template) => template.defaultForTenant === true
      );
      if (defaultTemplate) {
        formControl.setValue("userTemplate", {
          label: defaultTemplate.templateName,
          value: defaultTemplate.GUID,
          addedFields: defaultTemplate,
        });
        setSelectedTemplate(defaultTemplate);
      }
    }
  }, [userTemplates.isSuccess, formType]);

  // Auto-populate fields when template selected
  useEffect(() => {
    if (formType === "add" && watcher.userTemplate?.addedFields) {
      const template = watcher.userTemplate.addedFields;
      setSelectedTemplate(template);

      // Reset manual edit flags when template changes
      setDisplayNameManuallySet(false);
      setUsernameManuallySet(false);

      // Only set fields if they don't already have values (don't override user input)
      const setFieldIfEmpty = (fieldName, value) => {
        if (!watcher[fieldName] && value) {
          formControl.setValue(fieldName, value);
        }
      };

      // Populate form fields from template
      if (template.primDomain) {
        // If primDomain is an object, use it as-is; if it's a string, convert to object
        const primDomainValue =
          typeof template.primDomain === "string"
            ? { label: template.primDomain, value: template.primDomain }
            : template.primDomain;
        setFieldIfEmpty("primDomain", primDomainValue);
      }
      if (template.usageLocation) {
        // Handle both object and string formats
        const usageLocationCode =
          typeof template.usageLocation === "string"
            ? template.usageLocation
            : template.usageLocation?.value;
        const country = countryList.find((c) => c.Code === usageLocationCode);
        if (country) {
          setFieldIfEmpty("usageLocation", {
            label: country.Name,
            value: country.Code,
          });
        }
      }
      setFieldIfEmpty("jobTitle", template.jobTitle);
      setFieldIfEmpty("streetAddress", template.streetAddress);
      setFieldIfEmpty("city", template.city);
      setFieldIfEmpty("state", template.state);
      setFieldIfEmpty("postalCode", template.postalCode);
      setFieldIfEmpty("country", template.country);
      setFieldIfEmpty("companyName", template.companyName);
      setFieldIfEmpty("department", template.department);
      setFieldIfEmpty("mobilePhone", template.mobilePhone);
      setFieldIfEmpty("businessPhones[0]", template.businessPhones);

      // Handle licenses - need to match the format expected by CippFormLicenseSelector
      if (template.licenses && Array.isArray(template.licenses)) {
        setFieldIfEmpty("licenses", template.licenses);
      }
    }
  }, [watcher.userTemplate, formType]);

  return (
    <Grid container spacing={2}>
      {formType === "add" && (
        <>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormUserSelector
              formControl={formControl}
              name="userProperties"
              label="Copy properties from another user"
              multiple={false}
              select={
                "id,userPrincipalName,displayName,givenName,surname,mailNickname,jobTitle,department,streetAddress,city,state,postalCode,companyName,mobilePhone,businessPhones,usageLocation,office"
              }
              addedField={{
                groupType: "calculatedGroupType",
                displayName: "displayName",
                userPrincipalName: "userPrincipalName",
                id: "id",
                givenName: "givenName",
                surname: "surname",
                mailNickname: "mailNickname",
                jobTitle: "jobTitle",
                department: "department",
                streetAddress: "streetAddress",
                city: "city",
                state: "state",
                postalCode: "postalCode",
                companyName: "companyName",
                mobilePhone: "mobilePhone",
                businessPhones: "businessPhones",
                usageLocation: "usageLocation",
                office: "office",
              }}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="User Template (optional)"
              name="userTemplate"
              multiple={false}
              options={
                userTemplates.isSuccess
                  ? userTemplates.data?.map((template) => ({
                      label: template.templateName,
                      value: template.GUID,
                      addedFields: template,
                    }))
                  : []
              }
              formControl={formControl}
            />
          </Grid>
        </>
      )}
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="First Name"
          name="givenName"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Last Name"
          name="surname"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Display Name"
          name="displayName"
          formControl={formControl}
          onChange={(e) => {
            setDisplayNameManuallySet(true);
          }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Username"
          InputProps={{
            endAdornment: <InputAdornment position="end">@</InputAdornment>,
          }}
          name="username"
          formControl={formControl}
          onChange={(e) => {
            setUsernameManuallySet(true);
          }}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormDomainSelector
          formControl={formControl}
          name="primDomain"
          label="Primary Domain name"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Add Aliases"
          placeholder="One alias per line"
          name="addedAliases"
          formControl={formControl}
          multiline
          rows={4}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Settings</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <CippFormComponent
          type="switch"
          label="Create password manually"
          name="Autopassword"
          formControl={formControl}
        />
        <CippFormCondition
          formControl={formControl}
          field="Autopassword"
          compareType="is"
          compareValue={true}
        >
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="password"
              fullWidth
              label="Password"
              name="password"
              formControl={formControl}
            />
          </Grid>
        </CippFormCondition>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <CippFormComponent
          type="switch"
          label="Require password change at next logon"
          name="MustChangePass"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          label="Usage Location"
          name="usageLocation"
          multiple={false}
          defaultValue={userSettingsDefaults?.usageLocation || "US"}
          options={countryList.map(({ Code, Name }) => ({
            label: Name,
            value: Code,
          }))}
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormLicenseSelector label="Licenses" name="licenses" formControl={formControl} />
      </Grid>
      {integrationSettings?.data?.Sherweb?.Enabled === true && (
        <>
          <CippFormCondition
            formControl={formControl}
            field="licenses"
            compareType="labelContains"
            compareValue="(0 available)"
            labelCompare={true}
          >
            <Grid size={{ xs: 6 }}>
              <CippFormComponent
                type="switch"
                label="0 Licences available. Purchase new licence?"
                name="sherweb"
                formControl={formControl}
              />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="sherweb"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  This will Purchase a new Sherweb License for the user, according to the terms and
                  conditions with Sherweb. When the license becomes available, CIPP will assign the
                  license to this user.
                </Alert>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  api={{
                    queryKey: `SKU-${tenantDomain}`,
                    url: "/api/ListCSPsku",
                    data: { currentSkuOnly: true },
                    labelField: (option) => `${option?.productName} (${option?.sku})`,
                    valueField: "sku",
                  }}
                  label="Sherweb License"
                  name="sherwebLicense"
                  formControl={formControl}
                />
              </Grid>
            </CippFormCondition>
          </CippFormCondition>
        </>
      )}
      <Grid size={{ xs: 6 }}>
        <CippFormComponent
          type="switch"
          label="Remove all licenses"
          name="removeLicenses"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Job Title"
          name="jobTitle"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Street"
          name="streetAddress"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="City"
          name="city"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="State/Province"
          name="state"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Postal Code"
          name="postalCode"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Country"
          name="country"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Company Name"
          name="companyName"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Department"
          name="department"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Mobile #"
          name="mobilePhone"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Business #"
          name="businessPhones[0]"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Alternate Email Address"
          name="otherMails"
          formControl={formControl}
        />
      </Grid>
      {userSettingsDefaults?.userAttributes
        ?.filter((attribute) => attribute.value !== "sponsor")
        .map((attribute, idx) => (
          <Grid size={{ xs: 6 }} key={idx}>
            <CippFormComponent
              type="textField"
              fullWidth
              label={attribute.label}
              name={`defaultAttributes.${attribute.label}.Value`}
              formControl={formControl}
            />
          </Grid>
        ))}

      {/* Set Manager */}
      <Grid size={{ xs: 12 }}>
        <CippFormUserSelector
          formControl={formControl}
          name="setManager"
          label="Set Manager"
          valueField="userPrincipalName"
          multiple={false}
        />
      </Grid>
      {userSettingsDefaults?.userAttributes?.some((attribute) => attribute.value === "sponsor") && (
        <Grid size={{ xs: 12 }}>
          <CippFormUserSelector
            formControl={formControl}
            name="setSponsor"
            label="Set Sponsor"
            valueField="userPrincipalName"
            multiple={false}
          />
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <CippFormUserSelector
          formControl={formControl}
          name="copyFrom"
          label="Copy groups from user"
          multiple={false}
        />
      </Grid>
      {formType === "edit" && (
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Add to Groups"
            name="AddToGroups"
            multiple={true}
            options={filteredTenantGroups?.map((tenantGroup) => ({
              label: tenantGroup.displayName,
              value: tenantGroup.id,
              addedFields: {
                groupType: tenantGroup.groupType,
              },
            }))}
            creatable={false}
            formControl={formControl}
          />
        </Grid>
      )}
      {formType === "edit" && (
        <Grid size={{ xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Remove from Groups"
            name="RemoveFromGroups"
            multiple={true}
            options={userGroups?.data?.map((userGroups) => ({
              label: userGroups.DisplayName,
              value: userGroups.id,
              addedFields: {
                groupType: userGroups.groupType,
              },
            }))}
            creatable={false}
            formControl={formControl}
          />
        </Grid>
      )}
      {/* Manual Entry Custom Data Fields */}
      {currentTenantManualMappings.length > 0 && (
        <>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">Custom Data</Typography>
          </Grid>
          {currentTenantManualMappings.map((mapping, index) => {
            const fieldName = `customData.${mapping.customDataAttribute.value}`;
            const fieldLabel = mapping.manualEntryFieldLabel;
            const dataType = mapping.customDataAttribute.addedFields.dataType;

            // Determine field type based on the custom data attribute type
            const getFieldType = (dataType) => {
              switch (dataType?.toLowerCase()) {
                case "boolean":
                  return "switch";
                case "datetime":
                case "date":
                  return "datePicker";
                case "string":
                default:
                  return "textField";
              }
            };

            return (
              <Grid size={{ md: 6, xs: 12 }} key={`manual-entry-${index}`}>
                <CippFormComponent
                  type={getFieldType(dataType)}
                  fullWidth
                  label={fieldLabel}
                  name={fieldName}
                  formControl={formControl}
                  placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                />
              </Grid>
            );
          })}
        </>
      )}
      {/* Schedule User Creation */}
      {formType === "add" && (
        <>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Schedule user creation"
              name="Scheduled.enabled"
              formControl={formControl}
            />
            <CippFormCondition
              formControl={formControl}
              field="Scheduled.enabled"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12 }}>
                <label>Scheduled creation Date</label>
                <CippFormComponent
                  type="datePicker"
                  name="Scheduled.date"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="switch"
                  label="Send results to Webhook"
                  name="postExecution.webhook"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Send results to E-mail"
                  name="postExecution.email"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="switch"
                  label="Send results to PSA"
                  name="postExecution.psa"
                  formControl={formControl}
                />
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Reference"
                  name="reference"
                  placeholder="Enter a reference that will be added to the notification title"
                  formControl={formControl}
                />
              </Grid>
            </CippFormCondition>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default CippAddEditUser;
