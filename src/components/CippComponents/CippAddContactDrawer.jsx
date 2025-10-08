import React, { useState, useEffect } from "react";
import { Button, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useFormState } from "react-hook-form";
import { PersonAdd } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "../../hooks/use-settings";
import { ApiPostCall } from "../../api/ApiCall";

export const CippAddContactDrawer = ({
  buttonText = "Add Contact",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      firstName: "",
      lastName: "",
      email: "",
      hidefromGAL: false,
      streetAddress: "",
      postalCode: "",
      city: "",
      state: "",
      country: "",
      companyName: "",
      mobilePhone: "",
      businessPhone: "",
      jobTitle: "",
      website: "",
      mailTip: "",
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  const addContact = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`Contacts-${tenantDomain}`],
  });

  // Reset form fields on successful creation
  useEffect(() => {
    if (addContact.isSuccess) {
      formControl.reset({
        displayName: "",
        firstName: "",
        lastName: "",
        email: "",
        hidefromGAL: false,
        streetAddress: "",
        postalCode: "",
        city: "",
        state: "",
        country: "",
        companyName: "",
        mobilePhone: "",
        businessPhone: "",
        jobTitle: "",
        website: "",
        mailTip: "",
      });
    }
  }, [addContact.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }

    const formData = formControl.getValues();
    const shippedValues = {
      tenantID: tenantDomain,
      DisplayName: formData.displayName,
      hidefromGAL: formData.hidefromGAL,
      email: formData.email,
      FirstName: formData.firstName,
      LastName: formData.lastName,
      Title: formData.jobTitle,
      StreetAddress: formData.streetAddress,
      PostalCode: formData.postalCode,
      City: formData.city,
      State: formData.state,
      CountryOrRegion: formData.country?.value || formData.country,
      Company: formData.companyName,
      mobilePhone: formData.mobilePhone,
      phone: formData.businessPhone,
      website: formData.website,
      mailTip: formData.mailTip,
    };

    addContact.mutate({
      url: "/api/AddContact",
      data: shippedValues,
      relatedQueryKeys: [`Contacts-${tenantDomain}`],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      displayName: "",
      firstName: "",
      lastName: "",
      email: "",
      hidefromGAL: false,
      streetAddress: "",
      postalCode: "",
      city: "",
      state: "",
      country: "",
      companyName: "",
      mobilePhone: "",
      businessPhone: "",
      jobTitle: "",
      website: "",
      mailTip: "",
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<PersonAdd />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Contact"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={addContact.isLoading || !isValid}
            >
              {addContact.isLoading
                ? "Creating..."
                : addContact.isSuccess
                ? "Create Another"
                : "Create Contact"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
      >
        <Grid container spacing={2}>
          {/* Display Name */}
          <Grid size={{ md: 10, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Display Name"
              name="displayName"
              formControl={formControl}
              validators={{ required: "Display Name is required" }}
            />
          </Grid>

          {/* First Name and Last Name */}
          <Grid size={{ md: 5, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="First Name"
              name="firstName"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 5, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Last Name"
              name="lastName"
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Email */}
          <Grid size={{ md: 8, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Email"
              name="email"
              formControl={formControl}
              validators={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              }}
            />
          </Grid>

          {/* Hide from GAL */}
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Hide from Global Address List"
              name="hidefromGAL"
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Additional Contact Information */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Job Title"
              name="jobTitle"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Company Name"
              name="companyName"
              formControl={formControl}
            />
          </Grid>

          {/* Phone Numbers */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Mobile Phone"
              name="mobilePhone"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Business Phone"
              name="businessPhone"
              formControl={formControl}
            />
          </Grid>

          {/* Address Information */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Street Address"
              name="streetAddress"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="City"
              name="city"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="State"
              name="state"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Postal Code"
              name="postalCode"
              formControl={formControl}
            />
          </Grid>

          {/* Website and Mail Tip */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Website"
              name="website"
              formControl={formControl}
            />
          </Grid>
          {/* Website and Mail Tip */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Mail Tip"
              name="mailTip"
              multiline
              rows={3}
              formControl={formControl}
            />
          </Grid>

          <CippApiResults apiObject={addContact} />
        </Grid>
      </CippOffCanvas>
    </>
  );
};
