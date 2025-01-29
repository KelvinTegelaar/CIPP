import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { LocationOn } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Named Locations";

  const actions = [
    {
      label: "Add location to named location",
      type: "GET",
      url: "/api/ExecNamedLocation",
      icon: <PlusIcon />,
      data: {
        namedLocationId: "id",
        change: "addLocation",
      },
      fields: [{ type: "textField", name: "input", label: "Country Code" }],
      confirmText: "Enter a two-letter country code, e.g., US.",
      condition: (row) => row["@odata.type"] == "#microsoft.graph.countryNamedLocation",
    },
    {
      label: "Remove location from named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <MinusIcon />,
      data: {
        namedLocationId: "id",
        change: "removeLocation",
      },
      fields: [{ type: "textField", name: "input", label: "Country Code" }],
      confirmText: "Enter a two-letter country code, e.g., US.",
      condition: (row) => row["@odata.type"] == "#microsoft.graph.countryNamedLocation",
    },
    {
      label: "Add IP to named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <PlusIcon />,
      data: {
        namedLocationId: "id",
        change: "addIp",
      },
      fields: [{ type: "textField", name: "input", label: "IP" }],
      confirmText: "Enter an IP in CIDR format, e.g., 1.1.1.1/32.",
      condition: (row) => row["@odata.type"] == "#microsoft.graph.ipNamedLocation",
    },
    {
      label: "Remove IP from named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <MinusIcon />,
      data: {
        namedLocationId: "id",
        change: "removeIp",
      },
      fields: [{ type: "textField", name: "input", label: "IP" }],
      confirmText: "Enter an IP in CIDR format, e.g., 1.1.1.1/32.",
      condition: (row) => row["@odata.type"] == "#microsoft.graph.ipNamedLocation",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["displayName", "rangeOrLocation"],
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
          <Button component={Link} href="list-named-locations/add" startIcon={<LocationOn />}>
            Add Named Location
          </Button>
        </>
      }
      simpleColumns={[
        "displayName",
        "includeUnknownCountriesAndRegions",
        "isTrusted",
        "rangeOrLocation",
        "modifiedDateTime",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
