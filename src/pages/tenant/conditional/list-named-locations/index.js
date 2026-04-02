import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import {
  MinusIcon,
  PlusIcon,
  PencilIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { LocationOn } from "@mui/icons-material";
import countryList from "../../../../data/countryList.json";

const Page = () => {
  const pageTitle = "Named Locations";

  const actions = [
    {
      label: "Rename named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <PencilIcon />,
      data: {
        namedLocationId: "id",
        change: "!rename",
      },
      fields: [{ type: "textField", name: "input", label: "New Name" }],
      confirmText: "Enter the new name for this named location.",
    },
    {
      label: "Mark as Trusted",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <ShieldCheckIcon />,
      data: {
        namedLocationId: "id",
        change: "!setTrusted",
      },
      confirmText: "Are you sure you want to mark this IP location as trusted?",
      condition: (row) =>
        row["@odata.type"] == "#microsoft.graph.ipNamedLocation" && !row.isTrusted,
    },
    {
      label: "Mark as Untrusted",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <ShieldExclamationIcon />,
      data: {
        namedLocationId: "id",
        change: "!setUntrusted",
      },
      confirmText: "Are you sure you want to mark this IP location as untrusted?",
      condition: (row) => row["@odata.type"] == "#microsoft.graph.ipNamedLocation" && row.isTrusted,
    },
    {
      label: "Add location to named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <PlusIcon />,
      data: {
        namedLocationId: "id",
        change: "!addLocation",
      },
      fields: [
        {
          type: "autoComplete",
          name: "input",
          label: "Country",
          validators: {
            required: { value: true, message: "Please select a country" },
          },
          options: (row) => {
            const existingCountries = row?.countriesAndRegions || [];
            return countryList
              .filter(({ Code }) => !existingCountries.includes(Code))
              .map(({ Code, Name }) => ({
                value: Code,
                label: `${Name} (${Code})`,
              }));
          },
        },
      ],
      confirmText: "Select a country to add to this named location.",
      condition: (row) => row["@odata.type"] == "#microsoft.graph.countryNamedLocation",
    },
    {
      label: "Remove location from named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <MinusIcon />,
      data: {
        namedLocationId: "id",
        change: "!removeLocation",
      },
      fields: [
        {
          type: "autoComplete",
          name: "input",
          label: "Country",
          multiple: true,
          validators: {
            required: { value: true, message: "Please select at least one country" },
            validate: (value, formValues, row) => {
              const totalCountries = row?.countriesAndRegions?.length || 0;
              const selectedCount = Array.isArray(value) ? value.length : value ? 1 : 0;
              if (selectedCount >= totalCountries) {
                return "You must leave at least one country in the named location";
              }
              return true;
            },
          },
          options: (row) => {
            const currentCountries = row?.countriesAndRegions || [];
            return currentCountries.map((code) => {
              const country = countryList.find((c) => c.Code === code);
              return {
                value: code,
                label: country ? `${country.Name} (${code})` : code,
              };
            });
          },
        },
      ],
      confirmText: "Select countries to remove from this named location.",
      condition: (row) =>
        row["@odata.type"] == "#microsoft.graph.countryNamedLocation" &&
        (row.countriesAndRegions?.length || 0) > 1,
    },
    {
      label: "Add IP to named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <PlusIcon />,
      data: {
        namedLocationId: "id",
        change: "!addIp",
      },
      fields: [
        {
          type: "textField",
          name: "input",
          label: "IP",
          validators: {
            required: { value: true, message: "IP address is required" },
            validate: (value) => {
              if (!value) return true;
              // IPv4 CIDR pattern
              const ipv4Cidr =
                /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(\d{1,3})$/;
              // IPv6 CIDR pattern (simplified - covers most common formats)
              const ipv6Cidr =
                /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::)\/(\d{1,3})$/;

              const ipv4Match = value.match(ipv4Cidr);
              const ipv6Match = value.match(ipv6Cidr);

              if (ipv4Match) {
                const prefix = parseInt(ipv4Match[1], 10);
                if (prefix < 9 || prefix > 32) {
                  return "CIDR prefix must be between /9 and /32 for IPv4";
                }
                return true;
              }

              if (ipv6Match) {
                const prefix = parseInt(ipv6Match[1], 10);
                if (prefix < 9 || prefix > 128) {
                  return "CIDR prefix must be between /9 and /128 for IPv6";
                }
                return true;
              }

              return "Invalid CIDR format. Use IPv4 (e.g., 1.1.1.1/32) or IPv6 (e.g., 2001:db8::/32)";
            },
          },
        },
      ],
      confirmText: "Enter an IP in CIDR format, e.g., 1.1.1.1/32 or 2001:db8::/32.",
      condition: (row) => row["@odata.type"] == "#microsoft.graph.ipNamedLocation",
    },
    {
      label: "Remove IP from named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <MinusIcon />,
      data: {
        namedLocationId: "id",
        change: "!removeIp",
      },
      fields: [
        {
          type: "autoComplete",
          name: "input",
          label: "IP",
          multiple: true,
          validators: {
            required: { value: true, message: "Please select at least one IP" },
            validate: (value, formValues, row) => {
              const totalIps = row?.ipRanges?.length || 0;
              const selectedCount = Array.isArray(value) ? value.length : value ? 1 : 0;
              if (selectedCount >= totalIps) {
                return "You must leave at least one IP in the named location";
              }
              return true;
            },
          },
          options: (row) => {
            const ipRanges = row?.ipRanges || [];
            return ipRanges.map((ip) => ({
              value: ip.cidrAddress,
              label: ip.cidrAddress,
            }));
          },
        },
      ],
      confirmText: "Select IPs to remove from this named location.",
      condition: (row) =>
        row["@odata.type"] == "#microsoft.graph.ipNamedLocation" &&
        (row.ipRanges?.length || 0) > 1,
    },
    {
      label: "Delete named location",
      type: "POST",
      url: "/api/ExecNamedLocation",
      icon: <TrashIcon />,
      data: {
        namedLocationId: "id",
        change: "!delete",
      },
      confirmText:
        "Are you sure you want to delete this named location? This action cannot be undone.",
      color: "error",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListNamedLocations"
      actions={actions}
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
