// Legacy redirect: this page moved to /cipp/advanced/authentication/sso when the
// Super Admin area was split into Super Admin / Container Management / Authentication.
// Safe to delete once bookmarks and docs links have aged out.
import { useEffect } from "react";
import { useRouter } from "next/router";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace({ pathname: "/cipp/advanced/authentication/sso", query: router.query });
  }, [router.isReady]);

  return null;
};

export default Page;
