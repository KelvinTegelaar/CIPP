import { Box, Button, Grid, IconButton, InputAdornment, SvgIcon, Typography } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";
import { CippFormDomainSelector } from "../../../../components/CippComponents/CippFormDomainSelector";
import { CippFormUserSelector } from "../../../../components/CippComponents/CippFormUserSelector";
import countryList from "/src/data/CountryList.json";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippFormLicenseSelector } from "../../../../components/CippComponents/CippFormLicenseSelector";
const Page = () => {
  const [addedAttributes, setAddedAttribute] = useState(0);
  const userSettingsDefaults = useSettings();

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      usageLocation: userSettingsDefaults.usageLocation,
    },
  });
  const formValues = useWatch({ control: formControl.control, name: "userProperties" });
  useEffect(() => {
    if (formValues) {
      const { userPrincipalName, usageLocation, ...restFields } = formValues.addedFields || {};
      let newFields = { ...restFields };
      if (userPrincipalName) {
        const [mailNickname, domainNamePart] = userPrincipalName.split("@");
        if (mailNickname) {
          newFields.mailNickname = mailNickname;
        }
        if (domainNamePart) {
          newFields.primDomain = { label: domainNamePart, value: domainNamePart };
        }
      }
      if (usageLocation) {
        newFields.usageLocation = { label: usageLocation, value: usageLocation };
      }
      formControl.reset(newFields);
    }
  }, [formValues]);
  return (
    <>
      <CippFormPage
        queryKey={"JIT Admin Table"}
        formControl={formControl}
        title="JIT Admin"
        backButtonTitle="JIT Admin"
        postUrl="/api/ExecJitAdmin"
      >
        <Box sx={{ my: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CippFormUserSelector
                formControl={formControl}
                name="userProperties"
                label="Copy properties from another user"
                multiple={false}
                select={
                  "id,userPrincipalName,displayName,givenName,surname,mailNickname,jobTitle,department,streetAddress,postalCode,companyName,mobilePhone,businessPhones,usageLocation"
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
                  postalCode: "postalCode",
                  companyName: "companyName",
                  mobilePhone: "mobilePhone",
                  businessPhones: "businessPhones",
                  usageLocation: "usageLocation",
                }}
              />
            </Grid>
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
                name="mailNickname"
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
                    type="textField"
                    fullWidth
                    label="Password"
                    name="password"
                    formControl={formControl}
                  />
                </Grid>
              </CippFormCondition>
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
            {userSettingsDefaults?.userAttributes?.map((attribute, idx) => (
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
            {addedAttributes > 0 &&
              [...Array(addedAttributes)].map((_, i) => (
                <>
                  <Grid item xs={12} md={6}>
                    <CippFormComponent
                      type="textField"
                      fullWidth
                      label="Attribute Name"
                      name={`addedAttributes.${i}.Key`}
                      formControl={formControl}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CippFormComponent
                        type="textField"
                        label="Attribute Value"
                        name={`addedAttributes.${i}.Value`}
                        formControl={formControl}
                        sx={{
                          width: "90%",
                        }}
                      />
                      <IconButton onClick={() => setAddedAttribute(addedAttributes - 1)}>
                        <SvgIcon>
                          <TrashIcon />
                        </SvgIcon>
                      </IconButton>
                    </Box>
                  </Grid>
                </>
              ))}

            <Button
              onClick={() => setAddedAttribute(addedAttributes + 1)}
              startIcon={
                <SvgIcon fontSize="small">
                  <PlusIcon />
                </SvgIcon>
              }
            >
              Add Attribute
            </Button>
            <Grid item xs={12}></Grid>
            {/* Set Manager */}
            <Grid item xs={12}>
              <CippFormUserSelector
                formControl={formControl}
                name="setManager"
                label="Set Manager"
                multiple={false}
              />
            </Grid>
            {/* Schedule User Creation */}
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
                  //START DATE
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
          </Grid>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
