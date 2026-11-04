import { Button } from "@mui/material";
import { CippBulkDrawer, trimmedFields } from "./CippBulkDrawer";
import { CippFormDomainSelector } from "./CippFormDomainSelector";
import { useSettings } from "../../hooks/use-settings";

const fields = ["displayName", "username", "domain"];

const exampleRows = [
  ["Sales", "sales", "contoso.onmicrosoft.com"],
  ["Support Desk", "support", "contoso.onmicrosoft.com"],
];

const fieldValidators = {
  displayName: { required: "Display Name is required" },
  username: { required: "Username is required" },
  domain: { required: "Domain is required" },
};

// Same payload as CippSharedMailboxDrawer, one request per row.
const toPayload = (row, tenantDomain) => ({
  tenantID: tenantDomain,
  ...trimmedFields(row, fields),
});

export const CippBulkSharedMailboxDrawer = ({
  buttonText = "Bulk Add Shared Mailboxes",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const tenantDomain = useSettings().currentTenant;
  return (
    <CippBulkDrawer
      title="Bulk Add Shared Mailboxes"
      buttonText={buttonText}
      requiredPermissions={requiredPermissions}
      PermissionButton={PermissionButton}
      itemLabel="Shared Mailbox"
      itemLabelPlural="Shared Mailboxes"
      fields={fields}
      exampleRows={exampleRows}
      csvFileName="BulkSharedMailboxes.csv"
      fieldValidators={fieldValidators}
      fieldTypes={{ domain: CippFormDomainSelector }}
      invalidRowMessage="missing a display name, username or domain"
      toPayload={toPayload}
      url="/api/AddSharedMailbox"
      // The Mailboxes table is keyed by useCippReportDB as ListMailboxes-<tenant>-<cached>; both
      // modes are invalidated so whichever is showing refetches.
      relatedQueryKeys={[
        `ListMailboxes-${tenantDomain}-true`,
        `ListMailboxes-${tenantDomain}-false`,
      ]}
      // The Mailboxes page supports All Tenants, where no tenant resolves for the create.
      singleTenantOnly
    />
  );
};
