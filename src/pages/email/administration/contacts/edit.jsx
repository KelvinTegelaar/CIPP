import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Grid, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall } from "../../../../api/ApiCall";

const EditContact = () => {
  const tenantDomain = useSettings().currentTenant;
  const router = useRouter();
  const { id } = router.query;

  const contactInfo = ApiGetCall({
    url: `/api/ListContacts?tenantFilter=${tenantDomain}&id=${id}`,
    queryKey: `ListContacts-${id}`,
    waiting: false,
  });

  useEffect(() => {
    if (id) {
      contactInfo.refetch();
    }
  }, [router.query, id, tenantDomain]);

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
      country: "",
      companyName: "",
      mobilePhone: "",
      businessPhone: "",
      jobTitle: "",
    },
  });

  useEffect(() => {
    if (contactInfo.isSuccess && contactInfo.data?.Results?.[0]) {
      const contact = contactInfo.data.Results[0];
      formControl.reset({
        displayName: contact.displayName || "",
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.mail || "",
        hidefromGAL: contact.hidefromGAL || false,
        streetAddress: contact.streetAddress || "",
        postalCode: contact.postalCode || "",
        city: contact.city || "",
        country: contact.countryOrRegion || "",
        companyName: contact.companyName || "",
        mobilePhone: contact.mobilePhone || "",
        businessPhone: contact.phone || "",
        jobTitle: contact.jobTitle || "",
      });
    }
  }, [contactInfo.isSuccess, contactInfo.data, contactInfo.isFetching]);

  if (contactInfo.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`ListContacts-${id}`}
      title={`Contact: ${contactInfo.data?.Results?.[0]?.displayName || ""}`}
      backButtonTitle="Contacts Overview"
      postUrl="/api/EditContact"
      customDataformatter={(values) => {
        return {
          tenantID: tenantDomain,
          firstName: values.firstName,
          lastName: values.lastName,
          displayName: values.displayName,
          mail: values.email,
          hidefromGAL: values.hidefromGAL,
          ContactID: contactInfo.data?.Results?.[0]?.id,
          StreetAddress: values.streetAddress,
          PostalCode: values.postalCode,
          City: values.city,
          Country: values.country,
          companyName: values.companyName,
          MobilePhone: values.mobilePhone,
          BusinessPhone: values.businessPhone,
          jobTitle: values.jobTitle,
        };
      }}
    >
      <Grid container spacing={2}>
        {/* Display Name */}
        <Grid item xs={12} md={10}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        {/* First Name and Last Name */}
        <Grid item xs={12} md={5}>
          <CippFormComponent
            type="textField"
            label="First Name"
            name="firstName"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <CippFormComponent
            type="textField"
            label="Last Name"
            name="lastName"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Email */}
        <Grid item xs={12} md={8}>
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
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="switch"
            label="Hide from Global Address List"
            name="hidefromGAL"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Company Name"
            name="companyName"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Job Title"
            name="jobTitle"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Address Information */}
        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="textField"
            label="Street Address"
            name="streetAddress"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CippFormComponent type="textField" label="City" name="city" formControl={formControl} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="textField"
            label="Postal Code"
            name="postalCode"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CippFormComponent
            type="textField"
            label="Country"
            name="country"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Phone Numbers */}
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Mobile Phone"
            name="mobilePhone"
            formControl={formControl}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CippFormComponent
            type="textField"
            label="Business Phone"
            name="businessPhone"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

EditContact.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditContact;
