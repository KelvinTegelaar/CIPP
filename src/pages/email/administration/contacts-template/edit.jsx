import { useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import ContactFormLayout from "../../../../components/CippFormPages/CippAddEditContact";
import { ApiGetCall } from "../../../../api/ApiCall";
import countryList from "../../../../data/countryList.json";
import { useRouter } from "next/router";

const countryLookup = new Map(countryList.map((country) => [country.Name, country.Code]));

const EditContactTemplate = () => {
  const router = useRouter();
  const { id } = router.query;

  const contactTemplateInfo = ApiGetCall({
    url: `/api/ListContactTemplates?id=${id}`,
    queryKey: `ListContactTemplates-${id}`,
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
    if (!contactTemplateInfo.isSuccess || !contactTemplateInfo.data) {
      return null;
    }

    // Handle both single object (when fetching by ID) and array responses
    const contact = Array.isArray(contactTemplateInfo.data)
      ? contactTemplateInfo.data[0]
      : contactTemplateInfo.data;
    const address = contact.addresses?.[0] || {};
    const phones = contact.phones || [];

    // Use Map for O(1) phone lookup
    const phoneMap = new Map(phones.map((p) => [p.type, p.number]));

    return {
      ContactTemplateID: id || "",
      displayName: contact.displayName || "",
      firstName: contact.givenName || "",
      lastName: contact.surname || "",
      email: contact.email || "",
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
  }, [contactTemplateInfo.isSuccess, contactTemplateInfo.data]);

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
  const customDataFormatter = useCallback((values) => {
    return {
      ContactTemplateID: id,
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
  });

  const contactTemplate = Array.isArray(contactTemplateInfo.data)
    ? contactTemplateInfo.data[0]
    : contactTemplateInfo.data;

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`ListContactTemplates-${id}`}
      title={`Contact Template: ${contactTemplateInfo?.displayName || ""}`}
      backButtonTitle="Contact Templates"
      formPageType="Edit"
      postUrl="/api/EditContactTemplates"
      data={contactTemplate}
      customDataformatter={customDataFormatter}
    >
      {contactTemplateInfo.isLoading && <CippFormSkeleton layout={[2, 2, 1, 2, 1, 2, 2, 2, 4]} />}
      {!contactTemplateInfo.isLoading && (
        <ContactFormLayout formControl={formControl} formType="edit" />
      )}
    </CippFormPage>
  );
};

EditContactTemplate.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditContactTemplate;
