import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall } from "../../../../api/ApiCall";
import countryList from "/src/data/countryList.json";

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
    if (contactInfo.isSuccess && contactInfo.data?.[0]) {
      const contact = contactInfo.data[0];
      // Get the address info from the first address entry
      const address = contact.addresses?.[0] || {};

      // Find phone numbers by type
      const phones = contact.phones || [];
      const mobilePhone = phones.find((p) => p.type === "mobile")?.number;
      const businessPhone = phones.find((p) => p.type === "business")?.number;

      formControl.reset({
        displayName: contact.displayName || "",
        firstName: contact.givenName || "",
        lastName: contact.surname || "",
        email: contact.mail || "",
        hidefromGAL: contact.hidefromGAL || false,
        streetAddress: address.street || "",
        postalCode: address.postalCode || "",
        city: address.city || "",
        country: address.countryOrRegion
          ? countryList.find((c) => c.Name === address.countryOrRegion)?.Code || ""
          : "",
        companyName: contact.companyName || "",
        mobilePhone: mobilePhone || "",
        businessPhone: businessPhone || "",
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
      title={`Contact: ${contactInfo.data?.[0]?.displayName || ""}`}
      backButtonTitle="Contacts Overview"
      formPageType="Edit"
      postUrl="/api/EditContact"
      data={contactInfo.data?.[0]}
      customDataformatter={(values) => {
        return {
          tenantID: tenantDomain,
          ContactID: contactInfo.data?.[0]?.id,
          DisplayName: values.displayName,
          hidefromGAL: values.hidefromGAL,
          email: values.email,
          FirstName: values.firstName,
          LastName: values.lastName,
          Title: values.jobTitle,
          StreetAddress: values.streetAddress,
          PostalCode: values.postalCode,
          City: values.city,
          CountryOrRegion: values.country?.value || values.country,
          Company: values.companyName,
          mobilePhone: values.mobilePhone,
          phone: values.businessPhone,
        };
      }}
    >
      <Grid container spacing={2}>
        {/* Display Name */}
        <Grid item size={{ md: 10, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Display Name"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        {/* First Name and Last Name */}
        <Grid item size={{ md: 5, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="First Name"
            name="firstName"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 5, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Last Name"
            name="lastName"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Email */}
        <Grid item size={{ md: 8, xs: 12 }}>
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
        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Hidden from Global Address List"
            name="hidefromGAL"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Company Information */}
        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Company Name"
            name="companyName"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Job Title"
            name="jobTitle"
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Address Information */}
        <Grid item size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Street Address"
            name="streetAddress"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent type="textField" label="City" name="city" formControl={formControl} />
        </Grid>
        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Postal Code"
            name="postalCode"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 4, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Country"
            name="country"
            multiple={false}
            creatable={false}
            options={countryList.map(({ Code, Name }) => ({
              label: Name,
              value: Code,
            }))}
            formControl={formControl}
          />
        </Grid>

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Phone Numbers */}
        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Mobile Phone"
            name="mobilePhone"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 6, xs: 12 }}>
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
