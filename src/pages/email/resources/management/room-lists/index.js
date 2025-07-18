import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Visibility, ListAlt, Edit } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Room Lists";
  const apiUrl = "/api/ListRoomLists";

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

  const simpleColumns = [
    "DisplayName",
    "PrimarySmtpAddress",
    "Identity",
    "Phone",
    "Notes",
  ];

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
          <Button
            component={Link}
            href="/email/resources/management/room-lists/add"
            startIcon={<ListAlt />}
          >
            Create Room List
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
