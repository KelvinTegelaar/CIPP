import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import ContactFormLayout from "../../../../components/CippFormPages/CippAddEditContact";

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
