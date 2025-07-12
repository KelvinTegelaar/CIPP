import { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall } from "../../../../api/ApiCall";
import countryList from "/src/data/countryList.json";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Divider } from "@mui/material";

const countryLookup = new Map(countryList.map((country) => [country.Name, country.Code]));

const EditContact = () => {
  const tenantDomain = useSettings().currentTenant;
  const router = useRouter();
  const { id } = router.query;

  const contactInfo = ApiGetCall({
    url: `/api/ListContacts?tenantFilter=${tenantDomain}&id=${id}`,
    queryKey: `ListContacts-${id}`,
    waiting: !!id,
  });

  const defaultFormValues = useMemo(
    () => ({
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
    }),
    []
  );

  const formControl = useForm({
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  // Memoize processed contact data
  const processedContactData = useMemo(() => {
    if (!contactInfo.isSuccess || !contactInfo.data) {
      return null;
    }

    const contact = contactInfo.data;
    const address = contact.addresses?.[0] || {};
    const phones = contact.phones || [];

    // Use Map for O(1) phone lookup
    const phoneMap = new Map(phones.map((p) => [p.type, p.number]));

    return {
      displayName: contact.displayName || "",
      firstName: contact.givenName || "",
      lastName: contact.surname || "",
      email: contact.mail || "",
      hidefromGAL: contact.hidefromGAL || false,
      streetAddress: address.street || "",
      postalCode: address.postalCode || "",
      city: address.city || "",
      state: address.state || "",
      country: address.countryOrRegion ? countryLookup.get(address.countryOrRegion) || "" : "",
      companyName: contact.companyName || "",
      mobilePhone: phoneMap.get("mobile") || "",
      businessPhone: phoneMap.get("business") || "",
      jobTitle: contact.jobTitle || "",
      website: contact.website || "",
      mailTip: contact.mailTip || "",
    };
  }, [contactInfo.isSuccess, contactInfo.data]);

  // Use callback to prevent unnecessary re-renders
  const resetForm = useCallback(() => {
    if (processedContactData) {
      formControl.reset(processedContactData);
    }
  }, [processedContactData, formControl]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  // Memoize custom data formatter
  const customDataFormatter = useCallback(
    (values) => {
      const contact = Array.isArray(contactInfo.data) ? contactInfo.data[0] : contactInfo.data;
      return {
        tenantID: tenantDomain,
        ContactID: contact?.id,
        DisplayName: values.displayName,
        hidefromGAL: values.hidefromGAL,
        email: values.email,
        FirstName: values.firstName,
        LastName: values.lastName,
        Title: values.jobTitle,
        StreetAddress: values.streetAddress,
        PostalCode: values.postalCode,
        City: values.city,
        State: values.state,
        CountryOrRegion: values.country?.value || values.country,
        Company: values.companyName,
        mobilePhone: values.mobilePhone,
        phone: values.businessPhone,
        website: values.website,
        mailTip: values.mailTip,
      };
    },
    [tenantDomain, contactInfo.data]
  );

  const contact = Array.isArray(contactInfo.data) ? contactInfo.data[0] : contactInfo.data;

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`ListContacts-${id}`}
      title={`Contact: ${contact?.displayName || ""}`}
      backButtonTitle="Contacts Overview"
      formPageType="Edit"
      postUrl="/api/EditContact"
      data={contact}
      customDataformatter={customDataFormatter}
    >
      {contactInfo.isLoading && <CippFormSkeleton layout={[2, 2, 1, 2, 1, 2, 2, 2, 4]} />}
      {!contactInfo.isLoading && (
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
              label="Hidden from Global Address List"
              name="hidefromGAL"
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Company Information */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Company Name"
              name="companyName"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Job Title"
              name="jobTitle"
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

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
              label="Postal Code"
              name="postalCode"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
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
        </Grid>
      )}
    </CippFormPage>
  );
};

EditContact.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditContact;
