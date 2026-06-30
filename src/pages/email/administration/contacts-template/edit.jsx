import { useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormSkeleton from "../../../../components/CippFormPages/CippFormSkeleton";
import ContactFormLayout from "../../../../components/CippFormPages/CippAddEditContact";
import { ApiGetCall } from "../../../../api/ApiCall";
import countryList from "../../../../data/countryList.json";
import { useRouter } from "next/router";

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

    // The template is stored as a flat object (see Invoke-AddContactTemplates), so read the
    // fields directly rather than treating it as a Microsoft Graph contact.
    const countryEntry = contact.country
      ? countryList.find((c) => c.Code === contact.country || c.Name === contact.country)
      : null;

    return {
      ContactTemplateID: id || "",
      displayName: contact.displayName || "",
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      hidefromGAL: contact.hidefromGAL || false,
      streetAddress: contact.streetAddress || "",
      postalCode: contact.postalCode || "",
      city: contact.city || "",
      state: contact.state || "",
      country: countryEntry ? { label: countryEntry.Name, value: countryEntry.Code } : "",
      companyName: contact.companyName || "",
      mobilePhone: contact.mobilePhone || "",
      businessPhone: contact.businessPhone || "",
      jobTitle: contact.jobTitle || "",
      website: contact.website || "",
      mailTip: contact.mailTip || "",
    };
  }, [contactTemplateInfo.isSuccess, contactTemplateInfo.data, id]);

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
      return {
        ContactTemplateID: id,
        displayName: values.displayName,
        hidefromGAL: values.hidefromGAL,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        jobTitle: values.jobTitle,
        streetAddress: values.streetAddress,
        postalCode: values.postalCode,
        city: values.city,
        state: values.state,
        country: values.country?.value || values.country,
        companyName: values.companyName,
        mobilePhone: values.mobilePhone,
        businessPhone: values.businessPhone,
        website: values.website,
        mailTip: values.mailTip,
      };
    },
    [id]
  );

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
