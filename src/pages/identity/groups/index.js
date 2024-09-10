import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../layouts/index.js";

const Page = () => {
  const pageTitle = "Groups";
  const actions = [
    {
      label: "Edit Group",
      type: "LINK",
      link: "/[tenant]/identity/groups/[id]",
      linkParams: {
        tenant: "TenantFilter",
        id: "mail",
      },
    },
    {
      label: "Hide from Global Address List",
      type: "POST",
      url: "api/ExecGroupsHideFromGAL",
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
      type: "POST",
      url: "api/ExecGroupsHideFromGAL",
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
      type: "POST",
      url: "api/ExecGroupsDeliveryManagement",
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
      type: "POST",
      url: "api/ExecGroupsDeliveryManagement",
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
      type: "POST",
      url: "api/ExecGroupsDelete",
      data: {
        TenantFilter: "TenantFilter",
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
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "groups",
        $select:
          "id,createdDateTime,displayName,description,mail,mailEnabled,mailNickname,resourceProvisioningOptions,securityEnabled,visibility,organizationId,onPremisesSamAccountName,membershipRule,grouptypes,onPremisesSyncEnabled,resourceProvisioningOptions,userPrincipalName",
        $expand: "members($select=userPrincipalName)",
        $count: true,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "displayName",
        "description",
        "mail",
        "mailEnabled",
        "mailNickname",
        "resourceProvisioningOptions",
        "securityEnabled",
        "visibility",
        "organizationId",
        "onPremisesSamAccountName",
        "membershipRule",
        "grouptypes",
        "onPremisesSyncEnabled",
        "resourceProvisioningOptions",
        "userPrincipalName",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
