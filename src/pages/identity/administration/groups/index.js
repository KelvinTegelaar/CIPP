import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  Visibility,
  VisibilityOff,
  GroupAdd,
  Edit,
  LockOpen,
  Lock,
  GroupSharp,
  CloudSync,
} from "@mui/icons-material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "Groups";
  const [showMembers, setShowMembers] = useState(false);
  const { currentTenant } = useSettings();

  const handleMembersToggle = () => {
    setShowMembers(!showMembers);
  };
  const actions = [
    {
      //tested
      label: "Edit Group",
      link: "/identity/administration/groups/edit?groupId=[id]&groupType=[groupType]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
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
    },
    {
      label: "Only allow messages from people inside the organisation",
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
    },
    {
      label: "Allow messages from people inside and outside the organisation",
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
        "Are you sure you want to change the source of authority for '[displayName]'? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
      multiPost: false,
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
      condition: (row) => row?.calculatedGroupType === "m365",
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
    },
  ];
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
