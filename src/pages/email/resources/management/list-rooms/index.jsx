import { Layout as DashboardLayout } from "../../../../../layouts/index";
import { CippIcons } from "../../../../../utils/icon-registry"
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage.jsx";
import { CippAddRoomDrawer } from "../../../../../components/CippComponents/CippAddRoomDrawer";

const Page = () => {
  const pageTitle = "Rooms";
  const cardButtonPermissions = ["Exchange.Room.ReadWrite"];

  const actions = [
    {
      label: "Edit Room",
      link: `/email/resources/management/list-rooms/edit?roomId=[id]`,
      pinned: true,
      icon: <CippIcons.Edit />,
      color: "info",
      condition: (row) => !row.isDirSynced,
    },
    {
      label: "Edit permissions",
      link: "/identity/administration/users/user/exchange?userId=[id]",
      color: "info",
      icon: <CippIcons.Key />,
    },
    {
      label: "Block Sign In",
      type: "POST",
      icon: <CippIcons.Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to block the sign-in for this room mailbox?",
      multiPost: false,
      condition: (row) => !row.accountDisabled && !row.isDirSynced,
    },
    {
      label: "Unblock Sign In",
      type: "POST",
      icon: <CippIcons.LockOpen />,
      url: "/api/ExecDisableUser",
      data: { ID: "id", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this room mailbox?",
      multiPost: false,
      condition: (row) => row.accountDisabled && !row.isDirSynced,
    },
    {
      label: "Delete Room",
      type: "POST",
      icon: <CippIcons.Delete />,
      url: "/api/RemoveUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to delete this room mailbox?",
      multiPost: false,
      condition: (row) => !row.isDirSynced,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListRooms"
      actions={actions}
      simpleColumns={[
        "displayName",
        "mail",
        "building",
        "floor",
        "capacity",
        "city",
        "state",
        "countryOrRegion",
        "hiddenFromAddressListsEnabled",
      ]}
      cardButton={<CippAddRoomDrawer requiredPermissions={cardButtonPermissions} />}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
