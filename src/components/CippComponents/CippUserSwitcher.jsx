import { CippEntitySwitcher } from "./CippEntitySwitcher";

/**
 * The View User pages' title-as-switcher: CippEntitySwitcher preset over the tenant's
 * user list, swapping userId so the current tab (View, Edit, Exchange…) is preserved.
 */
export const CippUserSwitcher = ({ title, currentUserId, tenantFilter }) => (
  <CippEntitySwitcher
    title={title}
    currentId={currentUserId}
    queryParamKey="userId"
    entityName="user"
    api={{
      url: "/api/ListGraphRequest",
      data: {
        Endpoint: "users",
        tenantFilter: tenantFilter,
        $select: "id,displayName,userPrincipalName",
        $count: true,
        $orderby: "displayName",
        $top: 999,
      },
      queryKey: `UserSwitcher-${tenantFilter}`,
    }}
    getSecondary={(user) => user.userPrincipalName}
  />
);
