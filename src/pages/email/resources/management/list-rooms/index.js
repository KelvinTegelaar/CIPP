import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit, Block, LockOpen, Key } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippAddRoomDrawer } from "../../../../../components/CippComponents/CippAddRoomDrawer";

const Page = () => {
  const pageTitle = "Rooms";
  const cardButtonPermissions = ["Exchange.Room.ReadWrite"];

  const actions = [
    {
      label: "Edit Room",
      link: `/email/resources/management/list-rooms/edit?roomId=[id]`,
      icon: <Edit />,
      color: "info",
      condition: (row) => !row.isDirSynced,
    },
    {
      label: "Edit permissions",
      link: "/identity/administration/users/user/exchange?userId=[id]",
      color: "info",
      icon: <Key />,
    },
    {
      label: "Block Sign In",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to block the sign-in for this room mailbox?",
      multiPost: false,
      condition: (row) => !row.accountDisabled && !row.isDirSynced,
    },
    {
      label: "Unblock Sign In",
      type: "POST",
      icon: <LockOpen />,
      url: "/api/ExecDisableUser",
      data: { ID: "id", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this room mailbox?",
      multiPost: false,
      condition: (row) => row.accountDisabled && !row.isDirSynced,
    },
    {
      label: "Delete Room",
      type: "POST",
      icon: <TrashIcon />,
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
