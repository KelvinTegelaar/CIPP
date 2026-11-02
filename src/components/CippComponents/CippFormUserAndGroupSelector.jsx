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
          if (option.userPrincipalName) return `${option.displayName} (${option.userPrincipalName})`;
          const groupType = option.mailEnabled && !option.securityEnabled
            ? "Distribution Group"
            : option.mailEnabled && option.securityEnabled
            ? "Mail-Enabled Security Group"
            : "Security Group";
          return `${option.displayName} (${groupType})`;
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
      creatable={false}
      {...other}
    />
  );
};
