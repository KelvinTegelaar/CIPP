import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Block } from "@mui/icons-material";

/* 
  NOTE for Devs:
  - The original component used a Redux selector (`useSelector`) for tenant data, 
    which is handled by `CippTablePage` in the refactored version, thus eliminating `useSelector`.
  - The `ModalService` with `confirm` handling was originally used to confirm blocking sign-in.
    The action here replaces it with a confirmation text as per current guidelines.
  - Original button and `FontAwesomeIcon` (faBan) are not used since action confirmation is handled by CippTablePage.
*/

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
          confirmText: "Are you sure you want to block the sign-in for this user?",
        },
      ]}
      offCanvas={{
        extendedInfoFields: [
          "UserPrincipalName",
          "displayName",
          "accountEnabled",
          "onPremisesSyncEnabled",
        ],
      }}
      simpleColumns={[
        "UserPrincipalName",
        "displayName",
        "accountEnabled",
        "onPremisesSyncEnabled",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
