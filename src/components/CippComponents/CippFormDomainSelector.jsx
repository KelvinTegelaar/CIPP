import React from "react";
import { CippFormComponent } from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";

export const CippFormDomainSelector = ({
  formControl,
  name,
  label,
  allTenants = false,
  type = "multiple",
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
      multiple={false}
      api={{
        autoSelectFirstItem: true,
        tenantFilter: currentTenant ? currentTenant.value : selectedTenant,
        queryKey: `listDomains-${currentTenant?.value ? currentTenant.value : selectedTenant}`,
        url: "/api/ListGraphRequest",
        dataKey: "Results",
        labelField: (option) => `${option.id}`,
        valueField: "id",
        data: {
          Endpoint: "domains",
          manualPagination: true,
          $count: true,
          $top: 99,
        },
      }}
      {...other}
    />
  );
};
