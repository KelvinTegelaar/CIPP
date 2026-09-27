import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import CippTablePage from "../../../../components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import Link from "next/link";
import { useCippUserActions } from "../../../../components/CippComponents/CippUserActions.jsx";

// Access and account controls that matter for temporary admin accounts after creation.
// Full user actions (mailbox, OneDrive, licenses, etc.) stay on the Users page.
const JIT_ADMIN_ACTION_LABELS = new Set([
  "Create Temporary Access Pass",
  "Re-require MFA registration",
  "Set Per-User MFA",
  "Set Sign In State",
  "Reset Password",
  "Require Password Change at Next Logon",
  "Revoke all user sessions",
]);

const Page = () => {
  const actions = useCippUserActions()
    .filter((action) => JIT_ADMIN_ACTION_LABELS.has(action.label))
    .map((action) =>
      action.label === "Create Temporary Access Pass" ? { ...action, pinned: true } : action
    );

  const simpleColumns = [
    "userPrincipalName",
    "displayName",
    "accountEnabled",
    "jitAdminEnabled",
    "jitAdminStartDate",
    "jitAdminExpiration",
    "jitAdminReason",
    "jitAdminCreatedBy",
    "memberOf",
  ];

  const filters = [
    {
      filterName: "Active JIT Admins",
      value: [{ id: "jitAdminEnabled", value: true }],
      type: "column",
    },
    {
      filterName: "Expired/Disabled",
      value: [{ id: "jitAdminEnabled", value: false }],
      type: "column",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "id",
      "userPrincipalName",
      "displayName",
      "accountEnabled",
      "jitAdminEnabled",
      "jitAdminStartDate",
      "jitAdminExpiration",
      "jitAdminReason",
      "jitAdminCreatedBy",
      "memberOf",
    ],
    actions,
  };

  return (
    <CippTablePage
      cardButton={
        <>
          <Button component={Link} href="jit-admin/add" startIcon={<CippIcons.AdminPanelSettings />}>
            Add JIT Admin
          </Button>
        </>
      }
      title="JIT Admins"
      apiUrl="/api/ListJITAdmin"
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      filters={filters}
      actions={actions}
      offCanvas={offCanvas}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
