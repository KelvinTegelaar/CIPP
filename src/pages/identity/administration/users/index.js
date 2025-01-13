import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Archive,
  Block,
  Clear,
  CloudDone,
  Edit,
  Email,
  ForwardToInbox,
  GroupAdd,
  LockOpen,
  LockPerson,
  LockReset,
  MeetingRoom,
  NoMeetingRoom,
  Password,
  PersonOff,
  PhonelinkLock,
  PhonelinkSetup,
  Shortcut,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";
import { useSettings } from "/src/hooks/use-settings.js";

const Page = () => {
  const pageTitle = "Users";
  const tenant = useSettings().currentTenant;

  const actions = [
    {
      //tested
      label: "View User",
      link: "/identity/administration/users/user?userId=[id]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
    {
      //tested
      label: "Edit User",
      link: "/identity/administration/users/user/edit?userId=[id]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      //tested
      label: "Research Compromised Account",
      type: "GET",
      icon: <MagnifyingGlassIcon />,
      link: "/identity/administration/users/user/bec?userId=[id]",
      confirmText: "Are you sure you want to research this compromised account?",
      multiPost: false,
    },
    {
      //tested

      label: "Create Temporary Access Password",
      type: "GET",
      icon: <Password />,
      url: "/api/ExecCreateTAP",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to create a Temporary Access Password?",
      multiPost: false,
    },
    {
      //tested
      label: "Rerequire MFA registration",
      type: "GET",
      icon: <PhonelinkSetup />,
      url: "/api/ExecResetMFA",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to reset MFA for this user?",
      multiPost: false,
    },
    {
      //tested
      label: "Send MFA Push",
      type: "POST",
      icon: <PhonelinkLock />,
      url: "/api/ExecSendPush",
      data: { UserEmail: "userPrincipalName" },
      confirmText: "Are you sure you want to send an MFA request?",
      multiPost: false,
    },
    {
      //tested
      label: "Set Per-User MFA",
      type: "POST",
      icon: <LockPerson />,
      url: "/api/ExecPerUserMFA",
      data: { userId: "userPrincipalName" },
      fields: [
        {
          type: "autoComplete",
          name: "State",
          label: "State",
          options: [
            { label: "Enforced", value: "Enforced" },
            { label: "Enabled", value: "Enabled" },
            { label: "Disabled", value: "Disabled" },
          ],
          multiple: false,
        },
      ],
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
    },
    {
      //tested
      label: "Convert to Shared Mailbox",
      type: "GET",
      icon: <Email />,
      url: "/api/ExecConvertToSharedMailbox",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to convert this user to a shared mailbox?",
      multiPost: false,
    },
    {
      //tested
      label: "Enable Online Archive",
      type: "GET",
      icon: <Archive />,
      url: "/api/ExecEnableArchive",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to enable the online archive for this user?",
      multiPost: false,
    },
    {
      //tested
      label: "Set Out of Office",
      type: "POST",
      icon: <MeetingRoom />,
      url: "/api/ExecSetOoO",
      data: {
        userId: "userPrincipalName",
        AutoReplyState: { value: "Enabled" },
        tenantFilter: "Tenant",
      },
      fields: [{ type: "richText", name: "input", label: "Out of Office Message" }],
      confirmText: "Are you sure you want to set the out of office?",
      multiPost: false,
    },

    {
      label: "Disable Out of Office",
      type: "POST",
      icon: <NoMeetingRoom />,
      url: "/api/ExecSetOoO",
      data: { user: "userPrincipalName", AutoReplyState: "Disabled" },
      confirmText: "Are you sure you want to disable the out of office?",
      multiPost: false,
    },
    {
      label: "Add to Group",
      type: "POST",
      icon: <GroupAdd />,
      url: "/api/EditGroup",
      data: { addMember: "userPrincipalName" },
      fields: [
        {
          type: "autoComplete",
          name: "groupId",
          label: "Select a group to add the user to",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGroups",
            labelField: "displayName",
            valueField: "id",
            addedField: {
              groupType: "calculatedGroupType",
              groupName: "displayName",
            },
            queryKey: `groups-${tenant}`,
          },
        },
      ],
      confirmText: "Are you sure you want to add the user to this group?",
    },
    {
      label: "Disable Email Forwarding",
      type: "POST",
      url: "/api/ExecEmailForward",
      icon: <ForwardToInbox />,
      data: {
        username: "userPrincipalName",
        userid: "userPrincipalName",
        ForwardOption: "!disabled",
      },
      confirmText: "Are you sure you want to disable forwarding of this user's emails?",
      multiPost: false,
    },
    {
      label: "Pre-provision OneDrive",
      type: "POST",
      icon: <CloudDone />,
      url: "/api/ExecOneDriveProvision",
      data: { UserPrincipalName: "userPrincipalName" },
      confirmText: "Are you sure you want to pre-provision OneDrive for this user?",
      multiPost: false,
    },
    {
      label: "Add OneDrive Shortcut",
      type: "POST",
      icon: <Shortcut />,
      url: "/api/ExecOneDriveShortCut",
      data: {
        username: "userPrincipalName",
        userid: "id",
      },
      fields: [
        {
          type: "autoComplete",
          name: "siteUrl",
          label: "Select a Site",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListSites",
            data: { type: "SharePointSiteUsage", URLOnly: true },
            labelField: "webUrl",
            valueField: "webUrl",
            queryKey: `sharepointSites-${tenant}`,
          },
        },
      ],
      confirmText: "Select a SharePoint site to create a shortcut for:",
      multiPost: false,
    },
    {
      label: "Block Sign In",
      type: "GET",
      icon: <Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to block the sign-in for this user?",
      multiPost: false,
    },
    {
      label: "Unblock Sign In",
      type: "GET",
      icon: <LockOpen />,
      url: "/api/ExecDisableUser",
      data: { ID: "id", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this user?",
      multiPost: false,
    },
    {
      label: "Reset Password (Must Change)",
      type: "GET",
      icon: <LockReset />,
      url: "/api/ExecResetPass",
      data: {
        MustChange: true,
        ID: "userPrincipalName",
        displayName: "displayName",
      },
      confirmText:
        "Are you sure you want to reset the password for this user? The user must change their password at next logon.",
      multiPost: false,
    },
    {
      label: "Reset Password",
      type: "GET",
      icon: <LockReset />,
      url: "/api/ExecResetPass",
      data: {
        MustChange: false,
        ID: "userPrincipalName",
        displayName: "displayName",
      },
      confirmText: "Are you sure you want to reset the password for this user?",
      multiPost: false,
    },
    {
      label: "Clear Immutable ID",
      type: "GET",
      icon: <Clear />,
      url: "/api/ExecClrImmId",
      data: {
        ID: "id",
      },
      confirmText: "Are you sure you want to clear the Immutable ID for this user?",
      multiPost: false,
    },
    {
      label: "Revoke all user sessions",
      type: "GET",
      icon: <PersonOff />,
      url: "/api/ExecRevokeSessions",
      data: { ID: "id", Username: "userPrincipalName" },
      confirmText: "Are you sure you want to revoke all sessions for this user?",
      multiPost: false,
    },
    {
      label: "Delete User",
      type: "GET",
      icon: <TrashIcon />,
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
      filters={[
        {
          filterName: "Account Enabled",
          //true or false filters by yes/no
          value: [{ id: "accountEnabled", value: "Yes" }],
          type: "column",
        },
        {
          filterName: "Account Disabled",
          value: [{ id: "accountEnabled", value: "No" }],
          type: "column",
        },
        {
          filterName: "Guest Accounts",
          value: [{ id: "userType", value: "Guest" }],
          type: "column",
        },
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
