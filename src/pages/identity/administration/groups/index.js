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
} from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Groups";
  const actions = [
    {
      //tested
      label: "Edit Group",
      link: "/identity/administration/groups/edit?groupId=[id]&groupType=[calculatedGroupType]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
    },
    {
      label: "Hide from Global Address List",
      type: "POST",
      url: "/api/ExecGroupsHideFromGAL",
      icon: <VisibilityOff />,
      data: {
        ID: "mail",
        GroupType: "calculatedGroupType",
        HidefromGAL: true,
      },
      confirmText:
        "Are you sure you want to hide this mailbox from the global address list? Remember this will not work if the group is AD Synched.",
      multiPost: false,
    },
    {
      label: "Unhide from Global Address List",
      type: "POST",
      url: "/api/ExecGroupsHideFromGAL",
      icon: <Visibility />,
      data: {
        ID: "mail",
        GroupType: "calculatedGroupType",
        HidefromGAL: false,
      },
      confirmText:
        "Are you sure you want to unhide this mailbox from the global address list? Remember this will not work if the group is AD Synched.",
      multiPost: false,
    },
    {
      label: "Only allow messages from people inside the organisation",
      type: "POST",
      url: "/api/ExecGroupsDeliveryManagement",
      icon: <Lock />,
      data: {
        ID: "mail",
        GroupType: "calculatedGroupType",
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
        GroupType: "calculatedGroupType",
        OnlyAllowInternal: false,
      },
      confirmText:
        "Are you sure you want to allow messages from people inside and outside the organisation? Remember this will not work if the group is AD Synched.",
      multiPost: false,
    },
    {
      label: "Create template based on group",
      type: "POST",
      url: "/api/AddGroupTemplate",
      icon: <GroupSharp />,
      data: {
        Displayname: "displayname",
        Description: "description",
        GroupType: "calculatedGroupType",
        MembershipRules: "membershipRule",
        allowExternal: "allowExternal",
        username: "mailNickname",
      },
      confirmText: "Are you sure you want to create a template based on this group?",
      multiPost: false,
    },
    {
      label: "Delete Group",
      type: "POST",
      url: "/api/ExecGroupsDelete",
      icon: <TrashIcon />,
      data: {
        ID: "id",
        GroupType: "calculatedGroupType",
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
    ],
    actions: actions,
  };
  return (
    <CippTablePage
      title={pageTitle}
      cardButton={
        <>
          <Button component={Link} href="groups/add" startIcon={<GroupAdd />}>
            Add Group
          </Button>
        </>
      }
      apiUrl="/api/ListGroups"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "displayName",
        "description",
        "mail",
        "mailEnabled",
        "mailNickname",
        "calculatedGroupType",
        "assignedLicenses",
        "visibility",
        "onPremisesSamAccountName",
        "membershipRule",
        "onPremisesSyncEnabled",
        "userPrincipalName",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
