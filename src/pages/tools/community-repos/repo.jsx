import { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "../../../layouts";

// The per-repo template browser has been replaced by the unified community template catalog.
const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tools/community-repos");
  }, [router]);

  return null;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
