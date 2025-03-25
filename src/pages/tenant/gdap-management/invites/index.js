import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

const pageTitle = "GDAP Invites";
const simpleColumns = ["Timestamp", "RowKey", "InviteUrl", "OnboardingUrl", "RoleMappings"];
const apiUrl = "/api/ListGDAPInvite";

const actions = [
  {
    label: "Delete Invite",
    url: "/api/ExecGDAPInvite",
    type: "POST",
    icon: <TrashIcon />,
    confirmText:
      "Are you sure you want to delete this invite? This only removes the entry from the database, GDAP relationships cannot be terminated once they are in approval pending status.",
    data: {
      Action: "Delete",
      InviteId: "RowKey",
    },
  },
];

const Page = () => {
  return (
    <CippTablePage
      cardButton={
        <Button component={Link} href="/tenant/gdap-management/invites/add" startIcon={<Add />}>
          New Invite
        </Button>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={simpleColumns}
      actions={actions}
      tenantInTitle={false}
      queryKey="ListGDAPInvite"
      maxHeightOffset="460px"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
