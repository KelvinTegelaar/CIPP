import React from "react";
import { CippFormComponent } from "./CippFormComponent";
import { useWatch } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";

export const CippFormContactSelector = ({
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
        url: "/api/ListContacts",
        labelField: (option) => `${option.displayName} (${option.mail})`,
        valueField: valueField ? valueField : "id",
        queryKey: `listcontacts-${currentTenant?.value ? currentTenant.value : selectedTenant}`,
      }}
      creatable={false}
      {...other}
    />
  );
};
