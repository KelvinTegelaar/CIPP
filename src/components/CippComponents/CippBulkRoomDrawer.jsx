import { Button } from "@mui/material";
import { CippBulkDrawer, trimmedFields } from "./CippBulkDrawer";
import { CippFormDomainSelector } from "./CippFormDomainSelector";
import { useSettings } from "../../hooks/use-settings";

const fields = ["displayName", "username", "domain", "resourceCapacity"];

const exampleRows = [
  ["Boardroom", "boardroom", "contoso.onmicrosoft.com", "12"],
  ["Huddle Room 1", "huddle1", "contoso.onmicrosoft.com", ""],
];

const fieldValidators = {
  displayName: { required: "Display Name is required" },
  username: { required: "Username is required" },
  domain: { required: "Domain is required" },
  resourceCapacity: {
    validate: (value) =>
      !String(value ?? "").trim() ||
      /^\d+$/.test(String(value).trim()) ||
      "Resource Capacity must be a whole number",
  },
};

// Same payload as CippAddRoomDrawer, one request per row.
const toPayload = (row, tenantDomain) => {
  const { displayName, username, domain, resourceCapacity } = trimmedFields(row, fields);
  const payload = { tenantID: tenantDomain, domain, displayName, username, userPrincipalName: `${username}@${domain}` };
  if (resourceCapacity) payload.resourceCapacity = resourceCapacity;
  return payload;
};

export const CippBulkRoomDrawer = ({
  buttonText = "Bulk Add Rooms",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const tenantDomain = useSettings().currentTenant;
  return (
    <CippBulkDrawer
      title="Bulk Add Rooms"
      buttonText={buttonText}
      requiredPermissions={requiredPermissions}
      PermissionButton={PermissionButton}
      itemLabel="Room"
      fields={fields}
      exampleRows={exampleRows}
      csvFileName="BulkRooms.csv"
      fieldValidators={fieldValidators}
      fieldTypes={{ domain: CippFormDomainSelector }}
      invalidRowMessage="missing a display name, username or domain, or has a resource capacity that is not a whole number"
      toPayload={toPayload}
      url="/api/AddRoomMailbox"
      relatedQueryKeys={[`Rooms - ${tenantDomain}`]}
    />
  );
};
