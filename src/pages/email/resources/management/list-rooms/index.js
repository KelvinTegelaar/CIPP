import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Rooms";

  const actions = [
    {
      label: "View Room",
      link: `/email/resources/management/list-rooms/place/view?PlaceAddress=[emailAddress]`,
      color: "info",
      icon: <EyeIcon />,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListRooms"
      actions={actions}
      simpleColumns={["displayName", "building", "floorNumber", "capacity", "bookingType"]}
      cardButton={
        <Button component={Link} href="/email/resources/management/list-rooms/add">
          Add Room
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
