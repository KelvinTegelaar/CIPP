import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Block } from "@mui/icons-material";

const Page = () => {
  return (
    <CippTablePage
      title="Shared Mailbox with Enabled Account"
      apiUrl="/api/ListSharedMailboxAccountEnabled"
      actions={[
        {
          label: "Block Sign In",
          type: "POST",
          icon: <Block />,
          url: "/api/ExecDisableUser",
          data: { ID: "id" },
          confirmText: "Are you sure you want to block the sign-in for this mailbox?",
          condition: (row) => row.accountEnabled && !row.onPremisesSyncEnabled,
        },
      ]}
      offCanvas={{
        extendedInfoFields: [
          "UserPrincipalName",
          "displayName",
          "accountEnabled",
          "assignedLicenses",
          "onPremisesSyncEnabled",
        ],
      }}
      simpleColumns={[
        "UserPrincipalName",
        "displayName",
        "accountEnabled",
        "assignedLicenses",
        "onPremisesSyncEnabled",
      ]}
      filters={[
        {
          id: "accountEnabled",
          value: "Yes"
        }
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
