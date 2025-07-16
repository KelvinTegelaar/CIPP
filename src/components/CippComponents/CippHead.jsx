import Head from "next/head";
import { useSettings } from "../../hooks/use-settings";

export const CippHead = ({ title, noTenant=false }) => {
  const tenant = useSettings().currentTenant;
  return (
    <Head>
      <title>{tenant && !noTenant ? `${title} - ${tenant}` : title}</title>
    </Head>
  );
};
