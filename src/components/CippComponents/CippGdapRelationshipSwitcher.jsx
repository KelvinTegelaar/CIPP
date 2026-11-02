import { CippEntitySwitcher } from "./CippEntitySwitcher";

/**
 * The GDAP relationship pages' title-as-switcher: CippEntitySwitcher preset over all
 * relationships (partner-level, no tenantFilter), swapping id so the current tab
 * (Details, Role Mappings) is preserved while reviewing relationship after relationship.
 */
export const CippGdapRelationshipSwitcher = ({ title, currentRelationshipId }) => (
  <CippEntitySwitcher
    title={title}
    currentId={currentRelationshipId}
    queryParamKey="id"
    entityName="relationship"
    api={{
      url: "/api/ListGDAPRelationships",
      queryKey: "GDAPRelationshipSwitcher",
    }}
    getPrimary={(relationship) => relationship.customer?.displayName ?? "No Customer Set"}
    getSecondary={(relationship) => relationship.displayName}
    sortByPrimary
  />
);
