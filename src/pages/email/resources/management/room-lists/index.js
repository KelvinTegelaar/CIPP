import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage.jsx";
import { Edit } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippAddRoomListDrawer } from "../../../../../components/CippComponents/CippAddRoomListDrawer";

const Page = () => {
  const pageTitle = "Room Lists";
  const apiUrl = "/api/ListRoomLists";
  const cardButtonPermissions = ["Exchange.Room.ReadWrite"];

  const actions = [
    {
      label: "Edit Room List",
      link: "/email/resources/management/room-lists/edit?groupId=[PrimarySmtpAddress]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
    },
    {
      label: "Delete Room List",
      type: "POST",
      url: "/api/ExecGroupsDelete",
      icon: <TrashIcon />,
      data: {
        id: "Guid",
        displayName: "DisplayName",
        GroupType: "!Distribution List",
      },
      confirmText: "Are you sure you want to delete this room list?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Guid",
      "PrimarySmtpAddress",
      "DisplayName",
      "Phone",
      "Identity",
      "Notes",
      "MailNickname",
    ],
    actions: actions,
  };

  const simpleColumns = ["DisplayName", "PrimarySmtpAddress", "Identity", "Phone", "Notes"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      apiDataKey="Results"
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <CippAddRoomListDrawer requiredPermissions={cardButtonPermissions} />
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
