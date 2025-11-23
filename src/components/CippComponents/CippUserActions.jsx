import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Archive,
  Clear,
  CloudDone,
  Edit,
  Email,
  ForwardToInbox,
  GroupAdd,
  LockClock,
  LockPerson,
  LockReset,
  MeetingRoom,
  Password,
  PersonOff,
  PhonelinkLock,
  PhonelinkSetup,
  Shortcut,
  EditAttributes,
  CloudSync,
} from "@mui/icons-material";
import { getCippLicenseTranslation } from "../../utils/get-cipp-license-translation";
import { useSettings } from "/src/hooks/use-settings.js";
import { usePermissions } from "../../hooks/use-permissions";
import { Tooltip, Box } from "@mui/material";
import CippFormComponent from "./CippFormComponent";
import { useWatch } from "react-hook-form";

// Separate component for Out of Office form to avoid hook issues
const OutOfOfficeForm = ({ formControl }) => {
  // Watch the Auto Reply State value
  const autoReplyState = useWatch({
    control: formControl.control,
    name: "AutoReplyState",
  });

  // Calculate if date fields should be disabled
  const areDateFieldsDisabled = autoReplyState?.value !== "Scheduled";

  return (
    <>
      <CippFormComponent
        type="autoComplete"
        name="AutoReplyState"
        label="Auto Reply State"
        multiple={false}
        formControl={formControl}
        creatable={false}
        options={[
          { label: "Enabled", value: "Enabled" },
          { label: "Disabled", value: "Disabled" },
          { label: "Scheduled", value: "Scheduled" },
        ]}
      />

      <Tooltip
        title={
          areDateFieldsDisabled
            ? "Scheduling is only available when Auto Reply State is set to Scheduled"
            : ""
        }
        placement="bottom"
      >
        <Box>
          <CippFormComponent
            type="datePicker"
            label="Start Date/Time"
            name="StartTime"
            formControl={formControl}
            disabled={areDateFieldsDisabled}
          />
        </Box>
      </Tooltip>

      <Tooltip
        title={
          areDateFieldsDisabled
            ? "Scheduling is only available when Auto Reply State is set to Scheduled"
            : ""
        }
        placement="bottom"
      >
        <Box>
          <CippFormComponent
            type="datePicker"
            label="End Date/Time"
            name="EndTime"
            formControl={formControl}
            disabled={areDateFieldsDisabled}
          />
        </Box>
      </Tooltip>

      <CippFormComponent
        type="richText"
        label="Internal Message"
        name="InternalMessage"
        formControl={formControl}
        multiline
        rows={4}
      />

      <CippFormComponent
        type="richText"
        label="External Message"
        name="ExternalMessage"
        formControl={formControl}
        multiline
        rows={4}
      />
    </>
  );
};

