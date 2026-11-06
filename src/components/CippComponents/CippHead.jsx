import Head from "next/head";
import { useSettings } from "../../hooks/use-settings";
import { useTenantLabel } from "../../hooks/use-tenant-label";

export const CippHead = ({ title, noTenant=false }) => {
  const tenant = useSettings().currentTenant;
  const tenantLabel = useTenantLabel(tenant);
  return (
    <Head>
      <title>{tenant && !noTenant ? `${title} - ${tenantLabel}` : title}</title>
    </Head>
  );
};
