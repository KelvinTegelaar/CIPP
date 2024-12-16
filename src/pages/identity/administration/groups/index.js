import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Groups";
  const actions = [
    {
      //tested
      label: "Edit Group",
      link: "/identity/administration/groups/edit?groupId=[id]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
    {
      label: "Hide from Global Address List",
      type: "GET",
      url: "/api/ExecGroupsHideFromGAL",
      data: {
        TenantFilter: "TenantFilter",
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
      type: "GET",
      url: "/api/ExecGroupsHideFromGAL",
      data: {
        TenantFilter: "TenantFilter",
        ID: "mail",
        GroupType: "calculatedGroupType",
      },
      confirmText:
        "Are you sure you want to unhide this mailbox from the global address list? Remember this will not work if the group is AD Synched.",
      multiPost: false,
    },
    {
      label: "Only allow messages from people inside the organisation",
      type: "GET",
      url: "/api/ExecGroupsDeliveryManagement",
      data: {
        TenantFilter: "TenantFilter",
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
      type: "GET",
      url: "/api/ExecGroupsDeliveryManagement",
      data: {
        TenantFilter: "TenantFilter",
        ID: "mail",
        GroupType: "calculatedGroupType",
      },
      confirmText:
        "Are you sure you want to allow messages from people inside and outside the organisation? Remember this will not work if the group is AD Synched.",
      multiPost: false,
    },
    {
      label: "Delete Group",
      type: "GET",
      url: "/api/ExecGroupsDelete",
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
          <Button component={Link} href="groups/add">
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
