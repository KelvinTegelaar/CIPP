// Legacy redirect: SSO settings now live on the Credentials tab.
import { useEffect } from "react";
import { useRouter } from "next/router";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace({ pathname: "/cipp/advanced/authentication/credentials", query: router.query });
  }, [router.isReady]);

  return null;
};

export default Page;