export const useCippUserActions = () => {
  const tenant = useSettings().currentTenant;

  const { checkPermissions } = usePermissions();
  const canWriteUser = checkPermissions(["Identity.User.ReadWrite"]);
  const canWriteMailbox = checkPermissions(["Exchange.Mailbox.ReadWrite"]);
  const canWriteGroup = checkPermissions(["Identity.Group.ReadWrite"]);

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
      condition: () => canWriteUser,
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
      condition: () => canWriteUser,
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
      condition: () => canWriteUser,
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
      data: { userId: "id", userPrincipalName: "userPrincipalName" },
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
          validators: { required: "Please select an MFA state" },
        },
      ],
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
      condition: () => canWriteUser,
    },
    {
      //tested
      label: "Convert Mailbox",
      type: "POST",
      icon: <Email />,
      url: "/api/ExecConvertMailbox",
      data: { ID: "userPrincipalName" },
      fields: [
        {
          type: "radio",
          name: "MailboxType",
          label: "Mailbox Type",
          options: [
            { label: "User Mailbox", value: "Regular" },
            { label: "Shared Mailbox", value: "Shared" },
            { label: "Room Mailbox", value: "Room" },
            { label: "Equipment Mailbox", value: "Equipment" },
          ],
          validators: { required: "Please select a mailbox type" },
        },
      ],
      confirmText: "Pick the type of mailbox you want to convert [userPrincipalName] to:",
      multiPost: false,
      condition: () => canWriteMailbox,
    },
    {
      //tested
      label: "Enable Online Archive",
      type: "POST",
      icon: <Archive />,
      url: "/api/ExecEnableArchive",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to enable the online archive for [userPrincipalName]?",
      multiPost: false,
      condition: (row) => canWriteMailbox,
    },
    {
      //tested
      label: "Set Out of Office",
      type: "POST",
      icon: <MeetingRoom />,
      url: "/api/ExecSetOoO",
      data: {
        userId: "userPrincipalName",
        tenantFilter: "Tenant",
      },
      children: ({ formHook: formControl }) => <OutOfOfficeForm formControl={formControl} />,
      confirmText: "Are you sure you want to set the out of office?",
      multiPost: false,
      condition: () => canWriteMailbox,
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
              value: r.id,
              addedFields: {
                id: r.id,
                userPrincipalName: r.userPrincipalName,
                displayName: r.displayName,
              },
            }))
            .forEach((r) => addMember.push(r));
        } else {
          addMember.push({
            label: row.displayName,
            value: row.id,
            addedFields: {
              id: row.id,
              userPrincipalName: row.userPrincipalName,
              displayName: row.displayName,
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
          validators: { required: "Please select a group" },
          api: {
            url: "/api/ListGroups",
            labelField: (option) =>
              option?.calculatedGroupType
                ? `${option.displayName} (${option.calculatedGroupType})`
                : option?.displayName ?? "",
            valueField: "id",
            addedField: {
              groupType: "groupType",
              groupName: "displayName",
            },
            queryKey: `groups-${tenant}`,
            showRefresh: true,
          },
        },
      ],
      confirmText: "Are you sure you want to add [userPrincipalName] to this group?",
      multiPost: true,
      allowResubmit: true,
      condition: () => canWriteGroup,
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
          validators: { required: "Please select a license operation" },
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
      condition: () => canWriteUser,
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
      confirmText: "Are you sure you want to disable forwarding of [userPrincipalName]'s emails?",
      multiPost: false,
      condition: () => canWriteMailbox,
    },
    {
      label: "Pre-provision OneDrive",
      type: "POST",
      icon: <CloudDone />,
      url: "/api/ExecOneDriveProvision",
      data: { UserPrincipalName: "userPrincipalName" },
      confirmText: "Are you sure you want to pre-provision OneDrive for this user?",
      multiPost: false,
      condition: () => canWriteUser,
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
          validators: { required: "Please select or enter a SharePoint site URL" },
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
      condition: () => canWriteUser,
    },
    {
      label: "Set Sign In State",
      type: "POST",
      icon: <LockPerson />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      fields: [
        {
          type: "radio",
          name: "Enable",
          label: "Sign In State",
          options: [
            { label: "Enabled", value: true },
            { label: "Disabled", value: false },
          ],
          validators: { required: "Please select a sign-in state" },
        },
      ],
      confirmText: "Are you sure you want to set the sign-in state for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
    },
    {
      label: "Reset Password",
      type: "POST",
      icon: <LockReset />,
      url: "/api/ExecResetPass",
      data: {
        ID: "userPrincipalName",
        displayName: "displayName",
      },
      fields: [
        {
          type: "switch",
          name: "MustChange",
          label: "Must Change Password at Next Logon",
        },
      ],
      confirmText: "Are you sure you want to reset the password for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
    },
    {
      label: "Set Password Expiration",
      type: "POST",
      icon: <LockClock />,
      url: "/api/ExecPasswordNeverExpires",
      data: { userId: "id", userPrincipalName: "userPrincipalName" },
      fields: [
        {
          type: "radio",
          name: "PasswordPolicy",
          label: "Password Policy",
          options: [
            { label: "Disable Password Expiration", value: "DisablePasswordExpiration" },
            { label: "Enable Password Expiration", value: "None" },
          ],
          validators: { required: "Please select a password policy" },
        },
      ],
      confirmText:
        "Set Password Never Expires state for [userPrincipalName]. If the password of the user is older than the set expiration date of the organization, the user will be prompted to change their password at their next login.",
      multiPost: false,
      condition: () => canWriteUser,
    },
    {
      label: "Clear Immutable ID",
      type: "POST",
      icon: <Clear />,
      url: "/api/ExecClrImmId",
      data: {
        ID: "id",
      },
      confirmText: "Are you sure you want to clear the Immutable ID for [userPrincipalName]?",
      multiPost: false,
      condition: (row) => !row?.onPremisesSyncEnabled && row?.onPremisesImmutableId && canWriteUser,
    },
    {
      label: "Set Source of Authority",
      type: "POST",
      url: "/api/ExecSetCloudManaged",
      icon: <CloudSync />,
      data: {
        ID: "id",
        displayName: "displayName",
        type: "!User",
      },
      fields: [
        {
          type: "radio",
          name: "isCloudManaged",
          label: "Source of Authority",
          options: [
            { label: "Cloud Managed", value: true },
            { label: "On-Premises Managed", value: false },
          ],
          validators: { required: "Please select a source of authority" },
        },
      ],
      confirmText:
        "Are you sure you want to change the source of authority for [userPrincipalName]? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
      multiPost: false,
    },
    {
      label: "Revoke all user sessions",
      type: "POST",
      icon: <PersonOff />,
      url: "/api/ExecRevokeSessions",
      data: { ID: "id", Username: "userPrincipalName" },
      confirmText: "Are you sure you want to revoke all sessions for [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
    },
    {
      label: "Delete User",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveUser",
      data: { ID: "id", userPrincipalName: "userPrincipalName" },
      confirmText: "Are you sure you want to delete [userPrincipalName]?",
      multiPost: false,
      condition: () => canWriteUser,
    },
    {
      label: "Edit Properties",
      icon: <EditAttributes />,
      multiPost: true,
      noConfirm: true,
      customFunction: (users, action, formData) => {
        // Handle both single user and multiple users
        const userData = Array.isArray(users) ? users : [users];

        // Store users in session storage to avoid URL length limits
        sessionStorage.setItem("patchWizardUsers", JSON.stringify(userData));

        // Use Next.js router for internal navigation
        import("next/router")
          .then(({ default: router }) => {
            router.push("/identity/administration/users/patch-wizard");
          })
          .catch(() => {
            // Fallback to window.location if router is not available
            window.location.href = "/identity/administration/users/patch-wizard";
          });
      },
      condition: () => canWriteUser,
    },
  ];
};

// Legacy wrapper function for backward compatibility - but this should not be used
// Instead, components should use the useCippUserActions hook
export const CippUserActions = () => {
  console.warn("CippUserActions() function is deprecated. Use useCippUserActions() hook instead.");
  return useCippUserActions();
};

export default CippUserActions;
