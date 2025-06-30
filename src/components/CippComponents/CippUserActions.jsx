import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Archive,
  Block,
  Clear,
  CloudDone,
  Edit,
  Email,
  ForwardToInbox,
  GroupAdd,
  LockClock,
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
import { getCippLicenseTranslation } from "../../utils/get-cipp-license-translation";
import { useSettings } from "/src/hooks/use-settings.js";

export const CippUserActions = () => {
  const tenant = useSettings().currentTenant;
  return [
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
      type: "POST",
      icon: <Password />,
      url: "/api/ExecCreateTAP",
      data: { ID: "userPrincipalName" },
      fields: [
        {
          type: "number",
          name: "lifetimeInMinutes",
          label: "Lifetime (Minutes)",
          placeholder: "Leave blank for default",
        },
        {
          type: "switch",
          name: "isUsableOnce",
          label: "One-time use only",
        },
        {
          type: "datePicker",
          name: "startDateTime",
          label: "Start Date/Time (leave blank for immediate)",
          dateTimeType: "datetime",
        },
      ],
      confirmText: "Are you sure you want to create a Temporary Access Password?",
      multiPost: false,
    },
    {
      //tested
      label: "Re-require MFA registration",
      type: "POST",
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
          creatable: false,
        },
      ],
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
    },
    {
      //tested
      label: "Convert to Shared Mailbox",
      type: "POST",
      icon: <Email />,
      url: "/api/ExecConvertMailbox",
      data: { ID: "userPrincipalName", MailboxType: "!Shared" },
      confirmText: "Are you sure you want to convert this user to a shared mailbox?",
      multiPost: false,
    },
    {
      label: "Convert to User Mailbox",
      type: "POST",
      icon: <Email />,
      url: "/api/ExecConvertMailbox",
      data: { ID: "userPrincipalName", MailboxType: "!Regular" },
      confirmText: "Are you sure you want to convert this user to a user mailbox?",
      multiPost: false,
    },
    {
      //tested
      label: "Enable Online Archive",
      type: "POST",
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
      data: {
        userId: "userPrincipalName",
        AutoReplyState: { value: "Disabled" },
      },
      confirmText: "Are you sure you want to disable the out of office?",
      multiPost: false,
    },
    {
      label: "Add to Group",
      type: "POST",
      icon: <GroupAdd />,
      url: "/api/EditGroup",
      customDataformatter: (row, action, formData) => {
        let addMember = [];
        if (Array.isArray(row)) {
          row
            .map((r) => ({
              label: r.displayName,
              value: r.userPrincipalName,
              addedFields: {
                id: r.id,
              },
            }))
            .forEach((r) => addMember.push(r));
        } else {
          addMember.push({
            label: row.displayName,
            value: row.userPrincipalName,
            addedFields: {
              id: row.id,
            },
          });
        }
        return {
          addMember: addMember,
          tenantFilter: tenant,
          groupId: formData.groupId,
        };
      },
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
            showRefresh: true,
          },
        },
      ],
      confirmText: "Are you sure you want to add the user to this group?",
      multiPost: true,
    },
    {
      label: "Manage Licenses",
      type: "POST",
      url: "/api/ExecBulkLicense",
      icon: <CloudDone />,
      data: { userIds: "id" },
      multiPost: true,
      fields: [
        {
          type: "radio",
          name: "LicenseOperation",
          label: "License Operation",
          options: [
            { label: "Add Licenses", value: "Add" },
            { label: "Remove Licenses", value: "Remove" },
            { label: "Replace Licenses", value: "Replace" },
          ],
          required: true,
        },
        {
          type: "switch",
          name: "RemoveAllLicenses",
          label: "Remove All Existing Licenses",
        },
        {
          type: "autoComplete",
          name: "Licenses",
          label: "Select Licenses",
          multiple: true,
          creatable: false,
          api: {
            url: "/api/ListLicenses",
            labelField: (option) =>
              `${getCippLicenseTranslation([option])} (${option?.availableUnits} available)`,
            valueField: "skuId",
            queryKey: `licenses-${tenant}`,
          },
        },
      ],
      confirmText: "Are you sure you want to manage licenses for the selected users?",
      multiPost: true,
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
          creatable: true,
          api: {
            url: "/api/ListSites",
            data: { type: "SharePointSiteUsage", URLOnly: true },
            labelField: "webUrl",
            valueField: "webUrl",
            addedField: {
              siteId: "siteId", // Fix: Use "siteId" not "id" based on API response
            },
            queryKey: `sharepointSites-${tenant}`,
          },
        },
        {
          type: "autoComplete",
          name: "libraryId",
          label: "Select Document Library (optional - defaults to Documents)",
          multiple: false,
          creatable: false,
          dependsOn: "siteUrl",
          api: {
            url: "/api/ListGraphRequest",
            dataKey: "Results",
            labelField: "name",
            valueField: "id",
            data: (formValues) => {
              // More robust null checking
              if (!formValues || !formValues.siteUrl) {
                return null;
              }
              
              const siteUrl = formValues.siteUrl;
              const siteId = siteUrl?.addedFields?.siteId;
              
              if (!siteId) {
                return null; // Don't make API call if site ID not available
              }
              
              return {
                Endpoint: `sites/${siteId}/drives`,
                $filter: "driveType eq 'documentLibrary'",
                $select: "id,name,driveType",
              };
            },
            queryKey: (formValues) => {
              // More robust query key generation
              if (!formValues || !formValues.siteUrl) {
                return `libraries-${tenant}-empty`;
              }
              
              const siteId = formValues.siteUrl?.addedFields?.siteId;
              return siteId ? `libraries-${tenant}-${siteId}` : `libraries-${tenant}-no-site`;
            },
          },
        },
      ],
      confirmText: "Select a SharePoint site and document library to create a shortcut for:",
      multiPost: false,
    },
    {
      label: "Block Sign In",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to block the sign-in for this user?",
      multiPost: false,
      condition: (row) => row.accountEnabled,
    },
    {
      label: "Unblock Sign In",
      type: "POST",
      icon: <LockOpen />,
      url: "/api/ExecDisableUser",
      data: { ID: "id", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this user?",
      multiPost: false,
      condition: (row) => !row.accountEnabled,
    },
    {
      label: "Reset Password (Must Change)",
      type: "POST",
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
      type: "POST",
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
      label: "Set Password Never Expires",
      type: "POST",
      icon: <LockClock />,
      url: "/api/ExecPasswordNeverExpires",
      data: { userId: "id", userPrincipalName: "userPrincipalName" },
      fields: [
        {
          type: "autoComplete",
          name: "PasswordPolicy",
          label: "Password Policy",
          options: [
            { label: "Disable Password Expiration", value: "DisablePasswordExpiration" },
            { label: "Enable Password Expiration", value: "None" },
          ],
          multiple: false,
          creatable: false,
        },
      ],
      confirmText:
        "Set Password Never Expires state for this user. If the password of the user is older than the set expiration date of the organization, the user will be prompted to change their password at their next login.",
      multiPost: false,
    },
    {
      label: "Clear Immutable ID",
      type: "POST",
      icon: <Clear />,
      url: "/api/ExecClrImmId",
      data: {
        ID: "id",
      },
      confirmText: "Are you sure you want to clear the Immutable ID for this user?",
      multiPost: false,
      condition: (row) => !row.onPremisesSyncEnabled && row?.onPremisesImmutableId,
    },
    {
      label: "Revoke all user sessions",
      type: "POST",
      icon: <PersonOff />,
      url: "/api/ExecRevokeSessions",
      data: { ID: "id", Username: "userPrincipalName" },
      confirmText: "Are you sure you want to revoke all sessions for this user?",
      multiPost: false,
    },
    {
      label: "Delete User",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveUser",
      data: { ID: "id", userPrincipalName: "userPrincipalName" },
      confirmText: "Are you sure you want to delete this user?",
      multiPost: false,
    },
  ];
};

export default CippUserActions;
