import { Button } from "@mui/material";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import Link from "next/link";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import {
  Visibility,
  GroupAdd,
  Edit,
  LockOpen,
  Lock,
  GroupSharp,
  CloudSync,
  RocketLaunch,
  PersonAdd,
  Groups,
  Security,
  Mail,
  AdminPanelSettings,
  Cloud,
  Public,
  Sync,
  DynamicFeed,
  Description,
  ContactMail,
  PersonRemove,
} from "@mui/icons-material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { useSettings } from "../../../../hooks/use-settings";
import {
  GROUP_TYPES,
  groupSupportsContacts,
  isUnifiedGroup,
  resolveGroupType,
} from "../../../../utils/group-types";

const Page = () => {
  const pageTitle = "Groups";
  const [showMembers, setShowMembers] = useState(false);
  const { currentTenant } = useSettings();

  const handleMembersToggle = () => {
    setShowMembers(!showMembers);
  };
  const actions = [
    {
      label: "View Group",
      link: `/identity/administration/groups/group?groupId=[id]&tenantFilter=${currentTenant}`,
      color: "success",
      icon: <EyeIcon />,
      multiPost: false,
      category: "view",
      quickAction: true,
    },
    {
      label: "Edit Group",
      link: "/identity/administration/groups/edit?groupId=[id]&groupType=[groupType]",
      multiPost: false,
      icon: <Edit />,
      category: "edit",
      quickAction: true,
    },
    {
      label: "Add Member",
      type: "POST",
      icon: <PersonAdd />,
      url: "/api/EditGroup",
      customDataformatter: (row, action, formData) => {
        const groups = Array.isArray(row) ? row : [row];
        const user = formData.UserID;
        const addMember = [
          {
            label: user?.addedFields?.displayName ?? user?.label,
            value: user?.addedFields?.id ?? user?.value,
            addedFields: {
              id: user?.addedFields?.id,
              userPrincipalName: user?.addedFields?.userPrincipalName ?? user?.value,
              displayName: user?.addedFields?.displayName ?? user?.label,
            },
          },
        ];
        return groups.map((group) => ({
          addMember,
          tenantFilter: currentTenant,
          groupId: group.id,
          groupType: group.groupType,
          groupName: group.displayName,
        }));
      },
      fields: [
        {
          type: "autoComplete",
          name: "UserID",
          label: "Select User",
          multiple: false,
          creatable: false,
          validators: { required: "Please select a user" },
          api: {
            url: "/api/ListGraphRequest",
            data: {
              Endpoint: "users",
              $select: "id,displayName,userPrincipalName",
              $top: 999,
              $count: true,
            },
            queryKey: "ListUsersAutoComplete",
            dataKey: "Results",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "userPrincipalName",
            addedField: {
              id: "id",
              userPrincipalName: "userPrincipalName",
              displayName: "displayName",
            },
            showRefresh: true,
          },
        },
      ],
      confirmText: "Select a user to add as a member to the selected group(s).",
      multiPost: false,
      category: "edit",
      quickAction: true,
    },
    {
      label: "Add Contact",
      type: "POST",
      icon: <ContactMail />,
      url: "/api/EditGroup",
      customDataformatter: (row, action, formData) => {
        const groups = Array.isArray(row) ? row : [row];
        const contact = formData.ContactID;
        const addContact = [contact];
        return groups.map((group) => ({
          AddContact: addContact,
          tenantFilter: currentTenant,
          groupId: group.id,
          groupType: group.groupType,
          groupName: group.displayName,
        }));
      },
      fields: [
        {
          type: "autoComplete",
          name: "ContactID",
          label: "Select Contact",
          multiple: false,
          creatable: false,
          validators: { required: "Please select a contact" },
          api: {
            url: "/api/ListContacts",
            labelField: (option) =>
              `${option.displayName || option.DisplayName} (${
                option.mail || option.WindowsEmailAddress
              })`,
            valueField: "WindowsEmailAddress",
            addedField: {
              Guid: "Guid",
              displayName: "displayName",
              WindowsEmailAddress: "WindowsEmailAddress",
            },
          },
        },
      ],
      confirmText: "Select a contact to add to the selected group(s).",
      multiPost: false,
      category: "edit",
      quickAction: true,
      condition: (row) => groupSupportsContacts(row),
    },
    {
      label: "Remove Member",
      type: "POST",
      icon: <PersonRemove />,
      url: "/api/EditGroup",
      customDataformatter: (row, action, formData) => {
        const member = formData.RemoveMemberID;
        return {
          RemoveMember: [
            {
              label: member?.label,
              value: member?.addedFields?.id ?? member?.value,
              addedFields: {
                id: member?.addedFields?.id,
                userPrincipalName: member?.addedFields?.userPrincipalName,
                displayName: member?.addedFields?.displayName,
              },
            },
          ],
          tenantFilter: currentTenant,
          groupId: row.id,
          groupType: row.groupType,
          groupName: row.displayName,
        };
      },
      fields: [
        {
          type: "autoComplete",
          name: "RemoveMemberID",
          label: "Select Member",
          multiple: false,
          creatable: false,
          validators: { required: "Please select a member to remove" },
          api: {
            url: "/api/ListGraphRequest",
            // No $select: /members is a heterogeneous directoryObject collection,
            // so Graph rejects selecting derived-type properties like userPrincipalName
            data: {
              Endpoint: "groups/[id]/members",
              $top: 999,
            },
            queryKey: "ListGroupMembers",
            dataKey: "Results",
            labelField: (member) =>
              member.userPrincipalName
                ? `${member.displayName} (${member.userPrincipalName})`
                : member.displayName,
            valueField: "id",
            addedField: {
              id: "id",
              userPrincipalName: "userPrincipalName",
              displayName: "displayName",
            },
            showRefresh: true,
          },
        },
      ],
      confirmText: "Select the member to remove from '[displayName]'.",
      multiPost: false,
      // The member list is specific to one group, so this can't be bulk applied
      hideBulk: true,
      color: "error",
      category: "danger",
    },
    {
      label: "Remove Contact",
      type: "POST",
      icon: <PersonRemove />,
      url: "/api/EditGroup",
      customDataformatter: (row, action, formData) => {
        const contact = formData.RemoveContactID;
        return {
          RemoveContact: [
            {
              label: contact?.label,
              value: contact?.value,
              addedFields: { id: contact?.addedFields?.id },
            },
          ],
          tenantFilter: currentTenant,
          groupId: row.id,
          groupType: row.groupType,
          groupName: row.displayName,
        };
      },
      fields: [
        {
          type: "autoComplete",
          name: "RemoveContactID",
          label: "Select Contact",
          multiple: false,
          creatable: false,
          validators: { required: "Please select a contact to remove" },
          api: {
            url: "/api/ListGraphRequest",
            data: {
              Endpoint: "groups/[id]/members/microsoft.graph.orgContact",
              $top: 999,
              $select: "id,displayName,mail",
            },
            queryKey: "ListGroupContacts",
            dataKey: "Results",
            labelField: (contact) => `${contact.displayName} (${contact.mail})`,
            valueField: "mail",
            addedField: { id: "id", displayName: "displayName" },
            showRefresh: true,
          },
        },
      ],
      confirmText: "Select the contact to remove from '[displayName]'.",
      multiPost: false,
      hideBulk: true,
      color: "error",
      category: "danger",
      condition: (row) => groupSupportsContacts(row),
    },
    {
      label: "Set Global Address List Visibility",
      type: "POST",
      url: "/api/ExecGroupsHideFromGAL",
      icon: <Visibility />,
      data: {
        ID: "mail",
        GroupType: "groupType",
      },
      fields: [
        {
          type: "radio",
          name: "HidefromGAL",
          label: "Global Address List Visibility",
          options: [
            { label: "Hidden", value: true },
            { label: "Shown", value: false },
          ],
          validators: { required: "Please select a visibility option" },
        },
      ],
      confirmText:
        "Are you sure you want to hide this group from the global address list? Remember this will not work if the group is AD Synched.",
      multiPost: false,
      category: "manage",
    },
    {
      label: "Block External",
      type: "POST",
      url: "/api/ExecGroupsDeliveryManagement",
      icon: <Lock />,
      data: {
        ID: "mail",
        GroupType: "groupType",
        OnlyAllowInternal: true,
      },
      confirmText:
        "Are you sure you want to only allow messages from people inside the organisation? Remember this will not work if the group is AD Synched.",
      multiPost: false,
      category: "manage",
      quickAction: true,
    },
    {
      label: "Allow External",
      type: "POST",
      icon: <LockOpen />,
      url: "/api/ExecGroupsDeliveryManagement",
      data: {
        ID: "mail",
        GroupType: "groupType",
        OnlyAllowInternal: false,
      },
      confirmText:
        "Are you sure you want to allow messages from people inside and outside the organisation? Remember this will not work if the group is AD Synched.",
      multiPost: false,
      category: "manage",
      quickAction: true,
    },
    {
      label: "Set Source of Authority",
      type: "POST",
      url: "/api/ExecSetCloudManaged",
      icon: <CloudSync />,
      data: {
        ID: "id",
        displayName: "displayName",
        type: "!Group",
      },
      // Pre-select the current source of authority; leave unselected when the
      // selected rows have mixed states
      defaultvalues: (row) => {
        const states = [
          ...new Set(
            (Array.isArray(row) ? row : [row]).map((r) => r?.onPremisesSyncEnabled === true),
          ),
        ];
        return states.length === 1 ? { isCloudManaged: String(!states[0]) } : {};
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
          validators: {
            required: "Please select a source of authority",
            validate: (value, formValues, row) => {
              const states = [
                ...new Set(
                  (Array.isArray(row) ? row : [row]).map((r) => r?.onPremisesSyncEnabled === true),
                ),
              ];
              if (states.length === 1 && String(value) === String(!states[0])) {
                return "Source of authority is unchanged";
              }
              return true;
            },
          },
        },
      ],
      confirmText:
        "Are you sure you want to change the source of authority for '[displayName]'? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
      multiPost: false,
      // Only meaningful for groups that are on-premises managed (convert to cloud) or
      // were synced at some point (revert to on-premises); hide for cloud-native groups
      condition: (row) =>
        row?.onPremisesSyncEnabled === true || !!row?.onPremisesSamAccountName,
      category: "manage",
    },
    {
      label: "Create template based on group",
      type: "POST",
      url: "/api/AddGroupTemplate",
      icon: <GroupSharp />,
      data: {
        displayName: "displayName",
        description: "description",
        groupType: "calculatedGroupType",
        membershipRules: "membershipRule",
        allowExternal: "allowExternal",
        username: "mailNickname",
      },
      confirmText: "Are you sure you want to create a template based on this group?",
      multiPost: false,
      category: "manage",
    },
    {
      label: "Create Team from Group",
      type: "POST",
      url: "/api/AddGroupTeam",
      icon: <GroupAdd />,
      data: {
        GroupId: "id",
      },
      confirmText:
        "Are you sure you want to create a Team from this group? Note: The group must be at least 15 minutes old for this to work.",
      multiPost: false,
      category: "manage",
      defaultvalues: {
        TeamSettings: {
          memberSettings: {
            allowCreatePrivateChannels: false,
            allowCreateUpdateChannels: true,
            allowDeleteChannels: false,
            allowAddRemoveApps: false,
            allowCreateUpdateRemoveTabs: false,
            allowCreateUpdateRemoveConnectors: false,
          },
          messagingSettings: {
            allowUserEditMessages: true,
            allowUserDeleteMessages: true,
            allowOwnerDeleteMessages: false,
            allowTeamMentions: false,
            allowChannelMentions: false,
          },
          funSettings: {
            allowGiphy: true,
            giphyContentRating: "strict",
            allowStickersAndMemes: false,
            allowCustomMemes: false,
          },
        },
      },
      fields: [
        {
          type: "heading",
          name: "memberSettingsHeading",
          label: "Member Settings",
        },
        {
          type: "switch",
          name: "TeamSettings.memberSettings.allowCreatePrivateChannels",
          label: "Allow members to create private channels",
        },
        {
          type: "switch",
          name: "TeamSettings.memberSettings.allowCreateUpdateChannels",
          label: "Allow members to create and update channels",
        },
        {
          type: "switch",
          name: "TeamSettings.memberSettings.allowDeleteChannels",
          label: "Allow members to delete channels",
        },
        {
          type: "switch",
          name: "TeamSettings.memberSettings.allowAddRemoveApps",
          label: "Allow members to add and remove apps",
        },
        {
          type: "switch",
          name: "TeamSettings.memberSettings.allowCreateUpdateRemoveTabs",
          label: "Allow members to create, update and remove tabs",
        },
        {
          type: "switch",
          name: "TeamSettings.memberSettings.allowCreateUpdateRemoveConnectors",
          label: "Allow members to create, update and remove connectors",
        },
        {
          type: "heading",
          name: "messagingSettingsHeading",
          label: "Messaging Settings",
        },
        {
          type: "switch",
          name: "TeamSettings.messagingSettings.allowUserEditMessages",
          label: "Allow users to edit their messages",
        },
        {
          type: "switch",
          name: "TeamSettings.messagingSettings.allowUserDeleteMessages",
          label: "Allow users to delete their messages",
        },
        {
          type: "switch",
          name: "TeamSettings.messagingSettings.allowOwnerDeleteMessages",
          label: "Allow owners to delete messages",
        },
        {
          type: "switch",
          name: "TeamSettings.messagingSettings.allowTeamMentions",
          label: "Allow @team mentions",
        },
        {
          type: "switch",
          name: "TeamSettings.messagingSettings.allowChannelMentions",
          label: "Allow @channel mentions",
        },
        {
          type: "heading",
          name: "funSettingsHeading",
          label: "Fun Settings",
        },
        {
          type: "switch",
          name: "TeamSettings.funSettings.allowGiphy",
          label: "Allow Giphy",
        },
        {
          type: "select",
          name: "TeamSettings.funSettings.giphyContentRating",
          label: "Giphy content rating",
          options: [
            { value: "strict", label: "Strict" },
            { value: "moderate", label: "Moderate" },
          ],
        },
        {
          type: "switch",
          name: "TeamSettings.funSettings.allowStickersAndMemes",
          label: "Allow stickers and memes",
        },
        {
          type: "switch",
          name: "TeamSettings.funSettings.allowCustomMemes",
          label: "Allow custom memes",
        },
      ],
      condition: (row) => isUnifiedGroup(row),
    },
    {
      label: "Delete Group",
      type: "POST",
      url: "/api/ExecGroupsDelete",
      icon: <TrashIcon />,
      data: {
        ID: "id",
        GroupType: "groupType",
        DisplayName: "displayName",
      },
      confirmText: "Are you sure you want to delete this group.",
      multiPost: false,
      color: "error",
      category: "danger",
    },
  ];
  const cardConfig = {
    title: "displayName",
    subtitle: "mail",
    avatar: {
      field: "displayName",
      icon: (item) => {
        const gt = resolveGroupType(item);
        if (gt === GROUP_TYPES.security) return <Security />;
        if (gt === GROUP_TYPES.distributionList) return <Mail />;
        if (gt === GROUP_TYPES.mailEnabledSecurity) return <AdminPanelSettings />;
        return <Groups />;
      },
    },
    badges: [
      {
        field: "groupType",
        conditions: {
          "Microsoft 365": {
            label: "M365",
            color: "primary",
            icon: <Cloud fontSize="small" />,
          },
          Security: {
            label: "Security",
            color: "warning",
            icon: <Security fontSize="small" />,
          },
          "Distribution List": {
            label: "Distribution",
            color: "info",
            icon: <Mail fontSize="small" />,
          },
          "Mail-Enabled Security": {
            label: "Mail Security",
            color: "secondary",
            icon: <AdminPanelSettings fontSize="small" />,
          },
        },
      },
      {
        field: "visibility",
        iconOnly: true,
        conditions: {
          Public: {
            label: "Public",
            color: "success",
            icon: <Public fontSize="small" />,
          },
          Private: {
            label: "Private",
            color: "default",
            icon: <Lock fontSize="small" />,
          },
        },
      },
      {
        field: "onPremisesSyncEnabled",
        iconOnly: true,
        conditions: {
          true: {
            label: "Synced from On-Premises",
            color: "info",
            icon: <Sync fontSize="small" />,
          },
        },
      },
      {
        field: "membershipRule",
        iconOnly: true,
        transform: (value) => (value ? "dynamic" : null),
        conditions: {
          dynamic: {
            label: "Dynamic Membership",
            color: "secondary",
            icon: <DynamicFeed fontSize="small" />,
          },
        },
      },
    ],
    extraFields: [
      {
        field: "description",
        icon: <Description />,
        maxLines: 2,
      },
    ],
    desktopFields: [
      { field: "mail", label: "Email", icon: <Mail /> },
      { field: "visibility", label: "Visibility", icon: <Public /> },
    ],
    desktopFieldsMax: 3,
    desktopFieldsLayout: "column",
    cardGridProps: { md: 6, lg: 4 },
    mobileQuickActions: [
      "View Group",
      "Edit Group",
      "Add Member",
      "Add Contact",
      "Allow External",
      "Block External",
    ],
    maxQuickActions: 8,
  };

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "userPrincipalName",
      "id",
      "mail",
      "description",
      "mailEnabled",
      "securityEnabled",
      "visibility",
      "assignedLicenses",
      "licenseProcessingState.state",
      "onPremisesSamAccountName",
      "membershipRule",
      "onPremisesSyncEnabled",
    ],
    actions: actions,
  };
  return (
    <CippTablePage
      title={pageTitle}
      cardButton={
        <Stack direction="row" spacing={1}>
          <Button onClick={handleMembersToggle}>
            {showMembers ? "Hide Members" : "Show Members"}
          </Button>
          <Button component={Link} href="groups/add" startIcon={<GroupAdd />}>
            Add Group
          </Button>
          <Button
            component={Link}
            href="/identity/administration/group-templates/deploy"
            startIcon={<RocketLaunch />}
          >
            Deploy Group Template
          </Button>
        </Stack>
      }
      apiUrl="/api/ListGroups"
      apiData={{ expandMembers: showMembers }}
      queryKey={
        showMembers
          ? `groups-with-members-${currentTenant}`
          : `groups-without-members-${currentTenant}`
      }
      actions={actions}
      offCanvas={offCanvas}
      cardConfig={cardConfig}
      simpleColumns={[
        "displayName",
        "description",
        "mail",
        "mailEnabled",
        "mailNickname",
        "groupType",
        "assignedLicenses",
        "licenseProcessingState.state",
        "visibility",
        "onPremisesSamAccountName",
        "membershipRule",
        "onPremisesSyncEnabled",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
