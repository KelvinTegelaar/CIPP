import Head from "next/head";
import { useSettings } from "../../hooks/use-settings";

export const CippHead = ({ title }) => {
  const tenant = useSettings().currentTenant;
  return (
    <Head>
      <title>{tenant ? `${tenant} - ${title}` : title}</title>
    </Head>
  );
};
