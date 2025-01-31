import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import Link from "next/link";
import { AccountCircle } from "@mui/icons-material";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";

const Page = () => {
  const pageTitle = "Autopilot Profiles";

  const actions = [];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} type="intune" />,
    size: "xl",
  };

  const simpleColumns = [
    "displayName",
    "Description",
    "language",
    "extractHardwareHash",
    "deviceNameTemplate",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAutopilotConfig?type=ApProfile"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button
            component={Link}
            href="/endpoint/autopilot/list-profiles/add"
            startIcon={<AccountCircle />}
          >
            Add Profile
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
