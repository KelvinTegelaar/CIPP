import { useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import ContactFormLayout from "/src/components/CippFormPages/CippAddEditContact";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall } from "../../../../api/ApiCall";
import countryList from "/src/data/countryList.json";

const countryLookup = new Map(
  countryList.map(country => [country.Name, country.Code])
);

const EditContact = () => {
  const tenantDomain = useSettings().currentTenant;
  const router = useRouter();
  const { id } = router.query;
  
  const contactInfo = ApiGetCall({
    url: `/api/ListContacts?tenantFilter=${tenantDomain}&id=${id}`,
    queryKey: `ListContacts-${id}`,
    waiting: !!id,
  });

  const defaultFormValues = useMemo(() => ({
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
  }), []);

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
    const phoneMap = new Map(phones.map(p => [p.type, p.number]));

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
      country: address.countryOrRegion 
        ? countryLookup.get(address.countryOrRegion) || ""
        : "",
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
  const customDataFormatter = useCallback((values) => {
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
  }, [tenantDomain, contactInfo.data]);
  
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
      <ContactFormLayout 
        formControl={formControl} 
      />
    </CippFormPage>
  );
};

EditContact.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditContact;
