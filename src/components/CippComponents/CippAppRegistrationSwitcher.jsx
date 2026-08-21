import { CippEntitySwitcher } from "./CippEntitySwitcher";

/**
 * The app registration pages' title-as-switcher: CippEntitySwitcher preset over the
 * tenant's applications, swapping appId (the client ID, matching the table links) so the
 * current tab (Overview, API permissions) is preserved.
 */
export const CippAppRegistrationSwitcher = ({ title, currentAppId, tenantFilter }) => (
  <CippEntitySwitcher
    title={title}
    currentId={currentAppId}
    queryParamKey="appId"
    entityName="application"
    api={{
      url: "/api/ListGraphRequest",
      data: {
        Endpoint: "applications",
        tenantFilter: tenantFilter,
        $select: "id,appId,displayName",
        $count: true,
        $orderby: "displayName",
        $top: 999,
      },
      queryKey: `AppRegistrationSwitcher-${tenantFilter}`,
    }}
    getId={(app) => app.appId}
    getSecondary={(app) => app.appId}
  />
);
