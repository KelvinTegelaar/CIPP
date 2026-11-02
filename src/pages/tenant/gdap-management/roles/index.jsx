import { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../../layouts/index";

// Role mappings moved under Role Templates; the old route is kept so bookmarks still resolve.
const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tenant/gdap-management/role-templates/mappings");
  }, [router]);

  return null;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
