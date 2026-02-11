import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippTablePage from "../../../../components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
  const simpleColumns = [
    "userPrincipalName",
    "displayName",
    "accountEnabled",
    "jitAdminEnabled",
    "jitAdminStartDate",
    "jitAdminExpiration",
    "jitAdminReason",
    "jitAdminCreatedBy",
    "memberOf",
  ];

  const filters = [
    {
      filterName: "Active JIT Admins",
      value: [{ id: "jitAdminEnabled", value: true }],
      type: "column",
    },
    {
      filterName: "Expired/Disabled",
      value: [{ id: "jitAdminEnabled", value: false }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      cardButton={
        <>
          <Button component={Link} href="jit-admin/add" startIcon={<AdminPanelSettings />}>
            Add JIT Admin
          </Button>
        </>
      }
      title="JIT Admin Table"
      apiUrl="/api/ListJITAdmin"
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      filters={filters}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
