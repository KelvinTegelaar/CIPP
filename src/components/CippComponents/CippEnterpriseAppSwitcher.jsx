import { CippEntitySwitcher } from "./CippEntitySwitcher";

/**
 * The enterprise app pages' title-as-switcher: CippEntitySwitcher preset over the tenant's
 * service principals, swapping spId (the SP object ID, matching the table links) so the
 * current tab (Overview, API permissions) is preserved.
 */
export const CippEnterpriseAppSwitcher = ({ title, currentSpId, tenantFilter }) => (
  <CippEntitySwitcher
    title={title}
    currentId={currentSpId}
    queryParamKey="spId"
    entityName="application"
    api={{
      url: "/api/ListGraphRequest",
      data: {
        Endpoint: "servicePrincipals",
        tenantFilter: tenantFilter,
        $select: "id,appId,displayName",
        $count: true,
        $orderby: "displayName",
        $top: 999,
      },
      queryKey: `EnterpriseAppSwitcher-${tenantFilter}`,
    }}
    getSecondary={(app) => app.appId}
  />
);
