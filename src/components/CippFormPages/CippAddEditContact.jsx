import { Divider } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { getCippValidator } from "../../utils/get-cipp-validator";
import countryList from "../../data/countryList.json";

const countryOptions = countryList.map(({ Code, Name }) => ({
  label: Name,
  value: Code,
}));

const ContactFormLayout = ({ formControl, formType = "add" }) => {
  return (
    <Grid container spacing={2}>
      {/* Display Name */}
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Display Name *"
          name="displayName"
          disabled={formType === "edit"}
          formControl={formControl}
          validators={{ required: "Display Name is required" }}
        />
      </Grid>

      {/* First Name and Last Name */}
      <Grid size={{ md: 6, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="First Name"
          name="firstName"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
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

      {/* Website */}
      <Grid size={{ md: 12, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Website"
          name="website"
          formControl={formControl}
          validators={{
            validate: (value) => !value || getCippValidator(value, "url"),
          }}
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
      <Grid size={{ md: 3, xs: 12 }}>
        <CippFormComponent 
          type="textField" 
          label="City" 
          name="city" 
          formControl={formControl} 
        />
      </Grid>
      <Grid size={{ md: 3, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="State/Province"
          name="state"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 3, xs: 12 }}>
        <CippFormComponent
          type="textField"
          label="Postal Code"
          name="postalCode"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ md: 3, xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          label="Country"
          name="country"
          multiple={false}
          creatable={false}
          options={countryOptions}
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

      <Divider sx={{ my: 2, width: "100%" }} />

      {/* Mail Tip */}
      <Grid size={{ md: 12, xs: 12 }}>
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
  );
};

export default ContactFormLayout;
