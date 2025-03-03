import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
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
      apiUrl="/api/ExecJITAdmin?Action=List"
      apiDataKey="Results"
      simpleColumns={[]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
