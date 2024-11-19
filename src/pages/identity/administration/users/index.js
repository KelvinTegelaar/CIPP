import { EyeIcon } from "@heroicons/react/24/outline";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Users";

  const actions = [
    {
      label: "View User",
      link: "/identity/administration/users/user?userId=[id]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
    {
      label: "Edit User",
      link: "/identity/administration/users/user/edit?userId=[id]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Research Compromised Account",
      type: "GET",
      link: "/identity/administration/users/user/bec?userId=[id]",
      confirmText: "Are you sure you want to research this compromised account?",
      multiPost: false,
    },
    {
      label: "Create Temporary Access Password",
      type: "GET",
      url: "/api/ExecCreateTAP",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to create a Temporary Access Password?",
      multiPost: false,
    },
    {
      label: "Rerequire MFA registration",
      type: "GET",
      url: "/api/ExecResetMFA",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to reset MFA for this user?",
      multiPost: false,
    },
    {
      label: "Send MFA Push",
      type: "POST",
      url: "/api/ExecSendPush",
      data: { UserEmail: "userPrincipalName" },
      confirmText: "Are you sure you want to send an MFA request?",
      multiPost: false,
    },
    {
      label: "Set Per-User MFA",
      type: "POST",
      url: "/api/ExecPerUserMFA",
      data: { userId: "userPrincipalName" },
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
    },
    {
      label: "Convert to Shared Mailbox",
      type: "POST",
      url: "/api/ExecConvertToSharedMailbox",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to convert this user to a shared mailbox?",
      multiPost: false,
    },
    {
      label: "Enable Online Archive",
      type: "POST",
      url: "/api/ExecEnableArchive",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to enable the online archive for this user?",
      multiPost: false,
    },
    {
      label: "Set Out of Office",
      type: "POST",
      url: "/api/ExecSetOoO",
      data: { user: "userPrincipalName", AutoReplyState: "Enabled" },
      fields: [{ type: "textArea", name: "message", label: "Out of Office Message" }],
      confirmText: "Are you sure you want to set the out of office?",
      multiPost: false,
    },
    {
      label: "Add to Group",
      type: "POST",
      url: "/api/EditGroup",
      data: { addMember: { value: "userPrincipalName" }, TenantId: "Tenant" },
      fields: [
        {
          type: "autoComplete",
          name: "groupId",
          label: "Select a group to add the user to",
          api: {
            url: "/api/ListGroups",
            labelField: "displayName",
            valueField: "id",
            addedField: {
              groupType: "calculatedGroupType",
              groupName: "displayName",
            },
          },
        },
      ],
      confirmText: "Are you sure you want to add the user to this group?",
      multiPost: false,
    },
    {
      label: "Disable Out of Office",
      type: "POST",
      url: "/api/ExecSetOoO",
      data: { user: "userPrincipalName", AutoReplyState: "Disabled" },
      confirmText: "Are you sure you want to disable the out of office?",
      multiPost: false,
    },
    {
      label: "Disable Email Forwarding",
      type: "POST",
      url: "/api/ExecEmailForward",
      data: {
        username: "userPrincipalName",
        userid: "userPrincipalName",

        DisableForwarding: true,
      },
      confirmText: "Are you sure you want to disable forwarding of this user's emails?",
      multiPost: false,
    },
    {
      label: "Block Sign In",
      type: "POST",
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to block the sign-in for this user?",
      multiPost: false,
    },
    {
      label: "Unblock Sign In",
      type: "POST",
      url: "/api/ExecDisableUser",
      data: { ID: "id", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this user?",
      multiPost: false,
    },
    {
      label: "Reset Password (Must Change)",
      type: "POST",
      url: "/api/ExecResetPass",
      data: {
        MustChange: true,

        ID: "id",
        displayName: "displayName",
      },
      confirmText:
        "Are you sure you want to reset the password for this user? The user must change their password at next logon.",
      multiPost: false,
    },
    {
      label: "Reset Password",
      type: "POST",
      url: "/api/ExecResetPass",
      data: {
        MustChange: false,

        ID: "id",
        displayName: "displayName",
      },
      confirmText: "Are you sure you want to reset the password for this user?",
      multiPost: false,
    },
    {
      label: "Revoke all user sessions",
      type: "POST",
      url: "/api/ExecRevokeSessions",
      data: { ID: "id", Username: "userPrincipalName" },
      confirmText: "Are you sure you want to revoke all sessions for this user?",
      multiPost: false,
    },
    {
      label: "Delete User",
      type: "POST",
      url: "/api/RemoveUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to delete this user?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime", // Created Date (UTC)
      "userPrincipalName", // UPN
      "givenName", // Given Name
      "surname", // Surname
      "jobTitle", // Job Title
      "assignedLicenses", // Licenses
      "businessPhones", // Business Phone
      "mobilePhone", // Mobile Phone
      "mail", // Mail
      "city", // City
      "department", // Department
      "onPremisesLastSyncDateTime", // OnPrem Last Sync
      "id", // Unique ID
    ],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      cardButton={
        <>
          <Button component={Link} href="users/bulk-add">
            Bulk Add Users
          </Button>
          <Button component={Link} href="users/invite">
            Invite Guest
          </Button>
          <Button component={Link} href="users/add">
            Add User
          </Button>
        </>
      }
      apiData={{
        Endpoint: "users",
        manualPagination: true,
        $select:
          "id,accountEnabled,businessPhones,city,createdDateTime,companyName,country,department,displayName,faxNumber,givenName,isResourceAccount,jobTitle,mail,mailNickname,mobilePhone,onPremisesDistinguishedName,officeLocation,onPremisesLastSyncDateTime,otherMails,postalCode,preferredDataLocation,preferredLanguage,proxyAddresses,showInAddressList,state,streetAddress,surname,usageLocation,userPrincipalName,userType,assignedLicenses,onPremisesSyncEnabled",
        $count: true,
        $orderby: "displayName",
        $top: 999,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "accountEnabled",
        "userPrincipalName",
        "displayName",
        "mail",
        "businessPhones",
        "proxyAddresses",
        "assignedLicenses",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
