import { CippFormComponent } from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";

export const CippFormUserSelector = ({
  formControl,
  name,
  label,
  allTenants = false,
  multiple = false,
  type = "multiple",
  select,
  addedField,
  valueField,
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
        url: "/api/ListGraphRequest",
        dataKey: "Results",
        labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
        valueField: valueField ? valueField : "id",
        queryKey: `ListUsers-${currentTenant?.value ? currentTenant.value : selectedTenant}`,
        data: {
          Endpoint: "users",
          manualPagination: true,
          $select: select ? select : "id,userPrincipalName,displayName",
          $count: true,
          $orderby: "displayName",
          $top: 999,
        },
      }}
      creatable={false}
      {...other}
    />
  );
};
