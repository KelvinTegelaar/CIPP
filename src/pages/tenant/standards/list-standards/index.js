import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import Link from "next/link";
import { CopyAll, Delete, PlayArrow, Add, Edit, GitHub, Download } from "@mui/icons-material";
import { EyeIcon } from "@heroicons/react/24/outline";
import tabOptions from "./tabOptions.json";

const Page = () => {
  const pageTitle = "Drift Templates";
  const actions = [
    {
      label: "Manage Drift",
      link: "/tenant/standards/manageDrift?templateId=[standardId]&tenantFilter=[tenantFilter]",
      icon: <EyeIcon />,
      color: "info",
      target: "_self",
    },
    {
      label: "Remove assigned Drift Standard",
      type: "POST",
      url: "/api/RemoveStandardTemplate",
      icon: <Delete />,
      data: {
        ID: "standardId",
      },
      confirmText:
        "Are you sure you want to remove the assigned Drift Standard? This does not undo any customizations or applied policies.",
      multiPost: false,
    },
    {
      label: "Remove Drift Customization",
      type: "POST",
      url: "/api/RemoveStandardTemplate",
      icon: <Delete />,
      data: {
        ID: "standardId",
      },
      confirmText:
        "Are you sure you want to remove all drift customizations? This resets the Drift Standard to the default template, and will generate alerts for the drifted items.",
      multiPost: false,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTenantDrift"
      tenantInTitle={false}
      cardButton={
        <>
          <Button component={Link} href="/tenant/standards/template?type=drift" startIcon={<Add />}>
            Create Drift Template
          </Button>
          <Button
            component={Link}
            href="/tenant/standards/list-standards/apply-drift-template"
            startIcon={<PlayArrow />}
          >
            Apply Drift Template
          </Button>
        </>
      }
      actions={actions}
      simpleColumns={[
        "tenantFilter",
        "standardName",
        "alignmentScore",
        "acceptedDeviations",
        "currentDeviations",
      ]}
      queryKey="ListTenantDrift"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
