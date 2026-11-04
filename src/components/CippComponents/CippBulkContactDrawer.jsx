import { Button } from "@mui/material";
import { CippBulkDrawer } from "./CippBulkDrawer";
import { useSettings } from "../../hooks/use-settings";
import { getCippValidator } from "../../utils/get-cipp-validator";

// CSV cells arrive as strings; send a real boolean so the backend never has to interpret "false".
const truthy = (value) => ["true", "1", "yes"].includes(String(value ?? "").trim().toLowerCase());

const fields = [
  "displayName",
  "firstName",
  "lastName",
  "email",
  "hidefromGAL",
  "jobTitle",
  "companyName",
  "mobilePhone",
  "businessPhone",
  "streetAddress",
  "city",
  "state",
  "postalCode",
  "country",
  "website",
  "mailTip",
];

// Two sample rows in the same column order as `fields`, so the download shows what each column
// expects, including true/false for hidefromGAL. Values must stay free of commas and quotes.
const exampleRows = [
  [
    "Jane Doe",
    "Jane",
    "Doe",
    "jane.doe@example.com",
    "false",
    "Account Manager",
    "Contoso Ltd",
    "+1 555 0100",
    "+1 555 0101",
    "1 Main Street",
    "Seattle",
    "WA",
    "98101",
    "United States",
    "https://www.contoso.com",
    "Replies within one business day",
  ],
  [
    "Supplier Helpdesk",
    "",
    "",
    "helpdesk@example.com",
    "true",
    "",
    "Fabrikam",
    "",
    "+1 555 0200",
    "",
    "",
    "",
    "",
    "",
    "",
    "Hidden from the address book",
  ],
];

const fieldValidators = {
  displayName: { required: "Display Name is required" },
  email: {
    required: "Email is required",
    validate: (value) => getCippValidator(value, "email"),
  },
};

// Same payload as CippAddContactDrawer, one request per row.
const toPayload = (row, tenantDomain) => ({
  tenantID: tenantDomain,
  DisplayName: row.displayName,
  FirstName: row.firstName,
  LastName: row.lastName,
  email: row.email,
  hidefromGAL: truthy(row.hidefromGAL),
  Title: row.jobTitle,
  Company: row.companyName,
  mobilePhone: row.mobilePhone,
  phone: row.businessPhone,
  StreetAddress: row.streetAddress,
  City: row.city,
  State: row.state,
  PostalCode: row.postalCode,
  CountryOrRegion: row.country,
  website: row.website,
  mailTip: row.mailTip,
});

export const CippBulkContactDrawer = ({
  buttonText = "Bulk Add Contacts",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const tenantDomain = useSettings().currentTenant;
  return (
    <CippBulkDrawer
      title="Bulk Add Contacts"
      buttonText={buttonText}
      requiredPermissions={requiredPermissions}
      PermissionButton={PermissionButton}
      itemLabel="Contact"
      fields={fields}
      exampleRows={exampleRows}
      csvFileName="BulkContacts.csv"
      fieldValidators={fieldValidators}
      fieldTypes={{ hidefromGAL: "switch" }}
      invalidRowMessage="missing a display name or a valid email address"
      toPayload={toPayload}
      url="/api/AddContact"
      relatedQueryKeys={[`Contacts - ${tenantDomain}`]}
    />
  );
};
