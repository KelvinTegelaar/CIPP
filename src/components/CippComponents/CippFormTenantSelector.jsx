import React from "react";
import { CippFormComponent } from "./CippFormComponent";
import { useSettings } from "../../hooks/use-settings";

export const CippFormTenantSelector = ({
  formControl,
  componentType = "autoComplete",
  allTenants = false,
  type = "multiple",
  name = "tenantFilter",
  valueField = "defaultDomainName",
  required = true,
  disableClearable = true,
  removeOptions = [],
  ...other
}) => {
  const validators = () => {
    if (required) {
      return {
        required: { value: true, message: "This field is required" },
      };
    }
    return {};
  };
  const currentTenant = useSettings()?.currentTenant;
  return (
    <CippFormComponent
      type={componentType}
      name={name}
      formControl={formControl}
      preselectedValue={currentTenant ? currentTenant : null}
      placeholder="Select a tenant"
      //default value is: if currentTenant is not null, then FIND
      api={{
        excludeTenantFilter: true,
        url: allTenants ? "/api/ListTenants?AllTenantSelector=true" : "/api/ListTenants",
        queryKey: allTenants ? "ListTenants-AllTenantSelector" : "ListTenants-notAllTenants",
        labelField: (option) => `${option.displayName} (${option.defaultDomainName})`,
        valueField: valueField,
        addedField: {
          defaultDomainName: "defaultDomainName",
          displayName: "displayName",
          customerId: "customerId",
        },
      }}
      creatable={false}
      multiple={type === "single" ? false : true}
      disableClearable={disableClearable}
      validators={validators}
      removeOptions={removeOptions}
      {...other}
    />
  );
};
