import { Alert, InputAdornment, Typography } from "@mui/material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { CippFormDomainSelector } from "/src/components/CippComponents/CippFormDomainSelector";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import countryList from "/src/data/countryList.json";
import { CippFormLicenseSelector } from "/src/components/CippComponents/CippFormLicenseSelector";
import Grid from "@mui/material/Grid";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { useWatch } from "react-hook-form";
import { useEffect } from "react";

const CippAddEditUser = (props) => {
  const { formControl, userSettingsDefaults, formType = "add" } = props;
  const tenantDomain = useSettings().currentTenant;
  const integrationSettings = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "ListExtensionsConfig",
  });

  const watcher = useWatch({ control: formControl.control });
  useEffect(() => {
    //if watch.firstname changes, and watch.lastname changes, set displayname to firstname + lastname
    if (watcher.givenName && watcher.surname && formType === "add") {
      formControl.setValue("displayName", `${watcher.givenName} ${watcher.surname}`);
    }
  }, [watcher.givenName, watcher.surname]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="First Name"
          name="givenName"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Last Name"
          name="surname"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Display Name"
          name="displayName"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
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
      <Grid item xs={12} md={6}>
        <CippFormDomainSelector
          formControl={formControl}
          name="primDomain"
          label="Primary Domain name"
        />
      </Grid>
      <Grid item xs={12}>
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

      <Grid item xs={12}>
        <Typography variant="h6">Settings</Typography>
      </Grid>
      <Grid item xs={6}>
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
          <Grid item xs={12}>
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
      <Grid item xs={6}>
        <CippFormComponent
          type="switch"
          label="Require password change at next logon"
          name="MustChangePass"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormComponent
          type="autoComplete"
          label="Usage Location"
          name="usageLocation"
          multiple={false}
          defaultValue="US"
          options={countryList.map(({ Code, Name }) => ({
            label: Name,
            value: Code,
          }))}
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12}>
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
            <Grid item xs={6}>
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
              <Grid item xs={12}>
                <Alert severity="info">
                  This will Purchase a new Sherweb License for the user, according to the terms and
                  conditions with Sherweb. When the license becomes available, CIPP will assign the
                  license to this user.
                </Alert>
              </Grid>
              <Grid item xs={12}>
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
      <Grid item xs={6}>
        <CippFormComponent
          type="switch"
          label="Remove all licenses"
          name="removeLicenses"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Job Title"
          name="jobTitle"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Street"
          name="streetAddress"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Postal Code"
          name="postalCode"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Company Name"
          name="companyName"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Department"
          name="department"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Mobile #"
          name="mobilePhone"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Business #"
          name="businessPhones"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Alternate Email Address"
          name="otherMails"
          formControl={formControl}
        />
      </Grid>
      {userSettingsDefaults?.userAttributes?.filter((attribute) => attribute.value !== "sponsor").map((attribute, idx) => (
        <Grid item xs={6} key={idx}>
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
      <Grid item xs={12}>
        <CippFormUserSelector
          formControl={formControl}
          name="setManager"
          label="Set Manager"
          valueField="userPrincipalName"
          multiple={false}
        />
      </Grid>
      {userSettingsDefaults?.userAttributes?.some((attribute) => attribute.value === "sponsor") && (
        <Grid item xs={12}>
          <CippFormUserSelector
            formControl={formControl}
            name="setSponsor"
            label="Set Sponsor"
            valueField="userPrincipalName"
            multiple={false}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <CippFormUserSelector
          formControl={formControl}
          name="copyFrom"
          label="Copy groups from user"
          multiple={false}
        />
      </Grid>
      {formType === "edit" && (
        <Grid item xs={12}>
          <CippFormComponent
            type="autoComplete"
            label="Add to Groups"
            name="AddToGroups"
            multiple={true}
            api={{
              url: "/api/ListGroups",
              queryKey: `ListGroups-${tenantDomain}`,
              labelField: "displayName",
              valueField: "id",
              addedField: {
                calculatedGroupType: "calculatedGroupType",
              },
            }}
            formControl={formControl}
          />
        </Grid>
      )}
      {/* Schedule User Creation */}
      {formType === "add" && (
        <Grid item xs={12}>
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
            <Grid item xs={12}>
              <label>Scheduled creation Date</label>
              <CippFormComponent
                type="datePicker"
                name="Scheduled.date"
                formControl={formControl}
              />
            </Grid>
            <Grid item xs={12}>
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
