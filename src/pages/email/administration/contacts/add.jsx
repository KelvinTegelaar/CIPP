import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";
import countryList from "/src/data/countryList.json";

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
      <Grid container spacing={2}>
        {/* Display Name */}
        <Grid item size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Display Name *"
            name="displayName"
            formControl={formControl}
            validators={{ required: "Display Name is required" }}
          />
        </Grid>

        {/* First Name and Last Name */}
        <Grid item size={{ md: 6, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="First Name"
            name="firstName"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 6, xs: 12 }}>
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
            label="Email *"
            name="email"
            formControl={formControl}
            validators={{
              required: "Email is required",
              validate: (value) => getCippValidator(value, "email"),
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

        {/* Website */}
        <Grid item size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Website"
            name="website"
            formControl={formControl}
            validators={{
              validate: (value) => getCippValidator(value, "url"),
            }}
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
        <Grid item size={{ md: 3, xs: 12 }}>
          <CippFormComponent 
            type="textField" 
            label="City" 
            name="city" 
            formControl={formControl} 
          />
        </Grid>
        <Grid item size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="State/Province"
            name="state"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Postal Code"
            name="postalCode"
            formControl={formControl}
          />
        </Grid>
        <Grid item size={{ md: 3, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            label="Country"
            name="country"
            multiple={false}
            creatable={false}
            labelField="Name"
            options={countryList.map(({ Code, Name }) => ({
              labelField: Name,
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

        <Divider sx={{ my: 2, width: "100%" }} />

        {/* Mail Tip */}
        <Grid item size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="textField"
            label="Mail Tip"
            name="mailTip"
            formControl={formControl}
            multiline={true}
            rows={3}
            validators={{
              maxLength: {
                value: 175,
                message: "Mail tip cannot exceed 175 characters",
              },
            }}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

AddContact.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddContact;
