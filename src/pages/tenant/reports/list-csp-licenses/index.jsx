import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { DeleteForever } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "CSP Licenses Report";
  const apiUrl = "/api/listCSPLicenses";

  const actions = [
    {
      label: "Increase license count by 1",
      type: "POST",
      icon: <PlusIcon />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Add", sku: "sku", add: 1 },
      confirmText: "Are you sure you want to buy 1 extra license?",
      multiPost: false,
    },
    {
      label: "Decrease license count by 1",
      type: "POST",
      icon: <MinusIcon />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Remove", sku: "sku", Remove: 1 },
      confirmText: "Are you sure you want to decrease the license count by 1?",
      multiPost: false,
    },
    {
      label: "Increase license count",
      type: "POST",
      icon: <PlusIcon />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Add", sku: "sku" },
      fields: [
        {
          type: "textField",
          name: "add",
          label: "The number of licenses to add",
          multiple: false,
        },
      ],
      confirmText: "Enter the amount of licenses to buy, and press confirm.",
      multiPost: false,
    },
    {
      label: "Decrease license count",
      type: "POST",
      icon: <MinusIcon />,
      url: "/api/ExecCSPLicense",
      fields: [
        {
          type: "textField",
          name: "remove",
          label: "Licences",
          multiple: false,
        },
      ],
      data: { Action: "!Remove", sku: "sku" },
      confirmText: "Enter the number of licenses to remove. This must be a number greater than 0.",
      multiPost: false,
    },
    {
      label: "Cancel Subscription",
      type: "POST",
      icon: <DeleteForever />,
      url: "/api/ExecCSPLicense",
      data: { Action: "!Cancel", SubscriptionIds: "id" },
      confirmText: "Are you sure you want to cancel this entire subscription?",
      multiPost: false,
    },
  ]; // No actions specified, setting to empty array

  const offCanvas = null; // No off-canvas details provided

  const simpleColumns = [
    "productName",
    "sku",
    "purchaseDate",
    "quantity",
    "commitmentTerm.renewalConfiguration.renewalDate",
    "TermInfo",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button component={Link} href="add-subscription">
            Add Subscription
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
