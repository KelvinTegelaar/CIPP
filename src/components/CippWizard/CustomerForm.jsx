import { Grid } from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";

export const CustomerForm = (props) => {
  const { formControl } = props;

  const fields = [
    { name: "Domain", label: "Domain", type: "textField", required: true },
    { name: "CompanyName", label: "Company Name", type: "textField", required: true },
    { name: "FirstName", label: "First Name", type: "textField", required: true },
    { name: "LastName", label: "Last Name", type: "textField", required: true },
    { name: "Email", label: "Email", type: "email", required: true },
    { name: "PhoneNumber", label: "Phone Number", type: "textField", required: true },
    { name: "Country", label: "Country", type: "textField", required: true },
    { name: "City", label: "City", type: "textField", required: true },
    { name: "State", label: "State", type: "textField", required: true },
    { name: "AddressLine1", label: "Address Line 1", type: "textField", required: true },
    { name: "AddressLine2", label: "Address Line 2", type: "textField", required: false },
    { name: "PostalCode", label: "Postal Code", type: "textField", required: true },
  ];

  const transformPayload = (formData) => {
    const payload = {
      enableGDAPByDefault: false,
      Id: null,
      CommerceId: null,
      CompanyProfile: {
        TenantId: null,
        Domain: formData.Domain,
        CompanyName: formData.CompanyName,
        Attributes: { ObjectType: "CustomerCompanyProfile" },
      },
      BillingProfile: {
        Id: null,
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        Email: formData.Email,
        Culture: "EN-US",
        Language: "En",
        CompanyName: formData.CompanyName,
        DefaultAddress: {
          Country: formData.Country,
          Region: null,
          City: formData.City,
          State: formData.State,
          AddressLine1: formData.AddressLine1,
          AddressLine2: formData.AddressLine2,
          PostalCode: formData.PostalCode,
          FirstName: formData.FirstName,
          LastName: formData.LastName,
          PhoneNumber: formData.PhoneNumber,
        },
        Attributes: { ObjectType: "CustomerBillingProfile" },
      },
      RelationshipToPartner: "none",
      AllowDelegatedAccess: null,
      UserCredentials: null,
      CustomDomains: null,
      Attributes: { ObjectType: "Customer" },
    };

    if (formData.ResellerType === "Tier2" && associatedPartnerId) {
      payload.AssociatedPartnerId = associatedPartnerId;
    }

    return payload;
  };

  return (
    <Grid container spacing={3}>
      {fields.map((field, index) => (
        <Grid item xs={12} md={6} key={index}>
          <CippFormComponent
            type={field.type}
            label={field.label}
            name={field.name}
            required={field.required}
            formControl={formControl} // Use shared formControl
            fullWidth
          />
        </Grid>
      ))}
    </Grid>
  );
};
