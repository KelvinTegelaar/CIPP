import React from "react";
import { CippFormComponent } from "./CippFormComponent";
import { useWatch } from "react-hook-form";

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
  return (
    <CippFormComponent
      name={name}
      label={label}
      type="autoComplete"
      formControl={formControl}
      multiple={multiple}
      api={{
        addedField: addedField,
        tenantFilter: currentTenant ? currentTenant.value : undefined,
        url: "/api/ListGraphRequest",
        dataKey: "Results",
        labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
        valueField: valueField ? valueField : "id",
        queryKey: `ListUsers-${currentTenant?.value}`,
        data: {
          Endpoint: "users",
          manualPagination: true,
          $select: select ? select : "id,userPrincipalName,displayName",
          $count: true,
          $orderby: "displayName",
          $top: 999,
        },
      }}
    />
  );
};
