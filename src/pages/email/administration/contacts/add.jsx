import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import ContactFormLayout from "/src/components/CippFormPages/CIPPAddEditContact";
import { useSettings } from "../../../../hooks/use-settings";

const AddContact = () => {
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

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="AddContact"
      title="Add Contact"
      backButtonTitle="Contacts Overview"
      postUrl="/api/AddContact"
      resetForm={true}
      customDataformatter={(values) => {
        return {
          tenantID: tenantDomain,
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
      }}
    >
      <ContactFormLayout 
        formControl={formControl} 
      />
    </CippFormPage>
  );
};

AddContact.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddContact;
