import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Visibility } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Room Lists";
  const apiUrl = "/api/ListRoomLists";

  const actions = [
    {
      label: "View included Rooms",
      link: `/email/resources/management/room-lists/list/view?roomAddress=[emailAddress]`,
      color: "info",
      icon: <Visibility />,
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
