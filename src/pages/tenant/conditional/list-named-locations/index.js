import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Named Locations";

  const actions = [
    {
      label: "Add location to named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      data: {
        namedLocationId: "id",
        change: "addLocation",
      },
      confirmText: "Enter a two-letter country code, e.g., US.",
    },
    {
      label: "Remove location from named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      data: {
        namedLocationId: "id",
        change: "removeLocation",
      },
      confirmText: "Enter a two-letter country code, e.g., US.",
    },
    {
      label: "Add IP to named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      data: {
        namedLocationId: "id",
        change: "addIp",
      },
      confirmText: "Enter an IP in CIDR format, e.g., 1.1.1.1/32.",
    },
    {
      label: "Remove IP from named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      data: {
        namedLocationId: "id",
        change: "removeIp",
      },
      confirmText: "Enter an IP in CIDR format, e.g., 1.1.1.1/32.",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["displayName", "type", "rangeOrLocation"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListNamedLocations"
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        <>
          <Button component={Link} href="list-named-locations/add">
            Add Named Location
          </Button>
        </>
      }
      simpleColumns={[
        "displayName",
        "includeUnknownCountriesAndRegions",
        "type",
        "rangeOrLocation",
        "modifiedDateTime",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
