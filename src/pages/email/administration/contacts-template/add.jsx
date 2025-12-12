import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import ContactFormLayout from "/src/components/CippFormPages/CippAddEditContact";

const AddContactTemplates = () => {

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
      queryKey="AddContactTemplates"
      title="Add Contact Template"
      backButtonTitle="Contact Templates"
      postUrl="/api/AddContactTemplates"
      resetForm={true}
      customDataformatter={(values) => {
        return {
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

AddContactTemplates.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddContactTemplates;
