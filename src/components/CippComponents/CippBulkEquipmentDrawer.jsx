import { Button } from "@mui/material";
import { CippBulkDrawer, trimmedFields } from "./CippBulkDrawer";
import { CippFormDomainSelector } from "./CippFormDomainSelector";
import { useSettings } from "../../hooks/use-settings";

const fields = ["displayName", "username", "domain"];

const exampleRows = [
  ["Projector 1", "projector1", "contoso.onmicrosoft.com"],
  ["Pool Car", "poolcar", "contoso.onmicrosoft.com"],
];

const fieldValidators = {
  displayName: { required: "Display Name is required" },
  username: { required: "Username is required" },
  domain: { required: "Domain is required" },
};

// Same payload as CippAddEquipmentDrawer, one request per row.
const toPayload = (row, tenantDomain) => {
  const { displayName, username, domain } = trimmedFields(row, fields);
  return { tenantID: tenantDomain, domain, displayName, username, userPrincipalName: `${username}@${domain}` };
};

export const CippBulkEquipmentDrawer = ({
  buttonText = "Bulk Add Equipment",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const tenantDomain = useSettings().currentTenant;
  return (
    <CippBulkDrawer
      title="Bulk Add Equipment"
      buttonText={buttonText}
      requiredPermissions={requiredPermissions}
      PermissionButton={PermissionButton}
      itemLabel="Equipment Mailbox"
      itemLabelPlural="Equipment Mailboxes"
      fields={fields}
      exampleRows={exampleRows}
      csvFileName="BulkEquipment.csv"
      fieldValidators={fieldValidators}
      fieldTypes={{ domain: CippFormDomainSelector }}
      invalidRowMessage="missing a display name, username or domain"
      toPayload={toPayload}
      url="/api/AddEquipmentMailbox"
      relatedQueryKeys={[`Equipment - ${tenantDomain}`]}
    />
  );
};
