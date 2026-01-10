import { CippFormComponent } from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";

export const CippFormUserAndGroupSelector = ({
  formControl,
  name,
  label,
  allTenants = false,
  multiple = false,
  type = "multiple",
  addedField,
  valueField,
  dataFilter = null,
  showRefresh = false,
  ...other
}) => {
  const currentTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const selectedTenant = useSettings().currentTenant;
  return (
    <CippFormComponent
      name={name}
      label={label}
      type="autoComplete"
      formControl={formControl}
      multiple={multiple}
      api={{
        addedField: addedField,
        tenantFilter: currentTenant ? currentTenant.value : selectedTenant,
        url: "/api/ListUsersAndGroups",
        dataKey: "Results",
        labelField: (option) => {
          // If it's a group (no userPrincipalName), just show displayName
          if (!option.userPrincipalName) {
            return `${option.displayName}`;
          }
          // If it's a user, show displayName and userPrincipalName
          return `${option.displayName} (${option.userPrincipalName})`;
        },
        valueField: valueField ? valueField : "id",
        queryKey: `ListUsersAndGroups-${
          currentTenant?.value ? currentTenant.value : selectedTenant
        }`,
        data: {
          TenantFilter: currentTenant ? currentTenant.value : selectedTenant,
        },
        dataFilter: (options) => {
          if (dataFilter) {
            return options.filter(dataFilter);
          }
          return options;
        },
        showRefresh: showRefresh,
      }}
      groupBy={(option) => {
        // Group by type - Users or Groups
        if (option["@odata.type"] === "#microsoft.graph.group") {
          return "Groups";
        }
        return "Users";
      }}
      creatable={false}
      {...other}
    />
  );
};
