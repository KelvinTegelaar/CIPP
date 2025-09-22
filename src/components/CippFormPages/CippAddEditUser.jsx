import { Alert, InputAdornment, Typography } from "@mui/material";
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
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";

const CippAddEditUser = (props) => {
  const { formControl, userSettingsDefaults, formType = "add" } = props;
  const tenantDomain = useSettings().currentTenant;
  const router = useRouter();
  const { userId } = router.query;
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
  useEffect(() => {
    //if watch.firstname changes, and watch.lastname changes, set displayname to firstname + lastname
    if (watcher.givenName && watcher.surname && formType === "add") {
      formControl.setValue("displayName", `${watcher.givenName} ${watcher.surname}`);
    }
  }, [watcher.givenName, watcher.surname]);

  return (
    <Grid container spacing={2}>
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
                calculatedGroupType: tenantGroup.calculatedGroupType,
              },
            }))}
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
                calculatedGroupType: userGroups.calculatedGroupType,
              },
            }))}
            formControl={formControl}
          />
        </Grid>
      )}
      {/* Schedule User Creation */}
      {formType === "add" && (
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
                name="webhook"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Send results to E-mail"
                name="email"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Send results to PSA"
                name="psa"
                formControl={formControl}
              />
            </Grid>
          </CippFormCondition>
        </Grid>
      )}
    </Grid>
  );
};

export default CippAddEditUser;
