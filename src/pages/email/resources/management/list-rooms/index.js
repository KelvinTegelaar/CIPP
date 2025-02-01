import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { AddHomeWork } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Rooms";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListRooms"
      simpleColumns={["displayName", "building", "floorNumber", "capacity", "bookingType"]}
      cardButton={
        <Button
          component={Link}
          href="/email/resources/management/list-rooms/add"
          startIcon={<AddHomeWork />}
        >
          Add Room
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
