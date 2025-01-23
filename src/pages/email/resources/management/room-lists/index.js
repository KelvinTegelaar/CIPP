import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Room Lists";
  const apiUrl = "/api/ListRoomLists"

  const actions = [
    {
      label: "View Room List",
      link: `/email/resources/management/room-lists/list/view?RoomListAddress=[emailAddress]`,
      color: "info",
      icon: <EyeIcon />,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "id",
      "emailAddress",
      "displayName",
      "phone",
      "placeId",
      "geoCoordinates",
      "address.city",
      "address.countryOrRegion",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "geoCoordinates",
    "placeId",
    "address.city",
    "address.countryOrRegion",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
